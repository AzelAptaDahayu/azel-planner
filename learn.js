/* Learn: a small Duolingo-style course engine shared by the Grammar and Math menus.
   A course = units -> lessons. Each lesson has a short rule ("learn") and questions (a fixed bank and/or a generator).
   Strict rules: wrong answers come back until you get them right, a lesson passes at 80% first-try correct,
   and a unit "jump test" needs 90%. Progress is saved in the "learn" collection (one doc per course). */
(function(){
"use strict";
const P = window.__plannerAPI; if(!P) return;
const {$, esc, put, byId, D, toast, today} = P;
const IE = () => window.__ielts || {};
const COURSES = {};
const PASS = 0.8, JUMP = 0.9;

/* ---------- helpers ---------- */
const shuffle = a => a.map(x => [Math.random(), x]).sort((p,q) => p[0]-q[0]).map(x => x[1]);
const normT = s => String(s==null ? "" : s).toLowerCase().replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/\s+/g," ").replace(/\s*([,.;:!?])\s*/g,"$1 ").trim().replace(/[.!?]+$/,"").trim();
function parseNum(raw){
  let s = String(raw==null ? "" : raw).trim().replace(/\s+/g,"").replace(/[−–]/g,"-").replace(/^\+/,"").replace(/%$/,"").replace(/^rp\.?/i,"");
  if(!s) return NaN;
  const fr = s.match(/^(-?\d+(?:[.,]\d+)?)\/(-?\d+(?:[.,]\d+)?)$/);
  if(fr) return parseNum(fr[1]) / parseNum(fr[2]);
  if(s.includes(".") && s.includes(",")){ const last = Math.max(s.lastIndexOf("."), s.lastIndexOf(",")); s = s.slice(0,last).replace(/[.,]/g,"") + "." + s.slice(last+1); }
  else if(s.includes(",")){ const parts = s.split(","); s = parts.length===2 ? parts[0]+"."+parts[1] : parts.join(""); }
  return /^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(s) ? parseFloat(s) : NaN;
}
function check(item, val){
  if(item.type==="mc") return String(val)===String(item.a);
  if(item.type==="order") return [].concat(item.a, item.alt || []).some(a => normT(a)===normT(val));
  if(item.num){
    const as = [].concat(item.a).map(Number);
    // big whole-number answers (money): ignore thousand separators like 36.000 or 36,000
    const big = as.every(a => Number.isInteger(a) && Math.abs(a) >= 1000);
    const x = big ? parseNum(String(val).replace(/[.,\s](?=\d{3}(\D|$))/g,"")) : parseNum(val); if(!isFinite(x)) return false;
    return as.some(a => Math.abs(x - a) <= (item.tol!=null ? item.tol : 1e-6*Math.max(1, Math.abs(a))));
  }
  return [].concat(item.a, item.alt || []).some(a => normT(a)===normT(val));
}
const shown = item => item.type==="mc" ? item.a : item.num ? [].concat(item.a)[0] : [].concat(item.a)[0];
const fmt = n => { if(typeof n!=="number") return String(n); const r = Math.round(n*1e6)/1e6; return String(r).replace(/\.0+$/,""); };

/* ---------- progress ---------- */
const prog = id => Object.assign({done:{}, xp:0, days:{}}, byId("learn", id) || {}, {id});
function saveProg(id, patch){ const p = Object.assign({}, byId("learn", id) || {id}, patch, {id}); delete p.updatedAt; put("learn", p); }
function addXp(id, n){
  const p = prog(id), d = today(), days = Object.assign({}, p.days);
  days[d] = (days[d]||0) + n;
  Object.keys(days).sort().slice(0, -60).forEach(k => delete days[k]);
  saveProg(id, {xp:(p.xp||0)+n, days});
}
function streak(p){
  let n = 0; const d = new Date(today()+"T00:00:00");
  for(;;){ const k = d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); if((p.days||{})[k] > 0){ n++; d.setDate(d.getDate()-1); } else if(n===0 && k===today()){ d.setDate(d.getDate()-1); } else break; }
  return n;
}
const flat = c => c.units.flatMap(u => u.lessons.map(l => Object.assign(l, {unit:u})));
function status(c, l){
  const p = prog(c.id), r = p.done[l.id];
  if(r && r.best >= 1) return "perfect";
  if(r && (r.best >= PASS || r.jumped)) return "passed";
  const all = flat(c), i = all.indexOf(l);
  if(i===0) return "open";
  const prev = all[i-1], pr = p.done[prev.id];
  if(pr && (pr.best >= PASS || pr.jumped)) return "open";
  if(l.unit===all[i-1].unit) return "locked";
  return "locked";
}
const isDone = s => s==="passed" || s==="perfect";

