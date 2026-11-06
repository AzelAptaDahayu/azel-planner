/* Chess with Pita: play against Pita, with 3 levels, hints, undo, and Pita reacting to the game.
   Rules come from chesslib.js (chess.js). Pita's brain is a small search below. */
(function(){
"use strict";
const P = window.__plannerAPI; if(!P || !window.ChessLib) return;
const {$, esc, put, byId, D, toast, today} = P;
const {Chess} = window.ChessLib;

/* ---------- Pita's brain ---------- */
const VAL = {p:100, n:320, b:330, r:500, q:900, k:0};
// piece-square tables, white's view, rank 8 first
const PST = {
  p:[0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5, 0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
  n:[-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
  b:[-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
  r:[0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
  q:[-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
  k:[-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20],
  ke:[-50,-40,-30,-20,-20,-30,-40,-50, -30,-20,-10,0,0,-10,-20,-30, -30,-10,20,30,30,20,-10,-30, -30,-10,30,40,40,30,-10,-30, -30,-10,30,40,40,30,-10,-30, -30,-10,20,30,30,20,-10,-30, -30,-30,0,0,0,0,-30,-30, -50,-30,-30,-30,-30,-30,-30,-50]
};
const MATE = 100000;
const sqName = s => "abcdefgh"[s & 15] + (8 - (s >> 4));
function evaluate(g){
  const b = g._board; let s = 0, mat = 0;
  for(let i=0;i<128;i++){ if(i & 0x88){ i += 7; continue; } const pc = b[i]; if(pc && pc.type!=="k" && pc.type!=="p") mat += VAL[pc.type]; }
  const end = mat <= 2600;
  for(let i=0;i<128;i++){
    if(i & 0x88){ i += 7; continue; }
    const pc = b[i]; if(!pc) continue;
    const r = i >> 4, f = i & 15, idx = pc.color==="w" ? r*8+f : (7-r)*8+f;
    const t = pc.type==="k" && end ? PST.ke : PST[pc.type];
    const v = VAL[pc.type] + t[idx];
    s += pc.color==="w" ? v : -v;
  }
  return g._turn==="w" ? s : -s;
}
const order = ms => ms.map(m => ({m, k:(m.captured ? 10*VAL[m.captured] - VAL[m.piece] + 1000 : 0) + (m.promotion ? 800 : 0)})).sort((a,b) => b.k - a.k).map(x => x.m);
function search(g, opts){
  const deadline = Date.now() + opts.time; let nodes = 0, stop = false;
  function qs(alpha, beta, d){
    const stand = evaluate(g);
    if(stand >= beta) return stand;
    if(stand > alpha) alpha = stand;
    if(d <= 0) return alpha;
    const ms = order(g._moves({legal:true}).filter(m => m.captured || m.promotion));
    for(const m of ms){
      g._makeMove(m); const sc = -qs(-beta, -alpha, d-1); g._undoMove();
      if(sc >= beta) return sc; if(sc > alpha) alpha = sc;
    }
    return alpha;
  }
  function nega(depth, alpha, beta, ply){
    if((++nodes & 1023)===0 && Date.now() > deadline) stop = true;
    if(stop) return 0;
    const ms = g._moves({legal:true});
    if(!ms.length) return g._isKingAttacked(g._turn) ? -MATE + ply : 0;
    if(depth <= 0) return opts.quiet ? qs(alpha, beta, 4) : evaluate(g);
    let best = -Infinity;
    for(const m of order(ms)){
      g._makeMove(m); const sc = -nega(depth-1, -beta, -alpha, ply+1); g._undoMove();
      if(stop) return 0;
      if(sc > best) best = sc; if(sc > alpha) alpha = sc; if(alpha >= beta) break;
    }
    return best;
  }
  const root = g._moves({legal:true});
  if(!root.length) return null;
  let scored = root.map(m => ({m, s:0}));
  for(let depth=1; depth<=opts.depth; depth++){
    const next = [];
    for(const x of scored){
      g._makeMove(x.m); const sc = -nega(depth-1, -MATE*2, MATE*2, 1); g._undoMove();
      if(stop) break;
      next.push({m:x.m, s:sc});
    }
    if(stop && depth > 1) break;
    if(next.length===scored.length) scored = next.sort((a,b) => b.s - a.s);
    if(stop) break;
    if(scored[0].s > MATE - 100) break;
  }
  // a little randomness so Pita doesn't always play the same game
  const noisy = scored.map(x => ({m:x.m, s:x.s + (Math.random()*2-1)*(opts.noise||0)})).sort((a,b) => b.s - a.s);
  let pick = noisy[0];
  if(opts.blunder && Math.random() < opts.blunder) pick = noisy[Math.floor(Math.random()*Math.min(noisy.length, 6))];
  const m = pick.m;
  return {from:sqName(m.from), to:sqName(m.to), promotion:m.promotion, score:scored[0].s, nodes};
}
const LEVELS = {
  easy:  {name:"Easy",   who:"Baby Pita",  depth:1, quiet:false, noise:90, blunder:0.25, time:400},
  medium:{name:"Medium", who:"Pita",       depth:2, quiet:true,  noise:25, blunder:0,    time:900},
  hard:  {name:"Hard",   who:"Pro Pita",   depth:4, quiet:true,  noise:0,  blunder:0,    time:1600}
};

/* ---------- cute pieces ---------- */
const PIECE = {
  p:`<circle cx="22.5" cy="14" r="7"/><path d="M14.5 35c0-7 3.4-11.5 8-13 4.6 1.5 8 6 8 13z"/><rect x="11" y="34" width="23" height="7" rx="3.5"/>`,
  r:`<path d="M12 8.5h5v3.5h3.5V8.5h4V12H28V8.5h5V17H12z"/><path d="M14.5 17h16l-1 18h-14z"/><rect x="10" y="34" width="25" height="7" rx="3.5"/>`,
  n:`<path d="M15 35c0-6 2.5-9.5 3.5-13-3 1.8-6.4 1-7.5-1.5-.8-1.8.4-3.5 2-4.8L20 10l1-4.5 3.4 3.3C31 10.5 34 17 33 26l-1 9z"/><rect x="11" y="34" width="24" height="7" rx="3.5"/>`,
  b:`<circle cx="22.5" cy="7" r="3"/><path d="M22.5 9.5c7 5 8.4 11.5 5.6 17H16.9c-2.8-5.5-1.4-12 5.6-17z"/><path d="M16 26.5h13l2.5 8h-18z"/><rect x="11" y="34" width="23" height="7" rx="3.5"/>`,
  q:`<circle cx="9.5" cy="13" r="2.8"/><circle cx="16.5" cy="9.5" r="2.8"/><circle cx="22.5" cy="7.5" r="2.8"/><circle cx="28.5" cy="9.5" r="2.8"/><circle cx="35.5" cy="13" r="2.8"/><path d="M10 15.5l4.5 19h16l4.5-19-6.5 8-6-13-6 13z"/><rect x="11" y="34" width="23" height="7" rx="3.5"/>`,
  k:`<path d="M22.5 3.5v8M19 7h7" fill="none" stroke-width="2.6" stroke-linecap="round"/><path d="M12.5 19c0-5.5 4.5-8 10-8s10 2.5 10 8l-3 15.5h-14z"/><rect x="10.5" y="34" width="24" height="7" rx="3.5"/>`
};
// where the little eyes sit for each piece
const EYES = {p:[14,22.5,3], r:[23,22.5,3.4], n:[16,24,0], b:[19,22.5,3], q:[24,22.5,3.4], k:[23,22.5,3.6]};
function pieceSvg(type, color){
  const fill = color==="w" ? "#FFFFFF" : "#F4AFC4", stroke = color==="w" ? "#B48A9D" : "#A8436A";
  const e = EYES[type];
  const eyes = type==="n" ? `<circle cx="24.5" cy="15" r="1.7" fill="#4B3742"/><path d="M27 9.5c2 1 3.5 3 4 5.5" fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>`
    : `<circle cx="${e[1]-e[2]}" cy="${e[0]}" r="1.6" fill="#4B3742"/><circle cx="${e[1]+e[2]}" cy="${e[0]}" r="1.6" fill="#4B3742"/>`;
  const blush = color==="b" ? "" : `<circle cx="${type==="n" ? 22 : e[1]-e[2]-2.4}" cy="${(type==="n" ? 18 : e[0]+2.6)}" r="1.5" fill="#F8C9D7"/>${type==="n" ? "" : `<circle cx="${e[1]+e[2]+2.4}" cy="${e[0]+2.6}" r="1.5" fill="#F8C9D7"/>`}`;
  return `<svg viewBox="6 2.5 33 40" aria-hidden="true"><g fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round">${PIECE[type]}</g>${eyes}${blush}</svg>`;
}
const NAME = {p:"pawn", n:"knight", b:"bishop", r:"rook", q:"queen", k:"king"};

/* ---------- state ---------- */
let g = new Chess(), sel = null, legal = [], busy = false, flip = false, pita = null, els = {}, hintMv = null, lastMv = null, mounted = false, loadedPgn = null;
const cs = () => Object.assign({level:"medium", side:"w", stats:{}, day:{d:"", n:0}, mode:"pita", wname:"Azel", bname:"Friend", autoflip:false, fflip:false, fstats:{w:0,b:0,d:0}}, byId("prefs","chess") || {});
function save(patch){ const s = Object.assign({}, byId("prefs","chess") || {}, patch, {id:"chess"}); delete s.updatedAt; put("prefs", s); }
// two modes: "pita" (play against Pita) and "friend" (two people take turns on one device)
const friend = () => cs().mode==="friend";
const K = () => friend() ? {pgn:"fpgn", done:"fdone"} : {pgn:"pgn", done:"done"};
const me = () => friend() ? g.turn() : (cs().gside || cs().side);
const pitaSide = () => friend() ? null : (me()==="w" ? "b" : "w");
const nm = c => { const s = cs(), n = (c==="w" ? s.wname : s.bname) || ""; return n.trim() || (c==="w" ? "White" : "Pink"); };
const wantFlip = () => friend() ? (!!cs().fflip !== (!!cs().autoflip && g.turn()==="b")) : me()==="b";

function say(text, mood, state){
  const b = $("chSay"); if(b) b.textContent = text;
  if(pita){ if(mood) pita.mood(mood); pita.state(state || "idle"); }
}
function sqXY(sq){ let f = sq.charCodeAt(0)-97, r = 8 - (+sq[1]); if(flip){ f = 7-f; r = 7-r; } return [f, r]; }
function placeEl(el, sq){ const [x,y] = sqXY(sq); el.style.transform = `translate(${x*100}%, ${y*100}%)`; }

function drawBoard(){
  const box = $("chBoard"); if(!box) return;
  flip = wantFlip();
  let sq = "";
  for(let r=0;r<8;r++) for(let f=0;f<8;f++){
    const ff = flip ? 7-f : f, rr = flip ? 7-r : r;
    const name = "abcdefgh"[ff] + (8-rr);
    const dark = (ff + rr) % 2 === 1;
    sq += `<div class="cq ${dark ? "dk" : "lt"}" data-sq="${name}"><span class="mk"></span>${f===0 ? `<i class="rk">${8-rr}</i>` : ""}${r===7 ? `<i class="fl">${"abcdefgh"[ff]}</i>` : ""}</div>`;
  }
  box.innerHTML = `<div class="cgrid">${sq}</div><div class="clayer" id="chLayer"></div>`;
  if(!box.dataset.wired){ box.dataset.wired = "1"; wireBoard(box); }
  drawPieces();
}
function drawPieces(){
  const layer = $("chLayer"); if(!layer) return;
  layer.innerHTML = ""; els = {};
  g.board().forEach(row => row.forEach(p => {
    if(!p) return;
    const el = document.createElement("div"); el.className = "cp"; el.innerHTML = pieceSvg(p.type, p.color); el.dataset.c = p.color;
    placeEl(el, p.square); layer.appendChild(el); els[p.square] = el;
  }));
  marks();
}
function marks(){
  document.querySelectorAll("#chBoard .cq").forEach(b => {
    const s = b.dataset.sq;
    b.classList.toggle("q-sel", sel===s);
    b.classList.toggle("q-last", !!lastMv && (lastMv.from===s || lastMv.to===s));
    b.classList.toggle("q-hint", !!hintMv && (hintMv.from===s || hintMv.to===s));
    const t = legal.find(m => m.to===s);
    b.classList.toggle("q-dot", !!t && !t.captured);
    b.classList.toggle("q-cap", !!t && !!t.captured);
    const pc = g.get(s);
    b.classList.toggle("q-chk", !!pc && pc.type==="k" && pc.color===g.turn() && g.inCheck());
  });
}
function animateMove(m){
  const layer = $("chLayer"); if(!layer){ drawPieces(); return; }
  const capSq = m.flags.includes("e") ? m.to[0] + m.from[1] : m.to;
  if(m.captured && els[capSq]){ const c = els[capSq]; c.classList.add("gone"); setTimeout(() => c.remove(), 320); delete els[capSq]; }
  const el = els[m.from];
  if(el){ delete els[m.from]; els[m.to] = el; el.classList.add("moving"); placeEl(el, m.to); setTimeout(() => el.classList.remove("moving"), 360);
    if(m.promotion) setTimeout(() => { el.innerHTML = pieceSvg(m.promotion, m.color); el.classList.add("promo"); }, 300); }
  if(m.flags.includes("k") || m.flags.includes("q")){
    const r = m.from[1], rf = m.flags.includes("k") ? "h"+r : "a"+r, rt = m.flags.includes("k") ? "f"+r : "d"+r;
    const re = els[rf]; if(re){ delete els[rf]; els[rt] = re; placeEl(re, rt); }
  }
  lastMv = m; marks();
}
function tray(){
  const t = $("chTray"); if(!t) return;
  const cnt = {w:{p:8,n:2,b:2,r:2,q:1}, b:{p:8,n:2,b:2,r:2,q:1}};
  g.board().forEach(row => row.forEach(p => { if(p && p.type!=="k") cnt[p.color][p.type]--; }));
  const lost = c => ["q","r","b","n","p"].map(k => Array(Math.max(0,cnt[c][k])).fill(`<span class="tp">${pieceSvg(k,c)}</span>`).join("")).join("");
  const none = `<span class="muted small">nothing yet</span>`;
  if(friend()){ t.innerHTML = `<div><span class="label">${esc(nm("w"))} took</span><div class="tps">${lost("b") || none}</div></div><div><span class="label">${esc(nm("b"))} took</span><div class="tps">${lost("w") || none}</div></div>`; return; }
  t.innerHTML = `<div><span class="label">You took</span><div class="tps">${lost(pitaSide()) || none}</div></div><div><span class="label">Pita took</span><div class="tps">${lost(me()) || none}</div></div>`;
}
function stats(){
  const s = cs(), lv = s.glevel || s.level, st = (s.stats||{})[lv] || {w:0,l:0,d:0}, fs = Object.assign({w:0,b:0,d:0}, s.fstats || {});
  const el = $("chStats"); if(el) el.innerHTML = friend() ? `Friend games: White won <b>${fs.w}</b>, Pink won <b>${fs.b}</b>, draws <b>${fs.d}</b>` : `${esc(LEVELS[lv].who)} (${LEVELS[lv].name}): you won <b>${st.w}</b>, Pita won <b>${st.l}</b>, draws <b>${st.d}</b>`;
  const elF = $("chStatsF"); if(elF) elF.innerHTML = `${esc(nm("w"))} (white) won <b>${fs.w}</b>, ${esc(nm("b"))} (pink) won <b>${fs.b}</b>, draws <b>${fs.d}</b>`;
  document.querySelectorAll('[data-ch="mode"]').forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v===(friend() ? "friend" : "pita"))));
  document.querySelectorAll("[data-only]").forEach(x => { x.hidden = x.dataset.only !== (friend() ? "friend" : "pita"); });
  const af = $("chAuto"); if(af) af.checked = !!s.autoflip;
  ["w","b"].forEach(c => { const i = $("chName"+c); if(i && document.activeElement!==i) i.value = c==="w" ? (s.wname||"") : (s.bname||""); });
  document.querySelectorAll('[data-ch="level"]').forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v===lv)));
  document.querySelectorAll('[data-ch="side"]').forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v===s.side)));
}
function persist(){ loadedPgn = g.pgn(); save({[K().pgn]: loadedPgn}); }

