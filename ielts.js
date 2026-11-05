/* IELTS menu: band tracker + AI tutor (Gemini, with Azel's own free key). */
(function(){
"use strict";
const P = window.__plannerAPI; if(!P) return;
const {$, esc, put, del, byId, D, toast, today, fmtD, twoTap, field} = P;

/* ---------- basics ---------- */
const SK = {
  listening:{name:"Listening", color:"#8DBBE5"}, reading:{name:"Reading", color:"#8FCFAE"},
  writing:{name:"Writing", color:"#F0CC5C"}, speaking:{name:"Speaking", color:"#EE9AB5"}
};
const SKILLS = ["listening","reading","writing","speaking"];
const L_TABLE = [[39,9],[37,8.5],[35,8],[32,7.5],[30,7],[26,6.5],[23,6],[18,5.5],[16,5],[13,4.5],[10,4],[8,3.5],[6,3],[4,2.5],[2,2],[1,1],[0,0]];
const R_TABLE = [[39,9],[37,8.5],[35,8],[33,7.5],[30,7],[27,6.5],[23,6],[19,5.5],[15,5],[13,4.5],[10,4],[8,3.5],[6,3],[4,2.5],[2,2],[1,1],[0,0]];
const rawToBand = (raw, skill) => { for(const [min,b] of (skill==="reading" ? R_TABLE : L_TABLE)) if(raw>=min) return b; return 0; };
const roundBand = x => Math.round(x*2)/2;
const fmtBand = b => (typeof b==="number" && isFinite(b)) ? b.toFixed(1) : "–";
const clampBand = b => { const n = Number(b); return isFinite(n) ? Math.min(9, Math.max(0, roundBand(n))) : null; };
const pad2 = n => String(n).padStart(2,"0");
const mmss = s => (s<0?"+":"")+pad2(Math.floor(Math.abs(s)/60))+":"+pad2(Math.floor(Math.abs(s)%60));
const words = t => (String(t||"").trim().match(/\S+/g) || []).length;
const newId = () => Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const parseDay = s => { const p = String(s).split("-").map(Number); return new Date(p[0], (p[1]||1)-1, p[2]||1); };
const arr = x => Array.isArray(x) ? x : [];
const str = x => typeof x==="string" ? x : (x==null ? "" : String(x));

function prefs(){ return Object.assign({target:9, testDate:"", key:"", model:"", style:"strict", voice:true}, byId("prefs","ielts") || {}); }
function savePrefs(patch){ const p = Object.assign({}, byId("prefs","ielts") || {}, patch, {id:"ielts"}); delete p.updatedAt; put("prefs", p); }
const sessions = () => D.cols.ielts.slice().sort((a,b) => (a.ts||0)-(b.ts||0));
function latestBand(skill){
  const s = sessions().filter(x => x.skill===skill && typeof x.band==="number");
  if(!s.length) return null;
  const last = s.slice(-3);
  return roundBand(last.reduce((a,x) => a+x.band, 0)/last.length);
}

/* ---------- AI (Gemini) ---------- */
const MODELS = ["gemini-flash-latest","gemini-3.8-flash","gemini-3.5-flash-lite","gemini-2.5-flash"];
const STYLE = {
  strict: "You are a strict, senior IELTS examiner. Hold the candidate to the band 9 standard. Be blunt and direct: no compliments unless truly earned, no softening phrases, name every important error plainly. Never insult, swear at, mock or belittle the candidate as a person. Be tough on the work, never on the person.",
  friendly: "You are a warm, encouraging IELTS coach. Begin with what genuinely went well, then give clear and honest corrections. Encouraging tone, but never inflate band scores."
};
const BASE = " Use the official IELTS public band descriptors. Give realistic scores in steps of 0.5 and do not inflate them. Write comments in simple, natural English (around B2 level). The student is Indonesian: write every field named why_id or tips_id in simple Bahasa Indonesia. Reply with valid JSON only, in exactly the shape requested.";
const sys = () => (STYLE[prefs().style] || STYLE.strict) + BASE;
const ERR = {
  nokey:"Set up your AI tutor key first: IELTS → Settings.",
  badkey:"Your Gemini key didn't work. Check it in IELTS → Settings.",
  rate:"You've reached the free limit for now. Wait a minute and try again, or come back tomorrow.",
  network:"No internet connection. Connect and try again.",
  blocked:"The AI didn't give an answer this time. Try again.",
  parse:"The AI's answer came back broken. Try again.",
  model:"No Gemini model answered. Try again later.",
  server:"Gemini is busy right now. Try again in a minute.",
  mic:"Allow the microphone for this app, then try again. On iPhone/iPad: Settings → Safari → Microphone.",
  nomic:"This browser can't record audio. Try Chrome or Safari.",
  empty:"I couldn't hear an answer in your recording. Check your microphone and try again."
};
const errMsg = e => ERR[e && e.code] || "Something went wrong. Try again.";
const mkErr = code => Object.assign(new Error(code), {code});
async function ai(system, parts, opts){
  opts = opts || {};
  const pf = prefs();
  if(!pf.key) throw mkErr("nokey");
  const list = [pf.model, ...MODELS].filter((m,i,a) => m && a.indexOf(m)===i);
  let last = null;
  for(const m of list){
    let r, txt;
    try{
      r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(m)+":generateContent", {
        method:"POST", headers:{"Content-Type":"application/json", "x-goog-api-key":pf.key},
        body:JSON.stringify({systemInstruction:{parts:[{text:system}]}, contents:[{role:"user", parts}],
          generationConfig:{temperature: opts.temp==null ? 0.7 : opts.temp, responseMimeType:"application/json"}})
      });
      txt = await r.text();
    }catch(e){ throw mkErr("network"); }
    if(r.ok){
      let j; try{ j = JSON.parse(txt); }catch(e){ last = mkErr("parse"); continue; }
      const out = arr((((j.candidates||[])[0]||{}).content||{}).parts).map(p => p.text || "").join("").trim();
      if(!out) throw mkErr("blocked");
      if(pf.model!==m) savePrefs({model:m});
      try{ return JSON.parse(out.replace(/^```(?:json)?\s*/i,"").replace(/```\s*$/,"")); }catch(e){ throw mkErr("parse"); }
    }
    if(r.status===429) throw mkErr("rate");
    if(r.status===404 || (r.status===400 && /model|not found|not supported/i.test(txt) && !/api.?key/i.test(txt))){ last = mkErr("model"); continue; }
    if(r.status===400 || r.status===401 || r.status===403) throw mkErr(/api.?key|permission/i.test(txt) ? "badkey" : "server");
    last = mkErr("server");
  }
  throw last || mkErr("model");
}

/* ---------- audio ---------- */
let rec = null;
async function startRec(){
  if(!navigator.mediaDevices || !window.MediaRecorder) throw mkErr("nomic");
  let stream;
  try{ stream = await navigator.mediaDevices.getUserMedia({audio:true}); }catch(e){ throw mkErr("mic"); }
  const mr = new MediaRecorder(stream); const chunks = [];
  mr.ondataavailable = e => { if(e.data && e.data.size) chunks.push(e.data); };
  mr.start(250);
  rec = {mr, stream, chunks, start:Date.now()};
}
function stopRec(){
  return new Promise(res => {
    const r = rec; rec = null;
    if(!r){ res(null); return; }
    r.mr.onstop = () => { r.stream.getTracks().forEach(t => t.stop()); res({blob:new Blob(r.chunks, {type:r.mr.mimeType || "audio/webm"}), secs:(Date.now()-r.start)/1000}); };
    try{ r.mr.stop(); }catch(e){ r.stream.getTracks().forEach(t => t.stop()); res(null); }
  });
}
function cancelRec(){ if(rec){ try{ rec.mr.onstop = null; rec.mr.stop(); }catch(e){} rec.stream.getTracks().forEach(t => t.stop()); rec = null; } }
function blobToB64(blob){ return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1] || ""); fr.onerror = rej; fr.readAsDataURL(blob); }); }
async function toWavB64(blob){
  const buf = await blob.arrayBuffer();
  const AC = window.AudioContext || window.webkitAudioContext;
  const ac = new AC();
  const audio = await new Promise((res, rej) => ac.decodeAudioData(buf, res, rej));
  try{ ac.close(); }catch(e){}
  const rate = 16000; const len = Math.max(1, Math.ceil(audio.duration*rate));
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const off = new OAC(1, len, rate); const src = off.createBufferSource(); src.buffer = audio; src.connect(off.destination); src.start(0);
  const out = await off.startRendering(); const data = out.getChannelData(0);
  const ab = new ArrayBuffer(44 + data.length*2); const v = new DataView(ab);
  const w = (o,s) => { for(let i=0;i<s.length;i++) v.setUint8(o+i, s.charCodeAt(i)); };
  w(0,"RIFF"); v.setUint32(4, 36+data.length*2, true); w(8,"WAVE"); w(12,"fmt "); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true);
  v.setUint32(24,rate,true); v.setUint32(28,rate*2,true); v.setUint16(32,2,true); v.setUint16(34,16,true); w(36,"data"); v.setUint32(40,data.length*2,true);
  for(let i=0;i<data.length;i++){ const s = Math.max(-1, Math.min(1, data[i])); v.setInt16(44+i*2, s<0 ? s*0x8000 : s*0x7FFF, true); }
  return blobToB64(new Blob([ab], {type:"audio/wav"}));
}
async function audioPart(blob){
  try{ return {inlineData:{mimeType:"audio/wav", data: await toWavB64(blob)}}; }
  catch(e){ const t = (blob.type||"audio/webm").split(";")[0]; return {inlineData:{mimeType:t, data: await blobToB64(blob)}}; }
}