/* ---------- course view (the path) ---------- */
const NODE_X = [0, 46, 70, 46, 0, -46, -70, -46];
function renderCourse(c){
  const v = $("view-"+c.id); if(!v) return;
  const p = prog(c.id), all = flat(c);
  const passed = all.filter(l => isDone(status(c, l))).length;
  const next = all.find(l => status(c, l)==="open");
  const todayXp = (p.days||{})[today()] || 0;
  if(!v.dataset.mounted){
    v.dataset.mounted = "1";
    v.innerHTML = `<div class="card lhero"><div class="pita-wrap small-pita" id="lp-${c.id}"></div><div style="min-width:0"><div class="label">${esc(c.kicker||"")}</div><h2>${esc(c.title)}</h2><p class="small muted" id="lstat-${c.id}"></p><div class="lbar"><i id="lbar-${c.id}"></i></div></div></div>
      <div class="btn-row" id="lgo-${c.id}"></div>
      <div id="lpath-${c.id}" class="lpath"></div>
      <div id="lextra-${c.id}"></div>`;
    if(window.Pita) c._pita = window.Pita.create($("lp-"+c.id), {mood:"happy"});
    if(c.extraHtml) $("lextra-"+c.id).innerHTML = c.extraHtml();
  }
  $("lstat-"+c.id).innerHTML = `<b>${passed}</b> / ${all.length} lessons · <b>${p.xp||0}</b> XP · today <b>${todayXp}</b> XP${streak(p) ? ` · 🔥 ${streak(p)} day${streak(p)>1?"s":""}` : ""}`;
  $("lbar-"+c.id).style.width = Math.round(passed/all.length*100)+"%";
  $("lgo-"+c.id).innerHTML = next ? `<button class="btn" type="button" data-lx="open" data-c="${c.id}" data-l="${next.id}">${passed ? "Continue" : "Start"}: ${esc(next.title)}</button>` : `<button class="btn" type="button" data-lx="mixed" data-c="${c.id}">Mixed review</button>`;
  let h = "", k = 0;
  c.units.forEach((u, ui) => {
    const ls = u.lessons, done = ls.filter(l => isDone(status(c, l))).length;
    const locked = status(c, ls[0])==="locked";
    h += `<section class="lunit" style="--uc:${u.color||"var(--pink-soft)"};--ui:${u.ink||"var(--pink-ink)"}">
      <div class="lunit-head"><div><div class="label">Unit ${ui+1}</div><h3>${esc(u.title)}</h3>${u.sub ? `<p class="small">${esc(u.sub)}</p>` : ""}</div>
      <div class="lunit-side"><span class="small"><b>${done}</b>/${ls.length}</span>${done < ls.length ? `<button class="btn small ghost" type="button" data-lx="jump" data-c="${c.id}" data-u="${u.id}" title="Already know this? Pass a test (90%) to unlock the whole unit.">${locked ? "Jump here" : "Test out"}</button>` : `<button class="btn small ghost" type="button" data-lx="unitreview" data-c="${c.id}" data-u="${u.id}">Review</button>`}</div></div>
      <div class="lnodes">${ls.map(l => { const st = status(c, l), x = NODE_X[k++ % NODE_X.length];
        return `<div class="lnode-wrap" style="transform:translateX(${x}px)"><button class="lnode ${st}${next===l ? " next" : ""}" type="button" data-lx="open" data-c="${c.id}" data-l="${l.id}" aria-label="${esc(l.title)} (${st})">${st==="perfect" ? "★" : st==="passed" ? "✓" : st==="locked" ? "🔒" : esc(l.icon || String(ls.indexOf(l)+1))}</button><span class="lnode-t">${esc(l.title)}</span></div>`; }).join("")}</div></section>`;
  });
  $("lpath-"+c.id).innerHTML = h;
  if(c._pita) c._pita.mood(todayXp ? "happy" : "asking");
}

