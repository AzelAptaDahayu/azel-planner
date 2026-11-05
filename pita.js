/* Pita: the planner's animated tutor character.
   A pastel body that morphs between shapes, a dot face, and a ribbon on her head.
   Pita.create(el) -> {mood(name), state("idle"|"listen"|"speak"|"think"), level(0..1), destroy()} */
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
// eye: dot | arc | line ; er = eye radius (one number or [left,right]) ; brow: {ang, y} (ang>0 = inner ends down) ; mouth: {w, curve, open, round, wavy, side}
const FACE = {
  normal:   {eye:"dot", er:5.2, mouth:{w:12, curve:4}, blush:0.55},
  happy:    {eye:"arc", mouth:{w:18, curve:9, open:5}, blush:1},
  angry:    {eye:"dot", er:4.6, brow:{ang:28, y:-11}, mouth:{w:14, curve:-5}, blush:0},
  strict:   {eye:"line", brow:{ang:12, y:-8}, mouth:{w:12, curve:0}, blush:0},
  confused: {eye:"dot", er:[6.2,3.8], brow:{ang:[-16,10], y:-13}, mouth:{wavy:true, w:14}, blush:0.3},
  asking:   {eye:"dot", er:5.6, brow:{ang:[-14,0], y:-14}, mouth:{w:8, curve:0, open:4, round:true}, blush:0.5},
  sad:      {eye:"dot", er:4.8, brow:{ang:-20, y:-12}, mouth:{w:12, curve:-6}, blush:0.2, look:[0,2.5]},
  love:     {eye:"arc", mouth:{w:14, curve:7, open:3}, blush:1},
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
const heartD = (x,y,s) => `M${f(x)} ${f(y+s*0.9)}C${f(x-s*1.6)} ${f(y-s*0.1)} ${f(x-s*0.7)} ${f(y-s*1.3)} ${f(x)} ${f(y-s*0.45)}C${f(x+s*0.7)} ${f(y-s*1.3)} ${f(x+s*1.6)} ${f(y-s*0.1)} ${f(x)} ${f(y+s*0.9)}Z`;

function create(el, opts){
  opts = opts || {};
  el.innerHTML = `<svg viewBox="0 0 200 224" class="pita-svg" role="img" aria-label="Pita, your IELTS tutor">
    <defs><radialGradient id="pitaGlow"><stop offset="0" stop-color="#F8C9D7" stop-opacity="0.95"/><stop offset="0.6" stop-color="#F8C9D7" stop-opacity="0.35"/><stop offset="1" stop-color="#F8C9D7" stop-opacity="0"/></radialGradient></defs>
    <circle data-p="glow" cx="100" cy="112" r="70" fill="url(#pitaGlow)" opacity="0"/>
    <ellipse data-p="shadow" cx="100" cy="196" rx="46" ry="7" fill="${INK}" opacity="0.08"/>
    <g data-p="bars" opacity="0"></g>
    <g data-p="rig">
      <path data-p="body" stroke-width="5" stroke-linejoin="round"/>
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
  const E = {}; ["glow","shadow","bars","rig","body","face","blushL","blushR","eyeL","eyeR","hlL","hlR","browL","browR","mouth","bow","fx"].forEach(k => { E[k] = q(k); });
  const S = {mood: MOODS.includes(opts.mood) ? opts.mood : "normal", st:"idle", level:0, lvl:0, glow:0, bars:0,
    pts: (CACHE[opts.mood] || CACHE.normal).map(p => p.slice()), fill:hex(COL.normal[0]), stroke:hex(COL.normal[1]),
    blinkAt: 2000, blinkT: -1, hearts: [], lastHeart: 0, t0: 0, last: 0, alive: true, pop: 0};
  if(COL[S.mood]){ S.fill = hex(COL[S.mood][0]); S.stroke = hex(COL[S.mood][1]); }
  let raf = 0;
  function frame(ts){
    if(!S.alive) return;
    if(!el.isConnected){ S.alive = false; return; }
    raf = requestAnimationFrame(frame);
    if(el.offsetParent===null && !opts.always) return;
    if(!S.t0) S.t0 = ts;
    const t = (ts - S.t0)/1000, dt = Math.min(0.05, (ts - (S.last||ts))/1000); S.last = ts;
    const m = S.mood, st = S.st, A = RM ? 0 : 1;
    const ease = RM ? 1 : 1 - Math.exp(-dt*9);
    // body shape + colour
    const target = m==="angry" ? sample(SHAPES.angry, RM ? 0 : t) : CACHE[m];
    for(let i=0;i<N;i++){ S.pts[i][0] = lerp(S.pts[i][0], target[i][0], ease); S.pts[i][1] = lerp(S.pts[i][1], target[i][1], ease); }
    const tf = hex(COL[m][0]), ts2 = hex(COL[m][1]);
    for(let i=0;i<3;i++){ S.fill[i] = lerp(S.fill[i], tf[i], ease); S.stroke[i] = lerp(S.stroke[i], ts2[i], ease); }
    S.lvl = lerp(S.lvl, S.level, 1 - Math.exp(-dt*14));
    // motion
    let bx = 0, by = 0, tilt = 0, sx = 1, sy = 1;
    const breathe = Math.sin(t*2.2)*0.018*A;
    sx += breathe; sy -= breathe;
    if(m==="happy"){ const b = Math.abs(Math.sin(t*4.2)); by -= b*7*A; sy += (b<0.15 ? -0.06 : 0.02)*A; }
    if(m==="angry"){ bx += Math.sin(t*38)*1.6*A; }
    if(m==="love"){ const p = 1+Math.sin(t*6)*0.035*A; sx *= p; sy *= p; }
    if(m==="sad"){ by += 5; sy *= 0.97; tilt += Math.sin(t*1.3)*2*A; }
    if(m==="confused"){ tilt += -9 + Math.sin(t*1.6)*3*A; }
    if(m==="asking"){ tilt += 8; }
    if(m==="surprised"){ by -= 4; }
    if(m==="thinking"){ tilt += Math.sin(t*1.2)*4*A; }
    if(st==="speak"){ by += Math.sin(t*15)*1.1*A; }
    if(st==="listen"){ by -= S.lvl*5*A; sx *= 1 + S.lvl*0.04*A; sy *= 1 + S.lvl*0.05*A; }
    S.pop = Math.max(0, S.pop - dt*3); const pop = 1 + Math.sin(S.pop*Math.PI)*0.12*A; sx *= pop; sy *= pop;
    const SC = 58;
    E.rig.setAttribute("transform", `translate(${f(100+bx)} ${f(112+by)}) rotate(${f(tilt)}) scale(${f(sx)} ${f(sy)})`);
    E.body.setAttribute("d", pathD(S.pts.map(p => [p[0]*SC, p[1]*SC])));
    E.body.setAttribute("fill", rgb(S.fill)); E.body.setAttribute("stroke", rgb(S.stroke));
    E.shadow.setAttribute("rx", f(46*(1 - (-by)/60))); E.shadow.setAttribute("opacity", f(0.08*(1 - Math.max(0,-by)/40)));
    // face
    const F = FACE[m];
    const faceY = m==="love" ? -4 : m==="sad" ? 4 : m==="strict" ? 2 : 0;
    E.face.setAttribute("transform", `translate(0 ${faceY}) scale(1.3)`);
    const gap = 19, look = F.look || [0,0];
    const er = Array.isArray(F.er) ? F.er : [F.er||5, F.er||5];
    // blink
    if(S.blinkT<0 && ts > S.blinkAt){ S.blinkT = 0; }
    let blink = 1;
    if(S.blinkT>=0){ S.blinkT += dt; blink = Math.abs(Math.cos(Math.min(1, S.blinkT/0.16)*Math.PI)); if(S.blinkT>0.16){ S.blinkT = -1; S.blinkAt = ts + 2200 + Math.random()*2800; blink = 1; } }
    if(RM) blink = 1;
    [["L",-1],["R",1]].forEach(([s,side],i) => {
      const x = side*gap/2 + look[0], y = -4 + look[1];
      const eye = E["eye"+s], hl = E["hl"+s];
      if(F.eye==="dot"){
        const rx = er[i], ry = Math.max(0.6, er[i]*blink);
        eye.setAttribute("d", `M${f(x-rx)} ${f(y)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2*rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2*rx)} 0Z`);
        eye.setAttribute("fill", INK); eye.setAttribute("stroke", "none");
        hl.setAttribute("cx", f(x+rx*0.35)); hl.setAttribute("cy", f(y-ry*0.35)); hl.setAttribute("opacity", er[i]>4.2 && blink>0.6 ? "1" : "0");
      } else {
        eye.setAttribute("d", F.eye==="arc" ? `M${f(x-6)} ${f(y+2)}Q${f(x)} ${f(y-6)} ${f(x+6)} ${f(y+2)}` : `M${f(x-6)} ${f(y)}L${f(x+6)} ${f(y)}`);
        eye.setAttribute("fill", "none"); eye.setAttribute("stroke", INK); eye.setAttribute("stroke-width", "3.4"); eye.setAttribute("stroke-linecap", "round");
        hl.setAttribute("opacity", "0");
      }
      const br = E["brow"+s];
      if(F.brow){
        const ang = Array.isArray(F.brow.ang) ? F.brow.ang[i] : F.brow.ang;
        const dy = Math.tan(ang*Math.PI/180)*6, by2 = F.brow.y + look[1]*0.5;
        // inner end is toward the centre (x=0)
        const xo = x + side*6, xi = x - side*6;
        br.setAttribute("d", `M${f(xo)} ${f(by2-dy)}L${f(xi)} ${f(by2+dy)}`);
      } else br.setAttribute("d", "");
      const bl = E["blush"+s]; bl.setAttribute("cx", f(side*(gap/2+10))); bl.setAttribute("cy", "7"); bl.setAttribute("opacity", f((F.blush||0)*0.75));
    });
    // mouth
    const M = F.mouth || {w:12, curve:3};
    let open = M.open || 0, round = !!M.round;
    if(st==="speak"){ open = 4 + 6*(0.5+0.5*Math.sin(t*16))*(0.55+0.45*Math.sin(t*5.3)); round = true; }
    const my = 9, mx = M.side || 0, w = M.w;
    let md, mfill = "none";
    if(M.wavy && st!=="speak") md = `M${f(mx-7)} ${my}q3.5 -3 7 0t7 0`;
    else if(round && open>0.5){ const rx = Math.max(3.5, w/2*0.8), ry = open/2; md = `M${f(mx-rx)} ${f(my)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2*rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2*rx)} 0Z`; mfill = MOUTH; }
    else if(open>0.5){ md = `M${f(mx-w/2)} ${my}Q${f(mx)} ${f(my+M.curve)} ${f(mx+w/2)} ${my}Q${f(mx)} ${f(my+M.curve+open*1.6)} ${f(mx-w/2)} ${my}Z`; mfill = MOUTH; }
    else md = `M${f(mx-w/2)} ${my}Q${f(mx)} ${f(my+M.curve)} ${f(mx+w/2)} ${my}`;
    E.mouth.setAttribute("d", md); E.mouth.setAttribute("fill", mfill);
    // bow sits on the head, a little to the left of the top
    const bp = S.pts[N-5];
    E.bow.setAttribute("transform", `translate(${f(bp[0]*SC)} ${f(bp[1]*SC - 2)}) rotate(-18)`);
    // glow + sound bars
    S.glow = lerp(S.glow, st==="listen" ? 0.55 + S.lvl*0.45 : st==="speak" ? 0.35 : st==="think" ? 0.2 : 0, 1 - Math.exp(-dt*6));
    E.glow.setAttribute("opacity", f(S.glow)); E.glow.setAttribute("r", f(70 + S.lvl*40));
    S.bars = lerp(S.bars, st==="listen" ? 1 : 0, 1 - Math.exp(-dt*8));
    E.bars.setAttribute("opacity", f(S.bars));
    if(S.bars>0.02){
      let b = "";
      for(let i=0;i<7;i++){ const h = 3 + S.lvl*18*(0.55+0.45*Math.sin(t*(9+i*1.7)+i)); b += `<rect x="${f(82+i*6)}" y="${f(212-h/2)}" width="3.4" height="${f(h)}" rx="1.7" fill="#E987A8"/>`; }
      E.bars.innerHTML = b;
    }
    // effects
    let fx = "";
    if(m==="love" && !RM){
      if(ts - S.lastHeart > 650){ S.lastHeart = ts; S.hearts.push({x:60+Math.random()*80, t:0, s:4+Math.random()*3}); }
    }
    S.hearts = S.hearts.filter(h => (h.t += dt) < 2.2);
    S.hearts.forEach(h => { fx += `<path d="${heartD(h.x + Math.sin(h.t*3)*6, 70 - h.t*28, h.s)}" fill="#E987A8" opacity="${f(Math.max(0, 1 - h.t/2.2))}"/>`; });
    if(m==="confused" || m==="asking") fx += `<text x="${m==="confused" ? 152 : 150}" y="${f(56 + Math.sin(t*2.4)*3*A)}" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="${m==="confused" ? 30 : 24}" fill="${rgb(S.stroke)}">?</text>`;
    if(m==="sad"){ const k = (t*0.7)%1; fx += `<path d="M${f(100-gap/2-2)} ${f(122+k*18)}q-3 5 0 7q3 -2 0 -7Z" fill="#8DBBE5" opacity="${f(1-k)}"/>`; }
    if(m==="thinking" || st==="think"){ for(let i=0;i<3;i++){ const o = 0.25 + 0.75*Math.max(0, Math.sin(t*4 - i*0.9)); fx += `<circle cx="${140+i*10}" cy="${f(50 - i*6)}" r="${3+i}" fill="${rgb(S.stroke)}" opacity="${f(RM ? 0.7 : o)}"/>`; } }
    if(m==="happy" && !RM){ const s = (t*1.4)%1; fx += `<path d="M${f(150)} ${f(70-s*10)}l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2Z" fill="#EFBF4C" opacity="${f(1-s)}"/>`; }
    if(m==="angry" && !RM){ fx += `<path d="M146 62l6 -4m-2 10l7 0m-9 7l6 4" stroke="#E8577A" stroke-width="3" stroke-linecap="round" opacity="${f(0.5+0.5*Math.sin(t*10))}"/>`; }
    E.fx.innerHTML = fx;
  }
  raf = requestAnimationFrame(frame);
  return {
    mood(name){ if(MOODS.includes(name) && name!==S.mood){ S.mood = name; S.pop = 1; } return this; },
    state(s){ S.st = s || "idle"; if(s==="think" && S.mood!=="thinking"){ S.prevMood = S.mood; } return this; },
    level(v){ S.level = Math.max(0, Math.min(1, +v || 0)); return this; },
    get current(){ return S.mood; },
    destroy(){ S.alive = false; cancelAnimationFrame(raf); el.innerHTML = ""; }
  };
}
window.Pita = {create, MOODS};
})();