/* ---------- game flow ---------- */
function over(){
  if(!g.isGameOver()) return false;
  if(friend()){
    const s = cs(), fs = Object.assign({w:0,b:0,d:0}, s.fstats || {});
    let line, mood;
    if(g.isCheckmate()){ const win = g.turn()==="w" ? "b" : "w"; fs[win]++; line = "Checkmate! "+nm(win)+" wins! Great game, both of you!"; mood = "love"; }
    else { fs.d++; line = (g.isStalemate() ? "Stalemate!" : g.isThreefoldRepetition() ? "Same position three times!" : g.isInsufficientMaterial() ? "Not enough pieces to checkmate!" : "") + " It's a draw. Rematch?"; mood = "confused"; }
    loadedPgn = g.pgn();
    save({fstats:fs, fdone:true, fpgn:loadedPgn});
    say(line.trim(), mood); setCtrl(true); stats();
    return true;
  }
  const s = cs(), lv = s.glevel || s.level, stt = Object.assign({}, s.stats || {}); const st = Object.assign({w:0,l:0,d:0}, stt[lv] || {});
  let res, line, mood;
  if(g.isCheckmate()){
    const loser = g.turn();
    if(loser===pitaSide()){ res = "w"; line = "Checkmate! You beat me! I'm so proud of you, Azel!"; mood = "love"; }
    else { res = "l"; line = "Checkmate! Good game, Azel. Want a rematch?"; mood = "happy"; }
  } else { res = "d"; line = g.isStalemate() ? "Stalemate! Nobody can move, so it's a draw." : g.isThreefoldRepetition() ? "We repeated the same position three times. It's a draw!" : g.isInsufficientMaterial() ? "Not enough pieces left to checkmate. It's a draw!" : "It's a draw!"; mood = "confused"; }
  st[res]++; stt[lv] = st;
  const d = today(), day = s.day && s.day.d===d ? {d, n:(s.day.n||0)+1} : {d, n:1};
  loadedPgn = g.pgn();
  save({stats:stt, day, done:true, pgn:loadedPgn});
  say(line, mood);
  setCtrl(true); stats();
  return true;
}
function setCtrl(ended){
  const c = $("chCtrl"); if(!c) return;
  c.innerHTML = ended ? `<button class="btn" type="button" data-ch="new">Play again</button>`
    : `<button class="btn ghost" type="button" data-ch="hint">Hint</button><button class="btn ghost" type="button" data-ch="undo">Undo</button><button class="btn ghost" type="button" data-ch="resign">New game</button>`;
}
function reactAfter(m, byPita){
  if(over()) return;
  const n = m.captured ? NAME[m.captured] : "";
  if(friend()){
    const mover = nm(m.color), next = nm(g.turn());
    if(g.inCheck()) say("Check! "+next+", save your king!", "surprised");
    else if(m.captured==="q") say("Wow! "+mover+" took the queen! "+next+"'s turn.", "surprised");
    else if(m.captured) say(pickLine([mover+" took a "+n+"! "+next+"'s turn.", "Ooh, bye bye "+n+"! Your move, "+next+".", "Nice capture, "+mover+"! "+next+", your turn."]), "happy");
    else say(pickLine([next+"'s turn.", "Your move, "+next+".", "Okay "+next+", what will you do?"]), "normal");
    if(cs().autoflip) setTimeout(() => { if(friend() && wantFlip()!==flip) drawBoard(); }, 520);
    return;
  }
  if(byPita){
    if(g.inCheck()) say("Check! Protect your king.", "strict");
    else if(m.captured==="q") say("Yay, I took your queen!", "happy");
    else if(m.captured) say(pickLine(["Yum! I took your "+n+".", "Your "+n+" is mine now!", "Got your "+n+"!"]), "happy");
    else say(pickLine(["Your turn, Azel.", "Hmm, your move.", "I moved my "+NAME[m.piece]+". Your turn!", "Let's see what you do."]), "normal");
  } else {
    if(g.inCheck()) say("Eek! Check! Let me think…", "surprised", "think");
    else if(m.captured==="q") say("Hey! My queen! That was a great move…", "angry", "think");
    else if(m.captured) say(pickLine(["Oh no, my "+n+"!", "Nooo, not my "+n+"!", "You took my "+n+". Nice one."]), "sad", "think");
    else say(pickLine(["Hmm, let me think…", "Interesting move…", "Ooh, okay…"]), "thinking", "think");
  }
}
let lastLine = "";
function pickLine(a){ let x; do{ x = a[Math.floor(Math.random()*a.length)]; }while(a.length>1 && x===lastLine); lastLine = x; return x; }