/* ---------- lesson runner ---------- */
let R = null, rp = null;
function overlay(html){ const o = $("learnRun"); o.classList.remove("closing"); o.hidden = false; $("learnRunIn").innerHTML = html; o.scrollTop = 0; }
function closeRun(){
  R = null; rp = null;
  const o = $("learnRun"); if(o.hidden) return;
  o.classList.add("closing"); setTimeout(() => { o.classList.remove("closing"); o.hidden = true; $("learnRunIn").innerHTML = ""; }, 220);
  Object.values(COURSES).forEach(renderCourse);
}
function makeItems(c, lessons, n){
  const out = [];
  lessons.forEach(l => { (l.items || []).forEach(it => out.push(Object.assign({lesson:l}, it))); });
  let pool = shuffle(out);
  const gens = lessons.filter(l => l.gen);
  const res = [];
  // mix: bank items first, then generated ones, up to n
  while(res.length < n && (pool.length || gens.length)){
    if(pool.length && (!gens.length || Math.random() < 0.6)) res.push(pool.shift());
    else if(gens.length){ const l = gens[Math.floor(Math.random()*gens.length)]; try{ res.push(Object.assign({lesson:l}, l.gen())); }catch(e){ console.warn(e); } }
    if(!pool.length && !gens.length) break;
  }
  return res.slice(0, n);
}
function openLesson(cid, lid){
  const c = COURSES[cid]; const l = flat(c).find(x => x.id===lid); if(!l) return;
  const st = status(c, l);
  if(st==="locked"){ toast("Locked. Pass the lesson before it, or use “Jump here” on the unit."); return; }
  const r = prog(cid).done[l.id];
  overlay(`<div class="lrun-top"><button class="lx" type="button" data-lx="close" aria-label="Close">✕</button><div class="small muted">${esc(l.unit.title)}</div></div>
    <div class="lintro"><div class="pita-wrap small-pita" id="lrP"></div><div><div class="label">Lesson</div><h2>${esc(l.title)}</h2>${r ? `<p class="small muted">Best: ${Math.round(r.best*100)}%${r.jumped ? " (tested out)" : ""}</p>` : ""}</div></div>
    <div class="card lrule">${l.learn || ""}</div>
    <div class="btn-row"><button class="btn" type="button" data-lx="start" data-c="${cid}" data-l="${l.id}">Start practice</button>${c.aiItems ? `<button class="btn ghost" type="button" data-lx="aimore" data-c="${cid}" data-l="${l.id}">New questions (AI)</button>` : ""}</div>
    <p class="small muted">Strict mode: wrong answers come back until you get them right. You pass with 80% right on the first try.</p>`);
  rp = window.Pita && $("lrP") ? window.Pita.create($("lrP"), {mood:"strict"}) : null;
}
function startRun(cid, opts){
  const c = COURSES[cid];
  const items = opts.items || makeItems(c, opts.lessons, opts.n || 8);
  if(!items.length){ toast("No questions here yet."); return; }
  R = {c, kind:opts.kind, lesson:opts.lesson, unit:opts.unit, queue:items.slice(), total:items.length, first:0, answered:0, seen:new Set(), strictOne:opts.kind==="jump", wrong:0};
  overlay(`<div class="lrun-top"><button class="lx" type="button" data-lx="close" aria-label="Close">✕</button><div class="lprog"><i id="lrBar"></i></div><span class="small muted" id="lrCnt"></span></div>
    <div class="lq-pita"><div class="pita-wrap small-pita" id="lrP"></div><div class="bubble tutor lq-say" id="lrSay">${opts.kind==="jump" ? "Test time. 90% to pass. Focus!" : "Let's go. Read carefully."}</div></div>
    <div id="lrQ"></div>`);
  rp = window.Pita && $("lrP") ? window.Pita.create($("lrP"), {mood: opts.kind==="jump" ? "strict" : "happy"}) : null;
  nextQ();
}
function nextQ(){
  if(!R) return;
  const box = $("lrQ"); if(!box) return;
  if(!R.queue.length) return finish();
  const it = R.cur = R.queue[0]; it._done = false;
  $("lrBar").style.width = Math.round(R.answered/R.total*100)+"%";
  $("lrCnt").textContent = `${Math.min(R.answered+1, R.total)} / ${R.total}`;
  let ans = "";
  if(it.type==="mc") ans = `<div class="lopts ${it.opts.some(o => String(o).length > 28) ? "one" : ""}">${shuffle(it.opts.slice()).map(o => `<button class="opt" type="button" data-lx="pick" data-v="${esc(String(o))}">${it.safe ? esc(String(o)) : String(o)}</button>`).join("")}</div>`;
  else if(it.type==="order"){ it._picked = []; it._tiles = shuffle(it.words.map((w,i) => ({w, i}))); ans = `<div class="lorder-line" id="lrLine"></div><div class="lorder-bank" id="lrBank"></div><div class="btn-row"><button class="btn" type="button" data-lx="check">Check</button></div>`; }
  else ans = `<form class="lin" data-lx-form="1"><input class="in" id="lrIn" autocomplete="off" autocapitalize="none" spellcheck="false" ${it.num ? 'inputmode="decimal"' : ""} placeholder="${it.num ? "Your answer (number)" : "Type your answer"}"><button class="btn" type="submit">Check</button></form>${it.hint ? `<p class="small muted">${it.hint}</p>` : ""}`;
  box.innerHTML = `<div class="lq">${it.kicker ? `<div class="label">${esc(it.kicker)}</div>` : ""}<div class="lq-text">${it.safe ? esc(it.q) : it.q}</div>${ans}<div id="lrFb"></div></div>`;
  if(it.type==="order") drawOrder();
  try{ box.firstElementChild.animate([{opacity:0, transform:"translateX(24px)"},{opacity:1, transform:"none"}], {duration:300, easing:"cubic-bezier(.2,.9,.3,1)"}); }catch(e){}
  const inp = $("lrIn"); if(inp) setTimeout(() => inp.focus(), 80);
}
function drawOrder(){
  const it = R.cur;
  $("lrLine").innerHTML = it._picked.map((t,k) => `<button class="ltile on" type="button" data-lx="unpick" data-k="${k}">${esc(t.w)}</button>`).join("") || `<span class="small muted">Tap the words in the right order</span>`;
  $("lrBank").innerHTML = it._tiles.map(t => `<button class="ltile" type="button" data-lx="tile" data-i="${t.i}" ${it._picked.includes(t) ? "disabled" : ""}>${esc(t.w)}</button>`).join("");
}
function answer(val){
  if(!R || !R.cur || R.cur._done) return;
  const it = R.cur; it._done = true;
  const ok = check(it, val);
  const firstTry = !R.seen.has(it);
  R.seen.add(it);
  R.queue.shift();
  if(ok){ if(firstTry) R.first++; R.answered++; }
  else { R.wrong++; if(R.kind!=="jump") R.queue.push(it); else R.answered++; }
  document.querySelectorAll("#lrQ .opt").forEach(b => { b.disabled = true; if(b.dataset.v===String(it.a)) b.classList.add("ok"); else if(b.dataset.v===String(val) && !ok) b.classList.add("no"); });
  const inp = $("lrIn"); if(inp){ inp.disabled = true; inp.classList.add(ok ? "ok" : "no"); }
  if(rp) rp.mood(ok ? "happy" : (R.kind==="jump" ? "strict" : "sad"));
  const say = $("lrSay");
  if(say) say.textContent = ok ? pick(["Correct.", "Yes. Good.", "Right!", "Well done."]) : pick(["Wrong. Read why.", "No. Look at the rule.", "Not correct. Learn it now.", "Wrong. It will come back later."]);
  const right = it.type==="mc" ? (it.safe ? esc(String(it.a)) : String(it.a)) : it.num ? fmt([].concat(it.a)[0]) : esc(String([].concat(it.a)[0]));
  $("lrFb").innerHTML = `<div class="lfb ${ok ? "ok" : "no"}"><b>${ok ? "Correct!" : "Wrong."}</b>${ok ? "" : ` Correct answer: <b>${right}</b>`}${it.why ? `<div class="lwhy">${it.safe ? esc(it.why) : it.why}</div>` : ""}</div>
    ${!ok && IE().ai ? `<button class="linkbtn small" type="button" data-lx="explain">Explain more (AI)</button><div id="lrEx"></div>` : ""}
    <div class="btn-row"><button class="btn" type="button" data-lx="next">Continue</button></div>`;
  $("lrBar").style.width = Math.round(R.answered/R.total*100)+"%";
  const nb = document.querySelector('[data-lx="next"]'); if(nb) setTimeout(() => nb.focus(), 50);
  try{ if(!ok && navigator.vibrate) navigator.vibrate([30,40,30]); }catch(e){}
}
const pick = a => a[Math.floor(Math.random()*a.length)];
async function explain(){
  const it = R && R.cur; const out = $("lrEx"); if(!it || !out) return;
  out.innerHTML = `<p class="small muted">Pita is thinking…</p>`;
  const strip = h => String(h).replace(/<sup>/g,"^").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
  try{
    const r = await IE().ai(`You are a strict but kind ${R.c.tutor || "teacher"} for Azel, an Indonesian economics student. Explain clearly and simply, step by step. Return only JSON.`,
      [{text:`Question: ${strip(it.q)}\n${it.opts ? "Options: "+it.opts.map(strip).join(" | ")+"\n" : ""}Correct answer: ${strip(it.type==="mc" ? it.a : [].concat(it.a)[0])}\nShort reason: ${strip(it.why||"")}\nExplain why this is the answer and how to avoid this mistake. JSON {"steps": ["short steps in simple English"], "intuisi": "intuisi singkat dalam Bahasa Indonesia"}`}], {temp:0.3});
    out.innerHTML = `<div class="card soft small">${(r.steps||[]).map(s => `<p>${esc(String(s))}</p>`).join("")}${r.intuisi ? `<p class="vid">${esc(String(r.intuisi))}</p>` : ""}</div>`;
  }catch(e){ out.innerHTML = `<p class="small neg">${esc(IE().errMsg ? IE().errMsg(e) : "The AI couldn't answer.")}</p>`; }
}
function finish(){
  const c = R.c, score = R.first / R.total, pct = Math.round(score*100);
  let title, msg, mood, xp = R.first;
  if(R.kind==="lesson"){
    const l = R.lesson, p = prog(c.id), old = p.done[l.id] || {};
    const passed = score >= PASS;
    const done = Object.assign({}, p.done, {[l.id]: {best:Math.max(old.best||0, score), n:(old.n||0)+1, at:today(), jumped:old.jumped}});
    saveProg(c.id, {done});
    if(passed) xp += 5; if(score===1) xp += 5;
    title = score===1 ? "Perfect!" : passed ? "Lesson passed" : "Not passed yet";
    msg = score===1 ? "Every answer right on the first try. That's mastery." : passed ? "Good. Fix the ones you missed and aim for 100% next time." : `You need 80% on the first try. Read the rule again and retry. No skipping.`;
    mood = score===1 ? "love" : passed ? "happy" : "strict";
  } else if(R.kind==="jump"){
    const u = R.unit, passed = score >= JUMP, p = prog(c.id);
    if(passed){ const done = Object.assign({}, p.done); u.lessons.forEach(l => { done[l.id] = Object.assign({best:0, n:0}, done[l.id] || {}, {jumped:true, at:today()}); }); saveProg(c.id, {done}); xp += 10; }
    title = passed ? "Unit unlocked" : "Test not passed";
    msg = passed ? "You proved you know this unit. Go on to the next one." : "You need 90%. Do the lessons in this unit first.";
    mood = passed ? "love" : "strict";
  } else { title = "Review done"; msg = pct >= 80 ? "Strong memory. Keep it up." : "Some answers slipped. Practise those lessons again."; mood = pct >= 80 ? "happy" : "asking"; }
  addXp(c.id, xp);
  R = null;
  $("learnRunIn").innerHTML = `<div class="lrun-top"><button class="lx" type="button" data-lx="close" aria-label="Close">✕</button></div>
    <div class="lend"><div class="pita-wrap" id="lrP"></div><h2>${title}</h2><div class="lscore">${pct}%</div><p>${msg}</p><p class="small muted">+${xp} XP</p>
    <div class="btn-row">${title==="Not passed yet" ? `<button class="btn" type="button" data-lx="open" data-c="${c.id}" data-l="${R0.lid}">Read the rule & retry</button>` : ""}<button class="btn ${title==="Not passed yet" ? "ghost" : ""}" type="button" data-lx="close">Back to the path</button></div></div>`;
  rp = window.Pita && $("lrP") ? window.Pita.create($("lrP"), {mood}) : null;
}
let R0 = {};