/* ---------- voices ---------- */
let voices = [];
function loadVoices(){ try{ voices = (window.speechSynthesis && speechSynthesis.getVoices()) || []; }catch(e){ voices = []; } }
loadVoices(); try{ speechSynthesis.addEventListener("voiceschanged", loadVoices); }catch(e){}
function pickVoice(gender){
  const en = voices.filter(v => /^en[-_]/i.test(v.lang));
  const gb = en.filter(v => /GB|AU|IE/i.test(v.lang));
  const pool = gb.length ? gb : en;
  const fem = /female|samantha|serena|kate|karen|moira|tessa|fiona|martha|libby|sonia|hazel|susan|zira|aria|jenny|natasha|google uk english female/i;
  const mal = /male|daniel|arthur|oliver|george|ryan|thomas|rishi|james|guy|google uk english male/i;
  if(gender==="female") return pool.find(v => fem.test(v.name) && !/\bmale\b/i.test(v.name.replace(/female/i,""))) || pool[0] || en[0] || null;
  if(gender==="male") return pool.find(v => mal.test(v.name) && !/female/i.test(v.name)) || pool[1] || pool[0] || en[0] || null;
  return pool[0] || en[0] || null;
}
function speak(text, gender, onend){
  if(!window.speechSynthesis){ if(onend) onend(); return; }
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice(gender); if(v){ u.voice = v; u.lang = v.lang; } else u.lang = "en-GB";
  u.rate = 0.95; if(!v && gender==="male") u.pitch = 0.8; if(!v && gender==="female") u.pitch = 1.15;
  if(onend){ u.onend = onend; u.onerror = onend; }
  speechSynthesis.speak(u);
}
const stopSpeak = () => { try{ speechSynthesis.cancel(); }catch(e){} };

/* ---------- home view ---------- */
function render(){
  if(!$("ieHero")) return;
  const pf = prefs(); const t = +pf.target || 9;
  const bands = {}; SKILLS.forEach(s => { bands[s] = latestBand(s); });
  const all = SKILLS.every(s => bands[s]!=null);
  const overall = all ? roundBand(SKILLS.reduce((a,s) => a+bands[s], 0)/4) : null;
  let cd;
  if(pf.testDate){
    const days = Math.round((parseDay(pf.testDate) - parseDay(today()))/864e5);
    cd = days>0 ? `<b>${days}</b> day${days===1?"":"s"} to your test (${fmtD(pf.testDate)})` : days===0 ? "<b>Test day!</b> You've got this." : `Your test was on ${fmtD(pf.testDate)}.`;
  } else cd = `<button class="linkbtn" type="button" data-ia="settings">Set your test date</button>`;
  $("ieHero").innerHTML = `
    <div class="section-head"><div><div class="label">IELTS Academic</div><h2>Target band ${fmtBand(t)}</h2></div><button class="btn small ghost" type="button" data-ia="settings">Settings</button></div>
    <div class="small">${cd}</div>
    <div class="bandrow">
      <div class="bandbig"><span class="label">Estimated overall</span><b>${overall!=null ? fmtBand(overall) : "–"}</b>
        <span class="small muted">${overall==null ? "Practise all 4 skills to see it" : overall>=t ? "On target!" : "Gap to target: "+fmtBand(t-overall)}</span></div>
      <div class="skillchips">${SKILLS.map(s => `<div class="skchip" style="--sc:${SK[s].color}"><span>${SK[s].name}</span><b>${fmtBand(bands[s])}</b></div>`).join("")}</div>
    </div>`;
  $("ieKeyNote").hidden = !!pf.key;
  document.querySelectorAll('[data-ia="style"]').forEach(b => b.setAttribute("aria-pressed", String((pf.style==="friendly") === (b.dataset.v==="friendly"))));
  $("ieChart").innerHTML = chartSvg(t);
  const recent = sessions().slice().reverse().slice(0, 12);
  $("ieRecent").innerHTML = recent.length ? recent.map(s => `<button class="rec-row" type="button" data-ia="open" data-id="${esc(s.id)}">
      <span style="min-width:0"><span class="tag" style="--cb:${SK[s.skill] ? SK[s.skill].color+"33" : "var(--soft)"};--cf:var(--ink)">${esc(SK[s.skill] ? SK[s.skill].name : "IELTS")}</span>
      <span class="tt" style="display:block;margin-top:4px">${esc(s.title || "Practice")}</span><span class="small muted">${fmtD(s.date || today())}${s.kind==="manual" ? " · logged score" : ""}</span></span>
      <span class="bd">${fmtBand(s.band)}</span></button>`).join("")
    : `<div class="empty">No practice yet. Start with one Speaking question. It takes 2 minutes.</div>`;
}
function chartSvg(target){
  const pts = sessions().filter(s => typeof s.band==="number" && SK[s.skill]);
  if(pts.length < 2) return `<p class="muted small">Your progress chart appears after 2 practice sessions.</p>`;
  const W = 340, H = 190, L = 30, R = 10, T = 12, B = 26;
  const lo = Math.max(0, Math.min(4, Math.floor(Math.min(...pts.map(p => p.band)))));
  const hi = 9;
  const x = i => L + (pts.length===1 ? 0 : i*(W-L-R)/(pts.length-1));
  const y = b => T + (hi-b)*(H-T-B)/(hi-lo);
  let g = "";
  for(let b=lo; b<=hi; b++) g += `<line x1="${L}" x2="${W-R}" y1="${y(b)}" y2="${y(b)}" stroke="#F2E1E7" stroke-width="1"/><text x="${L-6}" y="${y(b)+4}" text-anchor="end" font-size="10" fill="#8A7480">${b}</text>`;
  g += `<line x1="${L}" x2="${W-R}" y1="${y(target)}" y2="${y(target)}" stroke="#A8436A" stroke-dasharray="5 4" stroke-width="1.5"/><text x="${W-R}" y="${y(target)-4}" text-anchor="end" font-size="10" fill="#A8436A" font-weight="700">target ${fmtBand(target)}</text>`;
  SKILLS.forEach(s => {
    const idx = pts.map((p,i) => p.skill===s ? i : -1).filter(i => i>=0);
    if(!idx.length) return;
    if(idx.length>1) g += `<polyline fill="none" stroke="${SK[s].color}" stroke-width="2.5" stroke-linejoin="round" points="${idx.map(i => x(i)+","+y(pts[i].band)).join(" ")}"/>`;
    idx.forEach(i => { g += `<circle cx="${x(i)}" cy="${y(pts[i].band)}" r="4" fill="${SK[s].color}" stroke="#fff" stroke-width="1.5"/>`; });
  });
  g += `<text x="${L}" y="${H-6}" font-size="10" fill="#8A7480">${esc(fmtD(pts[0].date || today()))}</text><text x="${W-R}" y="${H-6}" text-anchor="end" font-size="10" fill="#8A7480">${esc(fmtD(pts[pts.length-1].date || today()))}</text>`;
  return `<div class="chartbox"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Band scores over time">${g}</svg></div>
    <div class="legend">${SKILLS.map(s => `<span style="--tc:${SK[s].color}"><i></i>${SK[s].name}</span>`).join("")}</div>`;
}
function calc(){
  const l = $("cL").value, r = $("cR").value, w = $("cW").value, s = $("cS").value;
  const lb = l==="" ? null : rawToBand(Math.min(40, Math.max(0, +l)), "listening");
  const rb = r==="" ? null : rawToBand(Math.min(40, Math.max(0, +r)), "reading");
  $("cLb").textContent = lb==null ? "" : "Band "+fmtBand(lb);
  $("cRb").textContent = rb==null ? "" : "Band "+fmtBand(rb);
  const b = [lb, rb, w==="" ? null : +w, s==="" ? null : +s];
  $("cOut").innerHTML = b.every(x => x!=null) ? `Overall band: <b>${fmtBand(roundBand(b.reduce((a,x) => a+x, 0)/4))}</b>` : `<span class="muted">Fill in all 4 to see your overall band.</span>`;
}

