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

function prefs(){ return Object.assign({target:9, testDate:"", key:"", model:"", style:"strict", voice:true, pauseSecs:10, voiceName:""}, byId("prefs","ielts") || {}); }
function savePrefs(patch){ const p = Object.assign({}, byId("prefs","ielts") || {}, patch, {id:"ielts"}); delete p.updatedAt; put("prefs", p); }
const sessions = () => D.cols.ielts.slice().sort((a,b) => (a.ts||0)-(b.ts||0));
function latestBand(skill){
  const s = sessions().filter(x => x.skill===skill && typeof x.band==="number");
  if(!s.length) return null;
  const last = s.slice(-3);
  return roundBand(last.reduce((a,x) => a+x.band, 0)/last.length);
}

/* ---------- AI (Gemini) ---------- */
const MODELS = ["gemini-flash-latest","gemini-3.8-flash","gemini-3.6-flash","gemini-3.5-flash-lite","gemini-3.1-flash-lite"];
const STYLE = {
  strict: "You are a strict, senior IELTS examiner. Hold the candidate to the band 9 standard. Be blunt and direct: no compliments unless truly earned, no softening phrases, name every important error plainly. Never insult, swear at, mock or belittle the candidate as a person. Be tough on the work, never on the person.",
  friendly: "You are a warm, encouraging IELTS coach. Begin with what genuinely went well, then give clear and honest corrections. Encouraging tone, but never inflate band scores."
};
const BASE = " Use the official IELTS public band descriptors. Give realistic scores in steps of 0.5 and do not inflate them. Write comments in simple, natural English (around B2 level). The student is Indonesian: write every field named why_id or tips_id in simple Bahasa Indonesia. Reply with valid JSON only, in exactly the shape requested.";
const sys = () => (STYLE[prefs().style] || STYLE.strict) + BASE;
const ERR = {
  nokey:"Set up your AI tutor key first: IELTS → Settings.",
  badkey:"Your Gemini key didn't work. Check it in IELTS → Settings.",
  rate:"Pita's free limit is used up for now. Wait a minute and try again, or come back tomorrow. You won't be charged anything.",
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
const COOL = {}; // models that just hit their free limit rest for a while
async function ai(system, parts, opts){
  opts = opts || {};
  const pf = prefs();
  if(!pf.key) throw mkErr("nokey");
  const now = Date.now();
  let list = [pf.model, ...MODELS].filter((m,i,a) => m && a.indexOf(m)===i);
  const ready = list.filter(m => !(COOL[m] > now)); if(ready.length) list = ready;
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
    if(r.status===429){ COOL[m] = Date.now() + (/per.?day|daily|limit: ?0/i.test(txt) ? 6*3600e3 : 60e3); last = mkErr("rate"); continue; }
    if(r.status===404 || (r.status===400 && /model|not found|not supported/i.test(txt) && !/api.?key/i.test(txt))){ last = mkErr("model"); continue; }
    if(r.status===401 && /ACCESS_TOKEN_TYPE_UNSUPPORTED/i.test(txt)){ last = mkErr("badkey"); continue; }
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
// How natural a voice usually sounds, from its name (higher is better).
function voiceScore(v){
  const n = v.name || "";
  let s = 0;
  if(/natural|neural/i.test(n)) s += 60;          // Microsoft Edge "Online (Natural)" voices
  if(/premium/i.test(n)) s += 55;                 // Apple Premium voices (downloaded)
  if(/enhanced/i.test(n)) s += 45;                // Apple Enhanced voices (downloaded)
  if(/siri/i.test(n)) s += 40;
  if(/^google/i.test(n)) s += 25;                 // Chrome's online Google voices
  if(/online/i.test(n)) s += 10;
  if(/GB|AU|IE|NZ/i.test(v.lang)) s += 8;
  if(/compact|espeak|eloquence|grandpa|grandma|bad news|bells|boing|bubbles|cellos|jester|organ|trinoids|whisper|wobble|zarvox|albert|fred|junior|ralph|superstar|bahh/i.test(n)) s -= 80;
  return s;
}
function englishVoices(){ return voices.filter(v => /^en[-_]/i.test(v.lang)).slice().sort((a,b) => voiceScore(b) - voiceScore(a) || a.name.localeCompare(b.name)); }
function pickVoice(gender){
  const saved = prefs().voiceName;
  if(saved && gender!=="male"){ const v = voices.find(x => x.name===saved); if(v) return v; }
  const en = englishVoices();
  const gb = en.filter(v => /GB|AU|IE/i.test(v.lang));
  const pool = gb.length ? gb : en;
  const fem = /female|samantha|serena|kate|karen|moira|tessa|fiona|martha|libby|sonia|hazel|susan|zira|aria|jenny|natasha|google uk english female/i;
  const mal = /male|daniel|arthur|oliver|george|ryan|thomas|rishi|james|guy|google uk english male/i;
  const best = pool.filter(v => voiceScore(v) >= 40);
  if(gender==="female"){ const g = best.find(v => fem.test(v.name) && !/\bmale\b/i.test(v.name.replace(/female/i,""))); if(g) return g; }
  if(gender==="male"){ const g = best.find(v => mal.test(v.name) && !/female/i.test(v.name)); if(g) return g; }
  if(gender==="female") return pool.find(v => fem.test(v.name) && !/\bmale\b/i.test(v.name.replace(/female/i,""))) || pool[0] || en[0] || null;
  if(gender==="male") return pool.find(v => mal.test(v.name) && !/female/i.test(v.name)) || pool[1] || pool[0] || en[0] || null;
  return pool[0] || en[0] || null;
}
function speak(text, gender, onend){
  if(!window.speechSynthesis){ if(onend) onend(); return; }
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice(gender); if(v){ u.voice = v; u.lang = v.lang; } else u.lang = "en-GB";
  u.rate = voiceScore(v || {}) >= 40 ? 1 : 0.95; if(!v && gender==="male") u.pitch = 0.8; if(!v && gender==="female") u.pitch = 1.15;
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
  const all4 = overall!=null;
  const hm = !pf.key ? "asking" : !sessions().length ? "happy" : all4 && overall>=t ? "love" : "normal";
  const line = !pf.key ? "Hi Azel! Give me my key in Settings so I can talk with you." : !sessions().length ? "Hi Azel! I'm Pita, your IELTS tutor. Tap me and let's talk!" : all4 && overall>=t ? "You're at your target. I'm so proud of you!" : "Ready for a quick chat? Tap me to practise speaking.";
  if($("iePita")){ if(!homePita || !$("iePita").firstChild) homePita = mountPita($("iePita"), hm); else homePita.mood(hm); }
  if($("iePitaSay")) $("iePitaSay").textContent = line;
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
let run = null, pita = null, homePita = null;
const MOODLIST = '"normal","happy","angry","strict","confused","asking","sad","love","surprised","thinking"';
const validMood = m => (window.Pita && Pita.MOODS.includes(m)) ? m : "normal";
const mountPita = (el, mood) => (window.Pita && el) ? Pita.create(el, {mood: validMood(mood)}) : null;
let runHide = 0;
function openRun(html){ clearTimeout(runHide); $("ieltsRun").classList.remove("closing"); $("ieltsRun").hidden = false; $("ieltsRunIn").innerHTML = html; $("ieltsRun").scrollTop = 0; }
function stopAll(){ cancelRec(); stopSpeak(); if(run && run.tick){ clearInterval(run.tick); run.tick = null; } if(run && run.ctl && !run.ctl.done) run.ctl.finish("abort"); }
function closeRun(){ if(run) run.aborted = true; stopAll(); if(run && run.wake) run.wake("abort"); Mic.close(); run = null; pita = null;
  const box = $("ieltsRun"); if(box.hidden) return;
  let rm = false; try{ rm = matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){}
  const done = () => { box.classList.remove("closing"); box.hidden = true; $("ieltsRunIn").innerHTML = ""; };
  if(rm){ done(); return; }
  box.classList.add("closing"); clearTimeout(runHide); runHide = setTimeout(done, 220);
}
const head = (title, sub) => `<div class="section-head"><div><div class="label">${esc(sub||"")}</div><h2>${esc(title)}</h2></div><button class="btn ghost small" type="button" data-ia="close">Close</button></div>`;
function wait(title, msg){
  openRun(head(title, "AI tutor") + `<div class="card ai-wait"><div class="pita-wrap small-pita" id="waitPita"></div><p>${esc(msg)}</p><p class="muted small">Keep this screen open.</p></div>`);
  const p = mountPita($("waitPita"), "thinking"); if(p) p.state("think");
}
function fail(title, e, retry){
  openRun(head(title, "AI tutor") + `<div class="card ai-wait"><div class="pita-wrap small-pita" id="failPita"></div><p class="neg"><b>${esc(errMsg(e))}</b></p>
    <div class="btn-row">${retry ? `<button class="btn" type="button" data-ia="${retry}">Try again</button>` : ""}${e && (e.code==="nokey"||e.code==="badkey") ? `<button class="btn ghost" type="button" data-ia="settings">Open settings</button>` : ""}</div></div>`);
  mountPita($("failPita"), e && (e.code==="nokey"||e.code==="badkey") ? "asking" : "sad");
}
function tickStart(fn){ if(run.tick) clearInterval(run.tick); run.tick = setInterval(fn, 250); fn(); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
const waitFor = () => new Promise(res => { run.wake = v => { run.wake = null; res(v); }; });

/* ---------- microphone with voice detection ---------- */
const Mic = {stream:null, ctx:null, an:null, src:null, sink:null, buf:null, bbuf:null, noise:0.008,
  live(){ return !!(this.stream && this.stream.active && this.stream.getAudioTracks().some(t => t.readyState==="live")); },
  async open(){
    if(!navigator.mediaDevices || !window.MediaRecorder) throw mkErr("nomic");
    const AC = window.AudioContext || window.webkitAudioContext;
    // create/resume the audio context while we are still inside the tap (iPad needs this)
    if((!this.ctx || this.ctx.state==="closed") && AC){ try{ this.ctx = new AC(); }catch(e){ this.ctx = null; } }
    if(this.ctx){ try{ this.ctx.resume(); }catch(e){} }
    if(!this.live()){
      try{ this.stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true, noiseSuppression:true, autoGainControl:true}}); }
      catch(e){ throw mkErr("mic"); }
    }
    await this.ensure();
  },
  // reconnect the level meter to the mic; on iPad the audio can go quiet after Pita speaks
  wire(){
    if(!this.ctx || !this.stream) return;
    try{ if(this.src) this.src.disconnect(); }catch(e){}
    try{ if(this.sink) this.sink.disconnect(); }catch(e){}
    try{
      this.src = this.ctx.createMediaStreamSource(this.stream);
      this.an = this.ctx.createAnalyser(); this.an.fftSize = 1024; this.src.connect(this.an);
      // Safari only measures audio that flows to the speakers, so send it there at zero volume
      this.sink = this.ctx.createGain(); this.sink.gain.value = 0; this.an.connect(this.sink); this.sink.connect(this.ctx.destination);
      this.buf = new Float32Array(this.an.fftSize); this.bbuf = new Uint8Array(this.an.fftSize);
    }catch(e){ this.an = null; }
  },
  // iPad: hand the mic back while Pita talks, and take a fresh one when it's your turn
  release(){ if(this.stream) this.stream.getTracks().forEach(t => t.stop()); this.stream = null; try{ if(this.src) this.src.disconnect(); }catch(e){} this.src = null; this.an = null; },
  async ensure(){
    const muted = this.stream && this.stream.getAudioTracks().some(t => t.muted);
    if(muted) this.release();
    if(!this.live()){ try{ this.stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true, noiseSuppression:true, autoGainControl:true}}); }catch(e){ return; } }
    const AC = window.AudioContext || window.webkitAudioContext;
    if((!this.ctx || this.ctx.state==="closed") && AC){ try{ this.ctx = new AC(); }catch(e){ return; } }
    if(this.ctx && this.ctx.state!=="running"){ try{ await Promise.race([this.ctx.resume(), sleep(400)]); }catch(e){} }
    this.wire();
  },
  rms(){
    if(!this.an) return -1;
    let s = 0;
    if(this.an.getFloatTimeDomainData){ this.an.getFloatTimeDomainData(this.buf); for(let i=0;i<this.buf.length;i++) s += this.buf[i]*this.buf[i]; return Math.sqrt(s/this.buf.length); }
    this.an.getByteTimeDomainData(this.bbuf); for(let i=0;i<this.bbuf.length;i++){ const v = (this.bbuf[i]-128)/128; s += v*v; } return Math.sqrt(s/this.bbuf.length);
  },
  close(){ if(this.stream) this.stream.getTracks().forEach(t => t.stop()); this.stream = null; this.an = null; this.src = null; this.sink = null; if(this.ctx){ try{ this.ctx.close(); }catch(e){} } this.ctx = null; }
};
// any tap wakes the audio up again if the iPad paused it
["pointerdown","touchend","keydown"].forEach(ev => document.addEventListener(ev, () => { if(Mic.ctx && Mic.ctx.state!=="running"){ try{ Mic.ctx.resume(); }catch(e){} } }, {passive:true, capture:true}));
const IOS = /iPad|iPhone|iPod/.test(navigator.userAgent || "") || (navigator.platform==="MacIntel" && navigator.maxTouchPoints > 1);
function unlockSpeech(){ try{ if(window.speechSynthesis){ const u = new SpeechSynthesisUtterance(" "); u.volume = 0; speechSynthesis.speak(u); } }catch(e){} }
/* Records one answer. Stops by itself after a pause in speech (hands-free), or when a button finishes it. */
async function listen(o){
  await Mic.ensure();
  if(!run || run.aborted) return null;
  return new Promise(resolve => {
    const ctl = run.ctl = {done:false};
    let mr; const chunks = [];
    try{ mr = new MediaRecorder(Mic.stream); }catch(e){ ctl.done = true; resolve({error:mkErr("nomic")}); return; }
    mr.ondataavailable = e => { if(e.data && e.data.size) chunks.push(e.data); };
    const start = Date.now(); let speaking = false, above = 0, below = 0, first = 0, hinted = false, flat = 0, fixes = 0, deaf = false;
    const tEl = $("stTimer"); if(tEl){ tEl.hidden = false; tEl.classList.remove("over"); }
    const finish = reason => {
      if(ctl.done) return; ctl.done = true; clearInterval(iv); if(pita) pita.level(0);
      if(tEl) tEl.hidden = true;
      const secs = (Date.now()-start)/1000;
      mr.onstop = () => {
        if(reason==="abort") return resolve(null);
        if(reason==="pause") return resolve({paused:true});
        if(reason==="skip") return resolve({skipped:true});
        if(reason==="timeout") return resolve({timeout:true});
        if(reason==="retry") return resolve({retry:true});
        resolve({blob:new Blob(chunks, {type:mr.mimeType || "audio/webm"}), secs, spoke:speaking || secs>2, end: reason==="end"});
      };
      try{ mr.stop(); }catch(e){ resolve(null); }
    };
    ctl.finish = finish;
    mr.start(250);
    const iv = setInterval(() => {
      let r = Mic.rms(); const thr = Math.max(0.012, Mic.noise*3.2);
      // a real mic is never perfectly silent; exact zeros mean the level meter stopped
      if(!deaf && r < 1e-7){ flat += 50;
        if(flat >= 1200){ flat = 0; fixes++;
          if(fixes===1 && !speaking && (o.retries||0) < 2){ finish("retry"); return; }
          if(fixes <= 2){ if(Mic.ctx && Mic.ctx.state!=="running"){ try{ Mic.ctx.resume(); }catch(e){} } Mic.wire(); }
          else { deaf = true; const hh = $("stHint"); if(hh) hh.textContent = "I'm recording, but I can't see your voice level on this device. Just talk, then tap “I'm done talking”."; }
        }
      } else if(r > 1e-7) flat = 0;
      if(deaf){ if(pita) pita.level(0.25 + 0.2*Math.sin(Date.now()/180)); const el2 = (Date.now()-start)/1000; if(tEl) tEl.textContent = mmss(el2) + (o.maxSecs ? " / "+mmss(o.maxSecs) : ""); if(o.maxSecs && el2 >= o.maxSecs) finish("ok"); return; }
      r = Math.max(0, r);
      if(pita) pita.level(Math.min(1, r/(thr*4)));
      if(!speaking) Mic.noise = Mic.noise*0.96 + Math.min(r, 0.05)*0.04;
      if(r > thr){ above += 50; below = 0; } else { below += 50; above = Math.max(0, above-25); }
      const h = $("stHint");
      const talkHint = o.handsFree ? "I'm listening… take your time. Tap “I'm done talking” to send it now." : "I'm listening… tap “I'm done talking” when you finish.";
      if(!speaking && above >= 200){ speaking = true; first = Date.now(); if(h) h.textContent = talkHint; }
      if(o.handsFree && speaking && h){
        if(below >= 2000 && below < o.silenceMs){ const left = Math.ceil((o.silenceMs - below)/1000); h.textContent = "Still listening… Pita answers in "+left+"s. Keep going if you're thinking."; hinted = true; }
        else if(hinted && below === 0){ h.textContent = talkHint; hinted = false; }
      }
      const el = (Date.now()-start)/1000;
      if(tEl) tEl.textContent = mmss(el) + (o.maxSecs ? " / "+mmss(o.maxSecs) : "");
      if(o.handsFree && speaking && below >= o.silenceMs && Date.now()-first > 900) finish("ok");
      else if(o.maxSecs && el >= o.maxSecs) finish("ok");
      else if(!speaking && el > (o.waitSecs || 25)) finish("timeout");
    }, 50);
  });
}
const setHTML = (id, h) => { const e = $(id); if(e) e.innerHTML = h; };
const setText = (id, t) => { const e = $(id); if(e){ e.textContent = t; e.hidden = !t; } };
function stage(title, label){
  openRun(`<div class="section-head"><div><div class="label" id="stLabel">${esc(label||"")}</div><h2>${esc(title)}</h2></div><button class="btn ghost small" type="button" data-ia="close">Close</button></div>
    <div class="stage"><div class="pita-wrap" id="pitaBox"></div><span class="timerpill" id="stTimer" hidden></span></div>
    <div class="bubble tutor" id="sayT" hidden></div>
    <div class="bubble you" id="sayY" hidden></div>
    <div id="stExtra"></div>
    <p class="small muted" id="stHint" style="text-align:center"></p>
    <div class="btn-row" id="stCtrl"></div>`);
  pita = mountPita($("pitaBox"), "happy");
}
function sayAloud(text, gender){
  return new Promise(res => {
    if(!text){ res(); return; }
    if(!window.speechSynthesis || prefs().voice===false){ setTimeout(res, Math.min(6000, 900 + text.length*45)); return; }
    if(IOS) Mic.release();
    stopSpeak();
    const parts = (text.match(/[^.!?]+[.!?]*/g) || [text]).map(s => s.trim()).filter(Boolean);
    let i = 0, done = false;
    const end = () => { if(!done){ done = true; clearTimeout(safety); res(); } };
    const safety = setTimeout(end, 5000 + text.length*110);
    const next = () => { if(done) return; if(i>=parts.length || !run || run.aborted){ end(); return; } speak(parts[i++], gender, next); };
    next();
  });
}
async function tutorSays(text, mood){
  if(!run || run.aborted) return;
  if(pita){ pita.mood(validMood(mood)); pita.state("speak"); }
  setText("sayT", text); setHTML("stCtrl", ""); setText("stHint", "");
  await sayAloud(text, "female");
  if(pita) pita.state("idle");
}
async function listenUI(o){
  const handsFree = prefs().handsfree!==false;
  let retries = 0;
  for(;;){
    if(!run || run.aborted) return null;
    if(pita) pita.state("listen");
    setText("stHint", handsFree ? "Your turn. Just start talking. Pita waits "+Math.max(3, +prefs().pauseSecs || 10)+" seconds after you stop." : "Your turn. Tap “I'm done talking” when you finish.");
    setHTML("stCtrl", `<button class="btn" type="button" data-ia="st-done">I'm done talking</button><button class="btn ghost" type="button" data-ia="st-pause">Pause</button>`
      + (o.skip ? `<button class="btn ghost" type="button" data-ia="st-skip">Skip</button>` : "")
      + (o.end ? `<button class="btn ghost" type="button" data-ia="st-end">Finish &amp; get my band</button>` : ""));
    const pause = Math.max(3, +prefs().pauseSecs || 10)*1000;
    const r = await listen(Object.assign({handsFree}, o, {silenceMs: Math.max(o.silenceMs || 0, pause), retries}));
    if(r && r.retry && run && !run.aborted){ retries++; Mic.release(); await sleep(250); continue; }
    if(pita) pita.state("idle");
    if(!r || !run || run.aborted) return null;
    if(r.error){ setText("stHint", errMsg(r.error)); return null; }
    if(r.paused || r.timeout){
      if(pita) pita.mood(r.timeout ? "asking" : "normal");
      setText("stHint", r.timeout ? "I didn't hear anything. Take your time." : "Paused.");
      setHTML("stCtrl", `<button class="btn" type="button" data-ia="st-go">${r.timeout ? "I'm ready to answer" : "Continue"}</button>` + (o.skip ? `<button class="btn ghost" type="button" data-ia="st-skip">Skip</button>` : "") + (o.end ? `<button class="btn ghost" type="button" data-ia="st-end">Finish &amp; get my band</button>` : ""));
      const v = await waitFor();
      if(v==="abort") return null;
      if(v==="skip") return {skipped:true};
      if(v==="end") return {end:true};
      continue;
    }
    return r;
  }
}