function doMove(mv, byPita){
  let m; try{ m = g.move(mv); }catch(e){ m = null; }
  if(!m) return null;
  sel = null; legal = []; hintMv = null;
  animateMove(m); tray();
  reactAfter(m, byPita);
  return m;
}
function pitaTurn(){
  if(friend() || g.isGameOver() || g.turn()!==pitaSide()) return;
  busy = true;
  const lv = LEVELS[cs().glevel || cs().level] || LEVELS.medium;
  setTimeout(() => {
    const t0 = Date.now();
    const clone = new Chess(g.fen());
    const r = search(clone, lv);
    const wait = Math.max(0, 650 - (Date.now()-t0));
    setTimeout(() => {
      busy = false;
      if(r && g.turn()===pitaSide()){ doMove({from:r.from, to:r.to, promotion:r.promotion || "q"}, true); persist(); }
    }, wait);
  }, 420);
}
// Taps and drags are read from the finger position on the board, so they work the same on iPad, phone and laptop.
function squareAt(box, x, y){
  const r = box.getBoundingClientRect();
  let f = Math.floor((x - r.left) / r.width * 8), k = Math.floor((y - r.top) / r.height * 8);
  if(f < 0 || f > 7 || k < 0 || k > 7) return null;
  if(flip){ f = 7-f; k = 7-k; }
  return "abcdefgh"[f] + (8-k);
}
function wireBoard(box){
  let down = null, drag = null;
  box.addEventListener("pointerdown", e => {
    if(e.button > 0) return;
    const s = squareAt(box, e.clientX, e.clientY); if(!s) return;
    e.preventDefault();
    down = {s, x:e.clientX, y:e.clientY, moved:false};
    const before = sel;
    tapSquare(s);
    // start a drag if this tap picked up one of your pieces
    if(sel===s && els[s]){ drag = {el:els[s], s}; try{ box.setPointerCapture(e.pointerId); }catch(err){} }
    else drag = null;
    down.before = before;
  });
  box.addEventListener("pointermove", e => {
    if(!down || !drag) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y;
    if(!down.moved && Math.hypot(dx, dy) < 8) return;
    down.moved = true;
    const r = box.getBoundingClientRect(), cell = r.width/8;
    drag.el.classList.add("dragging");
    drag.el.style.transform = `translate(${e.clientX - r.left - cell/2}px, ${e.clientY - r.top - cell*0.65}px) scale(1.15)`;
  });
  const up = e => {
    if(!down) return;
    const d = down, dr = drag; down = null; drag = null;
    if(dr){ dr.el.classList.remove("dragging"); }
    if(d.moved && dr){
      const s = squareAt(box, e.clientX, e.clientY);
      if(s && s!==dr.s && legal.some(m => m.to===s)){ tapSquare(s); return; }
      placeEl(dr.el, dr.s);
    }
  };
  box.addEventListener("pointerup", up);
  box.addEventListener("pointercancel", e => { if(drag){ drag.el.classList.remove("dragging"); placeEl(drag.el, drag.s); } down = null; drag = null; });
}
function tapSquare(s){
  if(busy || g.isGameOver() || g.turn()!==me()) return;
  const pc = g.get(s);
  if(sel){
    const ms = legal.filter(m => m.to===s);
    if(ms.length){
      if(ms.length > 1 || ms[0].promotion){ askPromo(ms[0].from, s); return; }
      doMove({from:sel, to:s}, false); persist(); pitaTurn(); return;
    }
  }
  if(pc && pc.color===me()){
    sel = s===sel ? null : s; legal = sel ? g.moves({square:sel, verbose:true}) : [];
    const el = els[s]; if(el && sel){ el.classList.remove("lift"); void el.offsetWidth; el.classList.add("lift"); }
  } else { sel = null; legal = []; }
  marks();
}
function askPromo(from, to){
  P.openP("Choose a piece", `<p class="muted small">Your pawn reached the end. What should it become?</p><div class="promo-row">${["q","r","b","n"].map(k => `<button class="opt" type="button" data-ch="promo" data-k="${k}" data-from="${from}" data-to="${to}">${pieceSvg(k, g.turn())}<span>${NAME[k]}</span></button>`).join("")}</div>`);
}
function newGame(){
  const s = cs();
  g = new Chess(); sel = null; legal = []; hintMv = null; lastMv = null; loadedPgn = g.pgn();
  if(friend()){
    save({fpgn:"", fdone:false});
    drawBoard(); tray(); setCtrl(false); stats();
    say(nm("w")+" vs "+nm("b")+"! I'll be the referee. "+nm("w")+" has white and goes first.", "happy");
    return;
  }
  save({pgn:"", done:false, gside:s.side, glevel:s.level});
  drawBoard(); tray(); setCtrl(false); stats();
  const lv = LEVELS[s.level];
  const tired = s.day && s.day.d===today() && s.day.n >= 3;
  if(tired) say("That's "+s.day.n+" games today! Maybe a walk or a study block first? I'll wait for you.", "asking");
  else say(me()==="w" ? "Let's battle, Azel! You're white, so you go first." : "Let's battle! I'm white this time, so I go first.", "happy");
  if(lv && g.turn()===pitaSide()) pitaTurn();
}
function undo(){
  if(busy) return;
  if(g.history().length===0) return;
  g.undo(); if(!friend() && g.turn()!==me() && g.history().length) g.undo();
  if(g.turn()!==me()){ /* Pita moved first as white: just replay her move */ }
  sel = null; legal = []; hintMv = null; lastMv = null;
  if(friend()){ drawBoard(); tray(); persist(); say("Move taken back. "+nm(g.turn())+"'s turn again.", "normal"); return; }
  drawPieces(); tray(); persist();
  say(pickLine(["Okay, let's take that back. Try again!", "Undo! Think it through this time.", "No problem. Take your time."]), "normal");
  if(g.turn()===pitaSide()) pitaTurn();
}
function hint(){
  if(busy || g.turn()!==me() || g.isGameOver()) return;
  say("Let me look for a good move for you…", "thinking", "think");
  busy = true;
  setTimeout(() => {
    const r = search(new Chess(g.fen()), {depth:3, quiet:true, noise:0, time:900});
    busy = false;
    if(!r) return;
    hintMv = r; marks();
    const pc = g.get(r.from);
    say((friend() ? nm(g.turn())+", try" : "Try")+" moving your "+NAME[pc.type]+" from "+r.from+" to "+r.to+".", "happy");
  }, 300);
}

