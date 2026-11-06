/* Grammar course: all the grammar for IELTS, from sentence basics to C2 structures.
   Each lesson: a short rule (with a Bahasa Indonesia note) + strict practice. "New questions (AI)" makes fresh ones. */
(function(){
"use strict";
if(!window.Learn) return;
const M = (q, a, wrong, why) => ({type:"mc", q, a, opts:[a, ...wrong], why});
const T = (q, ans, why) => ({type:"input", q, a:ans.split("|")[0], alt:ans.split("|").slice(1), why});
const O = (sent, why, alts) => { const s = sent.replace(/[.?!]$/,""); return {type:"order", q:"Put the words in the right order.", words:s.split(" "), a:s, alt:alts||[], why}; };
const ID = s => `<p class="vid">🇮🇩 ${s}</p>`;
const EX = s => `<div class="lex">${s}</div>`;
const L = (id, title, icon, learn, items) => ({id, title, icon, learn, items, n:Math.min(8, items.length)});

const units = [
{id:"g-basic", title:"Sentence basics", sub:"Parts of speech, word order, agreement, articles", color:"#FDE8EF", ink:"#B04A72", lessons:[
  L("g-pos","Parts of speech","Aa",`<p><b>Noun</b> = thing/idea (decision). <b>Verb</b> = action/state (decide). <b>Adjective</b> describes a noun (decisive). <b>Adverb</b> describes a verb/adjective (decisively). <b>Preposition</b> shows relation (in, on, of).</p>${EX("She made a <b>quick</b> (adj) <b>decision</b> (noun) and acted <b>quickly</b> (adv).")}${ID("Bahasa Indonesia sering memakai kata yang sama untuk kata benda dan kata kerja. Di bahasa Inggris bentuknya beda: decide (kerja) → decision (benda).")}`,[
    M("The government's ___ to raise taxes was unpopular.","decision",["decide","decisive","decisively"],"After “the government's” we need a noun."),
    M("Prices rose ___ last year.","significantly",["significant","significance","signify"],"It describes the verb “rose”, so we need an adverb."),
    M("This is a very ___ policy.","effective",["effect","effectively","effectiveness"],"Before a noun (policy) we need an adjective."),
    M("Education can ___ people's lives.","improve",["improvement","improved","improving"],"After a modal (can) use the base verb."),
    M("There has been a sharp ___ in unemployment.","increase",["increasing","increased","increasingly"],"After “a sharp” we need a noun."),
    T("Make the noun of ‘economic’ → ‘the ___ of Indonesia’ (the system).","economy","‘Economy’ is the noun; ‘economic’ is the adjective."),
    M("Which word is an adverb?","rapidly",["rapid","rapidity","rapids"],"Most adverbs end in -ly."),
    M("She is ___ about the result.","confident",["confidence","confidently","confide"],"After ‘be’ we describe the subject with an adjective.")]),
  L("g-svo","Word order","→",`<p>Basic order: <b>Subject + Verb + Object + Place + Time</b>.</p>${EX("I met my friends at the café yesterday.")}<p>Adverbs of frequency go <b>before</b> the main verb but <b>after</b> “be”: I <b>often</b> study. She is <b>always</b> late.</p>${ID("Jangan taruh keterangan di antara kata kerja dan objek: ✗ I like very much coffee → ✓ I like coffee very much.")}`,[
    O("I usually study economics in the library.","Subject + adverb of frequency + verb + object + place.",["Usually I study economics in the library"]),
    O("She is always late for class.","Frequency adverbs go after ‘be’."),
    M("Choose the correct sentence.","I like coffee very much.",["I like very much coffee.","I very much coffee like.","Very much I like coffee."],"Don't separate the verb from its object."),
    O("We visited my grandmother in Padang last month.","Place before time.",["Last month we visited my grandmother in Padang"]),
    M("Choose the correct sentence.","He has never been to Jakarta.",["He has been never to Jakarta.","He has been to never Jakarta.","Never he has been to Jakarta."],"Adverb between the auxiliary and the main verb."),
    O("They often go to the beach on Sundays.","Adverb of frequency before the main verb.",["On Sundays they often go to the beach"])]),
  L("g-sva","Subject–verb agreement","=",`<p>Singular subject → singular verb (he <b>works</b>). Plural → plural verb (they <b>work</b>).</p><ul><li>The <b>number</b> of students <b>is</b> rising. / A <b>number</b> of students <b>are</b> absent.</li><li><b>Everyone / each / every</b> + singular: Everyone <b>has</b> a phone.</li><li>The verb agrees with the head noun, not the nearest noun: The <b>price</b> of houses <b>is</b> high.</li><li>Uncountable nouns are singular: Information <b>is</b>…</li></ul>${ID("Bahasa Indonesia tidak punya -s pada kata kerja, jadi ini kesalahan paling sering di Speaking. Biasakan cek: subjeknya satu atau banyak?")}`,[
    M("The price of houses ___ increased sharply.","has",["have","are","were"],"The head noun is ‘price’ (singular)."),
    M("A number of students ___ absent today.","are",["is","was","has"],"‘A number of’ = many → plural."),
    M("The number of tourists ___ grown.","has",["have","are","were"],"‘The number’ is singular."),
    M("Everyone in my family ___ rice every day.","eats",["eat","are eating","have eaten"],"‘Everyone’ takes a singular verb."),
    M("The information you gave me ___ very useful.","was",["were","are","have been"],"‘Information’ is uncountable → singular."),
    T("Correct the verb: ‘My brother work in a bank.’ → My brother ___ in a bank.","works","Third person singular needs -s."),
    M("Neither the manager nor the staff ___ happy.","are",["is","was","has"],"With neither…nor, the verb agrees with the nearer subject (staff → plural)."),
    M("Economics ___ my favourite subject.","is",["are","were","have"],"Subjects like economics, physics, news are singular.")]),
  L("g-count","Countable & uncountable","#",`<p>Countable: a book, two books (many, a few). Uncountable: information, advice, money, research, equipment, furniture, evidence (much, a little, <b>no -s</b>, no “a”).</p>${EX("a piece of advice · some information · a lot of research")}${ID("Kata seperti information, advice, research, homework TIDAK boleh diberi -s dan tidak pakai ‘a’. ✗ informations ✗ an advice.")}`,[
    M("Can you give me some ___?","advice",["advices","an advice","advise"],"‘Advice’ is uncountable (the verb is ‘advise’)."),
    M("There isn't ___ evidence to support this.","much",["many","a few","several"],"‘Evidence’ is uncountable → much."),
    M("She did a lot of ___ on climate change.","research",["researches","a research","researchs"],"‘Research’ is uncountable in academic English."),
    M("How ___ people came?","many",["much","little","a little"],"People is countable plural."),
    T("Correct it: ‘We bought new furnitures.’ → We bought new ___.","furniture","Furniture is uncountable."),
    M("I have ___ homework tonight.","a lot of",["many","a","several"],"Homework is uncountable."),
    M("Which is correct?","two pieces of equipment",["two equipments","two equipment","two pieces of equipments"],"Count uncountable nouns with ‘piece(s) of’.")]),
  L("g-art","Articles a / an / the","a",`<p><b>a/an</b>: one, not specific, first mention (a student). <b>an</b> before a vowel <i>sound</i> (an hour, a university).</p><p><b>the</b>: specific / already known / only one (the sun, the government, the economy of Indonesia), superlatives (the best), rivers/oceans, ‘the + adjective’ groups (the poor).</p><p><b>No article</b>: general plural or uncountable (Students need sleep. Money matters.), most countries, meals, ‘go to school/work/bed’.</p>${ID("Bahasa Indonesia tidak punya artikel, jadi sering lupa. Aturan cepat: kata benda tunggal yang bisa dihitung hampir selalu butuh a/an/the/my/this.")}`,[
    M("She is ___ university student.","a",["an","the","—"],"‘University’ starts with a ‘yu’ sound → a."),
    M("I waited for ___ hour.","an",["a","the","—"],"‘Hour’ starts with a vowel sound → an."),
    M("___ unemployment is a serious problem in many countries.","—",["The","A","An"],"General uncountable noun → no article."),
    M("___ government announced a new policy yesterday.","The",["A","—","An"],"A specific government both people know."),
    M("He is ___ tallest student in the class.","the",["a","—","an"],"Superlatives take ‘the’."),
    M("I bought ___ new laptop. ___ laptop is very fast.","a / The",["the / A","a / A","— / The"],"First mention ‘a’, second mention ‘the’."),
    M("We should help ___ poor.","the",["a","—","some"],"The + adjective = a group of people."),
    T("Correct it: ‘My father is engineer.’ → My father is ___ engineer.","an","A job with a singular noun needs a/an.")])
]},
{id:"g-present", title:"Present tenses", sub:"Simple, continuous, stative verbs", color:"#FFF4CF", ink:"#8A6A12", lessons:[
  L("g-ps","Present simple","⟳",`<p>Habits, facts, timetables: I <b>study</b> every day. Water <b>boils</b> at 100°C. The train <b>leaves</b> at 8.</p><p>He/she/it + <b>-s</b>. Negative/question with <b>do/does</b> + base verb: She <b>doesn't</b> like… <b>Does</b> he work…?</p>${ID("Setelah does/doesn't, kata kerja kembali ke bentuk dasar: ✗ Does she works? ✓ Does she work?")}`,[
    M("She ___ to work by bus every day.","goes",["go","is go","going"],"Habit, third person → goes."),
    M("___ your brother live in Padang?","Does",["Do","Is","Has"],"Third person question → Does."),
    M("He doesn't ___ coffee.","drink",["drinks","drinking","drank"],"After doesn't use the base verb."),
    T("Make it negative: ‘They play football.’ → They ___ play football.","don't|do not","Plural subject → don't."),
    M("The sun ___ in the east.","rises",["is rising","rise","rose"],"A fact → present simple."),
    M("My classes ___ at 9.20 on Mondays.","start",["starts","are start","starting"],"Timetable with a plural subject."),
    T("Correct it: ‘Does she likes economics?’ → Does she ___ economics?","like","Base verb after does.")]),
  L("g-pc","Present continuous","…ing",`<p><b>am/is/are + -ing</b> for actions happening now or around now, temporary situations, and changing trends.</p>${EX("I'm studying for my exam this week. Prices are rising.")}${ID("Di IELTS Writing Task 1, present continuous bagus untuk tren yang sedang berubah: ‘The number of… is increasing’.")}`,[
    M("Look! It ___.","is raining",["rains","rain","is rain"],"Happening now."),
    M("I ___ with my aunt this month, but I usually live alone.","am staying",["stay","stays","stayed"],"Temporary situation."),
    M("The number of online shoppers ___ every year.","is increasing",["increase","are increasing","increasing"],"Changing trend; ‘number’ is singular."),
    T("Complete: ‘Shh! The baby ___ (sleep).’","is sleeping|'s sleeping","Happening now."),
    M("Choose the correct one.","She usually walks to campus, but today she is taking a taxi.",["She usually is walking to campus, but today she takes a taxi.","She usually walk to campus, but today she taking a taxi.","She is usually walk to campus, but today she takes a taxi."],"Habit = simple; now = continuous."),
    M("What ___ these days?","are you doing",["do you do","you are doing","you do"],"Around now → continuous question.")]),
  L("g-stat","Stative verbs","♥",`<p>Verbs of state are <b>not</b> usually used in continuous: know, believe, understand, want, need, like, love, prefer, belong, seem, own, mean, agree.</p>${EX("✗ I am knowing → ✓ I know. ✗ I am wanting → ✓ I want.")}<p>Some change meaning: I <b>think</b> it's good (opinion) / I'm <b>thinking</b> about it (process). I <b>have</b> a car / I'm <b>having</b> lunch.</p>`,[
    M("I ___ what you mean.","understand",["am understanding","understanding","am understand"],"‘Understand’ is stative."),
    M("This bag ___ to my sister.","belongs",["is belonging","belong","belonging"],"‘Belong’ is stative."),
    M("I ___ about changing my major.","am thinking",["think","thinks","am think"],"Thinking as a process → continuous is fine."),
    M("She ___ a new phone.","wants",["is wanting","want","wanting"],"‘Want’ is stative."),
    T("Correct it: ‘I am believing you.’ → I ___ you.","believe","‘Believe’ is stative."),
    M("We ___ dinner right now, can I call you back?","are having",["have","has","having"],"‘Have’ = eat → action → continuous OK.")])
]},
{id:"g-past", title:"Past tenses", sub:"Past simple, past continuous, used to", color:"#E3F4EA", ink:"#2F7A55", lessons:[
  L("g-pst","Past simple","⏮",`<p>Finished actions at a finished time (yesterday, in 2020, last year, ago). Regular: -ed. Irregular: learn them (go → went, buy → bought, teach → taught).</p><p>Negative/question: <b>did/didn't + base verb</b>.</p>${EX("I didn't go. Did you see it?")}`,[
    M("I ___ my homework last night.","did",["do","done","have done"],"Finished time ‘last night’."),
    M("She ___ economics at UNAND in 2024.","started",["starts","has started","start"],"Finished time ‘in 2024’."),
    M("Did you ___ the lecture?","enjoy",["enjoyed","enjoying","enjoys"],"Base verb after did."),
    T("Past of ‘buy’: Yesterday I ___ a new bag.","bought","Irregular: buy → bought."),
    T("Past of ‘teach’: My mother ___ me to cook.","taught","Irregular: teach → taught."),
    M("We ___ to the beach two weeks ago.","went",["go","gone","have gone"],"‘Ago’ → past simple."),
    T("Correct it: ‘I didn't went to class.’ → I didn't ___ to class.","go","Base verb after didn't.")]),
  L("g-pstc","Past continuous","⏸",`<p><b>was/were + -ing</b>: an action in progress at a past moment, often interrupted by a past simple action.</p>${EX("I <b>was studying</b> when the power <b>went</b> off.")}<p><b>while</b> + continuous, <b>when</b> + simple (usually).</p>`,[
    M("I ___ TV when you called.","was watching",["watched","am watching","were watching"],"Action in progress, interrupted."),
    M("While they ___ dinner, the lights went out.","were having",["had","have","was having"],"‘They’ → were."),
    M("What were you doing at 8 pm yesterday? I ___.","was working",["worked","work","am working"],"In progress at a past time."),
    T("Complete: ‘She ___ (walk) home when it started to rain.’","was walking","In progress + interruption."),
    M("When the teacher came in, the students ___.","were talking",["talked","was talking","talk"],"Plural, in progress.")]),
  L("g-used","Used to & would","↺",`<p><b>used to + base verb</b>: past habits or states that are no longer true. I <b>used to</b> live in Medan.</p><p><b>would</b>: repeated past actions only (not states). When I was a child, I <b>would</b> play outside.</p><p>Don't mix with <b>be used to + -ing</b> = be accustomed: I <b>am used to waking</b> up early.</p>`,[
    M("I ___ spend 8 hours a day on TikTok, but now I don't.","used to",["use to","am used to","was used to"],"Past habit, no longer true."),
    M("Did you ___ live in Jakarta?","use to",["used to","using to","uses to"],"After ‘did’: use to (no -d)."),
    M("I'm used to ___ up at 5 am now.","waking",["wake","woke","waken"],"Be used to + -ing."),
    M("When I was small, my grandmother ___ tell me stories every night.","would",["was","is used to","uses to"],"Repeated past action."),
    M("I ___ have long hair.","used to",["would","am used to","was used"],"A past state → used to (not would)."),
    T("Complete: ‘She didn't ___ like vegetables, but now she loves them.’","use to","didn't + use to.")])
]},
{id:"g-perfect", title:"Perfect tenses", sub:"Present perfect, past perfect", color:"#E6F1FB", ink:"#3D6FA0", lessons:[
  L("g-pp","Present perfect vs past simple","✓",`<p><b>have/has + past participle</b>: experience (I've been to Bali), result now (I've lost my key), unfinished time (this year, so far, since/for).</p><p><b>Past simple</b> for a finished time: I <b>went</b> to Bali <b>last year</b>.</p>${EX("since + start point (since 2020) · for + length (for three years)")}${ID("Kalau ada waktu yang sudah selesai (yesterday, ago, in 2019) → JANGAN pakai present perfect.")}`,[
    M("I ___ to Bali twice.","have been",["went","was","have gone"],"Life experience, no time given."),
    M("I ___ to Bali in 2023.","went",["have been","have gone","had been"],"Finished time → past simple."),
    M("She has worked at the resort ___ 2025.","since",["for","from","ago"],"Since + starting point."),
    M("They have lived here ___ ten years.","for",["since","ago","during"],"For + length of time."),
    M("___ you ever eaten durian?","Have",["Did","Do","Are"],"Experience question."),
    M("Unemployment ___ steadily since 2020.","has fallen",["fell","falls","is fall"],"Since 2020 → up to now."),
    T("Past participle of ‘write’: I have ___ three essays this week.","written","write → wrote → written."),
    T("Correct it: ‘I have seen him yesterday.’ → I ___ him yesterday.","saw","‘Yesterday’ → past simple.")]),
  L("g-ppc","Present perfect continuous","⏳",`<p><b>have/has been + -ing</b>: an activity that started in the past and continues now (or just stopped), focus on duration.</p>${EX("I've been studying for three hours. You look tired. Have you been running?")}<p>Result/number → simple: I've <b>written</b> two essays. Duration → continuous: I've <b>been writing</b> all morning.</p>`,[
    M("I ___ for this exam for two months.","have been preparing",["prepare","am preparing","prepared"],"Started in the past, still continuing."),
    M("She ___ three cups of coffee today.","has drunk",["has been drinking","drinks","is drinking"],"A number/result → simple."),
    M("Your eyes are red. ___ you been crying?","Have",["Did","Are","Has"],"Recent activity with visible result."),
    T("Complete: ‘It ___ (rain) since this morning.’","has been raining|'s been raining","Duration up to now."),
    M("How long ___ English?","have you been learning",["are you learning","do you learn","did you learn"],"Duration question.")]),
  L("g-pastp","Past perfect","⏪",`<p><b>had + past participle</b>: an action <b>before</b> another past action.</p>${EX("When I arrived, the class <b>had</b> already <b>started</b>.")}<p>Past perfect continuous: <b>had been + -ing</b> for duration before a past point: She <b>had been working</b> there for 5 years when she quit.</p>`,[
    M("When we got to the station, the train ___.","had left",["left","has left","was leaving"],"It left before we got there."),
    M("I didn't recognise him because he ___ a lot.","had changed",["changed","has changed","was changing"],"Change happened earlier."),
    M("She was tired because she ___ all night.","had been studying",["has been studying","studied","is studying"],"Duration before a past moment."),
    T("Complete: ‘By 2020, prices ___ (double).’","had doubled","By + past time → past perfect."),
    M("After he ___ dinner, he went out.","had eaten",["has eaten","eats","had eat"],"First action → past perfect.")])
]},
{id:"g-future", title:"Future forms", sub:"will, going to, future perfect", color:"#EFE8FB", ink:"#6D51A8", lessons:[
  L("g-fut","will / going to / present continuous","→",`<p><b>will</b>: decisions now, predictions (opinion), promises. I'<b>ll</b> help you.</p><p><b>going to</b>: plans already decided, predictions from evidence. Look at the clouds, it's <b>going to</b> rain.</p><p><b>present continuous</b>: fixed arrangements. I'<b>m meeting</b> my supervisor at 10.</p>`,[
    M("The phone is ringing. — I ___ get it.","'ll",["'m going to","'m getting","get"],"Decision at the moment of speaking."),
    M("I ___ study abroad next year. I've already applied.","am going to",["will","would","am go to"],"A plan already decided."),
    M("Look at the sky! It ___ rain.","is going to",["will","rains","is raining"],"Prediction from evidence."),
    M("I ___ the dentist at 3 pm tomorrow. It's booked.","am seeing",["see","will to see","would see"],"Fixed arrangement."),
    M("I think the economy ___ recover next year.","will",["is going","goes","is recovering"],"Opinion prediction with ‘I think’."),
    T("Complete: ‘Don't worry, I ___ (not tell) anyone.’ (a promise)","won't tell|will not tell","Promise → will.")]),
  L("g-futp","Future continuous & perfect","⏭",`<p><b>will be + -ing</b>: in progress at a future time. This time tomorrow I'<b>ll be flying</b> to Bali.</p><p><b>will have + past participle</b>: finished before a future time. By 2030, I <b>will have graduated</b>.</p>`,[
    M("By the end of this year, I ___ 50 IELTS practice tests.","will have done",["will do","will be doing","have done"],"Finished before a future point (by…)."),
    M("Don't call me at 9; I ___ my class then.","will be teaching",["will have taught","teach","taught"],"In progress at that time."),
    T("Complete: ‘By 2030, the population ___ (reach) 300 million.’","will have reached","By + future time."),
    M("This time next week, we ___ on the beach.","will be lying",["will lie","lie","will have lain"],"In progress at a future moment.")])
]},
{id:"g-modals", title:"Modal verbs", sub:"can, must, should, might, must have", color:"#FDE8EF", ink:"#B04A72", lessons:[
  L("g-mod1","Ability, permission, obligation","!",`<p>Ability: can / could / be able to. Permission: can / may. Obligation: <b>must</b> (speaker's rule) / <b>have to</b> (external rule). <b>Don't have to</b> = not necessary. <b>Mustn't</b> = not allowed.</p>${EX("You mustn't smoke here. You don't have to come (it's optional).")}<p>After a modal: base verb, no ‘to’ (✗ must to go).</p>`,[
    M("You ___ smoke in the hospital. It's forbidden.","mustn't",["don't have to","needn't","couldn't"],"Not allowed → mustn't."),
    M("Tomorrow is a holiday, so we ___ go to class.","don't have to",["mustn't","can't","shouldn't"],"Not necessary."),
    M("I ___ swim when I was five.","could",["can","must","may"],"Past ability."),
    M("Will you ___ finish it by Friday?","be able to",["can","could","must"],"After ‘will’ use ‘be able to’."),
    T("Correct it: ‘You must to submit it today.’ → You must ___ it today.","submit","No ‘to’ after must."),
    M("Students ___ wear a uniform at my old school. It was the rule.","had to",["must","musted","have"],"Past obligation → had to.")]),
  L("g-mod2","Advice & possibility","?",`<p>Advice: <b>should / ought to / had better</b>. Possibility: <b>might / may / could</b> (maybe). Certainty now: <b>must</b> (I'm sure it's true), <b>can't</b> (I'm sure it's not true).</p>${EX("She must be tired; she worked all night. That can't be Ali; he's in Jakarta.")}`,[
    M("You look ill. You ___ see a doctor.","should",["must to","might","can't"],"Advice."),
    M("He's been working 14 hours. He ___ be exhausted.","must",["can't","should","might not"],"Logical certainty."),
    M("That ___ be true. I saw her at home a minute ago.","can't",["mustn't","shouldn't","mightn't"],"Certain it's not true → can't."),
    M("Take an umbrella. It ___ rain later.","might",["must","can't","should to"],"Possibility."),
    M("You'd better ___ now or you'll miss the bus.","leave",["to leave","leaving","left"],"Had better + base verb.")]),
  L("g-mod3","Modal perfects","↩",`<p><b>should have + past participle</b>: regret/criticism about the past. <b>must have</b>: sure it happened. <b>can't have</b>: sure it didn't. <b>might/could have</b>: maybe it happened. <b>needn't have</b>: did it but it wasn't necessary.</p>${EX("I should have started earlier. She must have forgotten.")}${ID("Bagus untuk Speaking Part 2/3 saat bercerita tentang masa lalu dan penyesalan.")}`,[
    M("I failed the test. I ___ harder.","should have studied",["should study","must have studied","should studied"],"Regret about the past."),
    M("The ground is wet. It ___ last night.","must have rained",["should have rained","can't have rained","must rain"],"Sure about the past."),
    M("She ___ the email; she was offline all day.","can't have read",["must have read","should have read","can't read"],"Sure it didn't happen."),
    T("Complete: ‘He's late. He ___ (might / miss) the bus.’","might have missed","Possibility about the past."),
    M("You ___ brought food; we had plenty.","needn't have",["mustn't have","shouldn't","can't have"],"It wasn't necessary, but you did.")])
]},
{id:"g-questions", title:"Questions", sub:"Question forms, indirect questions, tags", color:"#FFF4CF", ink:"#8A6A12", lessons:[
  L("g-qf","Question forms","?",`<p>Question word + <b>auxiliary</b> + subject + verb: Where <b>do</b> you live? What <b>did</b> she say? How long <b>have</b> you been here?</p><p><b>Subject questions</b> (asking about the subject) have no do/did: <b>Who called</b> you? <b>What happened</b>?</p>`,[
    O("Where did you buy that bag?","Question word + did + subject + base verb."),
    M("Who ___ the window?","broke",["did break","did broke","breaked"],"Subject question → no ‘did’."),
    M("What ___ you do last weekend?","did",["do","were","have"],"Past question."),
    M("How long ___ studying English?","have you been",["you have been","are you","did you"],"Present perfect continuous question."),
    T("Correct it: ‘Where you live?’ → Where ___ you live?","do","You need the auxiliary ‘do’."),
    M("What ___ to you yesterday?","happened",["did happen","did happened","happen"],"Subject question.")]),
  L("g-indq","Indirect questions","…?",`<p>After <i>Can you tell me / I wonder / Do you know</i>, use <b>statement order</b> (subject + verb), no do/did.</p>${EX("Where is the library? → Can you tell me where <b>the library is</b>?")}${EX("Did he come? → I wonder <b>if/whether he came</b>.")}`,[
    M("Can you tell me where ___?","the station is",["is the station","does the station be","the station"],"Statement order."),
    M("I wonder what time ___.","the class starts",["does the class start","starts the class","the class does start"],"No ‘does’ in indirect questions."),
    O("Do you know why she left early?","Statement order: she left."),
    M("Could you tell me ___ the exam is difficult?","whether",["that","does","is"],"Yes/no question → if/whether."),
    T("Make it indirect: ‘What did he say?’ → I don't know what he ___.","said","Statement order and past form.")]),
  L("g-tag","Question tags","…, isn't it?",`<p>Positive sentence → negative tag; negative → positive. Use the same auxiliary.</p>${EX("You're a student, <b>aren't you</b>? She didn't come, <b>did she</b>? Let's go, <b>shall we</b>? I'm right, <b>aren't I</b>?")}`,[
    M("It's hot today, ___?","isn't it",["is it","doesn't it","wasn't it"],"Positive → negative tag."),
    M("You haven't finished, ___?","have you",["haven't you","did you","do you"],"Negative → positive."),
    M("She works at a resort, ___?","doesn't she",["isn't she","don't she","does she"],"Present simple → does."),
    M("Let's start, ___?","shall we",["will we","don't we","let we"],"Let's → shall we."),
    M("I'm late, ___?","aren't I",["am not I","isn't I","don't I"],"Special form: aren't I.")])
]},
{id:"g-passive", title:"Passive voice", sub:"Tenses, modals, reporting, causative", color:"#E3F4EA", ink:"#2F7A55", lessons:[
  L("g-pas","Passive in all tenses","⇄",`<p><b>be (in the right tense) + past participle</b>. Use it when the action matters more than who did it (very common in IELTS Writing Task 1 processes).</p>${EX("is made · was built · has been done · is being repaired · will be sent · must be finished")}${ID("Passive = di-…: ‘Rumah itu dibangun tahun 1990’ → The house was built in 1990.")}`,[
    M("Coffee ___ in Sumatra.","is grown",["grows","is grew","grown"],"Present passive."),
    M("The bridge ___ in 1995.","was built",["built","is built","has built"],"Past passive."),
    M("The new library ___ at the moment.","is being built",["is built","builds","is building"],"Present continuous passive."),
    M("All the forms ___ already.","have been checked",["have checked","are checking","has been checked"],"Present perfect passive, plural."),
    T("Make it passive: ‘They will announce the results tomorrow.’ → The results ___ tomorrow.","will be announced","will be + past participle."),
    M("First, the beans ___ and then they are roasted.","are dried",["dry","are drying","dried"],"Process description → present passive."),
    M("This essay must ___ by Friday.","be submitted",["submitted","submit","been submitted"],"Modal passive: must be + pp.")]),
  L("g-rep-pas","It is said that…","📢",`<p>Formal reporting: <b>It is said / believed / reported / expected that</b> + clause. Or: <b>Subject + is said to + verb</b> / <b>to have + pp</b> (past).</p>${EX("It is believed that the economy will grow. → The economy is believed to grow / The company is said to have lost money.")}`,[
    M("It ___ that prices will rise next year.","is expected",["expects","is expecting","expected"],"It + passive reporting verb."),
    M("The president is reported ___ the country yesterday.","to have left",["to leave","leaving","that he left"],"Past action → to have + pp."),
    M("Bali ___ to be one of the most beautiful islands.","is said",["says","is saying","said"],"Subject + is said to…"),
    T("Complete: ‘It is ___ (believe) that coffee came from Ethiopia.’","believed","It is believed that…")]),
  L("g-caus","Causative have / get","✂",`<p><b>have/get + object + past participle</b>: someone else does it for you.</p>${EX("I <b>had my hair cut</b>. She <b>got her laptop repaired</b>.")}<p>have + person + base verb: I <b>had the mechanic check</b> the car.</p>`,[
    M("I ___ yesterday.","had my hair cut",["cut my hair by someone","had cut my hair","had my hair cutting"],"Have + object + pp."),
    M("We need to ___ before the guests arrive.","get the room cleaned",["get clean the room","get the room clean by","have cleaned the room by"],"Get + object + pp."),
    T("Complete: ‘She is having her car ___ (repair).’","repaired","Causative → past participle."),
    M("The manager had his assistant ___ the emails.","answer",["answered","to answer","answering"],"Have + person + base verb.")])
]},
{id:"g-cond", title:"Conditionals", sub:"Zero, first, second, third, mixed, wish", color:"#E6F1FB", ink:"#3D6FA0", lessons:[
  L("g-c01","Zero & first","if",`<p><b>Zero</b> (always true): If + present, present. If you heat ice, it melts.</p><p><b>First</b> (real future): If + present, <b>will</b> + verb. If it rains, I'll stay home. ✗ If it will rain…</p><p><b>unless</b> = if not. <b>as long as / provided that</b> = only if.</p>`,[
    M("If you ___ water to 100°C, it boils.","heat",["will heat","heated","would heat"],"Zero conditional."),
    M("If it ___ tomorrow, we will cancel the trip.","rains",["will rain","rained","would rain"],"No ‘will’ after if."),
    M("I'll call you if I ___ time.","have",["will have","had","would have"],"First conditional."),
    M("You won't pass ___ you study.","unless",["if","as long","provided"],"Unless = if not."),
    T("Complete: ‘If you study every day, you ___ (improve) quickly.’","will improve|'ll improve","First conditional result.")]),
  L("g-c2","Second conditional","💭",`<p>Unreal/unlikely present or future: If + <b>past</b>, <b>would</b> + verb.</p>${EX("If I <b>had</b> more time, I <b>would</b> learn Japanese. If I <b>were</b> you, I'd apply.")}${ID("Walaupun pakai bentuk lampau, artinya BUKAN masa lalu, tapi khayalan sekarang. Gunakan ‘were’ untuk semua subjek (If I were…).")}`,[
    M("If I ___ rich, I would travel the world.","were",["am","will be","would be"],"Unreal present → were."),
    M("If she studied harder, she ___ a higher band.","would get",["will get","gets","got"],"Second conditional result."),
    M("What would you do if you ___ the lottery?","won",["win","will win","would win"],"Imaginary situation."),
    T("Complete: ‘If I ___ (be) the president, I would improve education.’","were","If I were…"),
    M("If I ___ you, I'd take the job.","were",["was being","am","would be"],"Advice form.")]),
  L("g-c3","Third & mixed","⏮💭",`<p><b>Third</b> (unreal past): If + <b>had + pp</b>, <b>would have + pp</b>. If I <b>had studied</b>, I <b>would have passed</b>.</p><p><b>Mixed</b> (past → present result): If I <b>had taken</b> the job, I <b>would be</b> rich now.</p>`,[
    M("If I had known, I ___ you.","would have told",["would tell","will tell","had told"],"Third conditional."),
    M("If she ___ the bus, she wouldn't have been late.","hadn't missed",["didn't miss","wouldn't miss","hasn't missed"],"If + had + pp."),
    M("If I had saved money last year, I ___ a laptop now.","would have",["would have had","will have","had"],"Mixed: past condition, present result."),
    T("Complete: ‘We would have won if we ___ (play) better.’","had played","If + had + pp."),
    M("Which sentence is correct?","If I had woken up earlier, I wouldn't have missed the class.",["If I would have woken up earlier, I wouldn't miss the class.","If I woke up earlier, I wouldn't have missed the class yesterday.","If I had woke up earlier, I wouldn't have missed the class."],"No ‘would’ in the if-clause; had + past participle.")]),
  L("g-wish","Wish & if only","🌠",`<p>Wish about now: <b>wish + past</b> (I wish I <b>had</b> more time). About the past: <b>wish + past perfect</b> (I wish I <b>had studied</b>). Complaint/annoyance: <b>wish + would</b> (I wish you <b>would</b> stop).</p>`,[
    M("I wish I ___ speak French.","could",["can","will","would can"],"Wish about the present."),
    M("I wish I ___ so much time on my phone last year.","hadn't spent",["didn't spend","don't spend","wouldn't spend"],"Regret about the past."),
    M("If only it ___ raining!","would stop",["stops","will stop","stopped to"],"Annoyance → would."),
    T("Complete: ‘I wish I ___ (live) closer to campus.’","lived","Present wish → past.")])
]},
{id:"g-clauses", title:"Clauses", sub:"Relative clauses, reported speech, noun clauses", color:"#EFE8FB", ink:"#6D51A8", lessons:[
  L("g-rel","Relative clauses","who/which",`<p><b>who</b> (people), <b>which</b> (things), <b>that</b> (both, defining only), <b>whose</b> (possession), <b>where</b> (place), <b>when</b> (time).</p><p><b>Defining</b> (no commas): The student <b>who sits next to me</b> is from Medan. <b>Non-defining</b> (commas, extra info, no ‘that’): My mother, <b>who is a teacher</b>, …</p>${ID("Jangan ulang subjek: ✗ The man who he called me… ✓ The man who called me…")}`,[
    M("The woman ___ lives next door is a doctor.","who",["which","whose","where"],"People → who."),
    M("This is the town ___ I was born.","where",["which","who","when"],"Place → where."),
    M("He's the student ___ laptop was stolen.","whose",["who","who's","which"],"Possession → whose."),
    M("Padang, ___ is famous for rendang, is my hometown.","which",["that","who","where"],"Non-defining → which, not that."),
    T("Correct it: ‘The book that I bought it is good.’ → The book that I ___ is good.","bought","Don't repeat the object."),
    M("I remember the day ___ we met.","when",["which","where","who"],"Time → when."),
    M("Choose the correct sentence.","My brother, who lives in Jakarta, is an engineer.",["My brother who lives in Jakarta, is an engineer.","My brother, that lives in Jakarta, is an engineer.","My brother, who he lives in Jakarta, is an engineer."],"Commas on both sides; no ‘that’; no extra ‘he’.")]),
  L("g-rep","Reported speech","“ ”",`<p>Backshift when the reporting verb is past: am/is → was, will → would, can → could, present perfect/past → past perfect. Change pronouns and time words (tomorrow → the next day).</p>${EX("“I'm tired,” she said. → She said (that) she <b>was</b> tired.")}<p>Questions: statement order. He asked <b>where I lived</b>. Commands: told me <b>to</b> + verb.</p>`,[
    M("“I will help you,” he said. → He said he ___ help me.","would",["will","can","had"],"will → would."),
    M("“I have finished,” she said. → She said she ___.","had finished",["has finished","finished","finishes"],"Present perfect → past perfect."),
    M("“Where do you live?” → He asked me where ___.","I lived",["did I live","do I live","I live did"],"Statement order + backshift."),
    M("“Don't be late.” → The teacher told us ___ late.","not to be",["don't be","to not being","not be"],"Told + not to + verb."),
    T("“I can swim,” he said. → He said he ___ swim.","could","can → could.")]),
  L("g-noun","Noun clauses","what…",`<p>A whole clause can be a subject or object: <b>What</b> he said surprised me. I don't know <b>whether</b> she will come. <b>The fact that</b> prices rose is worrying.</p><p>Use <b>what</b> (= the thing that), not ‘that’ or ‘which’, when there is no noun before it.</p>`,[
    M("___ you need is more practice.","What",["That","Which","The thing what"],"What = the thing that."),
    M("I'm not sure ___ the shop is open today.","whether",["what","that","which"],"Yes/no idea → whether/if."),
    M("___ she won the award surprised everyone.","That",["What","Which","It"],"‘That + full clause’ as subject."),
    T("Complete: ‘I can't believe ___ he said.’ (the thing that)","what","What = the thing that.")])
]},
{id:"g-verbs", title:"Verb patterns", sub:"Gerund or infinitive", color:"#FDE8EF", ink:"#B04A72", lessons:[
  L("g-ger","Gerund or infinitive","-ing/to",`<p>+ <b>-ing</b>: enjoy, avoid, finish, mind, suggest, consider, keep, practise, deny, after prepositions (interested <b>in learning</b>), as a subject (<b>Reading</b> is fun).</p><p>+ <b>to</b>: want, decide, plan, hope, agree, refuse, afford, manage, promise, need, would like.</p>${ID("Ingat ‘look forward to + -ing’: I look forward to hearing from you (to di sini preposisi).")}`,[
    M("I enjoy ___ novels.","reading",["to read","read","reads"],"Enjoy + -ing."),
    M("She decided ___ economics.","to study",["studying","study","studied"],"Decide + to."),
    M("I'm looking forward to ___ you.","seeing",["see","saw","seen"],"Look forward to + -ing."),
    M("They can't afford ___ a new car.","to buy",["buying","buy","bought"],"Afford + to."),
    M("He suggested ___ a break.","taking",["to take","take","took"],"Suggest + -ing."),
    T("Complete: ‘She is good at ___ (explain) things.’","explaining","After a preposition → -ing."),
    M("I avoid ___ sugary drinks now.","drinking",["to drink","drink","drunk"],"Avoid + -ing.")]),
  L("g-ger2","Verbs that change meaning","⇆",`<p><b>stop doing</b> (quit) / <b>stop to do</b> (pause in order to). <b>remember doing</b> (memory of the past) / <b>remember to do</b> (don't forget). <b>try doing</b> (experiment) / <b>try to do</b> (make an effort). <b>regret to tell</b> (formal bad news) / <b>regret doing</b> (sorry about the past).</p>`,[
    M("I stopped ___ TikTok because it wasted my time.","using",["to use","use","used"],"Quit an activity → stop + -ing."),
    M("On the way home, I stopped ___ some fruit.","to buy",["buying","buy","bought"],"Stopped in order to buy."),
    M("Remember ___ the door when you leave.","to lock",["locking","lock","locked"],"Don't forget → remember to."),
    M("I remember ___ to the beach as a child.","going",["to go","go","went"],"Memory of the past → -ing."),
    M("If you can't sleep, try ___ a book.","reading",["to read","read","reads"],"Experiment → try + -ing.")])
]},
{id:"g-compare", title:"Comparing & quantity", sub:"Comparatives, superlatives, much/many", color:"#FFF4CF", ink:"#8A6A12", lessons:[
  L("g-comp","Comparatives & superlatives",">",`<p>Short: cheap → cheaper → the cheapest; big → bigger. Long: expensive → <b>more</b> expensive → <b>the most</b> expensive. Irregular: good → better → best, bad → worse → worst, far → further.</p><p>(not) as + adj + as: not as high as. Big differences: <b>much / far / significantly</b> higher. Small: <b>slightly</b> higher.</p>${ID("Untuk IELTS Task 1: ‘significantly higher than’, ‘slightly lower than’, ‘twice as high as’.")}`,[
    M("Jakarta is ___ than Padang.","bigger",["more big","biggest","more bigger"],"Short adjective → -er (double g)."),
    M("This is the ___ restaurant in town.","most expensive",["expensivest","more expensive","most expensivest"],"Long adjective → the most."),
    M("My English is ___ than last year.","better",["more good","gooder","best"],"good → better."),
    M("Sales in 2024 were ___ higher than in 2023.","slightly",["slight","more slightly","very"],"Adverbs of degree before comparatives: slightly/much/far."),
    M("Rice is not as expensive ___ meat.","as",["than","like","so"],"as … as."),
    T("Complete: ‘This was the ___ (bad) day of my life.’","worst","bad → worse → worst."),
    M("Prices in 2025 were twice ___ in 2015.","as high as",["higher than","as higher as","high as"],"twice as + adj + as.")]),
  L("g-quant","Quantifiers","∑",`<p>Countable: many, few, a few, several, a number of. Uncountable: much, little, a little, an amount of. Both: a lot of, some, any, plenty of, no.</p><p><b>few/little</b> = not enough (negative). <b>a few/a little</b> = some (positive).</p><p><b>amount</b> + uncountable (the amount of money); <b>number</b> + countable (the number of people).</p>`,[
    M("There are ___ students in the library today.","few",["little","much","a little"],"Countable, ‘not many’."),
    M("I have ___ money, so I can buy you a coffee.","a little",["few","a few","many"],"Uncountable, positive."),
    M("The ___ of cars on the road has doubled.","number",["amount","quantity of","much"],"Cars are countable → number."),
    M("How ___ sugar do you take?","much",["many","few","number"],"Uncountable."),
    T("Correct it: ‘The amount of people is increasing.’ → The ___ of people is increasing.","number","People are countable.")])
]},
{id:"g-prep", title:"Prepositions", sub:"Time, place, dependent prepositions", color:"#E3F4EA", ink:"#2F7A55", lessons:[
  L("g-pt","in / on / at","📍",`<p>Time: <b>at</b> 5 pm, at night, at the weekend (UK). <b>on</b> Monday, on 6 November, on my birthday. <b>in</b> November, in 2026, in the morning, in summer.</p><p>Place: <b>at</b> a point (at the station, at university), <b>on</b> a surface/line (on the table, on the coast), <b>in</b> an enclosed space/city/country (in the room, in Padang).</p>`,[
    M("My class starts ___ 9.20.","at",["on","in","by"],"Clock time → at."),
    M("I was born ___ 2006.","in",["on","at","since"],"Year → in."),
    M("We have a test ___ Friday morning.","on",["in","at","by"],"Specific day → on."),
    M("She lives ___ West Sumatra.","in",["at","on","to"],"Region → in."),
    M("The meeting is ___ 6 November.","on",["in","at","by"],"Dates → on."),
    M("I'll meet you ___ the bus stop.","at",["in","on","to"],"A point → at."),
    T("Complete: ‘I usually study ___ night.’","at","At night (but in the evening).")]),
  L("g-dep","Dependent prepositions","+prep",`<p>Learn these as chunks: interested <b>in</b>, good <b>at</b>, depend <b>on</b>, responsible <b>for</b>, afraid <b>of</b>, different <b>from</b>, married <b>to</b>, focus <b>on</b>, result <b>in</b>, contribute <b>to</b>, consist <b>of</b>, lead <b>to</b>, an increase <b>in</b> (the thing), an increase <b>of</b> (the amount).</p>${EX("There was an increase <b>in</b> sales <b>of</b> 20%.")}`,[
    M("I'm interested ___ behavioural economics.","in",["on","at","about"],"Interested in."),
    M("Success depends ___ hard work.","on",["of","in","from"],"Depend on."),
    M("She is responsible ___ the cashbook.","for",["of","to","about"],"Responsible for."),
    M("Pollution can lead ___ health problems.","to",["in","on","for"],"Lead to."),
    M("There was a rise ___ unemployment.","in",["of","on","at"],"A rise in + the thing."),
    M("Unemployment rose ___ 2%.","by",["in","of","on"],"Rose by + the size of the change."),
    T("Complete: ‘This course consists ___ ten units.’","of","Consist of.")])
]},
{id:"g-link", title:"Linking & punctuation", sub:"although, despite, however, because of, commas", color:"#E6F1FB", ink:"#3D6FA0", lessons:[
  L("g-con","Contrast","⚖",`<p><b>although / even though / while</b> + clause. <b>despite / in spite of</b> + noun or -ing. <b>However</b> starts a new sentence (followed by a comma). <b>whereas</b> compares two facts.</p>${EX("Although it rained, we went out. Despite the rain, we went out. It rained. However, we went out.")}${ID("✗ Despite it rained. ✓ Despite the rain / Despite the fact that it rained.")}`,[
    M("___ the heavy traffic, she arrived on time.","Despite",["Although","However","Even though"],"Despite + noun."),
    M("___ he studied hard, he failed.","Although",["Despite","In spite of","However"],"Although + clause."),
    M("The plan was cheap. ___, it was not effective.","However",["Although","Despite","Whereas"],"New sentence + comma."),
    M("Men spent 20 hours, ___ women spent 35.","whereas",["despite","however","in spite"],"Comparing two facts."),
    T("Correct it: ‘Despite it was late, we continued.’ → ___ it was late, we continued.","Although|Even though|Though","Before a clause use although."),
    M("In spite of ___ tired, she finished the essay.","being",["she was","be","to be"],"In spite of + -ing.")]),
  L("g-cause","Cause, result, purpose","∴",`<p>Cause: <b>because / since / as</b> + clause; <b>because of / due to / owing to</b> + noun. Result: <b>so, therefore, as a result, consequently</b>. Purpose: <b>to / in order to</b> + verb; <b>so that</b> + clause.</p>${EX("Due to inflation, prices rose. Prices rose; therefore, demand fell.")}`,[
    M("The flight was delayed ___ bad weather.","because of",["because","so","therefore"],"Because of + noun."),
    M("She saved money ___ she could buy a laptop.","so that",["in order to","because of","due to"],"So that + clause."),
    M("I woke up early ___ study.","to",["so that","for","because"],"Purpose with a verb → to."),
    M("Prices increased. ___, people bought less.","As a result",["Due to","Because","So that"],"Result linker starting a sentence."),
    T("Complete: ‘The match was cancelled ___ to the rain.’","due|owing","Due to / owing to + noun.")]),
  L("g-punct","Sentences & punctuation","✍",`<p>A sentence needs a subject and a finite verb. Don't join two full sentences with only a comma (<b>comma splice</b>): ✗ I was tired, I went to bed. ✓ I was tired, <b>so</b> I went to bed. / I was tired; I went to bed.</p><p>Comma after a fronted clause: <b>If it rains,</b> we stay. Comma before ‘which’ in non-defining clauses. No comma before ‘that’.</p>`,[
    M("Choose the correct sentence.","Prices rose sharply, so demand fell.",["Prices rose sharply, demand fell.","Prices rose sharply so, demand fell.","Prices rose sharply demand fell."],"Join with a linker, not just a comma."),
    M("Choose the correct sentence.","Although the test was hard, most students passed.",["Although the test was hard most students, passed.","Although, the test was hard most students passed.","The test was hard although, most students passed."],"Comma after the fronted clause."),
    M("Which is a complete sentence?","The number of tourists increased in 2024.",["Because the number of tourists increased.","The number of tourists increasing in 2024.","Which increased in 2024."],"It has a subject and a finite verb."),
    M("Choose the correct one.","I love Padang; the food is amazing.",["I love Padang, the food is amazing.","I love Padang the food is amazing.","I love Padang; and the food is amazing."],"A semicolon can join two full sentences.")])
]},
{id:"g-adv", title:"Advanced (band 8–9)", sub:"Inversion, cleft, participle clauses, academic style", color:"#EFE8FB", ink:"#6D51A8", lessons:[
  L("g-inv","Inversion","↕",`<p>After negative adverbs at the start, use question order: <b>Never have I</b> seen… <b>Not only did</b> prices rise, but… <b>Rarely do</b> people… <b>No sooner had</b> I arrived <b>than</b>… <b>Only after</b> the crisis <b>did</b> the bank act.</p><p>Formal conditional: <b>Had I known</b> (= If I had known), <b>Should you need</b> help…</p>`,[
    M("Never ___ such a beautiful beach.","have I seen",["I have seen","I saw","seen I have"],"Negative adverb → inversion."),
    M("Not only ___ prices, but it also reduced quality.","did the company raise",["the company raised","raised the company","the company did raise"],"Not only + did + subject + verb."),
    M("___ I known, I would have helped.","Had",["If","Have","Would"],"Had I known = If I had known."),
    M("Rarely ___ people read newspapers nowadays.","do",["are","did","have"],"Rarely + do + subject."),
    M("No sooner had she arrived ___ it started to rain.","than",["when","then","that"],"No sooner … than.")]),
  L("g-cleft","Cleft sentences","☝",`<p>Emphasise one part: <b>It was</b> my mother <b>who</b> taught me. <b>What</b> I need <b>is</b> more practice. <b>The reason why</b> I chose economics <b>is that</b>… <b>All</b> I want <b>is</b>…</p>${ID("Bagus untuk Speaking: ‘What I really love about my hometown is the food.’")}`,[
    M("___ I like most about Padang is the food.","What",["That","Which","It"],"What-cleft."),
    M("It was my teacher ___ encouraged me to study abroad.","who",["which","what","whom she"],"It was + person + who."),
    M("The reason why I chose economics ___ I love numbers.","is that",["is because of","because","is due"],"The reason … is that."),
    O("What I need is more practice","What + clause + is + noun.",["More practice is what I need"])]),
  L("g-part","Participle clauses","~ing",`<p>Shorten clauses with -ing (active) or past participle (passive). The subject must be the same!</p>${EX("<b>Feeling</b> tired, I went to bed. (= Because I felt tired…) · <b>Built</b> in 1900, the house is very old. · <b>Having finished</b> the essay, she relaxed.")}<p>✗ Walking to campus, the rain started. (The rain wasn't walking!)</p>`,[
    M("___ in 1920, the building is now a museum.","Built",["Building","Having built","To build"],"Passive meaning → past participle."),
    M("___ her homework, she went out.","Having finished",["Finished","Having finishing","Finish"],"Completed before → having + pp."),
    M("Which sentence is correct?","Walking to campus, I saw an accident.",["Walking to campus, an accident happened.","Walked to campus, I saw an accident.","Walking to campus, the accident was seen by me."],"The person walking must be the subject."),
    M("Students ___ late will not be allowed in.","arriving",["arrived","arrive","are arriving"],"= students who arrive late.")]),
  L("g-acad","Academic style","🎓",`<p><b>Nominalisation</b>: use nouns for an academic tone. “Prices rose quickly” → “There was a rapid rise in prices.”</p><p><b>Hedging</b>: tends to, is likely to, may, it could be argued that, appears to.</p><p>Avoid: contractions (don't → do not), ‘a lot of’ → a large number of / a great deal of, ‘things’ → factors/issues.</p>`,[
    M("Which is more academic?","There was a dramatic increase in unemployment.",["Unemployment went up a lot.","Lots of people lost jobs.","Unemployment, it went up big time."],"Nominalisation + precise vocabulary."),
    M("Choose the best hedged claim.","Social media is likely to affect young people's sleep.",["Social media destroys every teenager's sleep.","Social media definitely ruins sleep.","Social media is always bad for sleep."],"Hedging avoids over-claiming."),
    M("Replace ‘a lot of’ in formal writing:","a considerable number of",["lots of","loads of","plenty of the"],"Formal quantity expression (countable)."),
    T("Nominalise: ‘The government decided to…’ → The government's ___ to…","decision","decide → decision.")]),
  L("g-para","Parallel structure","∥",`<p>Items in a list or pair must have the same form.</p>${EX("✗ I like reading, to swim and cook. ✓ I like reading, swimming and cooking.")}${EX("not only … but also / both … and / either … or + same form")}`,[
    M("She enjoys hiking, cooking and ___.","painting",["to paint","paints","she paints"],"Parallel -ing forms."),
    M("The policy is cheap, effective and ___.","easy to implement",["it is easy to implement","implementing easily","easily"],"Parallel adjectives."),
    M("He is not only smart ___ hardworking.","but also",["and also","but","also"],"Not only … but also."),
    T("Correct it: ‘I want to study, travel and seeing the world.’ → I want to study, travel and ___ the world.","see","Parallel base verbs after ‘to’.")])
]},
{id:"g-traps", title:"Indonesian learner traps", sub:"The mistakes examiners hear the most", color:"#FDE8EF", ink:"#B04A72", lessons:[
  L("g-trap1","Top 10 mistakes","⚠",`<p>1) Forgetting -s: He work → works. 2) Forgetting plurals: many student → students. 3) Tense mixing in stories. 4) ‘one of the + plural’: one of the best <b>places</b>. 5) ‘every + singular’: every <b>student</b>. 6) make vs do: make a decision / do homework. 7) ‘discuss’ has no ‘about’. 8) ‘very’ + strong adjective (very delicious → absolutely delicious). 9) ‘more better’ → better. 10) ‘I am agree’ → I agree.</p>${ID("Di Speaking, kesalahan kecil yang diulang-ulang menurunkan skor Grammatical Range & Accuracy. Fokus perbaiki 10 ini dulu.")}`,[
    M("Padang is one of the most beautiful ___ in Indonesia.","cities",["city","citys","the city"],"One of the + plural noun."),
    M("Every ___ has to submit an essay.","student",["students","the students","of student"],"Every + singular."),
    M("I ___ with you.","agree",["am agree","am agreeing with","agreed to"],"‘Agree’ is a verb, not an adjective."),
    M("We need to ___ a decision soon.","make",["do","take on","get"],"Make a decision."),
    M("Let's discuss ___ plan.","the",["about the","on the","of the"],"Discuss + object (no ‘about’)."),
    M("The food was ___ delicious.","absolutely",["very","too much","very very"],"Strong adjectives take absolutely/really."),
    T("Correct it: ‘My life is more better now.’ → My life is ___ now.","better","No ‘more’ with -er."),
    M("Yesterday I ___ to the market and bought some fish.","went",["go","have gone","goes"],"Keep the tense consistent in past stories: went … bought.")])
]}
];

async function aiItems(l){
  const ai = window.__ielts && window.__ielts.ai; if(!ai) throw Object.assign(new Error("nokey"), {code:"nokey"});
  const plain = String(l.learn).replace(/<[^>]+>/g," ").replace(/\s+/g," ").slice(0,900);
  const r = await ai(`You are a strict, accurate English grammar teacher for Azel (Indonesian university student, aiming for IELTS band 9). Every question must have exactly ONE correct answer. Return only JSON.`,
    [{text:`Write 8 new practice questions for the grammar lesson "${l.title}". Rule summary: ${plain}\nMix types: "mc" (4 options, one correct) and "fill" (type one word or a short phrase). Use everyday and academic/IELTS contexts (economics, university, Indonesia). Short explanation in simple English.\nJSON {"items":[{"type":"mc"|"fill","q":"sentence with ___ for the gap","a":"correct answer","opts":["4 options incl. the answer, only for mc"],"alt":["other fully correct answers, only for fill"],"why":"short reason"}]}`}], {temp:0.8});
  return (r.items || []).filter(x => x && x.q && x.a).slice(0, 8).map(x => x.type==="mc" && Array.isArray(x.opts) && x.opts.includes(x.a)
    ? {type:"mc", q:String(x.q), a:String(x.a), opts:x.opts.map(String).slice(0,4), why:String(x.why||""), safe:true}
    : {type:"input", q:String(x.q), a:String(x.a), alt:(x.alt||[]).map(String), why:String(x.why||""), safe:true});
}

// Strict sentence checker: finds grammar errors and links them to lessons
async function checkText(){
  const t = document.getElementById("grIn") ? document.getElementById("grIn").value.trim() : "";
  const out = document.getElementById("grOut"); if(!out) return;
  if(!t){ out.innerHTML = `<p class="small muted">Write a few sentences first.</p>`; return; }
  const esc = window.__plannerAPI.esc, ai = window.__ielts && window.__ielts.ai;
  if(!ai){ out.innerHTML = `<p class="small neg">Add your AI key in IELTS → Settings first.</p>`; return; }
  out.innerHTML = `<p class="small muted">Pita is checking every sentence…</p>`;
  const lessons = units.flatMap(u => u.lessons.map(l => l.id+": "+l.title)).join("; ");
  try{
    const r = await ai(`You are a strict IELTS grammar examiner for Azel (Indonesian). Find EVERY grammar, article, preposition, agreement, tense and punctuation error. Don't change her ideas or style unless it is wrong. Never insult. Explanations in simple English plus a short Bahasa Indonesia note. Return only JSON.`,
      [{text:`Text:\n"""${t.slice(0,3000)}"""\nLessons available: ${lessons}\nJSON {"errors":[{"wrong":"exact wrong words","right":"correction","rule":"short rule","id":"short Bahasa Indonesia explanation","lesson":"lesson id from the list or empty"}],"corrected":"the full corrected text","band":"estimated IELTS Grammatical Range & Accuracy band (number)","tip":"one priority to work on, in simple English"}`}], {temp:0.2});
    const errs = r.errors || [];
    out.innerHTML = `<div class="vsec"><h3>${errs.length ? errs.length+" mistake"+(errs.length>1?"s":"") : "No mistakes found"}${r.band ? ` · grammar band ≈ ${esc(String(r.band))}` : ""}</h3>
      ${errs.map(e => `<div class="vchange"><s>${esc(String(e.wrong||""))}</s> → <b>${esc(String(e.right||""))}</b><div class="small">${esc(String(e.rule||""))}</div>${e.id ? `<div class="vid">${esc(String(e.id))}</div>` : ""}${e.lesson && units.some(u => u.lessons.some(l => l.id===e.lesson)) ? `<button class="linkbtn small" type="button" data-lx="open" data-c="grammar" data-l="${esc(e.lesson)}">Practise this rule →</button>` : ""}</div>`).join("")}</div>
      ${r.corrected ? `<div class="vsec"><h3>Corrected text</h3><div class="card soft">${esc(String(r.corrected))}</div></div>` : ""}
      ${r.tip ? `<p class="small"><b>Focus next:</b> ${esc(String(r.tip))}</p>` : ""}`;
  }catch(e){ out.innerHTML = `<p class="small neg">${esc(window.__ielts.errMsg ? window.__ielts.errMsg(e) : "The AI couldn't answer.")}</p>`; }
}

window.Learn.register({id:"grammar", title:"Grammar", kicker:"Every rule, from basics to band 9", tutor:"English grammar teacher", units, aiItems,
  extraHtml(){ return `<div class="section"><h2>Check my grammar</h2><div class="card"><p class="small muted">Paste a Writing answer or what you said in Speaking. Pita marks every mistake strictly and links it to the lesson that fixes it.</p><textarea class="in" id="grIn" rows="5" placeholder="e.g. Nowadays, many people thinks that technology make our life more easier…"></textarea><div class="btn-row"><button class="btn" type="button" data-lx="grcheck" data-c="grammar">Check strictly</button></div><div id="grOut"></div></div></div>`; },
  onAction(a){ if(a==="grcheck"){ checkText(); return true; } return false; }});
})();
