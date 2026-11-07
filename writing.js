/* Academic Writing course: built from Azel's materials (lecturer feedback, vocab list, phrasebank, noun-phrase and Task 1 notes).
   Lessons are written fresh for this app; exercises are generated so practice never runs out. */
(function(){
"use strict";
if(!window.Learn || !window.__plannerAPI) return;
const WORDS = {"n":[["analysis","analisis / penguraian","conduct an analysis; in-depth analysis; data analysis","Singular: analysis | Plural: analyses (irregular!)"],["category","kategori / golongan","fall into a category; broad category; age category","Singular: category | Plural: categories"],["comparison","perbandingan","in comparison to; draw a comparison; by comparison","Singular: comparison | Plural: comparisons"],["conclusion","kesimpulan","draw a conclusion; reach a conclusion; in conclusion","Singular: conclusion | Plural: conclusions"],["consumption","konsumsi / penggunaan","energy consumption; rise in consumption; fuel consumption","Uncountable — no plural"],["data","data / informasi","the data shows; collect data; interpret data","Uncountable — no plural (treated as plural in formal writing)"],["decline","penurunan","sharp decline; gradual decline; decline in production","Singular: decline | Plural: declines"],["distribution","distribusi / penyebaran","uneven distribution; income distribution; distribution of wealth","Singular: distribution | Plural: distributions"],["evidence","bukti / fakta","provide evidence; strong evidence; evidence suggests","Uncountable — no plural"],["factor","faktor / unsur","key factor; contributing factor; factor in growth","Singular: factor | Plural: factors"],["figure","angka / data / tokoh","the figures show; a significant figure; exact figure","Singular: figure | Plural: figures"],["fluctuation","fluktuasi / naik turun","price fluctuation; minor fluctuation; fluctuation in demand","Singular: fluctuation | Plural: fluctuations"],["government","pemerintah","local government; government policy; government spending","Singular: government | Plural: governments"],["graph","grafik","bar graph; line graph; interpret a graph","Singular: graph | Plural: graphs"],["impact","dampak / pengaruh","significant impact; have an impact on; negative impact","Singular: impact | Plural: impacts"],["increase","peningkatan / kenaikan","sharp increase; increase in demand; percentage increase","Singular: increase | Plural: increases"],["issue","isu / masalah","key issue; address an issue; raise an issue","Singular: issue | Plural: issues"],["majority","mayoritas / sebagian besar","the vast majority; majority of people; majority opinion","Singular: majority | Plural: majorities"],["measure","tindakan / ukuran","take measures; effective measures; safety measure","Singular: measure | Plural: measures"],["percentage","persentase","a high percentage; the percentage of; percentage point","Singular: percentage | Plural: percentages"],["period","periode / masa","over the period; time period; during this period","Singular: period | Plural: periods"],["population","populasi / penduduk","growing population; total population; urban population","Singular: population | Plural: populations"],["proportion","proporsi / bagian","a large proportion; in proportion to; proportion of the total","Singular: proportion | Plural: proportions"],["rate","tingkat / laju","growth rate; unemployment rate; at a rapid rate","Singular: rate | Plural: rates"],["sector","sektor / bidang","private sector; public sector; manufacturing sector","Singular: sector | Plural: sectors"],["society","masyarakat","modern society; in society; benefit society","Singular: society | Plural: societies"],["solution","solusi / penyelesaian","effective solution; find a solution; propose a solution","Singular: solution | Plural: solutions"],["source","sumber","reliable source; energy source; source of income","Singular: source | Plural: sources"],["statistic","statistik","official statistics; crime statistics; interpret statistics","Singular: statistic | Plural: statistics"],["trend","tren / kecenderungan","upward trend; current trend; follow a trend","Singular: trend | Plural: trends"]],"v":[["account for","menyumbang / menjelaskan","account for the majority; account for 30%; account for the difference","Base: account | Past: accounted | Past Participle: accounted"],["achieve","mencapai / meraih","achieve a goal; achieve growth; achieve results","Base: achieve | Past: achieved | Past Participle: achieved"],["analyse","menganalisis","analyse the data; analyse trends; carefully analyse","Base: analyse | Past: analysed | Past Participle: analysed"],["argue","berpendapat / berargumen","argue that; strongly argue; argue against","Base: argue | Past: argued | Past Participle: argued"],["attribute","mengaitkan / menghubungkan","attribute to a factor; be attributed to; attribute the cause","Base: attribute | Past: attributed | Past Participle: attributed"],["compare","membandingkan","compare with; compare to; compare figures","Base: compare | Past: compared | Past Participle: compared"],["consider","mempertimbangkan / menganggap","consider the evidence; be considered; consider carefully","Base: consider | Past: considered | Past Participle: considered"],["constitute","membentuk / merupakan","constitute the majority; constitute a problem; constitute evidence","Base: constitute | Past: constituted | Past Participle: constituted"],["decline","menurun / berkurang","decline sharply; decline in number; sales declined","Base: decline | Past: declined | Past Participle: declined"],["demonstrate","menunjukkan / membuktikan","demonstrate a trend; clearly demonstrate; demonstrate evidence","Base: demonstrate | Past: demonstrated | Past Participle: demonstrated"],["describe","menggambarkan / mendeskripsikan","describe the graph; accurately describe; describe a trend","Base: describe | Past: described | Past Participle: described"],["fluctuate","berfluktuasi / naik turun","fluctuate considerably; prices fluctuated; fluctuate between","Base: fluctuate | Past: fluctuated | Past Participle: fluctuated"],["highlight","menyoroti / menekankan","highlight the issue; highlight a trend; clearly highlight","Base: highlight | Past: highlighted | Past Participle: highlighted"],["illustrate","mengilustrasikan / menunjukkan","as illustrated in; illustrate a point; clearly illustrate","Base: illustrate | Past: illustrated | Past Participle: illustrated"],["implement","menerapkan / melaksanakan","implement a policy; fully implement; implement measures","Base: implement | Past: implemented | Past Participle: implemented"],["increase","meningkat / menambah","increase significantly; increase in value; steadily increase","Base: increase | Past: increased | Past Participle: increased"],["indicate","menunjukkan / mengindikasikan","the data indicates; indicate a trend; clearly indicate","Base: indicate | Past: indicated | Past Participle: indicated"],["influence","mempengaruhi","greatly influence; influence behaviour; influence policy","Base: influence | Past: influenced | Past Participle: influenced"],["lead","menyebabkan / memimpin","lead to consequences; lead to growth; directly lead","Base: lead | Past: led | Past Participle: led (irregular!)"],["observe","mengamati / mencatat","observe a trend; it can be observed; observe patterns","Base: observe | Past: observed | Past Participle: observed"],["propose","mengusulkan / mengajukan","propose a solution; propose measures; it is proposed that","Base: propose | Past: proposed | Past Participle: proposed"],["represent","mewakili / menggambarkan","represent the data; represent a percentage; accurately represent","Base: represent | Past: represented | Past Participle: represented"],["reveal","mengungkapkan / menunjukkan","the data reveals; reveal a pattern; clearly reveal","Base: reveal | Past: revealed | Past Participle: revealed"],["rise","naik / meningkat","rise sharply; rise steadily; rise to a peak","Base: rise | Past: rose | Past Participle: risen (irregular!)"],["suggest","menyarankan / mengindikasikan","suggest that; research suggests; strongly suggest","Base: suggest | Past: suggested | Past Participle: suggested"],["summarise","merangkum / menyimpulkan","summarise the key points; briefly summarise; summarise findings","Base: summarise | Past: summarised | Past Participle: summarised"],["support","mendukung / menopang","support the argument; support with evidence; strongly support","Base: support | Past: supported | Past Participle: supported"]],"a":[["apparent","nyata / jelas / tampak","apparent trend; it is apparent that; apparent difference","Positive: apparent | Comparative: more apparent | Superlative: most apparent"],["considerable","cukup besar / signifikan","considerable increase; considerable impact; considerable amount","Positive: considerable | Comparative: more considerable | Superlative: most considerable"],["consistent","konsisten / tetap","consistent growth; consistent pattern; remain consistent","Positive: consistent | Comparative: more consistent | Superlative: most consistent"],["dramatic","drastis / dramatis","dramatic rise; dramatic change; dramatic decline","Positive: dramatic | Comparative: more dramatic | Superlative: most dramatic"],["effective","efektif / ampuh","effective solution; highly effective; effective policy","Positive: effective | Comparative: more effective | Superlative: most effective"],["evident","jelas / nyata / terbukti","it is evident that; clearly evident; become evident","Positive: evident | Comparative: more evident | Superlative: most evident"],["gradual","bertahap / perlahan","gradual increase; gradual decline; gradual improvement","Positive: gradual | Comparative: more gradual | Superlative: most gradual"],["marginal","kecil / tidak signifikan","marginal increase; marginal difference; marginal improvement","Positive: marginal | Comparative: more marginal | Superlative: most marginal"],["notable","menonjol / patut dicatat","notable exception; notable difference; notable increase","Positive: notable | Comparative: more notable | Superlative: most notable"],["overall","secara keseluruhan / umum","overall trend; overall pattern; overall conclusion","— (absolute adjective)"],["predominant","dominan / utama","predominant factor; predominant view; predominant trend","Positive: predominant | Comparative: more predominant | Superlative: most predominant"],["rapid","cepat / pesat","rapid growth; rapid increase; rapid decline","Positive: rapid | Comparative: more rapid | Superlative: most rapid"],["relevant","relevan / berkaitan","highly relevant; relevant evidence; remain relevant","Positive: relevant | Comparative: more relevant | Superlative: most relevant"],["sharp","tajam / drastis","sharp rise; sharp decline; sharp contrast","Positive: sharp | Comparative: sharper | Superlative: sharpest"],["significant","signifikan / penting","significant increase; significant impact; highly significant","Positive: significant | Comparative: more significant | Superlative: most significant"],["slight","kecil / sedikit","slight increase; slight decline; slight improvement","Positive: slight | Comparative: slighter | Superlative: slightest"],["steady","stabil / konsisten","steady growth; steady decline; remain steady","Positive: steady | Comparative: steadier | Superlative: steadiest"],["substantial","substansial / besar","substantial increase; substantial evidence; substantial impact","Positive: substantial | Comparative: more substantial | Superlative: most substantial"],["sustainable","berkelanjutan / terjaga","sustainable development; sustainable growth; sustainable solution","Positive: sustainable | Comparative: more sustainable | Superlative: most sustainable"],["visible","terlihat / nyata","visible trend; visible impact; clearly visible","Positive: visible | Comparative: more visible | Superlative: most visible"]],"d":[["approximately","kira-kira / sekitar","approximately half; approximately 30%; approximately equal",""],["considerably","secara signifikan / cukup besar","increase considerably; considerably higher; drop considerably",""],["dramatically","secara drastis / dramatis","rise dramatically; fall dramatically; change dramatically",""],["gradually","secara bertahap / perlahan","decline gradually; gradually increase; improve gradually",""],["marginally","sedikit / tipis","marginally higher; improve marginally; marginally better",""],["notably","terutama / khususnya","most notably; notably different; increase notably",""],["overall","secara keseluruhan","overall, it can be seen; perform overall; the overall trend",""],["predominantly","sebagian besar / terutama","predominantly urban; predominantly male; predominantly used",""],["rapidly","dengan cepat / pesat","grow rapidly; decline rapidly; expand rapidly",""],["relatively","relatif / agak","relatively stable; relatively small; remain relatively constant",""],["sharply","secara tajam / drastis","rise sharply; fall sharply; decline sharply",""],["significantly","secara signifikan","increase significantly; differ significantly; contribute significantly",""],["slightly","sedikit / agak","increase slightly; slightly higher; improve slightly",""],["steadily","secara stabil / konsisten","grow steadily; decline steadily; increase steadily",""],["subsequently","kemudian / selanjutnya","subsequently increased; subsequently declined; subsequently found",""],["substantially","secara substansial / besar","increase substantially; substantially higher; differ substantially",""]]};

/* ---------- helpers ---------- */
const P = window.__plannerAPI;
const esc = P.esc;
const pk = a => a[Math.floor(Math.random()*a.length)];
const shuf = a => a.map(x => [Math.random(), x]).sort((p,q) => p[0]-q[0]).map(x => x[1]);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const M = (q, a, wrong, why) => ({type:"mc", q, a, opts:[a, ...wrong.filter(w => w!==a)].slice(0,4), why});
const T = (q, ans, why) => ({type:"input", q, a:ans.split("|")[0], alt:ans.split("|").slice(1), why});
const O = (sent, why, alts) => { const s = sent.replace(/[.?!]$/,""); return {type:"order", q:"Put the words in the right order.", words:s.split(" "), a:s, alt:alts||[], why}; };
const ID = s => `<p class="vid">🇮🇩 ${s}</p>`;
const EX = s => `<div class="lex">${s}</div>`;
const L = (id, title, icon, learn, items, gen) => ({id, title, icon, learn, items: items || [], gen, n: 8});
const B = s => `<b>${s}</b>`;

/* ---------- linking words: function, type and pattern ---------- */
// type: adv = linking adverb (starts a new sentence / after ;) · conj = conjunction (joins two clauses in one sentence) · prep = preposition (+ noun / -ing)
const LINK = [
 {f:"Adding", t:"adv", w:["Moreover","Furthermore","In addition","Additionally","What is more"], id:"selain itu / lebih lanjut", ex:"Public transport reduces pollution. Moreover, it eases traffic congestion."},
 {f:"Adding", t:"prep", w:["In addition to","Besides","Apart from"], id:"selain (+ kata benda / -ing)", ex:"In addition to reducing pollution, public transport eases congestion."},
 {f:"Contrast", t:"adv", w:["However","Nevertheless","Nonetheless","On the other hand","By contrast","In contrast","Conversely"], id:"namun / sebaliknya", ex:"Online learning is flexible. However, it requires strong self-discipline."},
 {f:"Contrast", t:"conj", w:["although","even though","whereas","while"], id:"meskipun / sedangkan", ex:"Although online learning is flexible, it requires strong self-discipline."},
 {f:"Contrast", t:"prep", w:["despite","in spite of","unlike"], id:"meskipun / tidak seperti (+ kata benda)", ex:"Despite its flexibility, online learning requires self-discipline."},
 {f:"Cause", t:"conj", w:["because","since","as"], id:"karena (+ klausa)", ex:"Flights were cancelled because the storm was severe."},
 {f:"Cause", t:"prep", w:["because of","due to","owing to","as a result of"], id:"karena / akibat (+ kata benda)", ex:"Flights were cancelled due to the storm."},
 {f:"Result", t:"adv", w:["Therefore","Consequently","As a result","Thus","Hence","Accordingly"], id:"oleh karena itu / akibatnya", ex:"The storm was severe. Consequently, many flights were cancelled."},
 {f:"Example", t:"adv", w:["For example","For instance","To illustrate"], id:"sebagai contoh / misalnya", ex:"Many countries invest in solar power. For instance, India has built huge solar parks."},
 {f:"Example", t:"prep", w:["such as"], id:"seperti (+ contoh)", ex:"Renewable sources such as solar and wind are getting cheaper."},
 {f:"Similarity", t:"adv", w:["Similarly","Likewise","In the same way"], id:"demikian pula / sama halnya", ex:"Japan has an ageing population. Similarly, South Korea's workforce is shrinking."},
 {f:"Clarifying", t:"adv", w:["In other words","That is to say"], id:"dengan kata lain / yaitu", ex:"Many students are time-poor. In other words, they work and study at once."},
 {f:"Emphasis", t:"adv", w:["In fact","Indeed","Notably","In particular"], id:"bahkan / memang / terutama", ex:"The policy failed. In fact, unemployment doubled."},
 {f:"Condition", t:"conj", w:["provided that","as long as","unless","if"], id:"asalkan / kecuali jika", ex:"The economy will recover provided that investment continues."},
 {f:"Sequence", t:"adv", w:["Firstly","Secondly","Subsequently","Finally","Meanwhile"], id:"pertama / kemudian / akhirnya / sementara itu", ex:"Firstly, the beans are dried. Subsequently, they are roasted."},
 {f:"Conclusion", t:"adv", w:["In conclusion","To sum up","Overall","On balance"], id:"kesimpulannya / secara keseluruhan", ex:"On balance, the benefits of remote work outweigh the drawbacks."}
];
const TYPE_NAME = {adv:"linking adverb", conj:"conjunction", prep:"preposition"};
const TYPE_RULE = {adv:"Starts a new sentence + comma (or after a semicolon). Never joins two sentences with only a comma.", conj:"Joins two clauses inside ONE sentence. Comma when it comes first.", prep:"Followed by a noun, a noun phrase or -ing. Never by a full clause."};
// gap contexts: which function + type fits, and the sentence with ___
const CTX = [
 ["Contrast","adv","Online learning is flexible. ___, it requires strong self-discipline.",["However","Nevertheless","Nonetheless","On the other hand"]],
 ["Contrast","adv","Tourism brings money to Bali. ___, it also damages the environment.",["However","Nevertheless","Nonetheless","On the other hand"]],
 ["Contrast","conj","___ online learning is flexible, it requires strong self-discipline.",["although","even though","while"]],
 ["Contrast","conj","Men spent 20 hours a week on housework, ___ women spent 35.",["whereas","while"]],
 ["Contrast","prep","___ its flexibility, online learning requires strong self-discipline.",["despite","in spite of"]],
 ["Contrast","prep","___ the high cost of living, many young people move to Jakarta.",["despite","in spite of"]],
 ["Cause","prep","Many flights were cancelled ___ the storm."],
 ["Cause","prep","House prices have risen ___ a shortage of land."],
 ["Cause","conj","Many flights were cancelled ___ the storm was severe."],
 ["Cause","conj","Many students work part-time ___ tuition fees are high."],
 ["Result","adv","The storm was severe. ___, many flights were cancelled.",["Therefore","Consequently","As a result","Thus","Hence"]],
 ["Result","adv","Fuel prices rose sharply. ___, transport costs increased.",["Therefore","Consequently","As a result","Thus","Hence"]],
 ["Adding","adv","Public transport reduces pollution. ___, it eases traffic congestion."],
 ["Adding","adv","Exercise improves physical health. ___, it reduces stress."],
 ["Adding","prep","___ reducing pollution, public transport eases traffic congestion."],
 ["Example","adv","Many countries invest in renewable energy. ___, Germany produces about half of its electricity from it."],
 ["Example","adv","Social media can harm sleep. ___, many teenagers scroll on their phones until after midnight."],
 ["Example","prep","Some renewable sources, ___ solar and wind power, are becoming cheaper."],
 ["Similarity","adv","Japan has an ageing population. ___, South Korea faces a shrinking workforce."],
 ["Clarifying","adv","Many students are time-poor. ___, they have to work and study at the same time."],
 ["Condition","conj","The economy will recover ___ the government keeps investing in infrastructure."],
 ["Conclusion","adv","___, the advantages of remote work outweigh its drawbacks."]
];
const NOT_WRONG = {Adding:["Emphasis","Similarity","Sequence"], Example:["Adding","Emphasis","Clarifying","Similarity"], Contrast:["Emphasis","Sequence"], Result:["Conclusion","Emphasis","Sequence"], Similarity:["Adding","Emphasis","Example"], Clarifying:["Emphasis","Result","Example"], Conclusion:["Result","Emphasis","Sequence"], Condition:["Cause"], Cause:["Condition"]};
function linkGen(funcs){
  const ctx = pk(CTX.filter(c => !funcs || funcs.includes(c[0])));
  const [f, t, s, only] = ctx;
  const good = only || LINK.filter(l => l.f===f && l.t===t).flatMap(l => l.w).filter(w => !(f==="Condition" && w==="unless"));
  const correct = pk(good);
  const fit = w => (s.startsWith("___") ? cap(w) : w);
  // distractors: same type but wrong meaning, plus the right meaning with the wrong grammar
  const sameTypeWrongMeaning = LINK.filter(l => l.t===t && l.f!==f && !(NOT_WRONG[f]||[]).includes(l.f)).flatMap(l => l.w);
  const rightMeaningWrongType = LINK.filter(l => l.f===f && l.t!==t).flatMap(l => l.w).concat(f==="Result" ? ["because of","because"] : f==="Cause" && t==="prep" ? ["because","therefore"] : f==="Cause" ? ["due to","therefore"] : []);
  const pool = shuf(rightMeaningWrongType).slice(0,2).concat(shuf(sameTypeWrongMeaning));
  const allSameFunc = LINK.filter(l => l.f===f && l.t===t).flatMap(l => l.w).map(x => x.toLowerCase());
  const wrong = []; for(const w of pool){ if(wrong.length>=3) break; const lw = w.toLowerCase(); if(!good.map(x=>x.toLowerCase()).includes(lw) && !allSameFunc.includes(lw) && !wrong.includes(fit(w)) && lw!=="unless" && lw!=="if") wrong.push(fit(w)); }
  const unlessTrap = f==="Condition" ? ["unless"] : [];
  const opts = [fit(correct), ...unlessTrap.map(fit), ...wrong].slice(0,4);
  return {type:"mc", q:s.replace("___","_____"), a:fit(correct), opts, why:`Meaning: ${f.toLowerCase()}. Grammar: here you need a ${TYPE_NAME[t]} — ${TYPE_RULE[t]} Good options: ${good.slice(0,4).join(", ")}.`};
}

/* ---------- giving examples (from Azel's phrasebank) ---------- */
const EXP = [
 ["For example,","sebagai contoh","6.0+"],["For instance,","misalnya","6.0+"],["such as","seperti (+ contoh)","6.0+"],["A good example is…","contoh yang baik adalah…","6.5+"],
 ["To illustrate,","untuk memberi ilustrasi","7.0+"],["A clear example of this is…","contoh yang jelas adalah…","7.0+"],["Namely,","yaitu (sebutkan yang spesifik)","7.0+"],["This can be seen when…","ini terlihat saat…","7.0+"],
 ["One such example is…","salah satu contohnya adalah…","7.5+"],["This is illustrated by…","ini dibuktikan oleh…","7.5+"],["An illustration of this is…","ilustrasi dari hal ini adalah…","7.5+"],
 ["A case in point is…","contoh nyatanya adalah…","8.0+"],["Take the case of…","ambil contoh kasus…","8.0+"],["As illustrated by…","seperti ditunjukkan oleh…","8.0+"],["This point is exemplified by…","poin ini dicontohkan oleh…","8.0+"]
];

/* ---------- active / passive generator ---------- */
const AG = [
 {s:"The government", by:"the government", pl:false},{s:"Researchers", by:"researchers", pl:true},{s:"The city council", by:"the city council", pl:false},
 {s:"Many companies", by:"many companies", pl:true},{s:"The university", by:"the university", pl:false},{s:"Local farmers", by:"local farmers", pl:true},{s:"The central bank", by:"the central bank", pl:false}
];
const VB = [ // base, 3rd person, past, past participle, -ing, objects [text, plural]
 ["raise","raises","raised","raised","raising",[["taxes",true],["interest rates",true],["the minimum wage",false]]],
 ["build","builds","built","built","building",[["a new bridge",false],["more schools",true],["affordable houses",true]]],
 ["introduce","introduces","introduced","introduced","introducing",[["a new policy",false],["strict rules",true],["a plastic bag tax",false]]],
 ["conduct","conducts","conducted","conducted","conducting",[["the survey",false],["several experiments",true],["a detailed study",false]]],
 ["publish","publishes","published","published","publishing",[["the results",true],["a new report",false],["the data",true]]],
 ["ban","bans","banned","banned","banning",[["mobile phones",true],["single-use plastic",false],["the sale of alcohol",false]]],
 ["grow","grows","grew","grown","growing",[["rice",false],["coffee",false],["vegetables",true]]],
 ["take","takes","took","taken","taking",[["strong measures",true],["the decision",false],["action",false]]],
 ["write","writes","wrote","written","writing",[["the report",false],["new guidelines",true],["the proposal",false]]],
 ["cut","cuts","cut","cut","cutting",[["public spending",false],["fuel subsidies",true],["the budget",false]]],
 ["give","gives","gave","given","giving",[["scholarships",true],["financial support",false],["clear instructions",true]]],
 ["reduce","reduces","reduced","reduced","reducing",[["import taxes",true],["the deficit",false],["working hours",true]]]
];
const TENSES = {
 pres:{name:"present simple", time:["every year","each month","regularly"], act:(a,v) => a.pl ? v[0] : v[1], pas:(o) => (o[1] ? "are " : "is ")},
 past:{name:"past simple", time:["in 2020","last year","in 2015"], act:(a,v) => v[2], pas:(o) => (o[1] ? "were " : "was ")},
 perf:{name:"present perfect", time:["recently","since 2020","this year"], act:(a,v) => (a.pl ? "have " : "has ")+v[3], pas:(o) => (o[1] ? "have been " : "has been ")},
 cont:{name:"present continuous", time:["at the moment","this year","right now"], act:(a,v) => (a.pl ? "are " : "is ")+v[4], pas:(o) => (o[1] ? "are being " : "is being ")},
 fut:{name:"future (will)", time:["next year","in 2030","soon"], act:(a,v) => "will "+v[0], pas:() => "will be "},
 modal:{name:"modal (should)", time:["",""], act:(a,v) => "should "+v[0], pas:() => "should be "}
};
const BE_WRONG = {pres:o => o[1] ? "is " : "are ", past:o => o[1] ? "was " : "were ", perf:o => o[1] ? "has been " : "have been ", cont:o => o[1] ? "is being " : "are being ", fut:() => "will being ", modal:() => "should been "};
function apGen(dir){
  const a = pk(AG), v = pk(VB), o = pk(v[5]), tk = pk(Object.keys(TENSES)), te = TENSES[tk], tm = pk(te.time);
  const tail = tm ? " "+tm : "";
  const active = `${a.s} ${te.act(a, v)} ${o[0]}${tail}.`;
  const passive = `${cap(o[0])} ${te.pas(o)}${v[3]} by ${a.by}${tail}.`;
  const wrongBe = `${cap(o[0])} ${BE_WRONG[tk](o)}${v[3]} by ${a.by}${tail}.`;
  const wrongPart = `${cap(o[0])} ${te.pas(o)}${v[2]===v[3] ? v[4] : v[2]} by ${a.by}${tail}.`;
  const otherT = pk(Object.keys(TENSES).filter(k => k!==tk && TENSES[k].pas(o)!==te.pas(o)));
  const wrongTense = `${cap(o[0])} ${TENSES[otherT].pas(o)}${v[3]} by ${a.by}${tail}.`;
  if(dir==="a2p") return {type:"mc", kicker:"Active → passive ("+te.name+")", q:`Change to the passive:<br><i>${esc(active)}</i>`, a:passive, opts:[passive, wrongBe, wrongPart, wrongTense].filter((x,i,arr) => arr.indexOf(x)===i), safe:false, why:`Object → subject, then <b>${te.pas(o)}+ past participle (${v[3]})</b>. Keep the same tense (${te.name}); the be-verb agrees with “${o[0]}”.`};
  const wrongSwap = `${cap(o[0])} ${te.act({pl:o[1]}, v)} ${a.by}${tail}.`;
  const wrongAgr = `${a.s} ${te.act({pl:!a.pl}, v)} ${o[0]}${tail}.`;
  const otherA = `${a.s} ${TENSES[otherT].act(a, v)} ${o[0]}${tail}.`;
  const wrongBeAct = `${a.s} ${te.pas(o)}${v[3]} ${o[0]}${tail}.`;
  const opts = [active, wrongSwap, otherA, wrongAgr, wrongBeAct].filter((x,i,arr) => arr.indexOf(x)===i).slice(0,4);
  return {type:"mc", kicker:"Passive → active ("+te.name+")", q:`Change to the active (the doer becomes the subject):<br><i>${esc(passive)}</i>`, a:active, opts, why:`The doer after “by” (${a.by}) becomes the subject. Keep the ${te.name}: ${a.s} <b>${te.act(a, v)}</b> ${o[0]}.`};
}

/* ---------- academic word list (from Azel's spreadsheet) ---------- */
const POSN = {n:"noun", v:"verb", a:"adjective", d:"adverb"};
function wordGen(pos){
  const list = WORDS[pos], w = pk(list), [word, idn, col] = w;
  const t = Math.random();
  const toks = s => s.split("/").map(x => x.trim().toLowerCase());
  const mine = toks(idn);
  const others = shuf(list.filter(x => x[0]!==word && !toks(x[1]).some(t => mine.includes(t)))).slice(0,3).map(x => x[0]);
  const otherPos = Object.keys(WORDS).filter(k => k!==pos && !(pos==="a" && k==="d") && !(pos==="d" && k==="a"));
  const head = word.split(" ")[0];
  const cols = col.split(";").map(s => s.trim()).filter(c => new RegExp("\\b"+head.replace(/[^a-z]/gi,"")+"\\w*","i").test(c));
  if(t < 0.45 || !cols.length) return {type:"mc", kicker:"Academic "+POSN[pos], q:`Which word means: <b>${esc(idn)}</b>?`, a:word, opts:[word, ...others], safe:false, why:`${esc(word)} = ${esc(idn)}. Common phrases: ${esc(col)}.`};
  const c = pk(cols);
  const re = new RegExp("\\b"+head.replace(/[^a-z]/gi,"")+"\\w*","i");
  const used = c.match(re)[0];
  const gap = c.replace(re, "_____");
  // answer in the same form as used in the phrase
  const pairOf = pos==="a" ? (PAIRS.find(p => p[0]===word)||[])[1] : pos==="d" ? (PAIRS.find(p => p[1]===word)||[])[0] : null;
  const wrongs = [pairOf, ...shuf(otherPos.flatMap(k => WORDS[k].map(x => x[0].split(" ")[0])))].filter(x => x && x.toLowerCase()!==used.toLowerCase()).filter((x,i,arr) => arr.indexOf(x)===i).slice(0,3);
  return {type:"mc", kicker:"Collocation (word class)", q:`Complete the academic phrase:<br><b>${esc(gap)}</b>`, a:used.toLowerCase(), opts:[used.toLowerCase(), ...wrongs], safe:false, why:`“${esc(c)}” — ${esc(word)} (${POSN[pos]}) = ${esc(idn)}.`};
}
const PAIRS = [["considerable","considerably"],["dramatic","dramatically"],["gradual","gradually"],["marginal","marginally"],["rapid","rapidly"],["sharp","sharply"],["significant","significantly"],["slight","slightly"],["steady","steadily"],["substantial","substantially"],["notable","notably"]];
function formGen(){
  const [adj, adv] = pk(PAIRS), s = pk(["sales","the price of rice","the number of tourists","unemployment","coffee exports","the birth rate"]);
  const verb = pk(["rose","fell","increased","declined","grew","dropped"]);
  if(Math.random()<.5) return M(`${cap(s)} ${verb} _____ between 2010 and 2020.`, adv, [adj, "more "+adj, "most "+adj], `After a verb (${verb}) use an adverb: ${verb} ${adv}.`);
  const noun = {rose:"rise",fell:"fall",increased:"increase",declined:"decline",grew:"growth",dropped:"drop"}[verb];
  const art = /^[aeiou]/.test(adj) ? "an" : "a";
  return M(`There was ${art} _____ ${noun} in ${s} between 2010 and 2020.`, adj, [adv, "more "+adv, "most "+adv], `Before a noun (${noun}) use an adjective: ${art} ${adj} ${noun}.`);
}

/* ---------- idioms for Speaking ---------- */
const IDI = [
 ["a piece of cake","very easy","sangat mudah","The first part of the test was a piece of cake."],
 ["once in a blue moon","very rarely","sangat jarang","I eat fast food once in a blue moon."],
 ["hit the books","study hard","belajar keras","I need to hit the books before my econometrics exam."],
 ["burn the midnight oil","work or study late at night","begadang belajar/kerja","I burned the midnight oil to finish my essay."],
 ["burn the candle at both ends","work too hard from early to late and get exhausted","kerja terlalu keras sampai capek","Working and studying full-time, I was burning the candle at both ends."],
 ["under the weather","slightly ill","kurang enak badan","I felt a bit under the weather last week."],
 ["at the eleventh hour","at the last possible moment","di menit terakhir","She submitted the assignment at the eleventh hour."],
 ["on the verge of","very close to (doing something)","hampir / di ambang","The project was on the verge of failure."],
 ["bury your head in the sand","ignore a problem and hope it goes away","pura-pura tidak tahu masalah","You can't bury your head in the sand about money problems."],
 ["hot under the collar","angry or embarrassed","marah / kesal","He got hot under the collar when the bus was late again."],
 ["lose heart","lose confidence or hope","putus asa / patah semangat","Don't lose heart if your first band score is low."],
 ["get the hang of","learn how to do something","mulai paham / terbiasa","After a week, I got the hang of the new software."],
 ["break the ice","make people feel relaxed at the start","mencairkan suasana","Our teacher told a joke to break the ice."],
 ["cost an arm and a leg","be very expensive","sangat mahal","Flights to Europe cost an arm and a leg in December."],
 ["in the long run","over a long period of time","dalam jangka panjang","Saving a little every week pays off in the long run."],
 ["a blessing in disguise","something bad that turns out to be good","hikmah di balik musibah","Missing that bus was a blessing in disguise."],
 ["call it a day","stop working for the day","selesai untuk hari ini","It's 10 pm, so let's call it a day."],
 ["see eye to eye","agree with someone","sepakat / sependapat","My sister and I don't always see eye to eye."],
 ["over the moon","extremely happy","sangat bahagia","I was over the moon when I got the scholarship."],
 ["up in the air","not decided yet","belum pasti","Our travel plans are still up in the air."],
 ["keep an eye on","watch something carefully","mengawasi","I keep an eye on my spending every week."],
 ["the ball is in your court","it's your turn to decide or act","giliranmu untuk memutuskan","I've sent the offer, so the ball is in your court."],
 ["beat around the bush","avoid saying something directly","bertele-tele","Stop beating around the bush and tell me the truth."],
 ["learn the ropes","learn the basic skills of a job","belajar dasar-dasar pekerjaan","My first month at the resort was spent learning the ropes."],
 ["make ends meet","have just enough money to live","mencukupi kebutuhan","Many students take part-time jobs to make ends meet."],
 ["a drop in the ocean","a very small amount compared to what is needed","setetes air di lautan (sangat kecil)","The donation was just a drop in the ocean."],
 ["the tip of the iceberg","a small visible part of a bigger problem","puncak gunung es","These complaints are only the tip of the iceberg."],
 ["get out of hand","become impossible to control","lepas kendali","Social media use can easily get out of hand."],
 ["on the same page","agree / understand in the same way","satu pemahaman","Before the project, make sure the team is on the same page."],
 ["go the extra mile","do more than expected","berusaha lebih","The staff at our resort always go the extra mile for guests."],
 ["face the music","accept the bad results of your actions","menanggung akibat","If you skip classes, you'll have to face the music at the exam."],
 ["think outside the box","think in a creative, new way","berpikir kreatif","To solve traffic jams, cities need to think outside the box."],
 ["a double-edged sword","something with both good and bad effects","pedang bermata dua","Technology is a double-edged sword for students."],
 ["by leaps and bounds","very quickly, in big amounts","sangat pesat","My English has improved by leaps and bounds."],
 ["in hot water","in trouble","dalam masalah","He was in hot water for missing the deadline."],
 ["let off steam","release stress or anger","melepas stres","I go for a walk to let off steam after class."]
];
function idiomGen(from, to){
  const set = IDI.slice(from, to), it = pk(set), others = shuf(IDI.filter(x => x!==it)).slice(0,3);
  const t = Math.random();
  if(t < .34) return {type:"mc", kicker:"Idiom → meaning", q:`What does <b>“${esc(it[0])}”</b> mean?`, a:it[1], opts:[it[1], ...others.map(o => o[1])], safe:false, why:`${esc(it[0])} = ${esc(it[1])} (${esc(it[2])}). Example: ${esc(it[3])}`};
  if(t < .67) return {type:"mc", kicker:"Meaning → idiom", q:`Which idiom means <b>${esc(it[1])}</b>? <span class="vid">(${esc(it[2])})</span>`, a:it[0], opts:[it[0], ...others.map(o => o[0])], safe:false, why:esc(it[3])};
  const m = it[3].match(new RegExp(it[0].split(" ").map(w => w==="your"||w==="you" ? "\\w+" : w.replace(/s$/,"s?")+"\\w*").join(" "), "i"));
  if(!m) return {type:"mc", kicker:"Idiom → meaning", q:`What does <b>“${esc(it[0])}”</b> mean?`, a:it[1], opts:[it[1], ...others.map(o => o[1])], safe:false, why:esc(it[3])};
  return {type:"mc", kicker:"Use it", q:esc(it[3].replace(m[0], "_____")), a:m[0], opts:[m[0], ...others.map(o => o[0])], safe:false, why:`${esc(it[0])} = ${esc(it[1])}.`};
}

/* ---------- approximations for Task 1 ---------- */
const APPROX = [[24,"just under a quarter"],[26,"just over a quarter"],[49,"just under half"],[51,"just over half"],[33,"about a third"],[65,"nearly two thirds"],[74,"nearly three quarters"],[76,"just over three quarters"],[10,"one in ten"],[20,"a fifth"],[90,"the vast majority"],[3,"a tiny fraction"]];

/* ---------- the course ---------- */
const units = [
{id:"w-para", title:"Paragraphs & topic sentences", sub:"Active topic sentences, PEEL, when passive is OK", color:"#FDE8EF", ink:"#B04A72", lessons:[
  L("w-topic","Active topic sentences","☝",`<p>Your lecturer is right: the <b>first sentence of a body paragraph</b> (the topic sentence) should usually be <b>active</b>. It names a clear subject and makes your claim directly.</p>
   ${EX("✗ Air pollution in big cities can be significantly reduced by public transport.<br>✓ Public transport can significantly reduce air pollution in big cities.")}
   <p>Formula: <b>clear subject (your main idea) + strong verb + what it does/causes</b>. Example: “Social media <b>damages</b> teenagers' sleep in two main ways.”</p>
   <p>After that, in the supporting sentences you can mix active and passive (see the next lessons).</p>
   ${ID("Kalimat pertama paragraf = ‘janji’ ke pembaca tentang isi paragraf. Kalau pakai passive, subjeknya jadi hal yang dikenai aksi, sehingga ide utama terasa lemah dan tidak langsung. Pakai active: siapa/apa melakukan apa.")}`,[
    M("Body paragraph about public transport. Which is the best topic sentence?","Public transport significantly reduces air pollution in large cities.",["Air pollution in large cities is significantly reduced by public transport.","There are many things about public transport in large cities.","Air pollution, it is reduced, by public transport."],"Active, clear subject (public transport) and a clear claim."),
    M("Paragraph about the risks of social media. Best topic sentence?","Excessive social media use harms young people's mental health.",["Young people's mental health is harmed by excessive social media use.","Social media, like, is bad for young people.","Mental health is something that social media is related to."],"The active version puts your main idea (social media use) first."),
    M("Paragraph about remote work. Best topic sentence?","Remote work allows employees to balance their jobs and family life.",["A balance between jobs and family life is allowed by remote work.","Remote work is a thing that many people do nowadays.","Employees are allowed by remote work to balance their lives."],"Direct, active and specific."),
    M("Which topic sentence is PASSIVE?","Many jobs have been replaced by automation.",["Automation has replaced many jobs.","Automation threatens many low-skilled jobs.","Governments must prepare workers for automation."],"have been + past participle (replaced) + by … = passive."),
    M("Make this topic sentence active: “Tourism in Bali is heavily depended on by the local economy.”","The local economy depends heavily on tourism in Bali.",["Tourism in Bali depends heavily on the local economy.","The local economy is heavily depended on tourism.","Heavily, the local economy depends on Bali tourism."],"The doer (the local economy) becomes the subject."),
    M("Make it active: “Higher fees should be paid by tourists who visit national parks.”","Tourists who visit national parks should pay higher fees.",["National parks should pay tourists higher fees.","Tourists should be paid higher fees by national parks.","Higher fees should pay tourists in national parks."],"Who pays? Tourists → subject."),
    M("Which topic sentence is too vague?","There are many things to discuss about this topic.",["Online learning widens access to higher education.","A sugar tax would reduce childhood obesity.","Urban green spaces improve residents' well-being."],"A topic sentence must state one clear main idea."),
    M("Paragraph 3 argues the government should fund public libraries. Best opening?","Governments should continue to fund public libraries for three reasons.",["Public libraries should continue to be funded by governments.","Libraries are, like, important for everyone.","Funding is something that libraries are given."],"Active + a clear plan for the paragraph.")]),
  L("w-peel","Paragraph structure (PEEL)","¶",`<p><b>P</b>oint (topic sentence, active) → <b>E</b>xplain (why/how) → <b>E</b>xample (evidence) → <b>L</b>ink (back to the question).</p>
   ${EX("P: Public transport reduces air pollution. E: When more people take buses and trains, fewer private cars burn fuel. E: For instance, Jakarta's TransJakarta buses carry about one million passengers a day. L: Therefore, investing in public transport is an effective way to improve air quality.")}
   ${ID("Satu paragraf = satu ide. Kalimat contoh dan penjelasan boleh pakai passive kalau pelakunya tidak penting.")}`,[
    M("“For instance, Jakarta's buses carry about one million passengers a day.” This sentence is the…","Example",["Point (topic sentence)","Link","Introduction"],"It gives evidence with ‘For instance’."),
    M("“Therefore, investing in public transport is an effective way to improve air quality.” This sentence is the…","Link",["Point (topic sentence)","Example","Explanation"],"It connects back to the essay question."),
    M("“When more people take buses, fewer private cars burn fuel.” This sentence is the…","Explanation",["Example","Link","Point (topic sentence)"],"It explains how/why the point is true."),
    M("Where should the topic sentence go?","At the start of the paragraph",["In the middle","At the end","Anywhere"],"The reader needs the main idea first."),
    M("How many main ideas should one body paragraph have?","One",["Two or three","As many as possible","None"],"One paragraph = one main idea, well developed."),
    M("Which is a good LINK sentence for a paragraph on online learning?","Thus, online courses make higher education more accessible.",["For example, I studied online last year.","Online learning is a type of learning.","However, there are also disadvantages."],"It restates the point and connects to the question.")]),
  L("w-whenpass","When passive is better","⇄",`<p>Use passive in <b>supporting sentences</b> when:</p><ul><li>the doer is unknown or not important: “The bridge <b>was built</b> in 1995.”</li><li>you describe a <b>process</b> (Task 1): “The beans <b>are dried</b> and then <b>roasted</b>.”</li><li>you want an objective tone: “It <b>is widely believed</b> that…”</li><li>you keep the same topic as the subject for flow: “Plastic is cheap. However, it <b>is rarely recycled</b>.”</li></ul><p>Use active when the doer matters, and in topic sentences.</p>`,[
    M("Which sentence SHOULD be passive?","The data were collected in 2024.",["Researchers collected the data in 2024 and they argue it shows a trend.","Smartphones distract students.","Governments should tax sugary drinks."],"Who collected it is not important → passive is natural."),
    M("Task 1 process (making coffee). Best style?","First, the coffee beans are picked and dried.",["First, farmers pick and somebody dries the coffee beans.","First, you pick the beans and you dry them.","First, picking and drying of beans happen by people."],"Processes are usually described in the passive."),
    M("Which is a good objective (hedged) passive?","It is widely argued that tourism benefits local economies.",["Everybody knows tourism is good.","I think tourism is good, like, for the economy.","Tourism is good, period."],"‘It is widely argued that…’ sounds academic and objective."),
    M("Topic sentence or supporting sentence: where is active MOST important?","Topic sentence",["Supporting sentence","Example sentence","It never matters"],"Your lecturer's rule: start paragraphs actively."),
    M("“Plastic is cheap. However, it ___.” Which keeps the topic (plastic) as the subject?","is rarely recycled",["people rarely recycle","rarely recycles by people","recycles rarely"],"Passive keeps ‘it’ (plastic) as the subject → better flow."),
    M("Which passive sentence is unnecessary (active is clearer)?","A decision was made by me to study economics.",["The results were published in 2023.","Rice is grown in West Sumatra.","The meeting was cancelled."],"When YOU are the doer, say ‘I decided…’.")])
]},
{id:"w-voice", title:"Active ↔ passive", sub:"Change sentences both ways in every tense", color:"#E6F1FB", ink:"#3D6FA0", lessons:[
  L("w-a2p","Active → passive","→",`<p>1) The object becomes the subject. 2) Use <b>be</b> in the <b>same tense</b> + <b>past participle</b>. 3) The old subject goes after <b>by</b> (or disappears).</p>
   <table class="ltbl wide"><tr><th>Tense</th><th>Active</th><th>Passive</th></tr><tr><td>Present</td><td>raises</td><td>is/are raised</td></tr><tr><td>Past</td><td>raised</td><td>was/were raised</td></tr><tr><td>Present perfect</td><td>has raised</td><td>has/have been raised</td></tr><tr><td>Continuous</td><td>is raising</td><td>is/are being raised</td></tr><tr><td>Future</td><td>will raise</td><td>will be raised</td></tr><tr><td>Modal</td><td>should raise</td><td>should be raised</td></tr></table>
   ${ID("Be-nya ikut subjek BARU: ‘taxes’ (jamak) → were/are/have been. Kata kerja ketiga (past participle) wajib: built, written, taken, grown.")}`, [], () => apGen("a2p")),
  L("w-p2a","Passive → active","←",`<p>Find the doer after <b>by</b> → make it the subject. Keep the tense. Make the verb agree with the new subject.</p>${EX("Taxes were raised by the government in 2020. → The government raised taxes in 2020.")}${EX("New rules have been introduced by many companies. → Many companies have introduced new rules.")}<p>This is exactly how you fix a passive topic sentence.</p>`, [], () => apGen("p2a")),
  L("w-agent","Keep or drop “by…”?","by",`<p>Keep <b>by + doer</b> only when the doer is important or new information. Drop it when the doer is obvious, unknown or ‘people’.</p>${EX("✗ English is spoken by people in many countries. ✓ English is spoken in many countries.")}${EX("✓ The theory was developed by Keynes. (the doer matters)")}`,[
    M("Which is better?","The suspect was arrested last night.",["The suspect was arrested by the police last night.","The police were arrested by the suspect.","The suspect arrested last night."],"‘by the police’ is obvious → drop it."),
    M("Which is better?","The novel was written by Pramoedya Ananta Toer.",["The novel was written.","The novel was written by someone.","The novel wrote Pramoedya."],"The writer is important information → keep ‘by…’."),
    M("Which is better?","Rice is eaten in most Asian countries.",["Rice is eaten by people in most Asian countries.","People are eaten rice in most Asian countries.","Rice eats in most Asian countries."],"‘by people’ adds nothing."),
    M("“It is believed ___ that the economy will grow.” What goes in the gap?","nothing (leave it out)",["by people","by everyone","by somebody"],"Reporting passives don't need an agent."),
    M("Which sentence needs the agent?","The vaccine was developed by Indonesian scientists.",["My phone was stolen.","The road is being repaired.","Breakfast is served from 7 am."],"Who developed it is the key information.")])
]},
{id:"w-link", title:"Linking words", sub:"Stop repeating “like”: the right connector with the right grammar", color:"#FFF4CF", ink:"#8A6A12", lessons:[
  L("w-ltypes","3 types of connectors","🔗",`<p>Connectors are not all the same grammar. This is the key to using them correctly:</p>
   <table class="ltbl wide"><tr><th>Type</th><th>Examples</th><th>Pattern</th></tr>
   <tr><td><b>Conjunction</b></td><td>although, because, whereas, while, since, unless</td><td>A, although B. / Although B, A.</td></tr>
   <tr><td><b>Linking adverb</b></td><td>however, moreover, therefore, nevertheless, consequently, in addition, as a result, on the other hand</td><td>A. However, B. / A; however, B.</td></tr>
   <tr><td><b>Preposition</b></td><td>despite, due to, because of, in addition to, according to, such as</td><td>Despite + noun / -ing</td></tr></table>
   ${EX("✗ Prices rose, however demand stayed high. ✓ Prices rose. However, demand stayed high. ✓ Although prices rose, demand stayed high. ✓ Despite the rise in prices, demand stayed high.")}
   ${ID("Catatan untuk spreadsheet-mu: however, moreover, therefore, furthermore, nevertheless BUKAN conjunction, tapi ‘linking adverb’ (kata keterangan penghubung). Bedanya: conjunction menggabungkan dua klausa dalam SATU kalimat; linking adverb memulai kalimat BARU (atau setelah titik koma).")}`,[
    M("Choose the correctly punctuated sentence.","Prices rose. However, demand stayed high.",["Prices rose, however demand stayed high.","Prices rose however, demand stayed high.","However prices rose, demand stayed high."],"However = linking adverb → new sentence (or after ;)."),
    M("Choose the correct one.","Although prices rose, demand stayed high.",["Although prices rose. Demand stayed high.","Although, prices rose, demand stayed high.","Prices rose, although, demand stayed high."],"Although = conjunction joining two clauses in one sentence."),
    M("Choose the correct one.","Despite the rise in prices, demand stayed high.",["Despite prices rose, demand stayed high.","Despite of the rise in prices, demand stayed high.","Despite, prices rose, demand stayed high."],"Despite + noun phrase (no ‘of’)."),
    M("What type is ‘moreover’?","linking adverb",["conjunction","preposition","adjective"],"It starts a new sentence: ‘… . Moreover, …’."),
    M("What type is ‘due to’?","preposition",["conjunction","linking adverb","verb"],"Due to + noun: due to the storm."),
    M("What type is ‘whereas’?","conjunction",["linking adverb","preposition","noun"],"A, whereas B (one sentence)."),
    M("Choose the correct one.","The data are limited; therefore, the results are uncertain.",["The data are limited, therefore the results are uncertain.","The data are limited therefore, the results are uncertain.","Therefore the data are limited, the results are uncertain."],"Semicolon before therefore, comma after it."),
    M("Choose the correct one.","Many flights were delayed because of the storm.",["Many flights were delayed because the storm.","Many flights were delayed because of the storm was strong.","Many flights were delayed due to the storm was strong."],"because of + noun; because + clause.")]),
  L("w-add","Adding & contrasting","±",`<p><b>Adding</b> (selain itu): Moreover, Furthermore, In addition, Additionally / In addition to + noun.</p><p><b>Contrast</b> (namun): However, Nevertheless, On the other hand, By contrast / although, whereas, while / despite, in spite of, unlike.</p>${EX("Exercise improves physical health. Furthermore, it reduces stress.")}${EX("Men spent 20 hours on housework, whereas women spent 35.")}<p><b>On the other hand</b> = the other side of the same issue. <b>By contrast / In contrast</b> = comparing two different things.</p>`, [], () => linkGen(["Adding","Contrast"])),
  L("w-cause","Cause & result","∴",`<p><b>Cause</b> (karena): because / since / as + clause · because of / due to / owing to + noun.</p><p><b>Result</b> (akibatnya): Therefore, Consequently, As a result, Thus, Hence (start a new sentence).</p>${EX("Fuel prices rose sharply. As a result, transport costs increased.")}${EX("Transport costs increased due to the sharp rise in fuel prices.")}`, [], () => linkGen(["Cause","Result"])),
  L("w-ex","Giving examples","e.g.",`<p>From your phrasebank, from basic to band 8:</p><table class="ltbl wide"><tr><th>Phrase</th><th>Arti</th><th>Band</th></tr>${EXP.map(e => `<tr><td><b>${esc(e[0])}</b></td><td>${esc(e[1])}</td><td>${e[2]}</td></tr>`).join("")}</table>
   <p><b>such as</b> goes inside the sentence before a list: “sources such as solar and wind”. <b>For example / For instance</b> usually start a new sentence with a comma.</p>${ID("Jangan pakai ‘like’ untuk memberi contoh di Writing. Ganti dengan such as / for instance / a case in point is…")}`,[
    M("Some renewable sources, _____ solar and wind power, are becoming cheaper.","such as",["for instance of","as like","for example of"],"such as + a list inside the sentence."),
    M("Many countries have reduced plastic waste. _____ Rwanda, which banned plastic bags in 2008.","Take the case of",["Such as","Like as","For example of"],"‘Take the case of + noun’ introduces one specific example."),
    M("Which is the most academic (band 7.5+)?","This is illustrated by the rapid growth of e-commerce in Indonesia.",["Like, e-commerce in Indonesia is growing.","For example like e-commerce.","E-commerce is an example, for example."],"‘This is illustrated by…’ is formal and precise."),
    M("One country has made great progress in renewable energy, _____ Denmark.","namely",["for instance of","such as like","as illustrated"],"namely = yaitu, naming the exact one."),
    M("Choose the correct punctuation.","For instance, many students prefer online classes.",["For instance many students, prefer online classes.","For instance; many students prefer online classes.","Many students for instance prefer, online classes."],"Comma after For instance at the start."),
    M("_____ of this is the reduction of plastic use in Bali.","A clear example",["Such as","For instance","Like"],"‘A clear example of this is…’"),
    M("Which sentence uses ‘such as’ correctly?","Cities such as Jakarta and Surabaya face traffic problems.",["Such as, Jakarta faces traffic problems.","Jakarta has traffic. Such as Surabaya.","Cities, such as, Jakarta face traffic."],"such as + examples right after the noun.")]),
  L("w-like","Stop overusing “like”","🚫",`<p>“Like” has a few correct uses, but in academic writing it is often too informal.</p><ul><li>Examples → <b>such as / for instance / for example</b></li><li>Role/job → <b>as</b>: She works <b>as</b> an assistant.</li><li>Similarity → <b>like / similar to / as with / likewise</b>: Jakarta, <b>like</b> many megacities, …</li><li>Speaking filler (“it's, like, really good”) → delete it, or pause and use “well…”, “I'd say…”.</li></ul>${ID("Dosenmu benar: ‘like’ terus-menerus membuat tulisan terdengar seperti bahasa lisan. Gunakan variasi sesuai fungsi.")}`,[
    M("Some cities, _____ Jakarta and Bangkok, suffer from heavy traffic.","such as",["like as","as like","for example of"],"In formal writing, use ‘such as’ to give examples."),
    M("_____, many students work part-time to pay their fees.","For instance",["Like","As like","Such as"],"Start a sentence with ‘For instance,’ (not ‘Like,’)."),
    M("She works _____ an assistant at a resort.","as",["like","such as","for example"],"Role or job → as."),
    M("Jakarta, _____ many other megacities, faces serious air pollution.","like",["such as","for instance","namely"],"Here ‘like’ = similar to. This use is correct."),
    M("Which is better in IELTS Speaking?","Well, I'd say it's really important to me.",["It's, like, like really important, like.","Like, it's like important.","Like… like… important."],"Remove ‘like’ fillers; use natural fillers like ‘Well, I'd say…’."),
    M("_____, Japan has an ageing population.","Similarly",["Like","Such as","For example of"],"Comparing two countries: Similarly / Likewise.")]),
  L("w-mix","Mixed connectors","🔀",`<p>All functions together: adding, contrast, cause, result, example, similarity, clarifying, condition and conclusion. Read the whole sentence before you choose. Check <b>meaning</b> first, then <b>grammar type</b>.</p>`, [], () => linkGen())
]},
{id:"w-vocab", title:"Academic vocabulary", sub:"Your 111-word list: meaning, collocations, word forms", color:"#E3F4EA", ink:"#2F7A55", lessons:[
  L("w-nouns","Academic nouns","n",`<p>Learn nouns <b>with their partners</b> (collocations): conduct an <b>analysis</b>, a key <b>factor</b>, have an <b>impact</b> on, the vast <b>majority</b>, take <b>measures</b>.</p><p>Watch out: <b>analysis → analyses</b>, <b>evidence / consumption</b> are uncountable (no -s).</p>`, [], () => wordGen("n")),
  L("w-verbs","Academic verbs","v",`<p>Replace basic verbs: show → <b>indicate / demonstrate / reveal</b>; cause → <b>lead to</b>; make up → <b>constitute / account for</b>; say → <b>argue / suggest</b>; do (a policy) → <b>implement</b>.</p>${EX("The data <b>indicate</b> that… · Students <b>account for</b> 40% of users. · This <b>led to</b> higher prices.")}<p>Irregular: <b>lead → led → led</b>, <b>rise → rose → risen</b>.</p>`, [], () => wordGen("v")),
  L("w-adjadv","Adjectives & adverbs","a/ly",`<p>Adjective + noun: a <b>significant</b> increase. Verb + adverb: increased <b>significantly</b>.</p><p>Size of change: slight/marginal → moderate/steady → considerable/substantial/significant → sharp/dramatic.</p>`, [], () => Math.random()<.5 ? formGen() : wordGen(Math.random()<.5 ? "a" : "d")),
  L("w-wordform","Word forms","↔",`<p>Change the form to fit the grammar and to paraphrase: analyse (v) → analysis (n) → analytical (adj); significant → significantly → significance; consume → consumption; decide → decision.</p>`,[
    M("The government's _____ to raise fuel prices was unpopular.","decision",["decide","decisive","decided"],"After ‘the government's’ → noun."),
    M("Energy _____ has risen sharply.","consumption",["consume","consumed","consuming"],"Subject position → noun."),
    M("The researchers _____ the data carefully.","analysed",["analysis","analytical","analyses"],"Verb needed after the subject."),
    M("Prices rose _____ in 2022.","significantly",["significant","significance","signify"],"Verb + adverb."),
    M("This policy had a _____ effect on employment.","considerable",["considerably","consider","consideration"],"Adjective before the noun ‘effect’."),
    M("There is clear _____ that exercise improves mood.","evidence",["evident","evidently","evidences"],"Noun, uncountable (no -s)."),
    M("The _____ of the population lives in cities.","majority",["major","majorly","majorities"],"the majority of + noun."),
    M("It is _____ that the trend will continue.","evident",["evidence","evidently","evidences"],"It is + adjective + that…")])
]},
{id:"w-para2", title:"Paraphrasing (thesaurus)", sub:"Better words that really fit", color:"#EFE8FB", ink:"#6D51A8", lessons:[
  L("w-syn","Upgrade basic words","↑",`<p>A thesaurus gives many synonyms, but they don't all fit. Check <b>collocation</b> (which words go together) and <b>register</b> (formal or not).</p>
   <table class="ltbl wide"><tr><th>Basic</th><th>Academic</th></tr><tr><td>big</td><td>large, substantial, considerable, major</td></tr><tr><td>important</td><td>crucial, essential, vital, significant</td></tr><tr><td>show</td><td>indicate, demonstrate, reveal, illustrate</td></tr><tr><td>think</td><td>believe, argue, maintain, contend</td></tr><tr><td>problem</td><td>issue, challenge, concern</td></tr><tr><td>help</td><td>support, assist, facilitate</td></tr><tr><td>get</td><td>obtain, acquire, gain, secure</td></tr><tr><td>a lot of</td><td>a large number of (countable), a great deal of (uncountable), numerous</td></tr><tr><td>bad / good</td><td>detrimental, adverse / beneficial, advantageous</td></tr></table>
   ${ID("Jangan asal ganti dari thesaurus. ‘Heavy rain’ benar, ‘strong rain’ salah. ‘Conduct research’ benar, ‘make research’ salah. Selalu cek contoh kalimatnya (pakai menu Vocab).")}`,[
    M("A _____ number of students now study online.","large",["big","tall","wide"],"‘a large number of’ is the natural collocation."),
    M("Clean water is _____ for public health.","essential",["heavy","strong","critic"],"essential = sangat penting."),
    M("The figures _____ a steady rise in unemployment.","indicate",["say","talk","point"],"Data indicate/show/reveal."),
    M("Many economists _____ that the minimum wage should rise.","argue",["opine of","think it","suppose of"],"argue that + clause."),
    M("The government should _____ small businesses during a crisis.","support",["help up","aid to","assist to"],"support + object (no preposition)."),
    M("Screen time can have _____ effects on children's sleep.","detrimental",["badly","bad-ish","negatively"],"detrimental/adverse effects."),
    M("Researchers _____ a survey of 2,000 households.","conducted",["made","did","took"],"conduct a survey/research."),
    M("There was _____ rain last night.","heavy",["strong","big","hard-ish"],"Collocation: heavy rain."),
    M("Students need to _____ practical experience before they graduate.","gain",["win","earn up","take in"],"gain experience."),
    M("Spending a _____ amount of money on advertising is risky.","considerable",["big number","many","numerous"],"amount (uncountable) + considerable/large/great.")]),
  L("w-paraphrase","Paraphrase the question","≈",`<p>Paraphrase the task in your introduction. Three tools:</p><ol><li><b>Synonyms</b>: people → individuals; harmful → detrimental.</li><li><b>Word form</b>: “Prices are rising” → “the rise in prices”.</li><li><b>Structure</b>: active ↔ passive, clause ↔ noun phrase.</li></ol>${EX("Task: Many people believe that university education should be free.<br>Paraphrase: It is widely argued that higher education ought to be provided at no cost.")}`,[
    M("Best paraphrase: “Many people believe that university education should be free.”","It is widely argued that higher education should be provided free of charge.",["Many people believe that university education should be free of free.","Many persons think universities free.","University is free, many people believe it."],"Synonyms + passive + no copying."),
    M("Best paraphrase: “The number of cars in cities is increasing.”","There has been a rise in the number of vehicles in urban areas.",["The number of cars in cities is increase.","Cars are many in cities more.","The cars number increasing in the cities."],"Word form (increase → a rise) + synonyms (cars → vehicles, cities → urban areas)."),
    M("Best paraphrase: “Some people think children should learn a foreign language at primary school.”","It is sometimes argued that pupils should start studying a second language in primary education.",["Some people think children should learn a foreign language at primary school too.","Some people think kids should learn foreign.","Primary school foreign language children think."],"Natural synonyms + new structure."),
    M("Which paraphrase CHANGES the meaning (wrong)?","Most people dislike working from home.",["Many employees now prefer working remotely.","Working remotely is increasingly preferred by many staff.","A growing number of workers would rather work from home."],"Original: ‘Many employees prefer working from home.’ ‘Dislike’ reverses the meaning."),
    M("Which uses word-form change?","The government's decision to raise taxes…",["The government decided to raise taxes…","The state chose to increase taxes…","Taxes were raised by the government…"],"decided (verb) → decision (noun).")])
]},
{id:"w-np", title:"Noun phrases", sub:"Adjective order, noun + noun, compound adjectives", color:"#FDE8EF", ink:"#B04A72", lessons:[
  L("w-np1","Adjective order","abc",`<p>Order before a noun: <b>Determiner → Number → Opinion → Size → Age → Shape → Colour → Origin → Material → Purpose → Noun</b>.</p>${EX("a beautiful red car · two small wooden chairs · an Italian black leather bag → ✓ a black Italian leather bag (colour before origin)")}<p>Ordinal before cardinal: <b>the first two</b> winners, my <b>last three</b> lessons.</p>${ID("Bahasa Indonesia: kata benda dulu lalu sifat (‘mobil merah cantik’). Bahasa Inggris: sifat dulu, kata benda paling akhir (‘a beautiful red car’).")}`,[
    O("a beautiful old wooden house","Opinion → age → material → noun."),
    O("two small round tables","Number → size → shape → noun."),
    M("Choose the correct order.","a black Italian leather bag",["an Italian black leather bag","a leather black Italian bag","a bag black Italian leather"],"Colour → origin → material."),
    M("‘Dua pemenang pertama itu’ in English:","the first two winners",["the two first winners","two winners first the","the winners first two"],"Ordinal (first) before cardinal (two)."),
    M("Choose the correct one.","an expensive new Japanese car",["a new expensive Japanese car","a Japanese new expensive car","an expensive Japanese new car"],"Opinion → age → origin."),
    O("my last three economics lectures","Determiner → ordinal → number → noun modifier → noun.")]),
  L("w-np2","Noun + noun & compound adjectives","-",`<p><b>Noun + noun</b>: the first noun describes the second and stays singular: a <b>rice</b> planting method, an English <b>language</b> course, <b>energy</b> consumption.</p><p><b>Compound adjectives</b> with a hyphen, and <b>no plural -s</b>: over an <b>eight-year</b> period, a <b>two-hour</b> class, a <b>five-month-old</b> baby, a <b>20-second</b> difference.</p>${ID("✗ eight-years period ✓ eight-year period. Seperti kata sifat, angka di dalam compound adjective tidak pakai -s.")}`,[
    M("Sales fell sharply over an _____ period.","eight-year",["eight-years","eight year's","eight years"],"Compound adjective: hyphen, no -s."),
    M("It was a _____ class.","two-hour",["two-hours","two hours'","two hour's"],"two-hour class."),
    M("Choose the correct noun phrase.","energy consumption",["energies consumption","consumption of energies","energy's consumptions"],"Noun modifier stays singular."),
    M("‘Metode penanaman padi yang modern’ =","a modern rice planting method",["a rice planting modern method","a method modern rice planting","a modern rices planting method"],"Adjective → noun modifiers → main noun."),
    M("He works _____ a day.","eight hours",["eight-hour","eight-hours","eight hour"],"Here it's not before a noun, so normal plural."),
    M("There was a _____ difference between the two runners.","twenty-second",["twenty-seconds","twenty seconds","twenty second's"],"Compound adjective before ‘difference’.")]),
  L("w-np3","Nominalisation","N",`<p>Academic writing often turns verbs/adjectives into nouns to pack information.</p>${EX("Prices rose rapidly. → <b>The rapid rise in prices</b>…")}${EX("Governments failed to act, so pollution increased. → <b>Government inaction led to an increase in pollution.</b>")}`,[
    M("Nominalise: “Unemployment increased sharply.”","There was a sharp increase in unemployment.",["Unemployment was increasing sharp.","It increased, unemployment, sharply.","Sharp unemployment increased."],"verb (increased) → noun (an increase), adverb → adjective."),
    M("Nominalise: “People consume more energy.”","Energy consumption has increased.",["Energy consumes people more.","People's consuming energy more.","The consume of energy."],"consume → consumption."),
    M("Which is more academic?","The introduction of the tax reduced sugar intake.",["They introduced the tax and people ate less sugar.","The tax, they brought it in, sugar less.","Sugar was less because tax."],"Nominalisation (introduction, intake)."),
    T("Nominalise ‘analyse’: a careful ___ of the data","analysis","analyse → analysis.")])
]},
{id:"w-t1", title:"Task 1 language", sub:"Trends, prepositions, numbers", color:"#FFF4CF", ink:"#8A6A12", lessons:[
  L("w-trend","Trend words","📈",`<p><b>Up</b>: rise (rose, risen), increase, grow (grew, grown), climb, soar. <b>Down</b>: fall (fell, fallen), drop, decline, decrease, plunge, plummet. <b>No change</b>: remain stable/steady/unchanged, level off, plateau. <b>Up and down</b>: fluctuate. <b>Top / bottom</b>: peak at / reach a peak · hit its lowest point.</p>
   <p>Two patterns: <b>verb + adverb</b> (rose sharply) or <b>There was a + adjective + noun</b> (There was a sharp rise in…).</p>${EX("slight / gradual / steady / considerable / significant / sharp / dramatic")}`, [], () => {
      const t = Math.random();
      if(t < .5) return formGen();
      const big = Math.random()<.5, s = pk(["Sales","Coffee exports","The number of visitors","Rice production"]);
      const from = pk([100,200,400]), to = big ? from*pk([2,3]) : from + Math.round(from*0.02);
      return big ? M(`${s} went from ${from} to ${to}. ${s} rose _____.`, pk(["dramatically","sharply","significantly"]), ["slightly","marginally","steadily-ish"], "A very big change → dramatically/sharply/significantly.")
                 : M(`${s} went from ${from} to ${to}. ${s} rose _____.`, pk(["slightly","marginally"]), ["dramatically","sharply","significantly"], "A tiny change → slightly/marginally.");
    }),
  L("w-prep","Prepositions for numbers","in/of/by/to",`<ul><li><b>an increase in</b> + the thing (no number): an increase in sales.</li><li><b>an increase of</b> + the amount: an increase of 70% (or: a 70% increase in sales).</li><li><b>by</b> = the size of the change: fell <b>by</b> 5% (100% → 95%).</li><li><b>to</b> = the end point: fell <b>to</b> 5% (100% → 5%). <b>from</b> X <b>to</b> Y.</li><li><b>at</b> = a point: peaked <b>at</b> 200, started <b>at</b> $300, remained steady <b>at</b> 10,000.</li><li><b>between</b> 2010 <b>and</b> 2015 · <b>since</b> 2011 (until now) · <b>over / during</b> the next three months · <b>in</b> December / 2017 / the second quarter.</li></ul>${ID("by = selisih; to = angka akhir. ‘Declined by 5%’ (turun 5 poin) ≠ ‘declined to 5%’ (jadi 5%).")}`,[
    M("There was an increase _____ the number of tourists.","in",["of","by","at"],"increase in + the thing."),
    M("There was an increase _____ 70% in sales.","of",["in","at","to"],"increase of + the amount."),
    M("The rate fell from 100% to 95%. It fell _____ 5%.","by",["to","at","of"],"by = size of the change."),
    M("The rate fell from 100% to 5%. It fell _____ 5%.","to",["by","at","of"],"to = the end point."),
    M("Crime peaked _____ 200 incidents in April.","at",["to","by","on"],"peak at + number."),
    M("Prices rose sharply _____ 1973 and 1980.","between",["from","since","during of"],"between X and Y."),
    M("Property prices have increased _____ 2011.","since",["from","in","at"],"since + start time (until now), present perfect."),
    M("500 units were sold _____ December.","in",["on","at","by"],"in + month."),
    M("Sales increased _____ 100 _____ 130 units.","from / to",["by / at","at / by","in / of"],"from start point to end point."),
    M("The population has remained steady _____ around 10,000.","at",["in","by","to"],"remain steady at + number.")]),
  L("w-approx","Numbers & approximations","≈",`<p>Avoid repeating exact numbers. Use: <b>just over / just under / nearly / approximately / around</b>, fractions (a quarter, a third, half, two thirds, three quarters), <b>the vast majority / a tiny fraction</b>, <b>one in ten</b>.</p>${EX("49% → just under half · 26% → just over a quarter · 74% → nearly three quarters")}`, [], () => {
      const [v, w] = pk(APPROX), wrong = shuf(APPROX.filter(x => x[1]!==w && Math.abs(x[0]-v) > 6)).slice(0,3).map(x => x[1]);
      return M(`${v}% of students use public transport. Which expression fits?`, w, wrong, `${v}% ≈ ${w}.`);
    }),
  L("w-tense","Tense in Task 1","⏱",`<p>Past dates → <b>past simple</b> (rose, fell). Up to now → <b>present perfect</b> (has risen since 2011). Future forecasts → <b>is expected / predicted / projected to</b> + verb. No time → present simple (The graph <b>shows</b>…).</p>`,[
    M("In 2015, sales _____ to 500 units.","rose",["rise","have risen","will rise"],"Past year → past simple."),
    M("By 2030, the population _____ to reach 300 million.","is projected",["projected","has projected","is projecting"],"Forecast → is projected/expected to."),
    M("The graph _____ the number of books sold between 2008 and 2016.","shows",["showed","is showing","has shown"],"Describe the chart in the present simple."),
    M("Since 2011, property prices _____ significantly.","have increased",["increased","increase","are increasing"],"Since + until now → present perfect."),
    M("Sales are expected _____ by 2030.","to double",["doubling","doubled","double"],"expected to + base verb.")])
]},
{id:"w-idioms", title:"Idioms for Speaking", sub:"Natural expressions (Speaking only, not Writing)", color:"#E6F1FB", ink:"#3D6FA0", lessons:[
  L("w-id1","Idioms 1","💬",`<p>Idioms make your <b>Speaking</b> sound natural (Lexical Resource). Use 1–2 per answer, naturally. <b>Don't</b> use them in Writing Task 1 or 2: they are too informal.</p><table class="ltbl wide">${IDI.slice(0,12).map(i => `<tr><td><b>${esc(i[0])}</b></td><td>${esc(i[1])}<div class="vid">${esc(i[2])}</div></td></tr>`).join("")}</table>`, [], () => idiomGen(0,12)),
  L("w-id2","Idioms 2","💬",`<table class="ltbl wide">${IDI.slice(12,24).map(i => `<tr><td><b>${esc(i[0])}</b></td><td>${esc(i[1])}<div class="vid">${esc(i[2])}</div></td></tr>`).join("")}</table>${ID("Tip: pakai idiom saat bercerita (Part 2) atau menjawab pengalaman pribadi (Part 1).")}`, [], () => idiomGen(12,24)),
  L("w-id3","Idioms 3","💬",`<table class="ltbl wide">${IDI.slice(24).map(i => `<tr><td><b>${esc(i[0])}</b></td><td>${esc(i[1])}<div class="vid">${esc(i[2])}</div></td></tr>`).join("")}</table>`, [], () => idiomGen(24, IDI.length))
]}
];

/* ---------- essay checker (your lecturer's rules) ---------- */
const PP_IRR = "known given taken made done seen shown written built found held kept left lost paid said sent set sold spent taught thought told understood brought bought caught chosen driven eaten fallen forgotten grown hidden led put read run spoken stolen thrown won worn born cut hit hurt met beaten begun broken drawn drunk forbidden frozen hung laid lent ridden risen shaken shut sung sunk slept spread stood struck swept sworn torn woken withdrawn".split(" ");
const ADJ_ED = /^(interested|concerned|tired|worried|bored|excited|surprised|pleased|satisfied|married|related|located|based|supposed|used|designed|qualified|experienced|advanced|limited|involved|exposed|prepared|determined|convinced|aware)$/i;
function isPassive(s){
  const re = /\b(am|is|are|was|were|be|been|being)\s+(?:(?:not|also|often|still|widely|usually|generally|always|largely|increasingly|rarely|significantly|heavily|easily|now|never|being)\s+)*([a-z]+)\b/gi;
  let m; while((m = re.exec(s))){ const w = m[2].toLowerCase(); if(ADJ_ED.test(w)) continue; if((/ed$/.test(w) && w.length>=5 && !/^(need|speed|seed|feed|indeed|hundred|shred)$/.test(w)) || PP_IRR.includes(w)) return m[0]; }
  return "";
}
const ALL_LINK = LINK.flatMap(l => l.w.map(w => ({w:w.toLowerCase(), f:l.f, t:l.t}))).filter(l => !["as","if"].includes(l.w)).concat(["and","but","so","also","then","firstly","secondly"].map(w => ({w, f:"basic", t:"conj"})));
const INFORMAL = [["like","such as / for instance (examples), as (role)"],["a lot of","a large number of / a great deal of / numerous"],["lots of","numerous / a considerable amount of"],["very","highly / extremely, or a stronger adjective"],["things","factors / aspects / issues"],["thing","factor / aspect / issue"],["get","obtain / gain / become"],["got","obtained / became"],["big","large / substantial / major"],["good","beneficial / positive / effective"],["bad","detrimental / harmful / adverse"],["kids","children"],["nowadays","today / in recent years / currently"],["really","significantly / genuinely"],["so","therefore / consequently (to show result)"],["don't","do not"],["can't","cannot"],["won't","will not"],["isn't","is not"],["it's","it is"],["i think","I believe / I would argue"],["etc","(give full examples instead)"]];
function countWord(text, w){ const re = new RegExp("(^|[^a-z'])"+w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/ /g,"\\s+")+"(?=$|[^a-z'])","gi"); return (text.match(re) || []).length; }
function analyse(text){
  const paras = text.split(/\n\s*\n|\n/).map(p => p.trim()).filter(p => p.split(/\s+/).length > 5);
  const words = (text.match(/[A-Za-z']+/g) || []).length;
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => /[a-z]/i.test(s));
  const passives = sentences.filter(s => isPassive(s));
  const res = {words, paras:[], links:[], informal:[], passiveShare: sentences.length ? Math.round(passives.length/sentences.length*100) : 0, sentences:sentences.length};
  paras.forEach((p, i) => { const first = (p.match(/^[^.!?]+[.!?]?/) || [p])[0]; const pv = isPassive(first); res.paras.push({i, first, pv, role: i===0 ? "Introduction" : i===paras.length-1 && paras.length>2 ? "Conclusion" : "Body "+i}); });
  const lower = " "+text.toLowerCase()+" ";
  ALL_LINK.forEach(l => { const n = countWord(lower, l.w); if(n) res.links.push({w:l.w, n, f:l.f}); });
  INFORMAL.forEach(([w, fix]) => { const n = countWord(lower, w); if(n) res.informal.push({w, n, fix}); });
  res.links.sort((a,b) => b.n - a.n); res.informal.sort((a,b) => b.n - a.n);
  return res;
}
function renderCheck(){
  const t = document.getElementById("wrIn") ? document.getElementById("wrIn").value.trim() : "";
  const out = document.getElementById("wrOut"); if(!out) return;
  if(t.split(/\s+/).length < 30){ out.innerHTML = `<p class="small muted">Paste a full essay (at least a few paragraphs). Put an empty line between paragraphs.</p>`; return; }
  const r = analyse(t);
  const bodyPassive = r.paras.filter(p => p.role.startsWith("Body") && p.pv);
  const funcs = [...new Set(r.links.filter(l => l.f!=="basic").map(l => l.f))];
  const repeated = r.links.filter(l => l.n >= 3 && !["and","also"].includes(l.w));
  out.innerHTML = `<div class="vsec"><h3>Quick check (no AI)</h3>
    <p class="small">${r.words} words · ${r.paras.length} paragraphs · ${r.sentences} sentences · about ${r.passiveShare}% of sentences look passive.</p></div>
    <div class="vsec"><h3>1. First sentences ${bodyPassive.length ? `<span class="tag" style="--cb:#FFE3EA;--cf:var(--bad)">${bodyPassive.length} passive</span>` : `<span class="tag" style="--cb:#E3F4EA;--cf:var(--good)">all active ✓</span>`}</h3>
      ${r.paras.map(p => `<div class="vchange"><b>${esc(p.role)}:</b> ${esc(p.first)}${p.pv ? `<div class="small neg">Looks passive (“${esc(p.pv)}”).${p.role.startsWith("Body") ? " Make this topic sentence active: put the doer first." : ""}</div>` : ""}</div>`).join("")}</div>
    <div class="vsec"><h3>2. Linking words</h3>
      <p class="small">${funcs.length ? `You used: ${funcs.join(", ")}.` : "No academic linking words found."} ${funcs.length < 4 ? "Try to cover more functions: contrast, result, example, adding." : ""}</p>
      <div class="vchips">${r.links.map(l => `<span class="vchip ${l.f==="basic" ? "plain" : "syn"}">${esc(l.w)} <small>×${l.n}</small></span>`).join("") || ""}</div>
      ${repeated.length ? `<p class="small neg">Repeated: ${repeated.map(l => `“${esc(l.w)}” ×${l.n}`).join(", ")}. Vary them (see the Linking words bank below).</p>` : ""}</div>
    <div class="vsec"><h3>3. Informal words</h3>${r.informal.length ? r.informal.map(x => `<div class="vchange"><s>${esc(x.w)}</s> ×${x.n} → ${esc(x.fix)}</div>`).join("") : `<p class="small pos">None found ✓</p>`}</div>
    <div class="btn-row"><button class="btn" type="button" data-lx="wrai" data-c="writing">Fix it with Pita (AI)</button></div><div id="wrAi"></div>`;
}
async function aiFix(){
  const t = document.getElementById("wrIn").value.trim(), out = document.getElementById("wrAi"); if(!out) return;
  const ai = window.__ielts && window.__ielts.ai; if(!ai){ out.innerHTML = `<p class="small neg">Add your AI key in IELTS → Settings first.</p>`; return; }
  out.innerHTML = `<p class="small muted">Pita is reading your essay like your lecturer would…</p>`;
  try{
    const r = await ai(`You are a strict but kind IELTS Writing teacher for Azel (Indonesian economics student). Her lecturer's rules: body paragraphs must start with an ACTIVE topic sentence; supporting sentences may use passive where it is natural; vary academic linking words (correct grammar type and punctuation); use academic vocabulary; avoid 'like' and informal words. Explain in simple English, with a short Bahasa Indonesia note. Never insult. Return only JSON.`,
      [{text:`Essay:\n"""${t.slice(0,4500)}"""\nJSON {"topic":[{"paragraph":"Body 1","original":"first sentence","active":"rewritten active topic sentence (or same if already good)","ok":true|false}],"linkers":[{"original":"weak or repeated linker in context","better":["2-3 better linkers"],"note":"grammar/punctuation note"}],"vocab":[{"from":"basic word/phrase","to":["academic alternatives"]}],"passive_ok":["supporting sentences where passive is good, short"],"band":"estimated band for Lexical Resource + Coherence (number)","priority_id":"one priority in Bahasa Indonesia"}`}], {temp:0.3});
    out.innerHTML = `<div class="vsec"><h3>Topic sentences</h3>${(r.topic||[]).map(x => `<div class="vchange"><b>${esc(String(x.paragraph||""))}</b>${x.ok ? ` <span class="pos small">✓ active</span>` : ""}<div class="small"><s>${x.ok ? "" : esc(String(x.original||""))}</s></div>${x.ok ? "" : `<div>→ <b>${esc(String(x.active||""))}</b></div>`}</div>`).join("")}</div>
      ${(r.linkers||[]).length ? `<div class="vsec"><h3>Linking words</h3>${r.linkers.map(x => `<div class="vchange"><s>${esc(String(x.original||""))}</s> → <span class="vchips">${(x.better||[]).map(b => `<span class="vchip syn">${esc(String(b))}</span>`).join("")}</span><div class="small">${esc(String(x.note||""))}</div></div>`).join("")}</div>` : ""}
      ${(r.vocab||[]).length ? `<div class="vsec"><h3>Academic vocabulary</h3>${r.vocab.map(x => `<div class="vchange"><s>${esc(String(x.from||""))}</s> → <span class="vchips">${(x.to||[]).map(b => `<button class="vchip up" type="button" data-vc="look" data-w="${esc(String(b))}">${esc(String(b))}</button>`).join("")}</span></div>`).join("")}</div>` : ""}
      ${r.band ? `<p class="small">Estimated band (vocabulary + coherence): <b>${esc(String(r.band))}</b></p>` : ""}${r.priority_id ? `<p class="vid">${esc(String(r.priority_id))}</p>` : ""}`;
  }catch(e){ out.innerHTML = `<p class="small neg">${esc(window.__ielts.errMsg ? window.__ielts.errMsg(e) : "The AI couldn't answer.")}</p>`; }
}

/* ---------- word banks ---------- */
let bank = "link";
function bankHtml(){
  const tabs = [["link","Linking words"],["ex","Giving examples"],["words","Academic words"],["idioms","Idioms (Speaking)"]];
  let h = `<div class="segs" role="group" aria-label="Word bank">${tabs.map(t => `<button type="button" data-lx="bank" data-c="writing" data-v="${t[0]}" aria-pressed="${bank===t[0]}">${t[1]}</button>`).join("")}</div>`;
  if(bank==="link"){
    const fs = [...new Set(LINK.map(l => l.f))];
    h += fs.map(f => `<div class="vsec"><h3>${f}</h3>${LINK.filter(l => l.f===f).map(l => `<div class="wbrow"><span class="tag">${TYPE_NAME[l.t]}</span> <span class="small vid">${esc(l.id)}</span><div class="vchips">${l.w.map(w => `<button class="vchip syn" type="button" data-vc="look" data-w="${esc(w.toLowerCase())}">${esc(w)}</button>`).join("")}</div><div class="vex">${esc(l.ex)}</div></div>`).join("")}</div>`).join("") + `<p class="small muted">${esc(TYPE_RULE.adv)}</p>`;
  } else if(bank==="ex"){
    h += `<table class="ltbl wide"><tr><th>Phrase</th><th>Arti</th><th>Band</th></tr>${EXP.map(e => `<tr><td><b>${esc(e[0])}</b></td><td>${esc(e[1])}</td><td>${e[2]}</td></tr>`).join("")}</table>`;
  } else if(bank==="words"){
    h += Object.keys(POSN).map(k => `<div class="vsec"><div class="section-head"><h3>${cap(POSN[k])}s (${WORDS[k].length})</h3><button class="btn small ghost" type="button" data-lx="saveall" data-c="writing" data-v="${k}">Save all to My words</button></div>${WORDS[k].map(w => `<div class="wbrow"><button class="linkbtn vtword" type="button" data-vc="look" data-w="${esc(w[0])}">${esc(w[0])}</button> <span class="vid">${esc(w[1])}</span><div class="small muted">${esc(w[2])}</div>${w[3] ? `<div class="small">${esc(w[3])}</div>` : ""}</div>`).join("")}</div>`).join("");
  } else {
    h += `<div class="vsec"><div class="section-head"><h3>${IDI.length} idioms</h3><button class="btn small ghost" type="button" data-lx="saveall" data-c="writing" data-v="idioms">Save all to My words</button></div>${IDI.map(i => `<div class="wbrow"><b>${esc(i[0])}</b> — ${esc(i[1])}<div class="vid">${esc(i[2])}</div><div class="vex">“${esc(i[3])}”</div></div>`).join("")}</div>`;
  }
  return h;
}
function saveAll(k){
  if(!window.__vocabAdd){ P.toast("Open the Vocab menu once first."); return; }
  let n = 0;
  if(k==="idioms") IDI.forEach(i => { if(window.__vocabAdd(i[0], {card:{word:i[0], senses:[{pos:"idiom", meaning:i[1], meaning_id:i[2], example:i[3]}], tip_id:"Idiom: pakai di Speaking, bukan di Writing.", _dict:true}})) n++; });
  else WORDS[k].forEach(w => {
    const forms = {};
    if(k==="v"){ const m = w[3].match(/Past: ([^|]+)\|\s*Past Participle: ([^(]+)/); if(m) forms.verb = {base:w[0].split(" ")[0], past:m[1].trim(), past_participle:m[2].trim()}; }
    if(k==="n"){ const m = w[3].match(/Plural: ([a-z]+)/i); if(m) forms.noun = {singular:w[0], plural:m[1]}; else if(/Uncountable/.test(w[3])) forms.noun = {singular:w[0], countable:"uncountable"}; }
    if(k==="a"){ const m = w[3].match(/Comparative: ([^|]+)\|\s*Superlative: (.+)/); if(m) forms.adjective = {comparative:m[1].trim(), superlative:m[2].trim()}; }
    if(window.__vocabAdd(w[0], {card:{word:w[0], senses:[{pos:POSN[k], meaning:"", meaning_id:w[1], example:""}], collocations:w[2].split(";").map(s => s.trim()), forms, _dict:true}})) n++;
  });
  P.toast(n ? `Saved ${n} words to My words. Review them in Vocab.` : "They are already in My words.");
}

window.Learn.register({id:"writing", title:"Academic Writing", kicker:"Topic sentences, connectors, vocab, idioms", tutor:"IELTS academic writing teacher", units,
  extraHtml(){ return `<div class="section"><h2>Check my essay</h2><div class="card"><p class="small muted">Paste your essay (empty line between paragraphs). Pita checks your lecturer's rules: active topic sentences, varied connectors and informal words. The quick check is free and unlimited; “Fix it with Pita” uses the AI.</p><textarea class="in" id="wrIn" rows="8" placeholder="Paste your essay here…"></textarea><div class="btn-row"><button class="btn" type="button" data-lx="wrcheck" data-c="writing">Check my essay</button></div><div id="wrOut"></div></div></div>
    <div class="section"><h2>Word banks</h2><div class="card" id="wrBank">${bankHtml()}</div></div>`; },
  onAction(a, el){
    if(a==="wrcheck"){ renderCheck(); return true; }
    if(a==="wrai"){ aiFix(); return true; }
    if(a==="bank"){ bank = el.dataset.v; const b = document.getElementById("wrBank"); if(b) b.innerHTML = bankHtml(); return true; }
    if(a==="saveall"){ saveAll(el.dataset.v); return true; }
    return false;
  }});
window.__writingTools = {analyse, isPassive, apGen, linkGen, wordGen, idiomGen, formGen, units};
})();
