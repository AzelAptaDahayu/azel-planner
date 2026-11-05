/* Pita: the planner's animated tutor character.
   A pastel jelly body that morphs between shapes, a dot face, and a ribbon on her head.
   All motion runs on small springs, so she squashes, overshoots and settles like a soft toy.
   Pita.create(el) -> {mood(name), state("idle"|"listen"|"speak"|"think"), level(0..1), poke(), destroy()} */
(function(){
"use strict";
const N = 72, TAU = Math.PI*2;
let RM = false; try{ RM = matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){}
const se = (a,b,n) => th => Math.pow(Math.pow(Math.abs(Math.cos(th)/a), n) + Math.pow(Math.abs(Math.sin(th)/b), n), -1/n);
const SHAPES = {
  normal: se(1, 0.94, 2.5),
  happy: se(1, 1, 2),
  angry: (th, t) => { const s = Math.sin(th); let r = 0.92; if(s>0){ const k = Math.pow(0.5+0.5*Math.cos(10*(th-Math.PI/2) + Math.sin(t*9)*0.5), 2.2); r += 0.42*Math.pow(s,1.6)*k; } return r; },
  strict: se(1.15, 0.86, 5),
  confused: th => 1 + 0.07*Math.sin(2*th+0.7) + 0.05*Math.cos(3*th),
  asking: se(1, 0.96, 2.3),
  sad: th => 0.93 - 0.14*Math.sin(th) + 0.03*Math.cos(2*th),
  love: th => { const s = Math.sin(th), c = Math.cos(th); return 2 - 2*s + s*Math.sqrt(Math.abs(c))/(s+1.4); },
  surprised: se(0.86, 1.12, 2),
  thinking: th => 1 + 0.09*Math.pow(Math.abs(Math.cos(3.5*(th-Math.PI/2))), 0.7)
};
const COL = {
  normal:["#FDE8EF","#EE9AB5"], happy:["#FFF4CF","#EFBF4C"], angry:["#FFDDE5","#E8577A"], strict:["#EFE8FB","#8E6CCB"],
  confused:["#FFF4CF","#E2B53A"], asking:["#E6F1FB","#6FA6D8"], sad:["#E3EEFA","#7FA7D9"], love:["#FCE4F1","#D86AA8"],
  surprised:["#FDE8EF","#EE9AB5"], thinking:["#EFE8FB","#B9A6E3"]
};
// eye: dot | arc | line | heart ; er = eye radius (one number or [left,right]) ; brow: {ang, y} (ang>0 = inner ends down) ; mouth: {w, curve, open, round, wavy, side}
const FACE = {
  normal:   {eye:"dot", er:5.2, mouth:{w:12, curve:4}, blush:0.55},
  happy:    {eye:"arc", mouth:{w:18, curve:9, open:5}, blush:1},
  angry:    {eye:"dot", er:4.6, brow:{ang:28, y:-11}, mouth:{w:14, curve:-5}, blush:0},
  strict:   {eye:"line", brow:{ang:12, y:-8}, mouth:{w:12, curve:0}, blush:0},
  confused: {eye:"dot", er:[6.2,3.8], brow:{ang:[-16,10], y:-13}, mouth:{wavy:true, w:14}, blush:0.3},
  asking:   {eye:"dot", er:5.6, brow:{ang:[-14,0], y:-14}, mouth:{w:8, curve:0, open:4, round:true}, blush:0.5},
  sad:      {eye:"dot", er:4.8, brow:{ang:-20, y:-12}, mouth:{w:12, curve:-6}, blush:0.2, look:[0,2.5]},
  love:     {eye:"heart", mouth:{w:14, curve:7, open:3}, blush:1},
  surprised:{eye:"dot", er:6.8, brow:{ang:0, y:-17}, mouth:{w:9, curve:0, open:10, round:true}, blush:0.4},
  thinking: {eye:"dot", er:5, look:[3,-3], brow:{ang:[-10,6], y:-13}, mouth:{w:8, curve:1, side:5}, blush:0.3}
};
const MOODS = Object.keys(SHAPES);
const INK = "#4B3742", MOUTH = "#7A3B57";

function sample(fn, t){
  const pts = [];
  for(let k=0;k<N;k++){ const th = Math.PI/2 - k*TAU/N; const r = fn(th, t||0); pts.push([r*Math.cos(th), r*Math.sin(th)]); }
  let x0=Infinity, x1=-Infinity, y0=Infinity, y1=-Infinity;
  pts.forEach(p => { x0=Math.min(x0,p[0]); x1=Math.max(x1,p[0]); y0=Math.min(y0,p[1]); y1=Math.max(y1,p[1]); });
  const cx = (x0+x1)/2, cy = (y0+y1)/2, s = 1/Math.max((x1-x0)/2, (y1-y0)/2);
  return pts.map(p => [(p[0]-cx)*s, -(p[1]-cy)*s]); // y down for SVG
}
const CACHE = {}; MOODS.forEach(m => { if(m!=="angry") CACHE[m] = sample(SHAPES[m]); });
const f = n => n.toFixed(2);
function pathD(P){
  const n = P.length; let d = "M"+f(P[0][0])+" "+f(P[0][1]);
  for(let i=0;i<n;i++){
    const p0 = P[(i-1+n)%n], p1 = P[i], p2 = P[(i+1)%n], p3 = P[(i+2)%n];
    d += "C"+f(p1[0]+(p2[0]-p0[0])/6)+" "+f(p1[1]+(p2[1]-p0[1])/6)+" "+f(p2[0]-(p3[0]-p1[0])/6)+" "+f(p2[1]-(p3[1]-p1[1])/6)+" "+f(p2[0])+" "+f(p2[1]);
  }
  return d+"Z";
}
const hex = h => [1,3,5].map(i => parseInt(h.slice(i,i+2),16));
const rgb = c => "rgb("+c.map(v => Math.round(v)).join(",")+")";
const lerp = (a,b,k) => a+(b-a)*k;
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const heartD = (x,y,s) => `M${f(x)} ${f(y+s*0.9)}C${f(x-s*1.6)} ${f(y-s*0.1)} ${f(x-s*0.7)} ${f(y-s*1.3)} ${f(x)} ${f(y-s*0.45)}C${f(x+s*0.7)} ${f(y-s*1.3)} ${f(x+s*1.6)} ${f(y-s*0.1)} ${f(x)} ${f(y+s*0.9)}Z`;
// a spring value: x = position, v = velocity
const Sp = x => ({x, v:0});
function step(s, target, k, c, dt){ s.v += (k*(target - s.x) - c*s.v)*dt; s.x += s.v*dt; }
// smooth pseudo-random wiggle in about -1..1
const wig = (t, seed) => (Math.sin(t*1.7+seed) + Math.sin(t*2.9+seed*2.3)*0.6 + Math.sin(t*4.3+seed*0.7)*0.3)/1.9;

function create(el, opts){
  opts = opts || {};
  el.innerHTML = `<svg viewBox="0 0 200 224" class="pita-svg" role="img" aria-label="Pita, your IELTS tutor">
    <defs><radialGradient id="pitaGlow"><stop offset="0" stop-color="#F8C9D7" stop-opacity="0.95"/><stop offset="0.6" stop-color="#F8C9D7" stop-opacity="0.35"/><stop offset="1" stop-color="#F8C9D7" stop-opacity="0"/></radialGradient></defs>
    <circle data-p="glow" cx="100" cy="112" r="70" fill="url(#pitaGlow)" opacity="0"/>
    <ellipse data-p="shadow" cx="100" cy="196" rx="46" ry="7" fill="${INK}" opacity="0.08"/>
    <g data-p="bars" opacity="0"></g>
    <g data-p="rig">
      <path data-p="body" stroke-width="5" stroke-linejoin="round"/>
      <ellipse data-p="shine" rx="13" ry="7" fill="#fff" opacity="0.45"/>
      <g data-p="face">
        <ellipse data-p="blushL" rx="7" ry="4" fill="#F4AFC4"/><ellipse data-p="blushR" rx="7" ry="4" fill="#F4AFC4"/>
        <path data-p="eyeL"/><path data-p="eyeR"/>
        <circle data-p="hlL" r="1.6" fill="#fff"/><circle data-p="hlR" r="1.6" fill="#fff"/>
        <path data-p="browL" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path data-p="browR" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
        <path data-p="mouth" stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <g data-p="bow">
        <path d="M0 0C-6 -9 -21 -13 -22 -2C-23 8 -9 7 0 0Z" fill="#F4AFC4" stroke="#E987A8" stroke-width="2" stroke-linejoin="round"/>
        <path d="M0 0C6 -9 21 -13 22 -2C23 8 9 7 0 0Z" fill="#F4AFC4" stroke="#E987A8" stroke-width="2" stroke-linejoin="round"/>
        <path d="M-2 2L-8 13M2 2L8 13" stroke="#E987A8" stroke-width="3" stroke-linecap="round"/>
        <circle r="4.6" fill="#E987A8"/>
      </g>
    </g>
    <g data-p="fx"></g>
  </svg>`;
  const q = id => el.querySelector('[data-p="'+id+'"]');
  const E = {}; ["glow","shadow","bars","rig","body","shine","face","blushL","blushR","eyeL","eyeR","hlL","hlR","browL","browR","mouth","bow","fx"].forEach(k => { E[k] = q(k); });
  const m0 = MOODS.includes(opts.mood) ? opts.mood : "normal";
  const F0 = FACE[m0], er0 = Array.isArray(F0.er) ? F0.er : [F0.er||5, F0.er||5];
  const S = {mood: m0, st:"idle", level:0, alive:true, t0:0, last:0, moodT:0, stateT:0,
    pts: CACHE[m0 === "angry" ? "normal" : m0].map(p => ({x:p[0], y:p[1], vx:0, vy:0})),
    fill:hex(COL[m0][0]), stroke:hex(COL[m0][1]),
    // body transform springs
    x:Sp(0), y:Sp(0), tilt:Sp(0), sx:Sp(1), sy:Sp(1), bow:Sp(-18),
    // face springs
    lx:Sp(0), ly:Sp(0), erL:Sp(er0[0]), erR:Sp(er0[1]), open:Sp(0), mw:Sp(12), curve:Sp(3),
    bAngL:Sp(0), bAngR:Sp(0), bY:Sp(-12), bOp:Sp(0), blush:Sp(F0.blush||0), lvl:Sp(0),
    glow:0, bars:0,
    hop:{y:0, v:0, crouch:0, power:0}, nextHop:1.2, wander:[0,0], nextWander:1.5,
    blinkAt:1.8, blinkT:-1, dbl:false, hearts:[], lastHeart:0, puffs:[], lastPuff:0,
    beat:0, lastSpeakPeak:0, talkSeed:Math.random()*10};
  let raf = 0;

  function impulse(kind){
    if(RM) return;
    if(kind==="mood"){ S.sy.v += 3.2; S.sx.v -= 2.4; S.tilt.v += (Math.random()<0.5 ? -1 : 1)*55; S.blinkT = 0; }
    if(kind==="poke"){ S.sy.v -= 4.5; S.sx.v += 3.8; S.tilt.v += (Math.random()<0.5 ? -1 : 1)*70; S.blinkT = 0; }
    if(kind==="state"){ S.sy.v += 1.6; S.sx.v -= 1.2; }
  }
  function hop(power, crouch){
    if(RM || S.hop.y < -0.5 || S.hop.crouch > 0) return;
    S.hop.power = power;
    if(crouch){ S.hop.crouch = 0.13; } else { S.hop.v = -power; S.sy.v += 3; S.sx.v -= 2; }
  }
  el.addEventListener("pointerdown", () => { impulse("poke"); if(S.mood==="happy" || S.mood==="love") hop(230, true); });

  function frame(ts){
    if(!S.alive) return;
    if(!el.isConnected){ S.alive = false; return; }
    raf = requestAnimationFrame(frame);
    if(el.offsetParent===null && !opts.always){ S.last = 0; return; }
    if(!S.t0) S.t0 = ts;
    const t = (ts - S.t0)/1000, dtAll = Math.min(0.05, S.last ? (ts - S.last)/1000 : 0.016); S.last = ts;
    const m = S.mood, st = S.st, A = RM ? 0 : 1, F = FACE[m];
    const sinceMood = t - S.moodT;
    if(!S.moodT) S.moodT = t;

    // ---------- targets ----------
    let tx = 0, ty = Math.sin(t*1.6)*2.6*A, tTilt = wig(t*0.6, 1)*2*A, tsx = 1, tsy = 1;
    const breathe = Math.sin(t*2.1)*0.022*A; tsx += breathe; tsy -= breathe;
    let look = (F.look || [0,0]).slice();
    // idle eyes wander around now and then
    if(t > S.nextWander){
      S.nextWander = t + 1.4 + Math.random()*2.6;
      S.wander = Math.random()<0.35 ? [0,0] : [(Math.random()*2-1)*3.2, (Math.random()*2-1)*1.8];
      if(st==="idle" && Math.random()<0.4){ S.tilt.v += S.wander[0]*9; }
    }
    if(st==="idle" || st==="speak"){ look[0] += S.wander[0]*(st==="speak" ? 0.4 : 1); look[1] += S.wander[1]*(st==="speak" ? 0.4 : 1); tTilt += S.wander[0]*0.7; tx += S.wander[0]*0.8; }
    if(m==="happy"){ tTilt += Math.sin(t*3.2)*4*A; if(t > S.nextHop){ S.nextHop = t + 1.1 + Math.random()*1.1; hop(200 + Math.random()*70, true); } }
    if(m==="angry"){ tx += Math.sin(t*34)*1.4*A; tsy += 0.03; tsx -= 0.02; ty += 2; }
    if(m==="strict"){ tTilt *= 0.3; ty *= 0.4; tsy += 0.02; }
    if(m==="love"){
      tTilt += Math.sin(t*2.4)*5*A;
      // lub-dub heartbeat
      const ph = (t % 1.0), pb = S.beat; S.beat = ph;
      if(pb > ph || (pb < 0.2 && ph >= 0.2)){ S.sx.v += pb > ph ? 1.4 : 0.9; S.sy.v += pb > ph ? 1.4 : 0.9; }
    }
    if(m==="sad"){ ty += 6; tsy -= 0.04; tsx += 0.03; tTilt += Math.sin(t*1.1)*2.5*A - 3; }
    if(m==="confused"){ tTilt += -10 + Math.sin(t*1.5)*4*A; tx -= 2; }
    if(m==="asking"){ tTilt += 9 + Math.sin(t*2)*2*A; ty -= 1; }
    if(m==="surprised"){ ty -= 5; tsy += 0.05; tsx -= 0.03; }
    if(m==="thinking"){ tTilt += Math.sin(t*1.1)*5*A + 3; look = [3.4, -3.6]; }
    if(st==="speak"){
      // gentle nods and a little bounce on syllables
      tTilt += Math.sin(t*3.3)*3*A;
      ty += -Math.abs(Math.sin(t*5.2))*2.2*A;
    }
    if(st==="listen"){
      const l = S.lvl.x;
      tsy += 0.035 + l*0.06*A; tsx += 0.02 + l*0.03*A; ty -= 3 + l*6*A; tTilt += -4 + Math.sin(t*1.3)*1.5*A;
      look = [look[0]*0.3, look[1]*0.3 + 0.5];
      if(l > 0.45 && t - S.lastSpeakPeak > 0.7){ S.lastSpeakPeak = t; S.y.v += 40; } // "mm-hm" nod while you talk
    }
    if(st==="think"){ look = [3.4, -3.6]; tTilt += Math.sin(t*1.4)*4*A; }

    // face targets
    const er = Array.isArray(F.er) ? F.er : [F.er||5, F.er||5];
    const M = F.mouth || {w:12, curve:3};
    let tOpen = M.open || 0;
    if(st==="speak"){
      const s = S.talkSeed;
      const syll = 0.5 + 0.5*Math.sin(t*13.5 + Math.sin(t*2.1+s)*2);
      const phrase = 0.55 + 0.45*Math.sin(t*3.4 + s);
      const pause = Math.sin(t*0.9 + s) > 0.82 ? 0.2 : 1;
      tOpen = (2 + 8*syll*phrase)*pause;
    }
    const brow = F.brow;
    const bAng = brow ? (Array.isArray(brow.ang) ? brow.ang : [brow.ang, brow.ang]) : [S.bAngL.x, S.bAngR.x];

    // ---------- physics (small sub-steps keep the springs stable) ----------
    const steps = Math.max(1, Math.ceil(dtAll/0.011)), dt = dtAll/steps;
    const shapeT = m==="angry" ? sample(SHAPES.angry, RM ? 0 : t) : CACHE[m];
    for(let n=0;n<steps;n++){
      if(RM){
        for(let i=0;i<N;i++){ S.pts[i].x = shapeT[i][0]; S.pts[i].y = shapeT[i][1]; }
      } else {
        for(let i=0;i<N;i++){
          const p = S.pts[i], g = shapeT[i];
          p.vx += (140*(g[0]-p.x) - 13*p.vx)*dt; p.vy += (140*(g[1]-p.y) - 13*p.vy)*dt;
          p.x += p.vx*dt; p.y += p.vy*dt;
        }
      }
      // hop with gravity, a crouch before take-off and a squash on landing
      const H = S.hop;
      if(H.crouch > 0){ H.crouch -= dt; if(H.crouch <= 0){ H.crouch = 0; H.v = -H.power; S.sy.v += 3.4; S.sx.v -= 2.6; } }
      if(H.y < 0 || H.v < 0){
        H.v += 1500*dt; H.y += H.v*dt;
        if(H.y >= 0){ const hit = H.v; H.y = 0; H.v = 0; S.sy.v -= 2.6*hit/260; S.sx.v += 2.2*hit/260; S.tilt.v += (Math.random()*2-1)*30; }
      }
      const crouch = H.crouch > 0 ? 1 : 0;
      const air = H.y < -0.5 ? clamp(-H.v/400, -0.6, 0.6) : 0; // stretch going up, a bit when falling
      step(S.x, tx, 190, 12, dt); step(S.y, ty, 170, 11, dt); step(S.tilt, tTilt, 160, 10, dt);
      step(S.sx, tsx + crouch*0.1 - Math.abs(air)*0.06, 210, 9, dt); step(S.sy, tsy - crouch*0.13 + Math.abs(air)*0.08, 210, 9, dt);
      // the ribbon lags behind the body, then flops back
      step(S.bow, -18 + S.tilt.x*0.5 + clamp(S.y.v*0.08 + H.v*0.03, -22, 22), 95, 6, dt);
      step(S.lx, look[0], 150, 15, dt); step(S.ly, look[1], 150, 15, dt);
      step(S.erL, er[0], 260, 16, dt); step(S.erR, er[1], 260, 16, dt);
      step(S.open, tOpen, st==="speak" ? 420 : 240, 22, dt); step(S.mw, M.w, 220, 16, dt); step(S.curve, M.curve||0, 220, 16, dt);
      step(S.bAngL, bAng[0], 200, 15, dt); step(S.bAngR, bAng[1], 200, 15, dt);
      step(S.bY, brow ? brow.y : -12, 200, 15, dt); step(S.bOp, brow ? 1 : 0, 200, 18, dt);
      step(S.blush, F.blush||0, 120, 16, dt); step(S.lvl, S.level, 260, 26, dt);
    }
    if(RM){ [S.x,S.y,S.tilt].forEach(s => { s.x = 0; s.v = 0; }); S.sx.x = 1; S.sy.x = 1; S.lx.x = look[0]; S.ly.x = look[1]; S.open.x = tOpen; S.bow.x = -18; }
    const ease = RM ? 1 : 1 - Math.exp(-dtAll*7);
    const tf = hex(COL[m][0]), ts2 = hex(COL[m][1]);
    for(let i=0;i<3;i++){ S.fill[i] = lerp(S.fill[i], tf[i], ease); S.stroke[i] = lerp(S.stroke[i], ts2[i], ease); }

    // ---------- draw ----------
    const SC = 58, bx = S.x.x, by = S.y.x + S.hop.y, sx = clamp(S.sx.x, 0.6, 1.5), sy = clamp(S.sy.x, 0.6, 1.5);
    // squash and stretch from her bottom, so she stays "on the ground"
    E.rig.setAttribute("transform", `translate(${f(100+bx)} ${f(166+by)}) rotate(${f(S.tilt.x)}) scale(${f(sx)} ${f(sy)}) translate(0 -54)`);
    E.body.setAttribute("d", pathD(S.pts.map(p => [p.x*SC, p.y*SC])));
    E.body.setAttribute("fill", rgb(S.fill)); E.body.setAttribute("stroke", rgb(S.stroke));
    E.shine.setAttribute("cx", f(-24 + S.lx.x*0.4)); E.shine.setAttribute("cy", f(-30 + S.ly.x*0.3)); E.shine.setAttribute("transform", `rotate(-28 ${f(-24)} ${f(-30)})`);
    const lift = Math.max(0, -by);
    E.shadow.setAttribute("rx", f(46*clamp(1 - lift/70, 0.45, 1.1)*sx)); E.shadow.setAttribute("opacity", f(0.09*clamp(1 - lift/45, 0.3, 1)));
    // face follows the eyes a little, which reads as turning her head
    const faceY = m==="love" ? -4 : m==="sad" ? 4 : m==="strict" ? 2 : 0;
    E.face.setAttribute("transform", `translate(${f(S.lx.x*0.9)} ${f(faceY + S.ly.x*0.6)}) scale(1.3)`);
    const gap = 19, lx = S.lx.x, ly = S.ly.x;
    // blink (sometimes twice)
    if(S.blinkT<0 && t > S.blinkAt){ S.blinkT = 0; }
    let blink = 1;
    if(S.blinkT>=0){
      S.blinkT += dtAll; const d = 0.15;
      blink = 1 - Math.sin(Math.min(1, S.blinkT/d)*Math.PI);
      if(S.blinkT > d){ S.blinkT = -1; blink = 1;
        if(!S.dbl && Math.random()<0.25){ S.dbl = true; S.blinkAt = t + 0.12; } else { S.dbl = false; S.blinkAt = t + 2 + Math.random()*3; } }
    }
    if(RM) blink = 1;
    const beatS = m==="love" ? 1 + Math.max(0, S.sx.x - 1)*2.5 : 1;
    [["L",-1,S.erL.x],["R",1,S.erR.x]].forEach(([s,side,r],i) => {
      const x = side*gap/2 + lx, y = -4 + ly;
      const eye = E["eye"+s], hl = E["hl"+s];
      if(F.eye==="dot"){
        const rx = Math.max(1, r), ry = Math.max(0.6, rx*blink);
        eye.setAttribute("d", `M${f(x-rx)} ${f(y)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2*rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2*rx)} 0Z`);
        eye.setAttribute("fill", INK); eye.setAttribute("stroke", "none");
        hl.setAttribute("cx", f(x+rx*0.35)); hl.setAttribute("cy", f(y-ry*0.35)); hl.setAttribute("opacity", rx>4.2 && blink>0.6 ? "1" : "0");
      } else if(F.eye==="heart"){
        const hs = 5.6*beatS;
        eye.setAttribute("d", heartD(x, y+0.5, hs)); eye.setAttribute("fill", "#E0577F"); eye.setAttribute("stroke", "none");
        eye.setAttribute("transform", blink < 0.95 ? `translate(0 ${f(y*(1-blink))}) scale(1 ${f(Math.max(0.15, blink))})` : "");
        hl.setAttribute("cx", f(x-1.8)); hl.setAttribute("cy", f(y-1.6)); hl.setAttribute("opacity", blink>0.6 ? "0.9" : "0");
      } else {
        const lift2 = F.eye==="arc" ? 6*Math.max(0.2, blink) : 0;
        eye.setAttribute("d", F.eye==="arc" ? `M${f(x-6)} ${f(y+2)}Q${f(x)} ${f(y+2-lift2*1.33)} ${f(x+6)} ${f(y+2)}` : `M${f(x-6)} ${f(y)}L${f(x+6)} ${f(y)}`);
        eye.setAttribute("fill", "none"); eye.setAttribute("stroke", INK); eye.setAttribute("stroke-width", "3.4"); eye.setAttribute("stroke-linecap", "round");
        hl.setAttribute("opacity", "0");
      }
      if(F.eye!=="heart") eye.removeAttribute("transform");
      const br = E["brow"+s];
      const ang = i===0 ? S.bAngL.x : S.bAngR.x;
      const dy = Math.tan(clamp(ang,-60,60)*Math.PI/180)*6, by2 = S.bY.x + ly*0.5 - (st==="listen" ? 1.5 : 0);
      const xo = x + side*6, xi = x - side*6;
      br.setAttribute("d", `M${f(xo)} ${f(by2-dy)}L${f(xi)} ${f(by2+dy)}`); br.setAttribute("opacity", f(clamp(S.bOp.x,0,1)));
      const bl = E["blush"+s]; bl.setAttribute("cx", f(side*(gap/2+10))); bl.setAttribute("cy", "7"); bl.setAttribute("opacity", f(clamp(S.blush.x,0,1)*0.75*(m==="love" ? 0.85+0.15*beatS : 1)));
    });
    // mouth
    const open = Math.max(0, S.open.x), round = st==="speak" || !!M.round, w = S.mw.x, cv = S.curve.x;
    const my = 9, mx = (M.side || 0);
    let md, mfill = "none";
    if(M.wavy && st!=="speak") md = `M${f(mx-7)} ${my}q3.5 -3 7 0t7 0`;
    else if(round && open>0.7){ const rx = clamp(w/2*0.8 - open*0.12, 3.2, 9), ry = open/2; md = `M${f(mx-rx)} ${f(my)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2*rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2*rx)} 0Z`; mfill = MOUTH; }
    else if(open>0.7){ md = `M${f(mx-w/2)} ${my}Q${f(mx)} ${f(my+cv)} ${f(mx+w/2)} ${my}Q${f(mx)} ${f(my+cv+open*1.6)} ${f(mx-w/2)} ${my}Z`; mfill = MOUTH; }
    else md = `M${f(mx-w/2)} ${my}Q${f(mx)} ${f(my+cv)} ${f(mx+w/2)} ${my}`;
    E.mouth.setAttribute("d", md); E.mouth.setAttribute("fill", mfill);
    // bow sits on the head, a little to the left of the top, and flops on its own spring
    const bp = S.pts[N-5];
    E.bow.setAttribute("transform", `translate(${f(bp.x*SC)} ${f(bp.y*SC - 2)}) rotate(${f(S.bow.x)}) scale(${f(1 + clamp(S.sy.x-1, -0.2, 0.2)*0.6)})`);
    // glow + sound bars
    const lvl = clamp(S.lvl.x, 0, 1);
    S.glow = lerp(S.glow, st==="listen" ? 0.55 + lvl*0.45 : st==="speak" ? 0.35 : st==="think" ? 0.2 : 0, 1 - Math.exp(-dtAll*6));
    E.glow.setAttribute("opacity", f(S.glow)); E.glow.setAttribute("r", f(70 + lvl*40 + Math.sin(t*2)*3*A));
    E.glow.setAttribute("cy", f(112 + by*0.6));
    S.bars = lerp(S.bars, st==="listen" ? 1 : 0, 1 - Math.exp(-dtAll*8));
    E.bars.setAttribute("opacity", f(S.bars));
    if(S.bars>0.02){
      let b = "";
      for(let i=0;i<7;i++){ const mid = 1 - Math.abs(i-3)/4; const h = 3 + lvl*20*mid*(0.6+0.4*Math.sin(t*(8+i*1.3)+i)); b += `<rect x="${f(82+i*6)}" y="${f(212-h/2)}" width="3.4" height="${f(h)}" rx="1.7" fill="#E987A8"/>`; }
      E.bars.innerHTML = b;
    }
    // ---------- effects ----------
    let fx = "";
    const top = 112 + by - 58*sy; // roughly the top of her head
    if(m==="love" && !RM){ if(ts - S.lastHeart > 600){ S.lastHeart = ts; S.hearts.push({x:62+Math.random()*76, t:0, s:3.5+Math.random()*3.5, w:Math.random()*6}); } }
    S.hearts = S.hearts.filter(h => (h.t += dtAll) < 2.4);
    S.hearts.forEach(h => { const pop = Math.min(1, h.t*5); fx += `<path d="${heartD(h.x + Math.sin(h.t*3+h.w)*6, 72 - h.t*26, h.s*(0.4+0.6*pop))}" fill="#E987A8" opacity="${f(Math.max(0, 1 - h.t/2.4))}"/>`; });
    if(m==="confused" || m==="asking"){
      const s = Math.min(1, sinceMood*4), sc = s < 1 ? 0.4 + 0.6*s + Math.sin(s*Math.PI)*0.35 : 1;
      fx += `<text x="${m==="confused" ? 152 : 150}" y="${f(56 + Math.sin(t*2.4)*3*A)}" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="${f((m==="confused" ? 30 : 24)*(RM?1:sc))}" fill="${rgb(S.stroke)}" transform="rotate(${f(Math.sin(t*1.8)*8*A)} 156 46)">?</text>`;
    }
    if(m==="surprised"){
      const s = Math.min(1, sinceMood*3.5), sc = RM ? 1 : (s < 1 ? 0.3 + 0.7*s + Math.sin(s*Math.PI)*0.5 : 1 + Math.sin(t*6)*0.04);
      fx += `<g transform="translate(152 ${f(Math.min(60, top+8))}) scale(${f(sc)}) rotate(10)"><path d="M-2.6 -22L2.6 -22L1.6 -4L-1.6 -4Z" fill="#E8577A"/><circle cy="3" r="2.8" fill="#E8577A"/></g>`;
    }
    if(m==="sad"){ const k = (t*0.7)%1; fx += `<path d="M${f(100-gap/2*1.3-2 + bx)} ${f(120+by+k*18)}q-3.4 5.6 0 7.8q3.4 -2.2 0 -7.8Z" fill="#8DBBE5" opacity="${f(1-k)}"/>`; }
    if(m==="thinking" || st==="think"){ for(let i=0;i<3;i++){ const o = 0.25 + 0.75*Math.max(0, Math.sin(t*4 - i*0.9)); const r = (3+i)*(0.85 + 0.15*Math.max(0, Math.sin(t*4 - i*0.9))); fx += `<circle cx="${140+i*10}" cy="${f(50 - i*6 + Math.sin(t*2+i)*1.5*A)}" r="${f(r)}" fill="${rgb(S.stroke)}" opacity="${f(RM ? 0.7 : o)}"/>`; } }
    if(m==="happy" && !RM){
      [[150,68,0],[46,80,0.5]].forEach(([x,y,o]) => { const s = (t*1.2+o)%1, sc = Math.sin(s*Math.PI); fx += `<path transform="translate(${x} ${f(y - s*10)}) scale(${f(0.4+sc*0.8)}) rotate(${f(s*90)})" d="M0 -7L2 -2L7 0L2 2L0 7L-2 2L-7 0L-2 -2Z" fill="#EFBF4C" opacity="${f(sc)}"/>`; });
    }
    if(m==="angry" && !RM){
      if(ts - S.lastPuff > 420){ S.lastPuff = ts; S.puffs.push({side: S.puffs.length%2 ? 1 : -1, t:0}); }
      S.puffs = S.puffs.filter(p => (p.t += dtAll) < 1.1);
      S.puffs.forEach(p => { const k = p.t/1.1; fx += `<circle cx="${f(100 + p.side*(34 + k*16) + bx)}" cy="${f(top + 20 - k*30)}" r="${f(4 + k*7)}" fill="#fff" stroke="#F2A7B9" stroke-width="2" opacity="${f((1-k)*0.9)}"/>`; });
      fx += `<path d="M146 62l6 -4m-2 10l7 0m-9 7l6 4" stroke="#E8577A" stroke-width="3" stroke-linecap="round" opacity="${f(0.5+0.5*Math.sin(t*10))}"/>`;
    } else if(S.puffs.length) S.puffs = [];
    E.fx.innerHTML = fx;
  }
  raf = requestAnimationFrame(frame);
  return {
    mood(name){
      if(MOODS.includes(name) && name!==S.mood){
        S.mood = name; S.moodT = S.last ? (S.last - S.t0)/1000 : 0; impulse("mood");
        if(name==="surprised") hop(260, false);
        else if(name==="happy" || name==="love") { hop(210, true); S.nextHop = S.moodT + 1.4; }
        else if(name==="sad"){ S.y.v += 60; }
      }
      return this;
    },
    state(s){ s = s || "idle"; if(s!==S.st){ S.st = s; impulse("state"); if(s==="speak") S.talkSeed = Math.random()*10; } return this; },
    level(v){ S.level = Math.max(0, Math.min(1, +v || 0)); return this; },
    poke(){ impulse("poke"); return this; },
    get current(){ return S.mood; },
    destroy(){ S.alive = false; cancelAnimationFrame(raf); el.innerHTML = ""; }
  };
}
window.Pita = {create, MOODS};
})();