/* ---------- practice overlay ---------- */
let run = null;
function openRun(html){ $("ieltsRun").hidden = false; $("ieltsRunIn").innerHTML = html; $("ieltsRun").scrollTop = 0; }
function stopAll(){ cancelRec(); stopSpeak(); if(run && run.tick){ clearInterval(run.tick); run.tick = null; } }
function closeRun(){ stopAll(); run = null; $("ieltsRun").hidden = true; $("ieltsRunIn").innerHTML = ""; }
const head = (title, sub) => `<div class="section-head"><div><div class="label">${esc(sub||"")}</div><h2>${esc(title)}</h2></div><button class="btn ghost small" type="button" data-ia="close">Close</button></div>`;
function wait(title, msg){ openRun(head(title, "AI tutor") + `<div class="card ai-wait"><div class="spinner" aria-hidden="true"></div><p>${esc(msg)}</p><p class="muted small">Keep this screen open.</p></div>`); }
function fail(title, e, retry){
  openRun(head(title, "AI tutor") + `<div class="card"><p class="neg"><b>${esc(errMsg(e))}</b></p>
    <div class="btn-row">${retry ? `<button class="btn" type="button" data-ia="${retry}">Try again</button>` : ""}${e && (e.code==="nokey"||e.code==="badkey") ? `<button class="btn ghost" type="button" data-ia="settings">Open settings</button>` : ""}</div></div>`);
}
function tickStart(fn){ if(run.tick) clearInterval(run.tick); run.tick = setInterval(fn, 250); fn(); }

/* ---------- SPEAKING ---------- */
const MIC_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="#4B3742" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>`;
const STOP_SVG = `<svg viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="2" fill="#4B3742"/></svg>`;
function speakingMenu(){
  const pf = prefs();
  openRun(head("Speaking", "IELTS") + `
    <button class="ptile" type="button" data-ia="sp-mock" style="--sc:${SK.speaking.color}"><b>Full mock test</b><span>Part 1, 2 and 3, like the real test (about 12 minutes). Scored at the end.</span></button>
    <div class="practice-grid">
      <button class="ptile" type="button" data-ia="sp-quick" data-part="1" style="--sc:${SK.speaking.color}"><b>Part 1</b><span>One everyday question, instant feedback.</span></button>
      <button class="ptile" type="button" data-ia="sp-quick" data-part="2" style="--sc:${SK.speaking.color}"><b>Part 2</b><span>Cue card: 1 min to prepare, 2 min to talk.</span></button>
      <button class="ptile" type="button" data-ia="sp-quick" data-part="3" style="--sc:${SK.speaking.color}"><b>Part 3</b><span>One discussion question, instant feedback.</span></button>
    </div>
    <label class="anchor" style="border:0;padding:0"><input type="checkbox" id="spVoice"${pf.voice!==false ? " checked" : ""}><span>Examiner reads the questions out loud</span></label>
    <p class="muted small">Find a quiet place. The first time, your browser asks to use the microphone: tap Allow.</p>`);
}
function avoidTopics(){ return sessions().filter(s => s.skill==="speaking").slice(-8).map(s => s.title).join("; "); }
async function spMock(){
  wait("Speaking mock test", "Your examiner is preparing the questions…");
  try{
    const sc = await ai(sys(), [{text:`Create a complete IELTS Speaking test. Return JSON:
{"p1_topic": string, "p1": [4 short everyday Part 1 questions on that topic],
 "p2": {"topic": "Describe ...", "bullets": [3 strings, the 'You should say' points], "final": "and explain ..."},
 "p2_followup": "one short rounding-off question about the Part 2 topic",
 "p3_topic": string, "p3": [4 Part 3 discussion questions linked to the Part 2 topic, more abstract]}