/* ---------- events ---------- */
document.addEventListener("submit", e => {
  if(!e.target.matches("[data-lx-form]")) return;
  e.preventDefault(); const i = $("lrIn"); if(i && i.value.trim()) answer(i.value);
});
document.addEventListener("click", async e => {
  const el = e.target.closest("[data-lx]"); if(!el) return;
  const a = el.dataset.lx, c = COURSES[el.dataset.c];
  if(c && c.onAction && c.onAction(a, el)) return;
  switch(a){
    case "open": openLesson(el.dataset.c, el.dataset.l); break;
    case "close": closeRun(); break;
    case "start": { const l = flat(c).find(x => x.id===el.dataset.l); R0 = {lid:l.id}; startRun(c.id, {kind:"lesson", lesson:l, lessons:[l], n:l.n || 8}); break; }
    case "aimore": {
      const l = flat(c).find(x => x.id===el.dataset.l); R0 = {lid:l.id};
      el.disabled = true; el.textContent = "Pita is writing questions…";
      try{ const items = await c.aiItems(l); if(!items || !items.length) throw new Error("none"); startRun(c.id, {kind:"lesson", lesson:l, items}); }
      catch(err){ el.disabled = false; el.textContent = "New questions (AI)"; toast(IE().errMsg ? IE().errMsg(err) : "The AI couldn't make questions."); }
      break;
    }
    case "jump": case "unitreview": { const u = c.units.find(x => x.id===el.dataset.u); startRun(c.id, {kind: a==="jump" ? "jump" : "review", unit:u, lessons:u.lessons, n: a==="jump" ? 12 : 10}); break; }
    case "mixed": { const done = flat(c).filter(l => isDone(status(c, l))); startRun(c.id, {kind:"review", lessons: shuffle(done).slice(0, 8), n:10}); break; }
    case "pick": answer(el.dataset.v); break;
    case "tile": { const it = R && R.cur; if(!it || it._done) break; const t = it._tiles.find(x => String(x.i)===el.dataset.i); if(t && !it._picked.includes(t)){ it._picked.push(t); drawOrder(); } break; }
    case "unpick": { const it = R && R.cur; if(!it || it._done) break; it._picked.splice(+el.dataset.k, 1); drawOrder(); break; }
    case "check": { const it = R && R.cur; if(it && it.type==="order"){ if(!it._picked.length) break; answer(it._picked.map(t => t.w).join(" ")); } break; }
    case "next": nextQ(); break;
    case "explain": el.remove(); explain(); break;
  }
});
document.addEventListener("keydown", e => {
  if(e.key==="Enter" && R && R.cur && R.cur._done && !$("learnRun").hidden && document.activeElement && document.activeElement.id!=="lrIn"){ const nb = document.querySelector('[data-lx="next"]'); if(nb){ e.preventDefault(); nb.click(); } }
});

window.Learn = {
  register(c){ COURSES[c.id] = c; try{ if(D.cols && D.cols.learn) renderCourse(c); }catch(e){ console.warn(e); } },
  render(){ Object.values(COURSES).forEach(c => { try{ renderCourse(c); }catch(e){ console.warn(e); } }); },
  startItems(cid, items, title){ R0 = {}; startRun(cid, {kind:"review", items}); },
  tools:{shuffle, parseNum, check, normT, esc},
  _cur: () => R && R.cur
};
})();