/* ---------- view ---------- */
function render(){
  const v = $("view-chess"); if(!v) return;
  if(!mounted){
    mounted = true;
    v.innerHTML = `
      <div class="segs chess-mode" role="group" aria-label="Who do you play with?"><button type="button" data-ch="mode" data-v="pita">With Pita</button><button type="button" data-ch="mode" data-v="friend">With a friend</button></div>
      <div class="chess-top"><div class="pita-wrap chess-pita" id="chPita"></div><div class="bubble tutor chess-say" id="chSay">Let's battle, Azel!</div></div>
      <div class="chess-board" id="chBoard"></div>
      <div class="btn-row" id="chCtrl"></div>
      <div class="card chess-tray" id="chTray"></div>
      <div class="card" data-only="friend" hidden>
        <p class="small muted">Two players on this device: take turns, and Pita is the referee.</p>
        <div class="chess-names">
          <div class="field"><label for="chNamew">White player</label><input class="in" id="chNamew" maxlength="20" placeholder="Azel" autocomplete="off"></div>
          <div class="field"><label for="chNameb">Pink player</label><input class="in" id="chNameb" maxlength="20" placeholder="Friend" autocomplete="off"></div>
        </div>
        <label class="anchor" style="border:0;padding:0"><input type="checkbox" id="chAuto"><span>Turn the board for each player</span></label>
        <div class="btn-row"><button class="btn ghost small" type="button" data-ch="flip">Flip board now</button></div>
        <p class="small muted" id="chStatsF"></p>
      </div>
      <div class="card" data-only="pita">
        <div class="field"><label>Level</label><div class="segs" role="group" aria-label="Level">${Object.keys(LEVELS).map(k => `<button type="button" data-ch="level" data-v="${k}">${LEVELS[k].name}</button>`).join("")}</div></div>
        <div class="field"><label>You play</label><div class="segs" role="group" aria-label="Your colour"><button type="button" data-ch="side" data-v="w">White (go first)</button><button type="button" data-ch="side" data-v="b">Pink (go second)</button></div></div>
        <p class="small muted" id="chStats"></p>
        <p class="small muted">A new level or colour starts on your next game. Tip: one game is a nice reward after a study block.</p>
      </div>`;
    pita = window.Pita ? window.Pita.create($("chPita"), {mood:"happy"}) : null;
    ["w","b"].forEach(c => $("chName"+c).addEventListener("change", e => { save({[c==="w" ? "wname" : "bname"]: e.target.value.trim().slice(0,20)}); tray(); }));
    $("chAuto").addEventListener("change", e => { save({autoflip:e.target.checked}); if(wantFlip()!==flip) drawBoard(); });
    loadMode(true);
    return;
  }
  // changes from another device
  const s = cs(), kp = s[K().pgn] || "";
  if(!busy && kp !== (loadedPgn||"") && kp !== g.pgn()){
    g = new Chess(); if(kp){ try{ g.loadPgn(kp); }catch(e){} }
    loadedPgn = g.pgn(); sel = null; legal = []; lastMv = null; drawBoard(); tray(); setCtrl(!!s[K().done] || g.isGameOver());
    const vis = !$("view-chess").hidden && document.visibilityState==="visible";
    if(vis && !g.isGameOver() && g.turn()===pitaSide()) pitaTurn();
  }
  stats();
}
// show the game of the chosen mode (each mode keeps its own game)
function loadMode(first){
  const s = cs(), kp = s[K().pgn] || "";
  g = new Chess(); if(kp){ try{ g.loadPgn(kp); }catch(e){ g = new Chess(); } }
  loadedPgn = g.pgn(); sel = null; legal = []; hintMv = null; lastMv = null;
  drawBoard(); tray(); stats();
  const ended = !!s[K().done] || g.isGameOver();
  setCtrl(ended);
  if(friend()){
    say(ended ? "Good game! Tap Play again for a rematch." : g.history().length ? "Game continues! "+nm(g.turn())+"'s turn." : nm("w")+" vs "+nm("b")+"! "+nm("w")+" has white and goes first.", "happy");
    return;
  }
  if(ended){ say("Good game! Tap Play again for a rematch.", "happy"); return; }
  say(g.history().length ? (first ? "Welcome back! Let's continue our game." : "Back to our game! Your turn.") : "Let's battle, Azel! Tap a piece to see where it can go.", "happy");
  if(g.turn()===pitaSide()) pitaTurn();
}
document.addEventListener("click", e => {
  const el = e.target.closest("[data-ch]"); if(!el) return;
  if(a0(el)) return;
  const a = el.dataset.ch;
  if(a==="new") newGame();
  if(a==="resign"){ if(g.history().length && !g.isGameOver()) P.twoTap(el, "Tap again", newGame); else newGame(); }
  if(a==="undo") undo();
  if(a==="hint") hint();
  if(a==="level"){ save({level:el.dataset.v}); toast("Level "+LEVELS[el.dataset.v].name+" starts on your next game."); }
  if(a==="side"){ save({side:el.dataset.v}); toast("New colour starts on your next game."); }
  if(a==="promo"){ P.closeP(); doMove({from:el.dataset.from, to:el.dataset.to, promotion:el.dataset.k}, false); persist(); pitaTurn(); }
});
function a0(el){
  const a = el.dataset.ch;
  if(a==="mode"){ if(busy){ toast("Wait for Pita's move first."); return true; } if((el.dataset.v==="friend")!==friend()){ save({mode:el.dataset.v}); loadMode(false); } return true; }
  if(a==="flip"){ save({fflip:!cs().fflip}); drawBoard(); return true; }
  return false;
}
window.__chessRender = render;
try{ if(D.cols && D.cols.prefs) render(); }catch(e){ console.warn(e); }
window.__chessEngine = {search, LEVELS, evaluate};
})();