/* ---------- SPEAKING ---------- */
function speakingMenu(){
  const pf = prefs();
  openRun(head("Speaking", "IELTS") + `
    <button class="ptile" type="button" data-ia="sp-talk" style="--sc:${SK.speaking.color}"><b>Talk with Pita</b><span>A real conversation. Pita asks, listens, reacts and corrects you. Get your band when you finish.</span></button>
    <button class="ptile" type="button" data-ia="sp-mock" style="--sc:${SK.speaking.color}"><b>Full mock test</b><span>Part 1, 2 and 3, like the real test (about 12 minutes). Scored at the end.</span></button>
    <div class="practice-grid three">
      <button class="ptile" type="button" data-ia="sp-quick" data-part="1" style="--sc:${SK.speaking.color}"><b>Part 1</b><span>One everyday question.</span></button>
      <button class="ptile" type="button" data-ia="sp-quick" data-part="2" style="--sc:${SK.speaking.color}"><b>Part 2</b><span>Cue card: prepare 1 min, talk 2 min.</span></button>
      <button class="ptile" type="button" data-ia="sp-quick" data-part="3" style="--sc:${SK.speaking.color}"><b>Part 3</b><span>One discussion question.</span></button>
    </div>
    <label class="anchor" style="border:0;padding:0"><input type="checkbox" id="spHands"${pf.handsfree!==false ? " checked" : ""}><span>Hands-free: Pita notices when you stop talking</span></label>
    <label class="anchor" style="border:0;padding:0"><input type="checkbox" id="spVoice"${pf.voice!==false ? " checked" : ""}><span>Pita speaks out loud</span></label>
    <div class="field"><label for="spPause">When I stop talking, Pita waits</label>
      <div class="segs" id="spPause" role="group" aria-label="Pause before Pita answers">${[3,5,8,10,15].map(n => `<button type="button" data-ia="sp-pause" data-v="${n}" aria-pressed="${(+pf.pauseSecs||10)===n}">${n}s</button>`).join("")}</div></div>
    <div class="field"><label for="spVoiceName">Pita's voice</label>
      <div style="display:flex;gap:8px"><select id="spVoiceName" style="flex:1;min-width:0">${voiceOptions(pf.voiceName)}</select><button class="btn ghost small" type="button" data-ia="sp-hear">Hear Pita</button></div>
      <p class="muted small" style="margin-top:6px">${voiceTip()}</p></div>
    <div class="field"><label>Mic check</label>
      <div style="display:flex;gap:8px;align-items:center"><button class="btn ghost small" type="button" data-ia="sp-mictest">Test my mic</button><div class="micmeter"><i id="micBar"></i></div></div>
      <p class="muted small" id="micMsg" style="margin-top:6px">Tap, then say something. The bar should move.</p></div>
    <p class="muted small">Find a quiet place. Earphones work best, so Pita doesn't hear her own voice. The first time, tap Allow for the microphone.</p>`);
}
function voiceOptions(sel){
  const list = englishVoices();
  if(!list.length) return `<option value="">Device voice</option>`;
  return `<option value="">Automatic (best on this device)</option>` + list.map(v => `<option value="${esc(v.name)}"${v.name===sel ? " selected" : ""}>${esc(v.name.replace(/^Microsoft /,"").replace(/ - English.*$/,""))} (${esc(v.lang)})${voiceScore(v)>=40 ? " ★" : ""}</option>`).join("");
}
function voiceTip(){
  const ua = navigator.userAgent || "";
  if(/iPhone|iPad|Macintosh/i.test(ua) && "ontouchend" in document) return "For a nicer voice: iPhone/iPad Settings → Accessibility → Spoken Content → Voices → English, download a voice marked Enhanced or Premium, then pick it here. ★ = natural voice.";
  if(/Edg\//.test(ua)) return "★ = natural voice. The “Natural” voices in Edge sound the most human.";
  return "★ = natural voice. On a laptop, Microsoft Edge has free “Natural” voices that sound much more human.";
}
let micTest = 0;
async function testMic(){
  clearInterval(micTest);
  const msg = $("micMsg"), bar = $("micBar");
  try{ await Mic.open(); }catch(e){ if(msg) msg.textContent = errMsg(e); return; }
  if(msg) msg.textContent = "Listening… say “Hello Pita”.";
  let peak = 0, zeros = 0, n = 0;
  micTest = setInterval(() => {
    const r = Mic.rms(); n++;
    if(r < 1e-7) zeros++; else peak = Math.max(peak, r);
    if(bar) bar.style.width = Math.min(100, Math.max(0, r)*900)+"%";
    if(!$("micBar") || n > 120){
      clearInterval(micTest); if(bar) bar.style.width = "0";
      if(!run) Mic.close();
      if(!msg || !$("micMsg")) return;
      msg.textContent = peak > 0.02 ? "Your mic works ✓ Pita can hear you." : zeros > 100 ? "Pita gets no sound level here. Speaking still records: just tap “I'm done talking” when you finish. If it keeps happening, close the app fully and open it again." : "Very quiet. Speak a bit louder or closer to the iPad.";
    }
  }, 50);
}
function readSpeakPrefs(){ const v = $("spVoice"), h = $("spHands"), vn = $("spVoiceName"); const patch = {}; if(vn) patch.voiceName = vn.value; if(v) patch.voice = v.checked; if(h) patch.handsfree = h.checked; if(Object.keys(patch).length) savePrefs(patch); }
function avoidTopics(){ return sessions().filter(s => s.skill==="speaking").slice(-8).map(s => s.title).join("; "); }
const cueHtml = c => `<div class="cue"><b>${esc(c.topic)}</b><p class="small" style="margin-top:6px">You should say:</p><ul class="small" style="margin:4px 0 6px;padding-left:1.2em">${c.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul><p class="small">${esc(c.final)}</p></div>`;
const cueText = c => c.topic+". You should say: "+c.bullets.join("; ")+". "+c.final;
async function prepTime(sec){
  const t = $("stTimer"); if(t){ t.hidden = false; t.classList.remove("over"); }
  setHTML("stCtrl", `<button class="btn" type="button" data-ia="st-go">I'm ready, start now</button>`);
  setText("stHint", "Make notes in your head or on paper. Talking starts by itself when the minute is over.");
  if(pita){ pita.mood("thinking"); pita.state("idle"); }
  const endAt = Date.now() + sec*1000;
  await new Promise(res => {
    const iv = setInterval(() => { const left = Math.ceil((endAt-Date.now())/1000); if(t) t.textContent = mmss(Math.max(0,left)); if(left<=0 || !run || run.aborted){ clearInterval(iv); if(run) run.wake = null; res(); } }, 250);
    run.wake = () => { clearInterval(iv); run.wake = null; res(); };
  });
  if(t) t.hidden = true;
}
async function askStep(st){
  setText("sayY", "");
  if(st.cue){
    setHTML("stExtra", cueHtml(st.cue));
    await tutorSays("Now I'm going to give you a topic, and I'd like you to talk about it for one to two minutes. You have one minute to think about what you're going to say. Your topic is: "+cueText(st.cue), "normal");
    if(!run || run.aborted) return null;
    await prepTime(60);
    if(!run || run.aborted) return null;
    await tutorSays("All right. Remember, you have one to two minutes. Please start speaking now.", "normal");
    const a = await listenUI({silenceMs:5000, maxSecs:150, waitSecs:30, skip: run.kind==="mock"});
    setHTML("stExtra", "");
    return a;
  }
  await tutorSays(st.q, "asking");
  if(!run || run.aborted) return null;
  if(pita) pita.mood("normal");
  return listenUI({silenceMs: 0, maxSecs: st.part===3 ? 120 : 90, skip: run.kind==="mock"});
}
async function spMock(){
  const micP = Mic.open(); unlockSpeech();
  wait("Speaking mock test", "Pita is preparing your questions…");
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
    await micP;
    const steps = p1.map(q => ({part:1, q}))
      .concat([{part:2, cue:{topic:str(p2.topic), bullets:arr(p2.bullets).map(str), final:str(p2.final)}}])
      .concat(sc.p2_followup ? [{part:2, q:str(sc.p2_followup)}] : [])
      .concat(p3.map(q => ({part:3, q})));
    run = {mode:"sp", kind:"mock", script:sc, steps, i:0, answers:[], active:true};
    stage("Speaking mock test", "Part 1");
    await tutorSays("Hello Azel, I'm Pita and I'll be your examiner today. In this first part, I'd like to ask you some questions about "+str(sc.p1_topic).toLowerCase()+".", "happy");
    for(run.i=0; run.i<steps.length; run.i++){
      if(!run || run.aborted) return;
      const st = steps[run.i];
      setText("stLabel", `Part ${st.part} · question ${run.i+1} of ${steps.length}`);
      if(st.part===3 && steps[run.i-1] && steps[run.i-1].part!==3) await tutorSays("Thank you. We've been talking about "+str(p2.topic).replace(/^Describe\s+/i,"")+". Now I'd like to discuss some more general questions related to this.", "normal");
      const ans = await askStep(st);
      if(!run || run.aborted) return;
      const a = {part:st.part, q: st.cue ? cueText(st.cue) : st.q, blob: ans && !ans.skipped && ans.spoke ? ans.blob : null, secs: ans && ans.secs ? ans.secs : 0};
      a.p = transcribe(a); run.answers.push(a);
    }
    await tutorSays("Thank you, Azel. That's the end of the speaking test. Give me a moment to score it.", "happy");
    spScoreMock();
  }catch(e){ fail("Speaking mock test", e, "sp-mock"); }
}
async function spQuick(part){
  const micP = Mic.open(); unlockSpeech();
  wait("Speaking Part "+part, "Pita is choosing a question…");
  try{
    const r = await ai(sys(), [{text: part==2
      ? `Give one IELTS Speaking Part 2 cue card. JSON {"topic":"Describe ...","bullets":[3 'You should say' points],"final":"and explain ..."}. Avoid: ${avoidTopics() || "none"}.`
      : `Give one IELTS Speaking Part ${part} question${part==3 ? " (abstract discussion)" : " (everyday, personal)"}. JSON {"topic": short topic name, "q": the question}. Avoid: ${avoidTopics() || "none"}.`}], {temp:1});
    const step = part==2 ? {part:2, cue:{topic:str(r.topic), bullets:arr(r.bullets).map(str), final:str(r.final)}} : {part, q:str(r.q), topic:str(r.topic)};
    if(part==2 ? !step.cue.topic : !step.q) throw mkErr("parse");
    await micP;
    run = {mode:"sp", kind:"quick", part, steps:[step], i:0, answers:[], active:true};
    stage("Speaking Part "+part, "Quick practice");
    const ans = await askStep(step);
    if(!run || run.aborted) return;
    if(!ans || ans.skipped){ closeRun(); return; }
    run.answers.push({part, q: step.cue ? cueText(step.cue) : step.q, blob: ans.spoke ? ans.blob : null, secs: ans.secs || 0});
    if(pita){ pita.mood("thinking"); pita.state("think"); }
    spScoreQuick();
  }catch(e){ fail("Speaking Part "+part, e, "sp-quick-"+part); }
}
const TALK = ` You are "Pita", a cute animated IELTS speaking tutor with a pink ribbon, talking with Azel, an Indonesian economics student who wants band 9. Everything you write in "reply" is spoken aloud: keep it natural and short (under 45 words), no emojis, no lists, no markdown. Choose "mood" to match your reaction: happy for a good answer, love for an excellent answer or a sweet moment, surprised for something unexpected, confused when the answer is unclear, asking when your main point is a question, thinking when you consider an idea, sad if she gives up or is down, strict when the answer is lazy, too short or off-topic, angry only for the same careless mistake made again and again (firm, never insulting), normal otherwise. If she answers in Indonesian, reply in English and ask her to try again in English.`;
const histText = () => run.history.slice(-14).map(h => (h.who==="tutor" ? "Pita: " : "Azel: ")+h.text).join("\n");
async function spTalk(){
  const micP = Mic.open(); unlockSpeech();
  run = {mode:"sp", kind:"talk", history:[], fixes:[], answers:[], active:true};
  stage("Talk with Pita", "Speaking practice");
  if(pita){ pita.mood("thinking"); pita.state("think"); }
  setText("stHint", "Pita is getting ready…");
  let r;
  try{
    r = await ai(sys()+TALK, [{text:`Start the conversation. Greet Azel warmly in one short sentence, tell her you'll chat like the IELTS Speaking test, then ask the first easy Part 1 question on a fresh everyday topic (avoid: ${avoidTopics() || "none"}). JSON {"reply": string, "mood": one of ${MOODLIST}}`}], {temp:0.9});
    await micP;
  }catch(e){ fail("Talk with Pita", e, "sp-talk"); return; }
  talkLoop(r);
}
async function talkLoop(r){
  for(;;){
    if(!run || run.aborted) return;
    const reply = str(r.reply).trim() || "Tell me a little more about that.";
    run.history.push({who:"tutor", text:reply});
    await tutorSays(reply, r.mood);
    if(!run || run.aborted) return;
    const ans = await listenUI({silenceMs:0, maxSecs:120, end:true});
    if(!run || run.aborted || !ans) return;
    if(ans.end && !(ans.blob && ans.spoke)){ talkFinish(); return; }
    if(ans.skipped || !ans.blob || !ans.spoke){ r = {reply:"No problem. Take your time. "+reply, mood:"normal"}; run.history.pop(); continue; }
    if(pita){ pita.mood("thinking"); pita.state("think"); }
    setText("stHint", "Pita is thinking…"); setHTML("stCtrl", "");
    try{
      const part = await audioPart(ans.blob);
      r = await ai(sys()+TALK, [{text:`Conversation so far:
${histText()}

Azel's new answer is in the audio. 1) Transcribe it exactly, keeping fillers and mistakes. 2) Write Pita's next turn: react naturally to what she said in one or two short sentences; if there is a clear grammar or vocabulary mistake, correct only the most useful one, briefly; then ask the next question (a follow-up, or move on like Parts 1, 2 and 3, and now and then give a Part 2 style "describe..." topic for a longer answer). 3) Pick Pita's face mood.
JSON {"transcript": string, "reply": string, "mood": one of ${MOODLIST}, "fix": {"original": string, "better": string} or null, "pron": "one short pronunciation note, or empty"}`}, part], {temp:0.8});
    }catch(e){
      if(["nokey","badkey","rate","network"].includes(e.code)){
        if(pita){ pita.mood("sad"); pita.state("idle"); }
        setText("stHint", errMsg(e));
        const can = run.answers.length >= 2;
        setHTML("stCtrl", (can ? `<button class="btn" type="button" data-ia="st-end">Finish &amp; get my band</button>` : "") + `<button class="btn ghost" type="button" data-ia="st-go">Try again</button>`);
        const v = await waitFor();
        if(v==="abort") return;
        if(v==="end"){ talkFinish(); return; }
        r = {reply:"Sorry, I missed that. Could you say it again?", mood:"confused"}; run.history.pop(); continue;
      }
      r = {reply:"Sorry, I didn't quite catch that. Could you say it again?", mood:"confused"}; run.history.pop(); continue;
    }
    const tr = str(r.transcript).trim();
    if(tr){
      run.history.push({who:"student", text:tr, pron:str(r.pron)});
      run.answers.push({q:reply, transcript:tr, pron:str(r.pron), secs:Math.round(ans.secs || 0)});
      setText("sayY", "You: "+tr);
    }
    if(r.fix && r.fix.original && r.fix.better){
      run.fixes.push({original:str(r.fix.original), better:str(r.fix.better)});
      setHTML("stExtra", `<div class="fix"><span class="o">${esc(r.fix.original)}</span><span class="b">→ ${esc(r.fix.better)}</span></div>`);
    } else setHTML("stExtra", "");
    if(ans.end){ talkFinish(); return; }
  }
}
async function talkFinish(){
  if(!run) return;
  if(run.answers.length < 2){
    if(pita) pita.mood("asking");
    setText("stHint", "Answer at least 2 questions first, so Pita can give you a fair band.");
    setHTML("stCtrl", `<button class="btn" type="button" data-ia="st-go">Keep talking</button>`);
    const v = await waitFor(); if(v==="abort") return;
    let last = "Let's keep going. Tell me about your favourite place to relax.";
    for(let i=run.history.length-1;i>=0;i--){ if(run.history[i].who==="tutor"){ last = run.history[i].text; run.history.splice(i,1); break; } }
    return talkLoop({reply:last, mood:"normal"});
  }
  run.active = true; Mic.close();
  wait("Talk with Pita", "Pita is scoring your speaking… This can take up to a minute.");
  try{
    const text = run.answers.map((a,i) => `Question ${i+1}: ${a.q}\nAzel (${a.secs}s): ${a.transcript}\nPronunciation note: ${a.pron || "-"}`).join("\n\n");
    const rep = await ai(sys(), [{text:`Assess this IELTS Speaking practice conversation as if it were a speaking test. Below are the tutor's questions, Azel's exact transcripts and pronunciation notes from the audio.
Short answers must lower Fluency and Coherence. overall = the mean of the four criteria, rounded to the nearest 0.5.
${text}

Return JSON ${SPEAK_SHAPE}`}], {temp:0.3});
    if(run.fixes.length) rep.fixes = run.fixes.concat(arr(rep.fixes)).slice(0, 10);
    saveSession({skill:"speaking", kind:"talk", title:"Talk with Pita ("+run.answers.length+" answers)", report:rep,
      band:clampBand(rep.overall), sub:{fc:clampBand((rep.fc||{}).band), lr:clampBand((rep.lr||{}).band), gra:clampBand((rep.gra||{}).band), p:clampBand((rep.p||{}).band)},
      items: run.answers.map(a => ({part:0, q:a.q, transcript:a.transcript, secs:a.secs}))});
  }catch(e){ fail("Talk with Pita", e, "talk-rescore"); }
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
    if((tries||0) < 1 && e.code!=="nokey" && e.code!=="badkey") { await sleep(3000); return transcribe(ans, (tries||0)+1); }
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
  run.active = true; Mic.close();
  wait("Speaking mock test", "Pita is listening to your answers and scoring your test… This can take up to a minute.");
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
  Mic.close();
  wait("Speaking Part "+run.part, "Pita is listening to your answer…");
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
  h += `<div class="pita-wrap small-pita" id="repPita"></div>`;
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
  Mic.close();
  const tg = +prefs().target || 9, gap = typeof s.band==="number" ? tg - s.band : null;
  const mood = gap==null ? "normal" : gap<=0 ? "love" : gap<=1 ? "happy" : gap<=2 ? "normal" : prefs().style==="friendly" ? "sad" : "strict";
  mountPita($("repPita"), mood);
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
  put("sets", set); toast("Added to your IELTS flashcards and My words.");
  if(window.__vocabAdd) window.__vocabAdd(front, {meaning:str(v.meaning), example:str(v.example)});
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
        <li>Click <b>Copy key</b> (it starts with <b>AQ.</b> or <b>AIza</b>) and paste it below.</li>
      </ol>
      ${field("stKey","Gemini API key",`<input class="in" id="stKey" type="password" autocomplete="off" placeholder="${pf.key ? "Leave empty to keep your current key" : "AQ.…"}">`)}
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
    if(!/^(AIza|AQ\.)\S{20,}$/.test(key)){ $("stMsg").hidden = false; $("stMsg").textContent = "That doesn't look like a Gemini key. It should start with AQ. or AIza."; return; }
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
      if(run && run.active && run.mode!=="report" && !(run.mode==="sp" && run.kind==="quick")){ twoTap(el, "Tap again to leave", () => closeRun()); }
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
    case "sp-talk": readSpeakPrefs(); spTalk(); break;
    case "sp-pause": { savePrefs({pauseSecs:+el.dataset.v}); el.parentNode.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b===el))); break; }
    case "sp-mictest": testMic(); break;
    case "sp-hear": { const vn = $("spVoiceName"); if(vn) savePrefs({voiceName: vn.value}); stopSpeak(); speak("Hi Azel! I'm Pita. Shall we practise some speaking together?", "female"); break; }
    case "sp-mock": readSpeakPrefs(); spMock(); break;
    case "sp-quick": readSpeakPrefs(); spQuick(+el.dataset.part); break;
    case "sp-quick-1": case "sp-quick-2": case "sp-quick-3": spQuick(+a.slice(-1)); break;
    case "st-done": if(run && run.ctl && !run.ctl.done) run.ctl.finish("ok"); break;
    case "st-pause": if(run && run.ctl && !run.ctl.done) run.ctl.finish("pause"); break;
    case "st-skip": if(run && run.ctl && !run.ctl.done) run.ctl.finish("skip"); else if(run && run.wake) run.wake("skip"); break;
    case "st-end": if(run && run.ctl && !run.ctl.done) run.ctl.finish("end"); else if(run && run.wake) run.wake("end"); break;
    case "st-go": if(run && run.wake) run.wake("go"); break;
    case "talk-rescore": talkFinish(); break;
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
document.addEventListener("change", e => { if(["cW","cS"].includes(e.target.id)) calc(); if(e.target.id==="spVoiceName") savePrefs({voiceName:e.target.value}); });
document.addEventListener("keydown", e => { if(e.key==="Escape" && !$("ieltsRun").hidden && !(run && run.active && run.mode!=="report")) closeRun(); });

window.__ieltsRender = render;
window.__ielts = {ai, prefs, errMsg, mkErr, speak, stopSpeak, voiceScore, openSettings: k => settingsForm(k), sessions};
try{ calc(); }catch(e){}
render();
})();
