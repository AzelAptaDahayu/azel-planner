/* Vocabulary menu: word cards (sound, meaning, word forms, synonyms...), "Say it better",
   topic word sets and a spaced-repetition review. Uses the free dictionary API and the IELTS AI key. */
(function(){
"use strict";
const P = window.__plannerAPI; if(!P) return;
const {$, esc, put, del, byId, D, toast, today, openP, closeP} = P;
const IE = () => window.__ielts || {};
const arr = x => Array.isArray(x) ? x : [];
const str = x => typeof x==="string" ? x : (x==null ? "" : String(x));
const norm = w => str(w).trim().toLowerCase().replace(/[“”"‘’]/g,"'").replace(/\s+/g," ").replace(/^'+|'+$/g,"");
const wid = w => "w_"+norm(w).replace(/[^a-z0-9]+/g,"-").slice(0,60);
const words = () => D.cols.vocab.slice().sort((a,b) => (b.addedAt||0)-(a.addedAt||0));
const addDays = (d, n) => { const x = new Date(d+"T00:00:00"); x.setDate(x.getDate()+n); return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0"); };
const due = () => words().filter(w => !w.due || w.due <= today());
const BOX_DAYS = [0,1,2,4,7,15,30];
const LV = {A1:1,A2:2,B1:3,B2:4,C1:5,C2:6};

/* ---------- word forms without AI (backup) ---------- */
const IRR = "arise arose arisen|awake awoke awoken|be was/were been|bear bore borne|beat beat beaten|become became become|begin began begun|bend bent bent|bet bet bet|bind bound bound|bite bit bitten|bleed bled bled|blow blew blown|break broke broken|breed bred bred|bring brought brought|broadcast broadcast broadcast|build built built|burn burnt/burned burnt/burned|burst burst burst|buy bought bought|catch caught caught|choose chose chosen|cling clung clung|come came come|cost cost cost|creep crept crept|cut cut cut|deal dealt dealt|dig dug dug|do did done|draw drew drawn|dream dreamt/dreamed dreamt/dreamed|drink drank drunk|drive drove driven|eat ate eaten|fall fell fallen|feed fed fed|feel felt felt|fight fought fought|find found found|flee fled fled|fly flew flown|forbid forbade forbidden|forget forgot forgotten|forgive forgave forgiven|freeze froze frozen|get got got/gotten|give gave given|go went gone|grind ground ground|grow grew grown|hang hung hung|have had had|hear heard heard|hide hid hidden|hit hit hit|hold held held|hurt hurt hurt|keep kept kept|kneel knelt knelt|know knew known|lay laid laid|lead led led|lean leant/leaned leant/leaned|leap leapt/leaped leapt/leaped|learn learnt/learned learnt/learned|leave left left|lend lent lent|let let let|lie lay lain|light lit lit|lose lost lost|make made made|mean meant meant|meet met met|mistake mistook mistaken|overcome overcame overcome|pay paid paid|prove proved proven/proved|put put put|quit quit quit|read read read|ride rode ridden|ring rang rung|rise rose risen|run ran run|say said said|see saw seen|seek sought sought|sell sold sold|send sent sent|set set set|shake shook shaken|shine shone shone|shoot shot shot|show showed shown|shrink shrank shrunk|shut shut shut|sing sang sung|sink sank sunk|sit sat sat|sleep slept slept|slide slid slid|speak spoke spoken|speed sped sped|spend spent spent|spill spilt/spilled spilt/spilled|spin spun spun|split split split|spread spread spread|spring sprang sprung|stand stood stood|steal stole stolen|stick stuck stuck|sting stung stung|strike struck struck|strive strove striven|swear swore sworn|sweep swept swept|swim swam swum|swing swung swung|take took taken|teach taught taught|tear tore torn|tell told told|think thought thought|throw threw thrown|understand understood understood|undertake undertook undertaken|upset upset upset|wake woke woken|wear wore worn|weep wept wept|win won won|wind wound wound|withdraw withdrew withdrawn|write wrote written";
const IRRV = {}; IRR.split("|").forEach(x => { const [b,p,pp] = x.split(" "); IRRV[b] = {past:p, pp}; });
const isV = c => /[aeiou]/.test(c);
const DBL = new Set("begin prefer refer occur admit commit permit regret forget control upset submit omit transfer equip compel expel propel patrol".split(" "));
function cvc(w){ if(DBL.has(w) || /[^aeiou][aeiou]l$/.test(w) && w.length>3 && !/(ail|eal|eel|oil|ool|oul|ial)$/.test(w)) return true; return w.length>=3 && w.length<=5 && !isV(w[w.length-1]) && !/[wxy]/.test(w[w.length-1]) && isV(w[w.length-2]) && !isV(w[w.length-3]) && (w.match(/[aeiou]+/g)||[]).length===1; }
function verbForms(base){
  const b = norm(base);
  const third = b==="be" ? "is" : b==="have" ? "has" : b==="do" ? "does" : b==="go" ? "goes" : /(s|x|z|ch|sh|o)$/.test(b) ? b+"es" : /[^aeiou]y$/.test(b) ? b.slice(0,-1)+"ies" : b+"s";
  const ing = b==="be" ? "being" : /ie$/.test(b) ? b.slice(0,-2)+"ying" : /[^eoy]e$/.test(b) && b!=="be" ? b.slice(0,-1)+"ing" : cvc(b) ? b+b[b.length-1]+"ing" : b+"ing";
  let past, pp;
  if(IRRV[b]){ past = IRRV[b].past; pp = IRRV[b].pp; }
  else { past = /e$/.test(b) ? b+"d" : /[^aeiou]y$/.test(b) ? b.slice(0,-1)+"ied" : cvc(b) ? b+b[b.length-1]+"ed" : b+"ed"; pp = past; }
  return {base:b, third, past, past_participle:pp, present_participle:ing, irregular:!!IRRV[b]};
}

/* ---------- sound ---------- */
let voices = [];
const loadV = () => { try{ voices = speechSynthesis.getVoices() || []; }catch(e){ voices = []; } };
loadV(); try{ speechSynthesis.addEventListener("voiceschanged", loadV); }catch(e){}
function sayWord(text, accent){
  if(!text) return;
  try{
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const want = accent==="us" ? /en[-_]US/i : /en[-_](GB|IE|AU)/i;
    const score = IE().voiceScore || (() => 0);
    const saved = (IE().prefs ? IE().prefs() : {}).voiceName;
    let v = voices.filter(x => want.test(x.lang)).sort((a,b) => score(b)-score(a))[0];
    if(!v && saved) v = voices.find(x => x.name===saved);
    if(v){ u.voice = v; u.lang = v.lang; } else u.lang = accent==="us" ? "en-US" : "en-GB";
    u.rate = 0.9; speechSynthesis.speak(u);
  }catch(e){}
}
let audioUrls = {};
function playReal(w, accent){
  const a = audioUrls[norm(w)] || {};
  const url = accent==="us" ? (a.us || a.any) : (a.uk || a.any);
  if(url){ try{ const au = new Audio(url); au.play().catch(() => sayWord(w, accent)); return; }catch(e){} }
  sayWord(w, accent);
}

/* ---------- getting a word card ---------- */
async function dictLookup(w){
  try{
    const r = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/"+encodeURIComponent(norm(w)));
    if(!r.ok) return null;
    const j = await r.json(); if(!Array.isArray(j) || !j.length) return null;
    const ph = j.flatMap(e => arr(e.phonetics));
    const au = {}; ph.forEach(p => { if(!p.audio) return; if(/-uk\./.test(p.audio)) au.uk = au.uk || p.audio; else if(/-us\./.test(p.audio)) au.us = au.us || p.audio; else au.any = au.any || p.audio; });
    audioUrls[norm(w)] = au;
    const ipa = (ph.find(p => p.text && p.audio && /-uk\./.test(p.audio)) || ph.find(p => p.text) || {}).text || j[0].phonetic || "";
    const senses = [], syn = new Set(), ant = new Set();
    j.forEach(e => arr(e.meanings).forEach(m => {
      arr(m.synonyms).forEach(s => syn.add(s)); arr(m.antonyms).forEach(s => ant.add(s));
      arr(m.definitions).slice(0,2).forEach(d => { arr(d.synonyms).forEach(s => syn.add(s)); arr(d.antonyms).forEach(s => ant.add(s)); if(senses.length < 4) senses.push({pos:m.partOfSpeech, meaning:d.definition, example:d.example || ""}); });
    }));
    return {ipa, senses, synonyms:[...syn].slice(0,8).map(x => ({word:x})), antonyms:[...ant].slice(0,6).map(x => ({word:x}))};
  }catch(e){ return null; }
}
const CARD_SHAPE = `{"word": the headword (base form), "level": CEFR level like "B2", "ipa_uk": "/.../", "ipa_us": "/.../", "syllables": "word split with · and the stressed syllable in CAPITALS, e.g. de·CI·sion",
"senses": [1-3 most useful meanings {"pos": "noun|verb|adjective|adverb|phrasal verb|idiom|preposition|conjunction", "meaning": "very simple English definition", "meaning_id": "arti dalam Bahasa Indonesia", "example": "a natural example sentence"}],
"forms": {"verb": {"base","third","past","past_participle","present_participle"} or null, "noun": {"singular","plural","countable": "countable|uncountable|both"} or null, "adjective": {"comparative","superlative"} or null},
"family": [other words in the same family {"pos","word"}, e.g. decide (verb), decisive (adjective)],
"synonyms": [4-6 {"word","level","note": "short nuance, e.g. more formal / stronger / positive"}],
"antonyms": [2-4 {"word","level"}],
"collocations": [4-6 common word partners, e.g. "make a decision"],
"examples": [3 {"en": "sentence", "id": "terjemahan"}; one must sound like an IELTS Speaking answer],
"instead_of": [basic words this word can replace, e.g. "choose"],
"upgrades": [4-6 stronger, more precise or more advanced words/phrases she can use INSTEAD of this word to sound band 8-9 {"word","level","note": "when to use it, short","example": "natural sentence"}] (for an advanced word, give natural alternatives at the same level),
"mistake_id": "one common mistake Indonesian learners make with this word, in Bahasa Indonesia (or empty)",
"tip_id": "one short tip in Bahasa Indonesia on when to use it in IELTS"}`;
async function aiCard(w){
  const ai = IE().ai; if(!ai) throw Object.assign(new Error("nokey"), {code:"nokey"});
  return ai(`You are a friendly English vocabulary teacher for Azel, an Indonesian university student aiming for IELTS band 9. Be accurate: IPA, word forms and parts of speech must be correct British English (give US IPA too). Keep definitions short and simple. Return only JSON.`,
    [{text:`Make a complete learner's word card for: "${w}". If it is misspelled, correct it. If it is an inflected form (e.g. "went"), make the card for the base word. JSON ${CARD_SHAPE}`}], {temp:0.3});
}
function fromDict(w, d){
  const pos = d.senses.map(s => s.pos);
  return {word:w, ipa_uk:d.ipa, senses:d.senses, synonyms:d.synonyms, antonyms:d.antonyms,
    forms:{verb: pos.includes("verb") && !/\s/.test(w) ? verbForms(w) : null}, _dict:true};
}
const cache = {};
let current = null; // {word, card, partial}
async function lookup(raw){
  const w = norm(raw); if(!w) return;
  const box = $("vcResult"); if(!box) return;
  const saved = byId("vocab", wid(w));
  if(saved && saved.card && !saved.card._dict){ current = {word:saved.word, card:saved.card}; showCard(); dictLookup(saved.word); return; }
  if(cache[w]){ current = {word:w, card:cache[w]}; showCard(); return; }
  box.innerHTML = `<div class="card ai-wait"><div class="pita-wrap small-pita" id="vcWait"></div><p>Pita is looking up <b>${esc(w)}</b>…</p></div>`;
  const wp = window.Pita && $("vcWait") ? window.Pita.create($("vcWait"), {mood:"thinking"}) : null; if(wp) wp.state("think");
  const [dr, ar] = await Promise.allSettled([dictLookup(w), aiCard(w)]);
  const d = dr.status==="fulfilled" ? dr.value : null;
  if(ar.status==="fulfilled" && ar.value && arr(ar.value.senses).length){
    const c = ar.value; const head = norm(c.word || w);
    if(head!==w && !audioUrls[head]) dictLookup(head);
    if(!c.ipa_uk && d) c.ipa_uk = d.ipa;
    cache[w] = cache[head] = c; current = {word:head, card:c};
    if(byId("vocab", wid(head))) saveWord(head, c); else if(saved) saveWord(saved.word, c);
  } else if(d){
    const c = fromDict(w, d); cache[w] = c; current = {word:w, card:c, why: ar.reason};
  } else {
    const e = ar.reason;
    const msg = e && e.code==="nokey" ? "Add your AI key in IELTS → Settings to get full word cards." : (IE().errMsg ? IE().errMsg(e) : "Couldn't find that word.");
    box.innerHTML = `<div class="card"><p><b>I couldn't find “${esc(w)}”.</b></p><p class="small muted">Check the spelling, or try again in a minute. ${esc(msg)}</p></div>`;
    return;
  }
  showCard();
}

/* ---------- word card view ---------- */
const chip = (w, extra, cls) => `<button class="vchip ${cls||""}" type="button" data-vc="look" data-w="${esc(w)}">${esc(w)}${extra ? ` <small>${esc(extra)}</small>` : ""}</button>`;
function formsHtml(f, word){
  if(!f) return "";
  let h = "";
  const v = f.verb;
  if(v && (v.past || v.past_participle)){
    const cells = [["Base",v.base||word],["He/she/it",v.third],["Past",v.past],["Past participle",v.past_participle],["-ing form",v.present_participle]];
    h += `<div class="vforms">${cells.map(([k,x]) => `<div><span>${esc(k)}</span>${x ? `<button class="vfword" type="button" data-vc="look" data-w="${esc(str(x).split("/")[0])}">${esc(str(x))}</button>` : "<b>–</b>"}${x ? `<button class="vplay" type="button" data-vc="say" data-w="${esc(str(x).split("/")[0])}" aria-label="Listen">🔊</button>` : ""}</div>`).join("")}</div>`;
    if(v.irregular || (v.past && v.base && !/ed$/.test(str(v.past)))) h += `<p class="small muted">Irregular verb: learn the past forms by heart.</p>`;
  }
  if(f.noun && (f.noun.plural || f.noun.countable)) h += `<p class="small"><span class="tag">noun</span> plural: ${f.noun.plural ? chip(str(f.noun.plural), "", "plain2") : "–"}${f.noun.countable ? ` · ${esc(f.noun.countable)}` : ""}</p>`;
  if(f.adjective && (f.adjective.comparative || f.adjective.superlative)) h += `<p class="small"><span class="tag">adjective</span> ${[f.adjective.comparative, f.adjective.superlative].filter(Boolean).map(x => chip(str(x), "", "plain2")).join(" ")}</p>`;
  return h ? `<div class="vsec"><h3>Word forms</h3>${h}</div>` : "";
}
function cardHtml(word, c, opts){
  opts = opts || {};
  const saved = !!byId("vocab", wid(word));
  const pos = [...new Set(arr(c.senses).map(s => str(s.pos)).filter(Boolean))];
  let h = `<div class="vhead"><div><div class="vword">${esc(word)}</div>
      <div class="vmeta">${c.level ? `<span class="tag lvl">${esc(c.level)}</span>` : ""}${pos.map(p => `<span class="tag">${esc(p)}</span>`).join("")}</div></div>
      ${opts.noSave ? "" : `<button class="btn small ${saved ? "ghost" : ""}" type="button" data-vc="${saved ? "unsave" : "save"}" data-w="${esc(word)}">${saved ? "Saved ✓" : "+ Save"}</button>`}</div>
    <div class="vsay">
      <button class="vplaybig" type="button" data-vc="real" data-w="${esc(word)}" data-a="uk">🔊 UK${c.ipa_uk ? ` <span>${esc(c.ipa_uk)}</span>` : ""}</button>
      <button class="vplaybig" type="button" data-vc="real" data-w="${esc(word)}" data-a="us">🔊 US${c.ipa_us ? ` <span>${esc(c.ipa_us)}</span>` : ""}</button>
      ${c.syllables ? `<span class="small muted">Stress: <b>${esc(c.syllables)}</b></span>` : ""}
    </div>`;
  h += `<div class="vsec"><h3>Meaning</h3>${arr(c.senses).map(s => `<div class="vsense"><span class="tag">${esc(str(s.pos))}</span> ${esc(str(s.meaning))}${s.meaning_id ? `<div class="vid">🇮🇩 ${esc(str(s.meaning_id))}</div>` : ""}${s.example ? `<div class="vex">“${esc(str(s.example))}”</div>` : ""}</div>`).join("")}</div>`;
  h += formsHtml(c.forms, word);
  if(arr(c.family).length) h += `<div class="vsec"><h3>Word family</h3><div class="vchips">${arr(c.family).map(f => chip(str(f.word), str(f.pos))).join("")}</div></div>`;
  if(arr(c.synonyms).length) h += `<div class="vsec"><h3>Synonyms <small class="muted">(similar meaning)</small></h3><div class="vchips">${arr(c.synonyms).map(s => chip(str(s.word), [s.level, s.note].filter(Boolean).join(" · "), "syn")).join("")}</div></div>`;
  if(arr(c.antonyms).length) h += `<div class="vsec"><h3>Antonyms <small class="muted">(opposite)</small></h3><div class="vchips">${arr(c.antonyms).map(s => chip(str(s.word), str(s.level||""), "ant")).join("")}</div></div>`;
  if(arr(c.collocations).length) h += `<div class="vsec"><h3>Words that go with it</h3><div class="vchips">${arr(c.collocations).map(x => chip(str(x), "", "col")).join("")}</div></div>`;
  if(arr(c.examples).length) h += `<div class="vsec"><h3>Examples</h3>${arr(c.examples).map(x => `<div class="vexrow"><button class="vplay" type="button" data-vc="say" data-w="${esc(str(x.en))}" aria-label="Listen">🔊</button><div><div>${esc(str(x.en))}</div>${x.id ? `<div class="vid">${esc(str(x.id))}</div>` : ""}</div></div>`).join("")}</div>`;
  if(arr(c.upgrades).length) h += `<div class="vsec vup"><h3>Instead of “${esc(word)}”, you can say <small class="muted">(level up)</small></h3>${arr(c.upgrades).map(u => `<div class="vuprow">${chip(str(u.word || u), str(u.level||""), "up")}${u.note ? `<span class="small muted">${esc(str(u.note))}</span>` : ""}${u.example ? `<div class="vex">“${esc(str(u.example))}”</div>` : ""}</div>`).join("")}</div>`;
  else if(!c._dict) h += `<div class="vsec vup"><h3>Instead of “${esc(word)}”, you can say</h3><button class="btn small ghost" type="button" data-vc="upgrades" data-w="${esc(word)}">Show better words</button><div id="vupOut"></div></div>`;
  if(arr(c.instead_of).length) h += `<div class="vsec"><h3>Use “${esc(word)}” instead of</h3><div class="vchips">${arr(c.instead_of).map(x => chip(str(x), "", "plain")).join("")}</div></div>`;
  if(c.mistake_id) h += `<div class="notice small"><b>Awas salah:</b> ${esc(str(c.mistake_id))}</div>`;
  if(c.tip_id) h += `<p class="small"><b>Tip IELTS:</b> ${esc(str(c.tip_id))}</p>`;
  if(c._dict) h += `<div class="notice small">This is the quick dictionary card. Pita's full card (Indonesian meaning, levels, collocations) comes when the AI is free again. <button class="linkbtn" type="button" data-vc="retry" data-w="${esc(word)}">Try again</button></div>`;
  return h;
}
function showCard(){
  const box = $("vcResult"); if(!box || !current) return;
  box.innerHTML = `<div class="card vcard">${cardHtml(current.word, current.card)}</div>`;
  try{ box.firstElementChild.animate([{opacity:0, transform:"translateY(10px) scale(.98)"},{opacity:1, transform:"none"}], {duration:320, easing:"cubic-bezier(.2,.9,.3,1)"}); }catch(e){}
}
function saveWord(word, card, src){
  const id = wid(word), old = byId("vocab", id);
  put("vocab", Object.assign({}, old || {box:0, due:today(), right:0, wrong:0, addedAt:Date.now()}, {id, word:norm(word), card: card || (old && old.card) || null, src: src || (old && old.src) || "lookup"}));
}
window.__vocabAdd = (word, basic) => {
  const w = norm(word); if(!w || byId("vocab", wid(w))) return;
  const c = cache[w] || {word:w, senses:[{pos:"", meaning:str(basic && basic.meaning), example:str(basic && basic.example)}], _dict:true};
  saveWord(w, c, "ielts");
};

async function moreUpgrades(word, btn){
  const out = $("vupOut"); if(btn) btn.disabled = true; if(out) out.innerHTML = `<p class="small muted">Pita is finding better words…</p>`;
  try{
    const r = await IE().ai(`You are an IELTS vocabulary teacher for Azel (Indonesian, aiming for band 9). Return only JSON.`,
      [{text:`Give 4-6 stronger, more precise or more advanced words/phrases to use instead of "${word}" in IELTS Speaking and Writing. JSON {"upgrades": [{"word","level","note": "when to use it, short","example": "natural sentence"}]}`}], {temp:0.5});
    const ups = arr(r.upgrades);
    const id = wid(word), saved = byId("vocab", id);
    const c = (current && norm(current.word)===norm(word)) ? current.card : saved && saved.card;
    if(c){ c.upgrades = ups; if(saved) saveWord(saved.word, c); }
    if(out) out.innerHTML = ups.map(u => `<div class="vuprow">${chip(str(u.word), str(u.level||""), "up")}${u.note ? `<span class="small muted">${esc(str(u.note))}</span>` : ""}${u.example ? `<div class="vex">“${esc(str(u.example))}”</div>` : ""}</div>`).join("") || `<p class="small muted">No ideas this time.</p>`;
    if(btn) btn.remove();
  }catch(e){ if(btn) btn.disabled = false; if(out) out.innerHTML = `<p class="small neg">${esc(IE().errMsg ? IE().errMsg(e) : "The AI couldn't answer.")}</p>`; }
}

/* ---------- Say it better ---------- */
const STOP = new Set("i me my we our you your he she it its they them their a an the and or but so because if then than that this these those is am are was were be been being do does did have has had will would can could should may might must to of in on at for with from by about as into like just very really also not no yes there here what which who when where why how all some any one two more most much many lot lots well um uh er ah oh okay ok yeah".split(" "));
const BASIC = new Set("good bad very really nice big small thing things stuff important interesting happy sad beautiful many lot get got make made think help use people problem great hard easy like want say said".split(" "));
function repeated(text){
  const c = {};
  (norm(text).match(/[a-z']+/g) || []).forEach(t => { if(t.length>2 && (!STOP.has(t) || BASIC.has(t))) c[t] = (c[t]||0)+1; });
  return Object.entries(c).filter(([w,n]) => n >= (BASIC.has(w) ? 2 : 3)).sort((a,b) => b[1]-a[1]).slice(0,10);
}
function speakingText(){
  const ss = (IE().sessions ? IE().sessions() : []).filter(s => s.skill==="speaking").slice(-6);
  return ss.flatMap(s => arr(s.items).map(it => str(it.transcript))).join(" ");
}
async function sayBetter(){
  const t = $("vbIn") ? $("vbIn").value.trim() : ""; const out = $("vbOut"); if(!out) return;
  if(!t){ out.innerHTML = `<p class="small muted">Write or paste a few sentences first.</p>`; return; }
  const rep = repeated(t);
  out.innerHTML = (rep.length ? `<p class="small"><b>Words you repeat:</b></p><div class="vchips">${rep.map(([w,n]) => chip(w, "×"+n, "rep")).join("")}</div>` : "") + `<p class="small muted">Pita is reading your text…</p>`;
  try{
    const r = await IE().ai(`You are an encouraging IELTS teacher for Azel (Indonesian, aiming for band 9). Upgrade her vocabulary while keeping her meaning and a natural spoken style. Never insult. Explanations in Bahasa Indonesia. Return only JSON.`,
      [{text:`Azel's text:\n"""${t.slice(0,2500)}"""\nFind basic or repeated words and suggest better ones. JSON {"better": "her text rewritten with richer but natural vocabulary (band 8-9)", "changes": [3-8 {"from": "exact words she used", "to": ["2-3 better options"], "why_id": "short reason in Bahasa Indonesia"}], "repeated": [words she repeats {"word", "count", "try": ["2-3 alternatives"]}]}`}], {temp:0.5});
    const ch = arr(r.changes);
    out.innerHTML = (arr(r.repeated).length ? `<div class="vsec"><h3>Words you repeat</h3>${arr(r.repeated).map(x => `<div class="vrep"><b>${esc(str(x.word))}</b>${x.count ? ` <span class="muted small">×${esc(str(x.count))}</span>` : ""} → <span class="vchips">${arr(x.try).map(y => chip(str(y), "", "syn")).join("")}</span></div>`).join("")}</div>` : "")
      + (ch.length ? `<div class="vsec"><h3>Better words</h3>${ch.map(x => `<div class="vchange"><s>${esc(str(x.from))}</s> → <span class="vchips">${arr(x.to).map(y => chip(str(y), "", "syn")).join("")}</span><div class="vid">${esc(str(x.why_id))}</div></div>`).join("")}</div>` : "")
      + (r.better ? `<div class="vsec"><h3>Your text, upgraded</h3><div class="card soft">${esc(str(r.better))}</div><button class="btn small ghost" type="button" data-vc="say" data-w="${esc(str(r.better))}">🔊 Listen</button></div>` : "");
  }catch(e){
    out.innerHTML = (rep.length ? `<p class="small"><b>Words you repeat:</b> tap one to see synonyms.</p><div class="vchips">${rep.map(([w,n]) => chip(w, "×"+n, "rep")).join("")}</div>` : "") + `<p class="small neg">${esc(IE().errMsg ? IE().errMsg(e) : "The AI couldn't answer.")}</p>`;
  }
}

/* ---------- topic word sets ---------- */
const TOPICS = ["Education","Work & careers","Technology","Environment","Health","Economy & money","Cities & housing","Travel & tourism","Food","Family & friends","Media & news","Culture & art","Science","Government & society","Feelings & opinions","Describing trends (Task 1)"];
async function topicWords(topic){
  const out = $("vtOut"); if(!out) return;
  out.innerHTML = `<p class="small muted">Pita is choosing ${esc(topic)} words…</p>`;
  try{
    const have = words().map(w => w.word).slice(0,80).join(", ");
    const r = await IE().ai(`You are an IELTS vocabulary teacher for Azel (Indonesian, aiming for band 9). Return only JSON.`,
      [{text:`Give 8 useful, natural IELTS words or short phrases for the topic "${topic}", from B2 to C2, that help her speak and write better. Avoid these words she already knows: ${have || "none"}. JSON {"words": [{"word","pos","level","meaning": "simple English","meaning_id": "Bahasa Indonesia","example": "natural IELTS-style sentence"}]}`}], {temp:0.9});
    const ws = arr(r.words);
    out.innerHTML = ws.length ? ws.map(x => `<div class="vtrow"><div style="min-width:0"><button class="linkbtn vtword" type="button" data-vc="look" data-w="${esc(str(x.word))}">${esc(str(x.word))}</button> <span class="tag">${esc(str(x.pos))}</span>${x.level ? ` <span class="tag lvl">${esc(str(x.level))}</span>` : ""}<div class="small">${esc(str(x.meaning))}</div><div class="vid">${esc(str(x.meaning_id))}</div><div class="vex">“${esc(str(x.example))}”</div></div><button class="btn small ghost" type="button" data-vc="quicksave" data-w="${esc(str(x.word))}" data-m="${esc(str(x.meaning))}" data-mi="${esc(str(x.meaning_id))}" data-e="${esc(str(x.example))}" data-p="${esc(str(x.pos))}" data-l="${esc(str(x.level))}">${byId("vocab", wid(x.word)) ? "Saved ✓" : "+ Save"}</button></div>`).join("") : `<p class="small muted">No words this time. Try again.</p>`;
  }catch(e){ out.innerHTML = `<p class="small neg">${esc(IE().errMsg ? IE().errMsg(e) : "The AI couldn't answer.")}</p>`; }
}

/* ---------- review (active recall, spaced repetition) ---------- */
let Q = null, qp = null;
function makeQ(w, all){
  const c = w.card || {}, word = w.word;
  const others = all.filter(x => x.id!==w.id);
  const sense = arr(c.senses)[0] || {};
  const types = [];
  if(sense.meaning) types.push("meaning");
  const v = c.forms && c.forms.verb;
  if(v && v.past) types.push("form");
  if(arr(c.synonyms).length) types.push("syn");
  if(arr(c.antonyms).length) types.push("ant");
  const ex = arr(c.examples).map(x => str(x.en)).concat([str(sense.example)]).find(s => s && new RegExp("\\b"+word.replace(/[^a-z' ]/g,""), "i").test(s));
  if(ex) types.push("gap");
  if(sense.pos && /^(noun|verb|adjective|adverb)$/.test(sense.pos)) types.push("pos");
  if(!types.length) types.push("recall");
  const t = types[Math.floor(Math.random()*types.length)];
  const shuffle = a => a.map(x => [Math.random(), x]).sort((a,b) => a[0]-b[0]).map(x => x[1]);
  if(t==="meaning"){
    if(others.length >= 3) return {t, word, q:`Which word means:`, big:str(sense.meaning), sub:str(sense.meaning_id), opts:shuffle([word, ...shuffle(others).slice(0,3).map(x => x.word)]), ans:[word]};
    return {t, word, q:`Type the word that means:`, big:str(sense.meaning), sub:str(sense.meaning_id), type:true, ans:[word]};
  }
  if(t==="form"){
    const k = [["past","past tense"],["past_participle","past participle"],["present_participle","-ing form"],["third","he/she/it form"]].filter(x => v[x[0]]);
    const [key, label] = k[Math.floor(Math.random()*k.length)];
    return {t, word, q:`What is the <b>${label}</b> of:`, big:word, type:true, ans:str(v[key]).split("/").map(norm)};
  }
  if(t==="syn" || t==="ant"){
    const good = arr(t==="syn" ? c.synonyms : c.antonyms).map(x => norm(x.word || x));
    const pick = good[Math.floor(Math.random()*good.length)];
    const bad = shuffle([...arr(t==="syn" ? c.antonyms : c.synonyms).map(x => norm(x.word || x)), ...others.map(x => x.word)].filter(x => !good.includes(x) && x!==word)).slice(0,3);
    if(bad.length < 2) return {t, word, q:`Name one ${t==="syn" ? "synonym (similar word)" : "antonym (opposite)"} of:`, big:word, type:true, ans:good, loose:true};
    return {t, word, q:`Choose a word with ${t==="syn" ? "a <b>similar</b>" : "the <b>opposite</b>"} meaning to:`, big:word, opts:shuffle([pick, ...bad]), ans:good};
  }
  if(t==="gap"){
    const re = new RegExp("\\b("+word.replace(/[^a-z' ]/g,"")+"[a-z]*)", "i");
    const m = ex.match(re); const used = m ? norm(m[1]) : word;
    return {t, word, q:`Fill the gap:`, big:ex.replace(re, "_____"), sub:`(${str(sense.meaning)})`, type:true, ans:[used, word]};
  }
  if(t==="pos"){
    return {t, word, q:`What part of speech is this word?`, big:word, sub: ex ? `“${ex}”` : "", opts:["noun","verb","adjective","adverb"], ans:[sense.pos]};
  }
  return {t, word, q:`Do you remember what this word means?`, big:word, opts:["Yes, I know it","Not sure"], ans:["Yes, I know it"], self:true};
}
function startReview(all){
  const pool = all || due();
  const list = (pool.length ? pool : words()).slice().sort(() => Math.random()-0.5).slice(0, 10);
  if(!list.length){ toast("Save some words first."); return; }
  Q = {list, i:0, right:0};
  openP("Word review", `<div class="vq-top"><div class="pita-wrap small-pita" id="vqPita"></div><div class="small muted" id="vqProg"></div></div><div id="vqBody"></div>`, () => { Q = null; qp = null; renderLists(); });
  qp = window.Pita && $("vqPita") ? window.Pita.create($("vqPita"), {mood:"happy"}) : null;
  nextQ();
}
function nextQ(){
  if(!Q) return;
  const b = $("vqBody"); if(!b) return;
  if(Q.i >= Q.list.length){
    const pct = Math.round(Q.right/Q.list.length*100);
    if(qp) qp.mood(pct>=80 ? "love" : pct>=50 ? "happy" : "sad");
    b.innerHTML = `<div class="vq-end"><h2>${Q.right} / ${Q.list.length}</h2><p>${pct>=80 ? "Amazing memory, Azel!" : pct>=50 ? "Good work! The tricky words come back sooner." : "That's okay. Mistakes help you remember. Those words come back tomorrow."}</p><div class="btn-row"><button class="btn" type="button" data-vc="rv-close">Done</button></div></div>`;
    return;
  }
  const w = Q.list[Q.i]; const q = Q.cur = makeQ(w, words());
  $("vqProg").textContent = `Word ${Q.i+1} of ${Q.list.length}`;
  if(qp){ qp.mood("asking"); qp.state("idle"); }
  b.innerHTML = `<p class="small muted">${q.q}</p><div class="vq-big">${esc(q.big)}</div>${q.sub ? `<div class="vid">${esc(q.sub)}</div>` : ""}
    ${q.opts ? `<div class="vq-opts">${q.opts.map(o => `<button class="opt" type="button" data-vc="rv-pick" data-v="${esc(o)}">${esc(o)}</button>`).join("")}</div>`
      : `<form class="vq-type" data-vc-form="1"><input class="in" id="vqIn" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Type your answer"><button class="btn" type="submit">Check</button></form><button class="linkbtn small" type="button" data-vc="rv-skip">I don't know</button>`}
    <div id="vqFb"></div>`;
  try{ b.animate([{opacity:0, transform:"translateX(18px)"},{opacity:1, transform:"none"}], {duration:300, easing:"cubic-bezier(.2,.9,.3,1)"}); }catch(e){}
  const inp = $("vqIn"); if(inp) setTimeout(() => inp.focus(), 60);
}
function answer(val){
  const q = Q && Q.cur; if(!q || q.done) return;
  q.done = true;
  const v = norm(val);
  const ok = q.self ? v===norm(q.ans[0]) : q.ans.map(norm).includes(v) || (q.loose && v.length>2 && q.ans.some(a => a.includes(v)));
  const w = Q.list[Q.i], rec = byId("vocab", w.id) || w;
  const box = ok ? Math.min(6, (rec.box||0)+1) : 0;
  put("vocab", Object.assign({}, rec, {box, due:addDays(today(), ok ? BOX_DAYS[box] : 1), right:(rec.right||0)+(ok?1:0), wrong:(rec.wrong||0)+(ok?0:1), seen:today()}));
  if(ok) Q.right++;
  if(qp) qp.mood(ok ? "happy" : "sad");
  document.querySelectorAll("#vqBody .opt").forEach(b => { const bv = norm(b.dataset.v); b.disabled = true; if(q.ans.map(norm).includes(bv)) b.classList.add("ok"); else if(bv===v) b.classList.add("no"); });
  const inp = $("vqIn"); if(inp) inp.disabled = true;
  const fb = $("vqFb");
  if(fb) fb.innerHTML = `<div class="vq-fb ${ok ? "ok" : "no"}">${ok ? pick(["Correct!","Yes! Well done.","Perfect!","Nice one!"]) : "Not quite. The answer: <b>"+esc(q.ans.slice(0, q.t==="syn"||q.t==="ant" ? 3 : 1).join(" / "))+"</b>"}</div>
    <button class="linkbtn small" type="button" data-vc="rv-card" data-w="${esc(w.word)}">See the word card</button>
    <div class="btn-row"><button class="btn" type="button" data-vc="rv-next">Next</button></div>`;
  sayWord(w.word);
}
const pick = a => a[Math.floor(Math.random()*a.length)];

/* ---------- main view ---------- */
let mounted = false, vp = null;
function renderLists(){
  const ws = words(), d = due();
  const st = $("vcStats"); if(st) st.innerHTML = `<b>${ws.length}</b> words saved · <b>${d.length}</b> to review today`;
  const rv = $("vcReview");
  if(rv) rv.innerHTML = ws.length ? `<p class="small">${d.length ? `<b>${d.length} word${d.length===1?"":"s"}</b> are ready to review. Pita asks, you remember.` : "All done for today! Words come back when you're about to forget them."}</p>
      <div class="btn-row"><button class="btn" type="button" data-vc="review">${d.length ? "Start review" : "Practise anyway"}</button></div>`
    : `<p class="small muted">Save words from the word cards, and Pita will quiz you on them: meaning, word forms, synonyms and fill-the-gap.</p>`;
  const f = norm($("vcFilter") ? $("vcFilter").value : "");
  const lst = $("vcList");
  if(lst) lst.innerHTML = ws.filter(w => !f || w.word.includes(f)).map(w => {
    const c = w.card || {}, s = arr(c.senses)[0] || {};
    return `<button class="vrow" type="button" data-vc="open" data-w="${esc(w.word)}"><span style="min-width:0"><b>${esc(w.word)}</b> ${s.pos ? `<span class="tag">${esc(str(s.pos))}</span>` : ""}${c.level ? ` <span class="tag lvl">${esc(c.level)}</span>` : ""}<span class="small muted vrow-m">${esc(str(s.meaning_id || s.meaning))}</span></span><span class="vbox" title="Memory strength">${"●".repeat(Math.min(6,w.box||0))}${"○".repeat(Math.max(0,6-(w.box||0)))}</span></button>`;
  }).join("") || `<div class="empty">${ws.length ? "No word matches." : "No saved words yet. Look one up above!"}</div>`;
  const sp = $("vcSpeak");
  if(sp){
    const rep = repeated(speakingText());
    sp.innerHTML = rep.length ? `<p class="small">From your Speaking practice, you often say:</p><div class="vchips">${rep.map(([w,n]) => chip(w, "×"+n, "rep")).join("")}</div><p class="small muted">Tap a word to find better ones.</p>` : `<p class="small muted">After a few Speaking sessions, Pita shows the words you repeat most here.</p>`;
  }
}
function render(){
  const v = $("view-vocab"); if(!v) return;
  if(!mounted){
    mounted = true;
    v.innerHTML = `
      <div class="card vhero"><div class="pita-wrap small-pita" id="vcPita"></div><div><div class="label">Word power</div><h2>Vocabulary</h2><p class="small muted" id="vcStats"></p></div></div>
      <form class="vsearch" id="vcForm"><input class="in" id="vcQ" autocomplete="off" autocapitalize="none" spellcheck="false" enterkeyhint="search" placeholder="Look up a word, e.g. decide"><button class="btn" type="submit">Look up</button></form>
      <div id="vcResult"></div>
      <div class="section"><h2>Review</h2><div class="card" id="vcReview"></div></div>
      <div class="section"><h2>Say it better</h2>
        <div class="card"><p class="small muted">Paste a speaking answer or a few sentences. Pita finds the words you repeat and gives you better ones.</p>
          <textarea class="in" id="vbIn" rows="4" placeholder="e.g. I think technology is very good because it is very useful and it makes life very easy…"></textarea>
          <div class="btn-row"><button class="btn" type="button" data-vc="better">Make it better</button><button class="btn ghost small" type="button" data-vc="fromspeak">Use my Speaking answers</button></div>
          <div id="vbOut"></div></div>
        <div class="card" id="vcSpeak"></div></div>
      <div class="section"><h2>Topic words</h2><div class="card"><div class="vchips">${TOPICS.map(t => `<button class="vchip topic" type="button" data-vc="topic" data-t="${esc(t)}">${esc(t)}</button>`).join("")}</div><div id="vtOut"></div></div></div>
      <div class="section"><div class="section-head"><h2>My words</h2></div><input class="in" id="vcFilter" placeholder="Search my words" autocomplete="off"><div class="section" style="gap:8px" id="vcList"></div></div>`;
    vp = window.Pita && $("vcPita") ? window.Pita.create($("vcPita"), {mood:"happy"}) : null;
    $("vcForm").addEventListener("submit", e => { e.preventDefault(); const q = $("vcQ").value; if(q.trim()){ $("vcQ").blur(); lookup(q); } });
    $("vcFilter").addEventListener("input", renderLists);
  }
  renderLists();
}
function openSaved(word){
  const w = byId("vocab", wid(word)); if(!w) { lookup(word); return; }
  if(!w.card || w.card._dict){ show(); $("vcQ").value = w.word; lookup(w.word); return; }
  dictLookup(w.word);
  openP(w.word, `<div class="vcard">${cardHtml(w.word, w.card)}</div><div class="btn-row"><button class="btn ghost small" type="button" data-vc="remove" data-w="${esc(w.word)}">Remove from My words</button></div>`);
}
const show = () => { if(P.show) P.show("vocab"); };
function lookAndShow(w){
  if(Q){ /* leave the review open: show the card inside it */ }
  closeP(); show(); const q = $("vcQ"); if(q) q.value = w; lookup(w); setTimeout(() => { const r = $("vcResult"); if(r) r.scrollIntoView({behavior:"smooth", block:"start"}); }, 50);
}
document.addEventListener("submit", e => {
  if(!e.target.matches("[data-vc-form]")) return;
  e.preventDefault(); const i = $("vqIn"); if(i && i.value.trim()) answer(i.value);
});
document.addEventListener("click", e => {
  const el = e.target.closest("[data-vc]"); if(!el) return;
  const a = el.dataset.vc, w = el.dataset.w;
  switch(a){
    case "look": lookAndShow(w); break;
    case "real": playReal(w, el.dataset.a); break;
    case "say": sayWord(w); break;
    case "save": if(current){ saveWord(current.word, current.card); if(vp) vp.mood("love"); setTimeout(() => vp && vp.mood("happy"), 1600); toast("Saved to My words. Pita will quiz you on it."); showCard(); } break;
    case "unsave": del("vocab", wid(w)); toast("Removed from My words."); showCard(); break;
    case "remove": del("vocab", wid(w)); closeP(); toast("Removed from My words."); break;
    case "retry": delete cache[norm(w)]; lookup(w); break;
    case "upgrades": moreUpgrades(w, el); break;
    case "open": openSaved(w); break;
    case "better": sayBetter(); break;
    case "fromspeak": { const t = speakingText(); if(!t.trim()){ toast("No Speaking answers saved yet."); break; } $("vbIn").value = t.slice(-2000); sayBetter(); break; }
    case "topic": topicWords(el.dataset.t); break;
    case "quicksave": {
      if(byId("vocab", wid(w))){ toast("Already in My words."); break; }
      const c = cache[norm(w)] || {word:norm(w), level:el.dataset.l, senses:[{pos:el.dataset.p, meaning:el.dataset.m, meaning_id:el.dataset.mi, example:el.dataset.e}], _dict:true};
      if(c._dict && /^verb/.test(el.dataset.p||"") && !/\s/.test(w)) c.forms = {verb:verbForms(w)};
      saveWord(w, c, "topic"); el.textContent = "Saved ✓"; break;
    }
    case "review": startReview(); break;
    case "rv-pick": answer(el.dataset.v); break;
    case "rv-skip": answer("\u0000"); break;
    case "rv-next": if(Q){ Q.i++; nextQ(); } break;
    case "rv-close": closeP(); break;
    case "rv-card": { const x = byId("vocab", wid(w)); const fb = $("vqFb"); if(x && x.card && fb){ fb.insertAdjacentHTML("beforeend", `<div class="vcard mini">${cardHtml(x.word, x.card, {noSave:true})}</div>`); el.remove(); } break; }
  }
});
window.__vocabRender = render;
try{ if(D.cols && D.cols.prefs) render(); }catch(e){ console.warn(e); }
window.__vocabTools = {verbForms, makeQ, repeated};
})();