Use fresh, varied topics typical of recent IELTS tests. Avoid these recent topics: ${avoidTopics() || "none"}.`}], {temp:0.95});
    const p1 = arr(sc.p1).map(str).filter(Boolean).slice(0,5), p3 = arr(sc.p3).map(str).filter(Boolean).slice(0,5);
    const p2 = sc.p2 || {};
    if(!p1.length || !p3.length || !p2.topic) throw mkErr("parse");
    const steps = p1.map(q => ({part:1, q}))
      .concat([{part:2, cue:{topic:str(p2.topic), bullets:arr(p2.bullets).map(str), final:str(p2.final)}}])
      .concat(sc.p2_followup ? [{part:2, q:str(sc.p2_followup)}] : [])
      .concat(p3.map(q => ({part:3, q})));
    run = {mode:"sp", kind:"mock", script:sc, steps, i:0, answers:[], active:true};
    spStep();
  }catch(e){ fail("Speaking mock test", e, "sp-mock"); }
}
async function spQuick(part){
  wait("Speaking Part "+part, "Your examiner is choosing a question…");
  try{
    const r = await ai(sys(), [{text: part==2
      ? `Give one IELTS Speaking Part 2 cue card. JSON {"topic":"Describe ...","bullets":[3 'You should say' points],"final":"and explain ..."}. Avoid: ${avoidTopics() || "none"}.`
      : `Give one IELTS Speaking Part ${part} question${part==3 ? " (abstract discussion)" : " (everyday, personal)"}. JSON {"topic": short topic name, "q": the question}. Avoid: ${avoidTopics() || "none"}.`}], {temp:1});
    const step = part==2 ? {part:2, cue:{topic:str(r.topic), bullets:arr(r.bullets).map(str), final:str(r.final)}} : {part, q:str(r.q), topic:str(r.topic)};
    if(part==2 ? !step.cue.topic : !step.q) throw mkErr("parse");
    run = {mode:"sp", kind:"quick", part, steps:[step], i:0, answers:[], active:true};
    spStep();
  }catch(e){ fail("Speaking Part "+part, e, "sp-quick-"+part); }
}
const cueHtml = c => `<div class="cue"><b>${esc(c.topic)}</b><p class="small" style="margin-top:6px">You should say:</p><ul class="small" style="margin:4px 0 6px;padding-left:1.2em">${c.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul><p class="small">${esc(c.final)}</p></div>`;
const cueText = c => c.topic+". You should say: "+c.bullets.join("; ")+". "+c.final;
function spStep(){
  stopAll();
  const st = run.steps[run.i]; const n = run.steps.length;
  const voiceOn = prefs().voice!==false;
  const label = run.kind==="mock" ? `Part ${st.part} · ${run.i+1} of ${n}` : `Part ${st.part}`;
  if(st.cue){
    run.phase = "prep"; run.prepEnd = Date.now()+60000;
    openRun(head("Speaking", label) + cueHtml(st.cue) + `
      <div class="section-head"><b>Preparation time</b><span class="timerpill" id="spT">01:00</span></div>
      ${field("cueNotes","Notes (only you see them)",`<textarea id="cueNotes" placeholder="Write a few key words…"></textarea>`)}
      <button class="btn" type="button" data-ia="sp-rec">I'm ready: start talking (2 min)</button>
      <p class="muted small">Talking starts by itself when the minute is over.</p>`);
    if(voiceOn) speak("Here is your topic. "+cueText(st.cue)+" You have one minute to prepare.");
    tickStart(() => { const left = Math.ceil((run.prepEnd-Date.now())/1000); const t = $("spT"); if(t) t.textContent = mmss(Math.max(0,left)); if(left<=0 && run.phase==="prep"){ run.phase = "go"; spRecord(); } });
    return;
  }
  run.phase = "ask";
  openRun(head("Speaking", label) + `
    <div class="card"><p class="qbig">${esc(st.q)}</p><div style="text-align:center"><button class="linkbtn" type="button" data-ia="sp-hear">Hear it again</button></div></div>
    <button class="mic" type="button" data-ia="sp-rec" aria-label="Start answering">${MIC_SVG}</button>
    <p style="text-align:center" class="muted" id="spState">Tap the microphone and answer out loud.</p>
    ${run.kind==="mock" ? `<div style="text-align:center"><button class="linkbtn" type="button" data-ia="sp-skip">Skip this question</button></div>` : ""}`);
  if(voiceOn) setTimeout(() => speak(st.q), 150);
}
async function spRecord(){
  const st = run.steps[run.i];
  stopSpeak();
  try{ await startRec(); }catch(e){ toast(errMsg(e)); if(st.cue){ run.phase = "prep"; run.prepEnd = Date.now()+5000; } return; }
  run.phase = "rec";
  const max = st.cue ? 120 : st.part===3 ? 90 : st.part===2 ? 45 : 60;
  openRun(head("Speaking", (st.cue ? "Part 2 · talk for 1–2 minutes" : "Part "+st.part+" · recording")) + (st.cue ? cueHtml(st.cue) + (run.notes ? `<p class="small muted">Your notes: ${esc(run.notes)}</p>` : "") : `<div class="card"><p class="qbig">${esc(st.q)}</p></div>`) + `
    <button class="mic rec" type="button" data-ia="sp-stop" aria-label="Stop recording">${STOP_SVG}</button>
    <p style="text-align:center"><b class="timerpill" id="spT">00:00</b></p>
    <p style="text-align:center" class="muted">Recording… tap the square when you finish.${st.cue ? " Try to keep talking until about 2:00." : ""}</p>`);
  tickStart(() => { if(!rec) return; const s = (Date.now()-rec.start)/1000; const t = $("spT"); if(t) t.textContent = mmss(s)+" / "+mmss(max); if(s>=max) spStop(); });
}
async function spStop(){
  if(!run || run.phase!=="rec") return;
  run.phase = "saving";
  const notesEl = $("cueNotes"); if(notesEl) run.notes = notesEl.value;
  const r = await stopRec();
  if(run.tick){ clearInterval(run.tick); run.tick = null; }
  const st = run.steps[run.i];
  const ans = {part:st.part, q: st.cue ? cueText(st.cue) : st.q, blob: r && r.blob, secs: r ? r.secs : 0};
  run.answers.push(ans);
  if(run.kind==="mock") ans.p = transcribe(ans);
  spNext();
}
function spSkip(){ const st = run.steps[run.i]; const ans = {part:st.part, q: st.cue ? cueText(st.cue) : st.q, blob:null, secs:0}; ans.p = Promise.resolve({transcript:"", pron:[], pron_overall:"No answer given."}); run.answers.push(ans); spNext(); }
function spNext(){
  run.i++;
  if(run.i < run.steps.length){ run.notes = ""; spStep(); return; }
  if(run.kind==="mock") spScoreMock(); else spScoreQuick();
}
async function transcribe(ans, tries){
  if(!ans.blob || ans.secs < 1) return {transcript:"", pron:[], pron_overall:"No answer recorded."};
  const part = await audioPart(ans.blob);
  try{
    return await ai("You transcribe IELTS speaking answers accurately and note pronunciation. Reply with JSON only.", [{text:`Question asked: "${ans.q}"
Transcribe the candidate's spoken answer exactly as said, keeping fillers (um, uh), repetitions and grammar mistakes. Do not correct anything. If there is no English speech, return an empty transcript.
Then list up to 4 specific pronunciation problems (word: what was wrong) and one sentence about clarity, stress, intonation and pace.
JSON {"transcript": string, "pron": [string], "pron_overall": string}`}, part], {temp:0.1});
  }catch(e){
    if((tries||0) < 1 && e.code!=="nokey" && e.code!=="badkey") { await new Promise(r => setTimeout(r, 3000)); return transcribe(ans, (tries||0)+1); }
    throw e;
  }
}
const SPEAK_SHAPE = `{"overall": number, "fc": {"band": number, "comment": string}, "lr": {"band": number, "comment": string}, "gra": {"band": number, "comment": string}, "p": {"band": number, "comment": string},
 "summary": "2-3 sentences", "strengths": [2-3 strings],
 "fixes": [5-8 items {"original": "exact words from the transcript", "better": "corrected or upgraded version", "why_id": "short reason in Bahasa Indonesia"}],
 "vocab": [5 items {"word": "band 8+ word or collocation useful for these topics", "meaning": "simple English meaning", "example": "example sentence"}],
 "model_answer": {"question": string, "answer": "a natural band 9 answer"},
 "tips_id": "3 concrete practice tips in Bahasa Indonesia"}`;
async function spScoreMock(){
  run.active = true;
  wait("Speaking mock test", "Listening to your answers and scoring your test… This can take up to a minute.");
  let items;
  try{
    items = await Promise.all(run.answers.map(a => a.p.then(r => r, e => ({error:e}))));
    const hard = items.find(x => x.error && ["nokey","badkey","rate","network"].includes(x.error.code));
    if(hard) throw hard.error;
    run.answers.forEach((a,i) => { a.p = Promise.resolve(items[i]); });
    if(!items.some(x => str(x.transcript).trim())) throw mkErr("empty");
    const text = run.answers.map((a,i) => `Part ${a.part}, question ${i+1}: ${a.q}\nCandidate (${Math.round(a.secs)}s): ${str(items[i].transcript) || "(no answer)"}\nPronunciation notes: ${arr(items[i].pron).join("; ")} ${str(items[i].pron_overall)}`).join("\n\n");
    const rep = await ai(sys(), [{text:`Assess this full IELTS Speaking test (Parts 1, 2 and 3). Below are the questions, the candidate's exact transcripts and pronunciation notes taken from the audio.
Short or missing answers must lower Fluency and Coherence. overall = the mean of the four criteria, rounded to the nearest 0.5.
${text}

Return JSON ${SPEAK_SHAPE}`}], {temp:0.3});
    const sc = run.script || {};
    saveSession({skill:"speaking", kind:"mock", title:"Mock test: "+str(sc.p1_topic)+" / "+str((sc.p2||{}).topic).replace(/^Describe\s+/i,""), report:rep,
      band:clampBand(rep.overall), sub:{fc:clampBand((rep.fc||{}).band), lr:clampBand((rep.lr||{}).band), gra:clampBand((rep.gra||{}).band), p:clampBand((rep.p||{}).band)},
      items: run.answers.map((a,i) => ({part:a.part, q:a.q, transcript:str(items[i].transcript), secs:Math.round(a.secs)}))});
  }catch(e){ fail("Speaking mock test", e, "sp-rescore"); }
}
async function spScoreQuick(){
  wait("Speaking Part "+run.part, "Listening to your answer…");
  const a = run.answers[0];
  try{
    if(!a.blob || a.secs < 1) throw mkErr("empty");
    const part = await audioPart(a.blob);
    const rep = await ai(sys(), [{text:`IELTS Speaking Part ${a.part}. Question: "${a.q}".
Listen to the candidate's recorded answer. First transcribe it exactly (keep fillers and mistakes). Then assess it as a Part ${a.part} answer, including pronunciation from the audio. Answers that are too short for the part must lower Fluency and Coherence.
Return JSON {"transcript": string, ${SPEAK_SHAPE.slice(1)}`}, part], {temp:0.3});
    if(!str(rep.transcript).trim()) throw mkErr("empty");
    const st = run.steps[0];
    saveSession({skill:"speaking", kind:"quick", title:"Part "+a.part+": "+(st.cue ? st.cue.topic.replace(/^Describe\s+/i,"") : (st.topic || st.q)), report:rep,
      band:clampBand(rep.overall), sub:{fc:clampBand((rep.fc||{}).band), lr:clampBand((rep.lr||{}).band), gra:clampBand((rep.gra||{}).band), p:clampBand((rep.p||{}).band)},
      items:[{part:a.part, q:a.q, transcript:str(rep.transcript), secs:Math.round(a.secs)}]});
  }catch(e){ fail("Speaking Part "+run.part, e, "sp-rescore"); }
}

/* ---------- WRITING ---------- */
function writingMenu(){
  openRun(head("Writing", "IELTS Academic") + `
    <div class="card"><h3>Task 1 · chart report</h3><p class="muted small">20 minutes · at least 150 words</p>
      <div class="btn-row"><button class="btn small" type="button" data-ia="wr-new" data-task="1">New chart from tutor</button><button class="btn small ghost" type="button" data-ia="wr-own" data-task="1">Use my own question</button></div></div>
    <div class="card"><h3>Task 2 · essay</h3><p class="muted small">40 minutes · at least 250 words</p>
      <div class="btn-row"><button class="btn small" type="button" data-ia="wr-new" data-task="2">New question from tutor</button><button class="btn small ghost" type="button" data-ia="wr-own" data-task="2">Use my own question</button></div></div>`);
}
async function wrNew(task){
  wait("Writing Task "+task, "Your tutor is writing a question…");
  try{
    const q = task==1
      ? await ai(sys(), [{text:`Create an IELTS Academic Writing Task 1 question with a chart. JSON {"type": "bar" or "line" or "table", "title": string, "unit": string, "categories": [4-7 labels], "series": [2-4 items {"name": string, "values": [numbers, one per category]}], "prompt": "The chart below shows ... Summarise the information by selecting and reporting the main features, and make comparisons where relevant."}. Use realistic data with clear trends and comparisons.`}], {temp:0.9})
      : await ai(sys(), [{text:`Create one IELTS Academic Writing Task 2 question in the real exam style (opinion, discussion, advantages/disadvantages, problem/solution or two-part). JSON {"prompt": "the full question including the final instruction line"}.`}], {temp:1});
    if(!str(q.prompt)) throw mkErr("parse");
    wrStart(task, q);
  }catch(e){ fail("Writing Task "+task, e, "wr-new-"+task); }
}
function wrOwn(task){
  openRun(head("Writing Task "+task, "Your own question") + `
    ${field("wrQ","Paste or type the question",`<textarea id="wrQ" placeholder="${task==1 ? "The graph below shows… (describe the chart in words if you can)" : "Some people believe that…"}"></textarea>`)}
    <button class="btn" type="button" data-ia="wr-own-go" data-task="${task}">Start writing</button>`);
}
function task1Visual(q){
  const cats = arr(q.categories).map(str), ser = arr(q.series).filter(s => s && arr(s.values).length);
  if(!cats.length || !ser.length) return "";
  if(q.type==="table") return `<div class="chartbox"><table class="mini"><thead><tr><th></th>${cats.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${ser.map(s => `<tr><th>${esc(s.name)}</th>${cats.map((c,i) => `<td>${esc(arr(s.values)[i])}</td>`).join("")}</tr>`).join("")}</tbody></table><p class="small muted">${esc(q.unit||"")}</p></div>`;
  const COL = ["#EE9AB5","#8DBBE5","#F0CC5C","#8FCFAE"];
  const vals = ser.flatMap(s => arr(s.values).map(Number).filter(isFinite));
  const vmax = Math.max(1, ...vals); const step = niceStep(vmax/5); const top = Math.ceil(vmax/step)*step;
  const W = 360, H = 220, L = 40, R = 10, T = 16, B = 44;
  const y = v => T + (1 - v/top)*(H-T-B);
  let g = "";
  for(let v=0; v<=top+1e-9; v+=step) g += `<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="#F2E1E7"/><text x="${L-5}" y="${y(v)+4}" font-size="10" text-anchor="end" fill="#8A7480">${+v.toFixed(2)}</text>`;
  const bw = (W-L-R)/cats.length;
  cats.forEach((c,i) => { g += `<text x="${L+bw*i+bw/2}" y="${H-B+14}" font-size="10" text-anchor="middle" fill="#4B3742">${esc(c.length>10 ? c.slice(0,9)+"…" : c)}</text>`; });
  if(q.type==="line"){
    ser.forEach((s,k) => { const p = arr(s.values).map((v,i) => (L+bw*i+bw/2)+","+y(+v||0)).join(" "); g += `<polyline fill="none" stroke="${COL[k%4]}" stroke-width="2.5" points="${p}"/>` + arr(s.values).map((v,i) => `<circle cx="${L+bw*i+bw/2}" cy="${y(+v||0)}" r="3.5" fill="${COL[k%4]}"/>`).join(""); });
  } else {
    const inner = bw*0.8, one = inner/ser.length;
    ser.forEach((s,k) => arr(s.values).forEach((v,i) => { const h = (H-T-B) * (Math.max(0,+v||0)/top); g += `<rect x="${L+bw*i+bw*0.1+one*k}" y="${H-B-h}" width="${Math.max(2,one-2)}" height="${h}" rx="3" fill="${COL[k%4]}"/>`; }));
  }
  return `<div class="chartbox"><p class="small"><b>${esc(q.title||"")}</b> <span class="muted">(${esc(q.unit||"")})</span></p><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(q.title||"Chart")}">${g}</svg>
    <div class="legend">${ser.map((s,k) => `<span style="--tc:${COL[k%4]}"><i></i>${esc(s.name)}</span>`).join("")}</div></div>`;
}
function niceStep(raw){ const p = Math.pow(10, Math.floor(Math.log10(raw||1))); const n = raw/p; return (n<=1 ? 1 : n<=2 ? 2 : n<=5 ? 5 : 10)*p; }
function wrStart(task, q){
  const draftKey = "azel.ielts.draft";
  let draft = ""; try{ const d = JSON.parse(localStorage.getItem(draftKey) || "null"); if(d && d.prompt===q.prompt) draft = d.text; }catch(e){}
  run = {mode:"wr", task:+task, q, start:Date.now(), active:true};
  const mins = task==1 ? 20 : 40, min = task==1 ? 150 : 250;
  openRun(head("Writing Task "+task, "Write your answer") + `
    <div class="section-head"><span class="timerpill" id="wrT">${mins}:00</span><span class="small muted" id="wrC">0 words · at least ${min}</span></div>
    <div class="card">${task==1 ? task1Visual(q) : ""}<p style="white-space:pre-wrap">${esc(q.prompt)}</p></div>
    <textarea id="wrText" class="wr-text" aria-label="Your answer" placeholder="Write your answer here…">${esc(draft)}</textarea>
    <div class="notice" id="wrErr" hidden></div>
    <button class="btn" type="button" data-ia="wr-submit">Submit for marking</button>
    <p class="muted small">Your draft is saved on this device while you write.</p>`);
  const ta = $("wrText");
  const upd = () => { const n = words(ta.value); $("wrC").textContent = n+" words · at least "+min; $("wrC").className = "small "+(n>=min ? "pos" : "muted"); try{ localStorage.setItem(draftKey, JSON.stringify({prompt:q.prompt, text:ta.value})); }catch(e){} };
  ta.addEventListener("input", upd); upd();
  tickStart(() => { const t = $("wrT"); if(!t) return; const left = mins*60 - (Date.now()-run.start)/1000; t.textContent = mmss(left); t.classList.toggle("over", left<0); });
}
async function wrSubmit(){
  const text = $("wrText").value.trim(); const n = words(text);
  if(n < 40){ $("wrErr").hidden = false; $("wrErr").textContent = "Write at least a few sentences first. Short answers can't get a fair band."; return; }
  const q = run.q, task = run.task; const minutes = Math.round((Date.now()-run.start)/60000);
  if(run.tick){ clearInterval(run.tick); run.tick = null; }
  wait("Writing Task "+task, "Your tutor is marking your answer…");
  try{
    const data = task==1 && arr(q.series).length ? "\nChart data: "+JSON.stringify({type:q.type, title:q.title, unit:q.unit, categories:q.categories, series:q.series}) : "";
    const rep = await ai(sys(), [{text:`Assess this IELTS Academic Writing Task ${task} answer.
Question: ${q.prompt}${data}
Candidate's answer (${n} words, written in about ${minutes} minutes):
"""${text}"""
${task==1 ? "Task 1 under 150 words must lose marks in Task Achievement. Check that the overview and key features match the data." : "Task 2 under 250 words must lose marks in Task Response."}
overall = the mean of the four criteria, rounded to the nearest 0.5.
Return JSON {"overall": number, "ta": {"band": number, "comment": string}, "cc": {"band": number, "comment": string}, "lr": {"band": number, "comment": string}, "gra": {"band": number, "comment": string},
 "summary": "2-3 sentences", "strengths": [2-3 strings],
 "fixes": [6-10 items {"original": "exact words from the answer", "better": "corrected or upgraded version", "why_id": "short reason in Bahasa Indonesia"}],
 "vocab": [5 items {"word": string, "meaning": string, "example": string}],
 "improved": {"original": "one weak paragraph quoted from the answer", "better": "band 9 rewrite of it"},
 "tips_id": "3 concrete tips in Bahasa Indonesia"}`}], {temp:0.3});
    try{ localStorage.removeItem("azel.ielts.draft"); }catch(e){}
    saveSession({skill:"writing", kind:"task"+task, title:"Task "+task+": "+str(q.title || q.prompt).replace(/\s+/g," ").slice(0,70), report:rep,
      band:clampBand(rep.overall), sub:{ta:clampBand((rep.ta||{}).band), cc:clampBand((rep.cc||{}).band), lr:clampBand((rep.lr||{}).band), gra:clampBand((rep.gra||{}).band)},
      question:q, answer:text, words:n});
  }catch(e){ run.retryText = text; fail("Writing Task "+task, e, "wr-retry"); }
}

/* ---------- READING ---------- */
async function rdNew(){
  wait("Reading", "Your tutor is writing a passage and questions…");
  try{
    const d = await ai(sys(), [{text:`Write an IELTS Academic Reading practice passage of about 750 words on an academic topic (science, history, environment, psychology, technology or society), in paragraphs labelled A to F. Then write exactly 10 questions:
- questions 1-4: TRUE / FALSE / NOT GIVEN (make NOT GIVEN items genuinely not stated)
- questions 5-7: multiple choice with four options A-D
- questions 8-10: sentence completion, answers NO MORE THAN TWO WORDS taken exactly from the passage
JSON {"title": string, "paragraphs": [{"label": "A", "text": string}], "questions": [{"n": number, "type": "tfng" or "mcq" or "gap", "q": string, "options": ["A. ...","B. ...","C. ...","D. ..."] (mcq only), "answer": "TRUE/FALSE/NOT GIVEN, or the option letter, or the exact word(s); alternatives separated by /", "explain_id": "short explanation in Bahasa Indonesia naming the paragraph"}]}`}], {temp:0.8});
    if(!arr(d.paragraphs).length || arr(d.questions).length < 5) throw mkErr("parse");
    run = {mode:"rd", d, ans:{}, start:Date.now(), active:true};
    rdRender();
  }catch(e){ fail("Reading", e, "rd-new"); }
}
function qInputs(q, prefix){
  const n = q.n;
  if(q.type==="tfng") return `<div class="opts">${["TRUE","FALSE","NOT GIVEN"].map(v => `<button class="opt" type="button" data-ia="ans" data-n="${n}" data-v="${v}" aria-pressed="false">${v}</button>`).join("")}</div>`;
  if(q.type==="mcq") return `<div class="opts" style="flex-direction:column">${arr(q.options).map(o => `<button class="opt" type="button" data-ia="ans" data-n="${n}" data-v="${esc(str(o).trim().charAt(0))}" aria-pressed="false">${esc(o)}</button>`).join("")}</div>`;
  return `<input class="in gapin" id="${prefix}${n}" data-n="${n}" autocomplete="off" autocapitalize="off" placeholder="Your answer">`;
}
function rdRender(){
  const d = run.d;
  openRun(head("Reading", "20 minutes · 10 questions") + `
    <div class="section-head"><span class="timerpill" id="rdT">20:00</span><button class="linkbtn" type="button" data-ia="jump">Go to questions ↓</button></div>
    <div class="card passage"><h3>${esc(d.title)}</h3>${arr(d.paragraphs).map(p => `<p><b class="pl">${esc(p.label)}</b>${esc(p.text)}</p>`).join("")}</div>
    <h3 id="qTop">Questions</h3>
    ${arr(d.questions).map(q => `<div class="qitem"><b>${esc(q.n)}. ${esc(q.q)}</b>${qInputs(q,"rd")}</div>`).join("")}
    <button class="btn" type="button" data-ia="rd-check">Check my answers</button>`);
  tickStart(() => { const t = $("rdT"); if(!t) return; const left = 1200 - (Date.now()-run.start)/1000; t.textContent = mmss(left); t.classList.toggle("over", left<0); });
}
const norm = s => str(s).toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
function isRight(q, a){
  if(!a) return false;
  if(q.type==="gap") return str(q.answer).split("/").map(norm).filter(Boolean).includes(norm(a));
  if(q.type==="mcq") return norm(a).charAt(0)===norm(q.answer).charAt(0);
  return norm(a)===norm(q.answer);
}
function collectAnswers(prefix){ document.querySelectorAll(".gapin").forEach(el => { run.ans[el.dataset.n] = el.value.trim(); }); return arr(run.d.questions).map(q => { const a = run.ans[q.n] || ""; return {n:q.n, type:q.type, q:q.q, options:q.options || null, answer:str(q.answer), yours:a, ok:isRight(q,a), explain_id:str(q.explain_id)}; }); }
function rdCheck(){
  const res = collectAnswers("rd"); const raw = res.filter(r => r.ok).length; const total = res.length;
  const scaled = Math.round(raw/total*40);
  saveSession({skill:"reading", kind:"practice", title:str(run.d.title), band:rawToBand(scaled,"reading"), raw, total, scaled,
    minutes:Math.round((Date.now()-run.start)/60000), report:{questions:res, paragraphs:run.d.paragraphs}});
}

/* ---------- LISTENING ---------- */
function listeningMenu(){
  openRun(head("Listening", "IELTS") + `
    <p class="muted">Pick a section. The recording plays once, like the real test. You can read the questions while you listen.</p>
    <div class="practice-grid">
      ${[["1","Everyday conversation","Booking, enquiry: names, numbers, dates."],["2","Everyday talk","One speaker: a tour, a service, an event."],["3","Study discussion","Students and a tutor talk about a project."],["4","Academic lecture","One speaker on an academic topic."]].map(([n,t,s]) => `<button class="ptile" type="button" data-ia="ls-new" data-sec="${n}" style="--sc:${SK.listening.color}"><b>Section ${n}</b><span><b style="font-size:.85rem">${t}</b><br>${s}</span></button>`).join("")}
    </div>
    <p class="muted small">The voices come from your device, so they sound a bit robotic. For real exam audio, use Cambridge IELTS books and log your score.</p>`);
}
async function lsNew(sec){
  wait("Listening Section "+sec, "Your tutor is writing the recording and questions…");
  try{
    const kind = {1:"an everyday conversation between two people (a booking or enquiry, with names, spellings, numbers and dates)", 2:"a monologue in an everyday social context (a tour guide, a facility, a local event)", 3:"an academic discussion between two or three students and/or a tutor about an assignment", 4:"an academic lecture by one speaker"}[sec];
    const d = await ai(sys(), [{text:`Write an IELTS Listening Section ${sec} practice script: ${kind}. About 500 words.
Then write exactly 10 questions in the order the answers are heard: mostly note or sentence completion (answers ONE WORD AND/OR A NUMBER, spelled exactly as in the script) plus 2-3 multiple choice questions with options A-C.
JSON {"title": string, "context": "one sentence the narrator reads before the recording", "lines": [{"speaker": "name", "gender": "female" or "male", "text": string}],
"questions": [{"n": number, "type": "gap" or "mcq", "q": string, "options": ["A. ...","B. ...","C. ..."] (mcq only), "answer": "the exact answer, alternatives separated by /", "explain_id": "short explanation in Bahasa Indonesia"}]}`}], {temp:0.8});
    if(!arr(d.lines).length || arr(d.questions).length < 5) throw mkErr("parse");
    run = {mode:"ls", sec, d, ans:{}, start:Date.now(), played:false, playing:false, active:true};
    lsRender();
  }catch(e){ fail("Listening Section "+sec, e, "ls-new-"+sec); }
}
function lsRender(){
  const d = run.d;
  openRun(head("Listening Section "+run.sec, "Plays once") + `
    <div class="card"><p><b>${esc(d.title)}</b></p><p class="muted small">${esc(d.context)}</p>
      <div class="btn-row"><button class="btn" type="button" data-ia="ls-play" id="lsPlay">▶ Play the recording</button></div>
      <label class="anchor" style="border:0;padding:0"><input type="checkbox" id="lsReplay"><span>Practice mode: allow replay</span></label>
      <p class="small muted" id="lsState">Read the questions first, then press play.</p></div>
    ${arr(d.questions).map(q => `<div class="qitem"><b>${esc(q.n)}. ${esc(q.q)}</b>${qInputs(q,"ls")}</div>`).join("")}
    <button class="btn" type="button" data-ia="ls-check">Check my answers</button>`);
}
function lsPlay(){
  if(run.playing) return;
  if(run.played && !($("lsReplay") && $("lsReplay").checked)){ toast("In the real test it plays only once. Turn on practice mode to replay."); return; }
  if(!window.speechSynthesis){ toast("This device can't play the voices."); return; }
  run.playing = true; run.played = true;
  const lines = [{speaker:"Narrator", gender:"", text:str(run.d.context)}].concat(arr(run.d.lines));
  let i = 0;
  const next = () => {
    if(!run || run.mode!=="ls" || !run.playing) return;
    if(i>=lines.length){ run.playing = false; const s = $("lsState"); if(s) s.textContent = "The recording has finished. Check your answers."; const b = $("lsPlay"); if(b) b.textContent = "▶ Play again (practice mode)"; return; }
    const l = lines[i++]; const s = $("lsState"); if(s) s.textContent = "Playing… "+i+" of "+lines.length;
    speak(str(l.text), l.gender, next);
  };
  stopSpeak(); setTimeout(next, 200);
}
function lsCheck(){
  stopSpeak(); run.playing = false;
  const res = collectAnswers("ls"); const raw = res.filter(r => r.ok).length; const total = res.length;
  const scaled = Math.round(raw/total*40);
  saveSession({skill:"listening", kind:"section"+run.sec, title:"Section "+run.sec+": "+str(run.d.title), band:rawToBand(scaled,"listening"), raw, total, scaled,
    report:{questions:res, lines:run.d.lines, context:run.d.context}});
}

/* ---------- saving + reports ---------- */
function saveSession(s){
  const rec = Object.assign({date:today(), ts:Date.now()}, s);
  const id = put("ielts", rec);
  if(run) run.active = false;
  showReport(id, true);
}
const CRIT = {
  speaking:[["fc","Fluency & coherence"],["lr","Vocabulary"],["gra","Grammar"],["p","Pronunciation"]],
  writing:[["ta","Task achievement / response"],["cc","Coherence & cohesion"],["lr","Vocabulary"],["gra","Grammar"]]
};
function showReport(id, fresh){
  const s = byId("ielts", id);
  if(!s){ closeRun(); return; }
  stopAll();
  run = {mode:"report", sid:id};
  const r = s.report || {};
  let h = head(s.title || "Practice", (SK[s.skill] ? SK[s.skill].name : "IELTS")+" · "+fmtD(s.date || today()));
  h += `<div class="bandbig" style="align-items:center;text-align:center"><span class="label">${s.raw!=null ? `Score ${s.raw} / ${s.total}${s.scaled!=null && s.total!==40 ? " (≈ "+s.scaled+"/40)" : ""}` : "Band"}</span><b>${fmtBand(s.band)}</b>
    ${fresh && typeof s.band==="number" ? `<span class="small muted">${s.band >= (+prefs().target||9) ? "On target. Keep it there." : "Target "+fmtBand(+prefs().target||9)+" · gap "+fmtBand((+prefs().target||9)-s.band)}</span>` : ""}</div>`;
  if(CRIT[s.skill]){
    h += `<div class="crit">${CRIT[s.skill].map(([k,l]) => { const c = r[k] || {}; return `<div class="critc"><div class="cb"><span class="small">${l}</span><b>${fmtBand(clampBand(c.band))}</b></div><span class="small">${esc(c.comment)}</span></div>`; }).join("")}</div>`;
    if(r.summary) h += `<div class="card"><p>${esc(r.summary)}</p>${arr(r.strengths).length ? `<p class="small"><b>Good:</b> ${arr(r.strengths).map(esc).join(" · ")}</p>` : ""}</div>`;
    if(arr(r.fixes).length) h += `<h3>Fix these</h3><div class="section" style="gap:8px">${arr(r.fixes).map(f => `<div class="fix"><span class="o">${esc(f.original)}</span><span class="b">→ ${esc(f.better)}</span>${f.why_id ? `<span class="small muted">${esc(f.why_id)}</span>` : ""}</div>`).join("")}</div>`;
    if(arr(r.vocab).length) h += `<h3>Words to steal</h3><div class="section" style="gap:8px">${arr(r.vocab).map((v,i) => `<div class="fix"><div class="section-head"><b>${esc(v.word)}</b><button class="btn small ghost" type="button" data-ia="addvocab" data-i="${i}">+ Flashcard</button></div><span class="small">${esc(v.meaning)}</span><span class="small muted">“${esc(v.example)}”</span></div>`).join("")}</div>`;
    if(r.model_answer && r.model_answer.answer) h += `<details class="card"><summary>Band 9 model answer</summary><p class="small muted">${esc(r.model_answer.question)}</p><p style="white-space:pre-wrap">${esc(r.model_answer.answer)}</p></details>`;
    if(r.improved && r.improved.better) h += `<details class="card"><summary>One paragraph, rewritten</summary><p class="small o-text">${esc(r.improved.original)}</p><p style="white-space:pre-wrap">${esc(r.improved.better)}</p></details>`;
    if(r.tips_id) h += `<div class="hint"><b>Tips:</b> ${esc(r.tips_id)}</div>`;
    if(arr(s.items).length) h += `<details class="card"><summary>Your answers (transcripts)</summary>${arr(s.items).map(it => `<p class="small"><b>${esc(it.q)}</b><br>${esc(it.transcript || "(no answer)")}${it.secs ? ` <span class="muted">· ${it.secs}s</span>` : ""}</p>`).join("")}</details>`;
    if(s.answer) h += `<details class="card"><summary>Your answer (${s.words||words(s.answer)} words)</summary>${s.question && s.question.series ? task1Visual(s.question) : ""}<p class="small muted" style="white-space:pre-wrap">${esc(s.question ? s.question.prompt : "")}</p><p style="white-space:pre-wrap">${esc(s.answer)}</p></details>`;
  }
  if(arr(r.questions).length){
    h += `<h3>Answers</h3>${arr(r.questions).map(q => `<div class="qitem ${q.ok ? "ok" : "bad"}"><b>${esc(q.n)}. ${esc(q.q)}</b>
      <span class="small">${q.ok ? "✓ Correct" : "✗ Your answer: "+esc(q.yours || "(empty)")} · <b>Answer: ${esc(q.answer)}</b></span>${q.explain_id ? `<span class="small muted">${esc(q.explain_id)}</span>` : ""}</div>`).join("")}`;
    if(arr(r.paragraphs).length) h += `<details class="card passage"><summary>Passage</summary>${arr(r.paragraphs).map(p => `<p><b class="pl">${esc(p.label)}</b>${esc(p.text)}</p>`).join("")}</details>`;
    if(arr(r.lines).length) h += `<details class="card"><summary>Recording script</summary>${arr(r.lines).map(l => `<p class="small"><b>${esc(l.speaker)}:</b> ${esc(l.text)}</p>`).join("")}</details>`;
  }
  if(s.kind==="manual") h += `<div class="card"><p>${esc(s.source || "Logged score")}</p>${s.raw!=null ? `<p class="small muted">${s.raw} / 40 correct</p>` : ""}</div>`;
  h += `<div class="btn-row"><button class="btn" type="button" data-ia="close">Done</button><button class="btn ghost" type="button" data-ia="delsess" data-id="${esc(id)}">Delete this record</button></div>`;
  openRun(h);
}
function addVocab(i){
  const s = byId("ielts", run && run.sid); if(!s) return;
  const v = arr((s.report||{}).vocab)[i]; if(!v) return;
  const front = str(v.word), back = str(v.meaning)+(v.example ? "\n“"+str(v.example)+"”" : "");
  let set = D.cols.sets.find(x => x.course==="ielts" && x.title==="IELTS vocabulary");
  const card = {id:newId(), f:front, b:back};
  if(set){
    if(arr(set.cards).some(c => str(c.f).toLowerCase()===front.toLowerCase())){ toast("Already in your IELTS flashcards."); return; }
    set = Object.assign({}, set, {cards:arr(set.cards).concat([card])}); delete set.updatedAt;
  } else set = {course:"ielts", title:"IELTS vocabulary", cards:[card], createdAt:Date.now()};
  put("sets", set); toast("Added to your IELTS flashcards.");
}

/* ---------- manual log + settings ---------- */
function logForm(){
  openRun(head("Log a score", "From a book, website or mock test") + `
    ${field("lgSkill","Skill",`<select id="lgSkill">${SKILLS.map(s => `<option value="${s}">${SK[s].name}</option>`).join("")}</select>`)}
    ${field("lgDate","Date",`<input class="in" type="date" id="lgDate" value="${today()}">`)}
    ${field("lgSrc","Source",`<input class="in" id="lgSrc" maxlength="80" placeholder="e.g. Cambridge IELTS 18, Test 2">`)}
    <div id="lgRawWrap">${field("lgRaw","Correct answers (out of 40)",`<input class="in" id="lgRaw" type="number" min="0" max="40" inputmode="numeric">`)}<p class="small muted" id="lgRawB"></p></div>
    <div id="lgBandWrap" hidden>${field("lgBand","Band",`<select id="lgBand">${Array.from({length:19},(_,i) => 9-i*0.5).map(b => `<option value="${b}"${b===6.5?" selected":""}>${fmtBand(b)}</option>`).join("")}</select>`)}</div>
    <div class="notice" id="lgErr" hidden></div>
    <button class="btn" type="button" data-ia="lg-save">Save score</button>`);
  const sync = () => { const s = $("lgSkill").value; const raw = s==="listening" || s==="reading"; $("lgRawWrap").hidden = !raw; $("lgBandWrap").hidden = raw;
    const v = $("lgRaw").value; $("lgRawB").textContent = raw && v!=="" ? "Band "+fmtBand(rawToBand(Math.min(40,Math.max(0,+v)), s)) : ""; };
  $("lgSkill").addEventListener("change", sync); $("lgRaw").addEventListener("input", sync); sync();
}
function logSave(){
  const skill = $("lgSkill").value; const raw = skill==="listening" || skill==="reading";
  const rec = {skill, kind:"manual", date:$("lgDate").value || today(), ts:Date.now(), source:$("lgSrc").value.trim()};
  if(raw){ const v = $("lgRaw").value; if(v===""){ $("lgErr").hidden = false; $("lgErr").textContent = "Type how many answers you got right."; return; } rec.raw = Math.min(40, Math.max(0, Math.round(+v))); rec.total = 40; rec.band = rawToBand(rec.raw, skill); }
  else rec.band = +$("lgBand").value;
  rec.title = (rec.source || SK[skill].name+" score");
  const day = parseDay(rec.date); rec.ts = day.getTime() + 12*3600e3;
  put("ielts", rec); closeRun(); toast("Score saved.");
}
function settingsForm(focusKey){
  const pf = prefs();
  openRun(head("IELTS settings", "Target and AI tutor") + `
    <div class="card">
      <div class="grid2">${field("stTarget","Target band",`<select id="stTarget">${Array.from({length:9},(_,i) => 9-i*0.5).map(b => `<option value="${b}"${b===(+pf.target||9)?" selected":""}>${fmtBand(b)}</option>`).join("")}</select>`)}
      ${field("stDate","Test date",`<input class="in" type="date" id="stDate" value="${esc(pf.testDate||"")}">`)}</div>
      <label class="anchor" style="border:0;padding:0"><input type="checkbox" id="stVoice"${pf.voice!==false?" checked":""}><span>Examiner reads Speaking questions out loud</span></label>
    </div>
    <div class="card">
      <h3>AI tutor (Gemini)</h3>
      <p class="small">${pf.key ? `<span class="pos"><b>Connected.</b></span> Key ending in ${esc(pf.key.slice(-4))}.` : `<b>Not set up yet.</b> It's free and takes about 5 minutes.`}</p>
      <ol class="small" style="margin:0;padding-left:1.2em;display:flex;flex-direction:column;gap:4px">
        <li>On your laptop, open <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a> and sign in with your Google account.</li>
        <li>Click <b>Create API key</b>. If it asks for a project, choose <b>azel-planner</b>.</li>
        <li>Copy the key (it starts with <b>AIza</b>) and paste it below.</li>
      </ol>
      ${field("stKey","Gemini API key",`<input class="in" id="stKey" type="password" autocomplete="off" placeholder="${pf.key ? "Leave empty to keep your current key" : "AIza…"}">`)}
      <p class="small muted">The key is saved in your private planner and syncs to your devices. It's never put on GitHub. With a free key, Google may use your practice answers to improve its products, so don't put personal details in your answers.</p>
      <div class="notice" id="stMsg" hidden></div>
      <div class="btn-row"><button class="btn" type="button" data-ia="st-save">Save</button>${pf.key ? `<button class="btn ghost" type="button" data-ia="st-test">Test my AI tutor</button>` : ""}</div>
      ${pf.model ? `<p class="small muted">Model in use: ${esc(pf.model)}</p>` : ""}
    </div>`);
  if(focusKey) setTimeout(() => { const k = $("stKey"); if(k) k.focus(); }, 80);
}
async function settingsSave(){
  const key = $("stKey").value.trim();
  const patch = {target:+$("stTarget").value, testDate:$("stDate").value, voice:$("stVoice").checked};
  if(key){
    if(!/^AIza[0-9A-Za-z_\-]{20,}$/.test(key)){ $("stMsg").hidden = false; $("stMsg").textContent = "That doesn't look like a Gemini key. It should start with AIza."; return; }
    patch.key = key; patch.model = "";
  }
  savePrefs(patch);
  if(key){ $("stMsg").hidden = false; $("stMsg").textContent = "Saved. Checking your key…"; await settingsTest(); }
  else { closeRun(); toast("Settings saved."); }
}
async function settingsTest(){
  const msg = $("stMsg"); if(msg){ msg.hidden = false; msg.textContent = "Checking your key…"; }
  try{
    const r = await ai("Reply with JSON only.", [{text:'Return {"ok": true, "hello": "a one-line friendly greeting for an IELTS student called Azel"}'}], {temp:0.5});
    if(msg) msg.textContent = "Your AI tutor is ready! "+str(r.hello);
    toast("AI tutor connected.");
  }catch(e){ if(msg) msg.textContent = errMsg(e); }
}

/* ---------- events ---------- */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-ia]"); if(!el) return;
  const a = el.dataset.ia;
  switch(a){
    case "close":
      if(run && run.active && run.mode!=="report"){ twoTap(el, "Tap again to leave", () => closeRun()); }
      else closeRun();
      break;
    case "settings": settingsForm(false); break;
    case "aikey": settingsForm(true); break;
    case "st-save": settingsSave(); break;
    case "st-test": settingsTest(); break;
    case "style": savePrefs({style:el.dataset.v}); toast(el.dataset.v==="friendly" ? "Friendly Coach is on." : "Strict Examiner is on."); break;
    case "log": logForm(); break;
    case "lg-save": logSave(); break;
    case "open": showReport(el.dataset.id, false); break;
    case "delsess": twoTap(el, "Tap again to delete", () => { del("ielts", el.dataset.id); closeRun(); toast("Deleted."); }); break;
    case "addvocab": addVocab(+el.dataset.i); break;
    case "go-speaking": speakingMenu(); break;
    case "go-writing": writingMenu(); break;
    case "go-reading": rdNew(); break;
    case "go-listening": listeningMenu(); break;
    case "sp-mock": { const v = $("spVoice"); if(v) savePrefs({voice:v.checked}); spMock(); break; }
    case "sp-quick": { const v = $("spVoice"); if(v) savePrefs({voice:v.checked}); spQuick(+el.dataset.part); break; }
    case "sp-quick-1": case "sp-quick-2": case "sp-quick-3": spQuick(+a.slice(-1)); break;
    case "sp-hear": { const st = run && run.steps && run.steps[run.i]; if(st) speak(st.q || cueText(st.cue)); break; }
    case "sp-rec": if(run && (run.phase==="ask" || run.phase==="prep")){ const n = $("cueNotes"); if(n) run.notes = n.value; run.phase = "go"; spRecord(); } break;
    case "sp-stop": spStop(); break;
    case "sp-skip": spSkip(); break;
    case "sp-rescore": if(run && run.answers && run.answers.length){ if(run.kind==="mock"){ run.answers.forEach(x => { x.p = transcribe(x); }); spScoreMock(); } else spScoreQuick(); } else speakingMenu(); break;
    case "wr-new": wrNew(+el.dataset.task); break;
    case "wr-new-1": wrNew(1); break;
    case "wr-new-2": wrNew(2); break;
    case "wr-own": wrOwn(+el.dataset.task); break;
    case "wr-own-go": { const q = $("wrQ").value.trim(); if(q.length<20){ toast("Paste the full question first."); break; } wrStart(+el.dataset.task, {prompt:q}); break; }
    case "wr-submit": wrSubmit(); break;
    case "wr-retry": if(run && run.retryText!=null){ const t = run.retryText; wrStart(run.task, run.q); $("wrText").value = t; wrSubmit(); } break;
    case "rd-new": rdNew(); break;
    case "jump": { const t = $("qTop"); if(t) t.scrollIntoView({behavior:"smooth"}); break; }
    case "ans": {
      if(!run || !run.ans) break;
      run.ans[el.dataset.n] = el.dataset.v;
      el.parentElement.querySelectorAll(".opt").forEach(b => b.setAttribute("aria-pressed", String(b===el)));
      break;
    }
    case "rd-check": rdCheck(); break;
    case "ls-new": lsNew(+el.dataset.sec); break;
    case "ls-new-1": case "ls-new-2": case "ls-new-3": case "ls-new-4": lsNew(+a.slice(-1)); break;
    case "ls-play": lsPlay(); break;
    case "ls-check": lsCheck(); break;
  }
});
document.addEventListener("input", e => { if(["cL","cR","cW","cS"].includes(e.target.id)) calc(); });
document.addEventListener("change", e => { if(["cW","cS"].includes(e.target.id)) calc(); });
document.addEventListener("keydown", e => { if(e.key==="Escape" && !$("ieltsRun").hidden && !(run && run.active && run.mode!=="report")) closeRun(); });

window.__ieltsRender = render;
try{ calc(); }catch(e){}
render();
})();
