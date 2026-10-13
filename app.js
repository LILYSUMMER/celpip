(function(){
'use strict';
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function fmt(s){return Math.floor(s/60)+':'+('0'+Math.floor(s%60)).slice(-2)}
function pickN(a,n){var c=a.slice(),o=[];while(o.length<n&&c.length)o.push(c.splice(Math.floor(Math.random()*c.length),1)[0]);return o}
function one(a){return a[Math.floor(Math.random()*a.length)]}

/* ============ 보스 ============ */
var BOSSES=[
 {id:'article',n:'관사 누락',d:'a / an / the',hp:100},
 {id:'agree',n:'주어–동사 수일치',d:'Two women is → are',hp:100},
 {id:'past',n:'과거시제',d:'we buy → bought',hp:100},
 {id:'spell',n:'철자',d:'bileve · qulity · surbaey',hp:100},
 {id:'herethere',n:'Here / There 혼동',d:'Here are → There are',hp:100},
 {id:'signal',n:'Another reason 누락',d:'문단 ③ 신호탄',hp:100},
 {id:'runon',n:'런온 문장',d:'마침표 누락',hp:100},
 {id:'word',n:'단어 오용',d:'except/accept · waste/lose',hp:100},
 {id:'compar',n:'비교급',d:'more good → better',hp:80},
 {id:'prep',n:'전치사',d:'come to here → come here',hp:80},
 {id:'freeze',n:'단어 막히면 정지',d:'some kind of ___',hp:70},
 {id:'toinf',n:'동사 앞 to',d:'need fix → need to fix',hp:0},
 {id:'theyhave',n:'they have',d:'→ there is / are',hp:0},
 {id:'being',n:'be + 동사원형',d:'is grab → is grabbing',hp:0}
];
var LEVELS=[[0,'First Words'],[300,'Sentence Maker'],[600,'Sentence Builder'],[1000,'Paragraph Writer'],
 [1500,'Fluent Drafter'],[2200,'Opinion Holder'],[3000,'Argument Builder'],[4000,'Confident Speaker'],
 [5200,'Test Ready'],[6500,'CLB 7']];
var SEED=620;

/* ============ 콘텐츠 ============ */
var REPAIR=[
 ['We watched movie last weekend.','We watched a movie last weekend.','article','처음 언급 + 셀 수 있는 단수 → a'],
 ['I sent email to my client yesterday.','I sent an email to my client yesterday.','article','모음 앞 → an'],
 ['She works at coffee shop near my house.','She works at a coffee shop near my house.','article',''],
 ['I need to buy new notebook.','I need to buy a new notebook.','article',''],
 ['The traffic system downtown is good, but bus is always late.','…but the bus is always late.','article','앞에서 언급된 특정 버스 → the'],
 ['We need update notice in the lobby.','We need an updated notice in the lobby.','article','관사 + 과거분사'],
 ['Two women is sitting on the bench.','Two women are sitting on the bench.','agree','복수 주어 → are'],
 ['My cat want to sleep on my laptop.','My cat wants to sleep on my laptop.','agree','3인칭 단수 → -s'],
 ['The residents doesn\'t have a car.','Most residents don\'t have a car.','agree','복수 주어 → don\'t'],
 ['Flowers is growing in the garden.','Flowers are growing in the garden.','agree',''],
 ['My wife enjoy cooking on weekends.','My wife enjoys cooking on weekends.','agree',''],
 ['There is three plants on my desk.','There are three plants on my desk.','agree','there 뒤 복수 → are'],
 ['We buy kimchi at the Korean market yesterday.','We bought kimchi at the Korean market yesterday.','past','buy – bought'],
 ['They shown me the new office last week.','They showed me the new office last week.','past','show – showed – shown'],
 ['I decide to use AI for my English study.','I decided to use AI for my English study.','past','이미 정한 일'],
 ['The steak look very nice and the wine is delicious.','The steak looked amazing and the wine was delicious.','past','과거 이야기는 동사도 과거'],
 ['We go to the theatre and the movie is interesting.','We went to the theatre and the movie was interesting.','past',''],
 ['Yesterday breakfast is red bean paste toast.','Yesterday\'s breakfast was red bean paste toast.','past','소유격 + 과거'],
 ['I bileve this option is better.','I believe this option is better.','spell','be-lieve'],
 ['I have read the surbaey carefully.','I have read the survey carefully.','spell','sur-vey'],
 ['Information from books is better qulity.','Information from books is better quality.','spell','qual-i-ty'],
 ['It is very importent to me.','It is very important to me.','spell','-ant로 끝남'],
 ['When I look outsite, I see runners.','When I look outside, I see runners.','spell','out + side'],
 ['Moving your body makes you helther.','Moving your body makes you healthier.','spell','health + ier'],
 ['Here are so many people who want to exercise.','There are so many people who want to exercise.','herethere','"~가 있다" = there'],
 ['Here is an error in my new app.','There is an error in my new app.','herethere',''],
 ['Here was a long line at the bakery.','There was a long line at the bakery.','herethere',''],
 ['The sports centre doesn\'t except everybody.','The sports centre can\'t accept everybody.','word','except = ~을 제외하고'],
 ['We want to waste weight before summer.','We want to lose weight before summer.','word','waste = 낭비하다'],
 ['It is very surprised to us.','We were very surprised.','word','-ed는 사람의 감정'],
 ['I asked to an AI for help.','I asked an AI for help.','word','ask는 전치사 없이'],
 ['I try so hardly every morning.','I try hard every morning.','word','hardly = 거의 ~않다'],
 ['Our meals are more healthier now.','Our meals are much healthier now.','compar','more와 -er를 같이 쓰지 않음'],
 ['Books give more good information.','Books give better information.','compar','good의 비교급은 better'],
 ['This option is more easier for everyone.','This option is much easier for everyone.','compar',''],
 ['So many cars come to here every morning.','So many cars come here every morning.','prep','here 앞에 to 없음'],
 ['I write my notes using English.','I write my notes in English.','prep','언어로 쓰다 = in'],
 ['It takes thirty minutes for go to my floor.','It takes thirty minutes to get to my floor.','prep','for + 동사원형 불가'],
 ['It is useful for many ways.','It is useful in many ways.','prep',''],
 ['I understand that option A has benefits such as more income these days our knowledge comes from the internet.','I understand that option A has benefits, such as more income. These days, our knowledge comes from the internet.','runon','마침표로 끊어라'],
 ['The elevator has been broken two weeks I have to use the stairs every day.','The elevator has been broken for two weeks. I have to use the stairs every day.','runon',''],
 ['She is grab a piece of paper.','She is grabbing a piece of paper.','being','be + 동사-ing'],
 ['Two people sit on the bench and look at each other.','Two people are sitting on the bench and looking at each other.','being','사진 속 진행 중인 동작'],
 ['I need fix it immediately.','It needs to be fixed soon.','toinf','동사 사이에 to'],
 ['They have a road on the left side.','There is a road on the left side.','theyhave','"~가 있다" = there is'],
 ['In the background they have some tall trees.','In the background there are some tall trees.','theyhave','']
];
var TRAP=[
 {p:"Hi Yuna,\n\nThanks again for offering to help with the Maple Street Community Kitchen. We run it on the second and fourth Saturday of every month, from 10 a.m. to 1 p.m.\n\nYour main role would be helping the lead cook prepare vegetables and then serving. You don't need cooking experience; Marcus, our lead cook, walks everyone through it. What we do ask is that you arrive by 9:45, since we go over the day's menu before the doors open.\n\nOne thing: the centre requires all kitchen volunteers to finish a short online food-safety course and forward me the certificate. I can't add you to the schedule until I have it.\n\nThanks,\nPriya",
  q:'What must happen before Yuna can be added to the schedule?',
  o:['A) Marcus must approve her application','B) Priya must receive her course certificate','C) The centre must confirm her availability','D) She must attend one session as an observer'],a:1,
  ev:"I can't add you to the schedule until I have it.",
  why:'A는 전형적인 함정 — Marcus는 지문에 나오지만 "승인한다"는 말은 없어. 지문에 있는 이름 + 지문에 없는 행동.'},
 {p:"Hello,\n\nYour building's recycling pickup is changing. Starting November 3, pickup moves from Tuesday to Thursday morning. Bins must be out by 7 a.m.\n\nWe are also adding a soft-plastics bin in the parking garage. This is for clean plastic bags and wrap only — no food containers. Items that don't belong will cause the whole bin to be rejected, and the building is charged a $75 fee each time that happens.\n\nIf you have questions, please email the strata office rather than calling; our phone line is only staffed on Fridays.\n\nStrata Council",
  q:'Why does the notice ask residents to email instead of call?',
  o:['A) The phone line is rarely staffed','B) Emails create a written record','C) The office is closed in November','D) Calls cost the building a fee'],a:0,
  ev:'our phone line is only staffed on Fridays',
  why:'D가 매력적인 오답이야 — $75 fee가 지문에 있지만 그건 "잘못된 물건을 넣었을 때"고 전화랑 상관없어. 숫자나 단어가 지문에 있다고 그 선택지가 맞는 건 아니야.'},
 {p:"Hi Daniel,\n\nOur team is planning the annual volunteer day on Saturday, October 17, and we'd like your branch to join.\n\nWe'll be at the Riverside Community Garden from 9 a.m. to 2 p.m. Lunch is provided, but bring gloves and closed-toe shoes. Last year only twelve people signed up and we struggled to finish the planting, so this time we're hoping for twenty-five.\n\nCould you circulate this and let me know numbers by September 30? If transportation is an issue we can arrange a shuttle from the downtown office, but I'd need to book it two weeks in advance.\n\nMarisa",
  q:'In the message, "circulate" most nearly means',
  o:['A) move around in a circle','B) share with a group of people','C) print several copies','D) discuss in a meeting'],a:1,
  ev:'Could you circulate this and let me know numbers by September 30?',
  why:'단어의 제일 흔한 뜻(A)이 아니라 그 문장 안에서의 뜻을 골라야 해. 목적어가 "this"(이 안내)이고 뒤에 "let me know numbers"가 오니까 "퍼뜨리다"야.'},
 {p:"Hi,\n\nThanks for your interest in the studio space. The rate is $45 an hour, with a two-hour minimum. That includes lights and a backdrop, but not the audio kit — that's $20 extra per session.\n\nWeekends book out about three weeks ahead. Weekday mornings are usually open and I can often offer those at $35 an hour if you book more than four hours.\n\nI do need a 50% deposit to hold any date. The balance is due on the day.\n\nSam",
  q:'When can the renter get the lower hourly rate?',
  o:['A) By paying the full amount in advance','B) By booking a weekend more than three weeks ahead','C) By booking over four hours on a weekday morning','D) By skipping the audio kit'],a:2,
  ev:'Weekday mornings are usually open and I can often offer those at $35 an hour if you book more than four hours.',
  why:'조건이 두 개(평일 오전 + 4시간 초과)인데 하나만 맞는 선택지들이 섞여 있어. 조건이 여러 개면 전부 맞는 걸 골라야 해.'}
];
var READ=[
{id:'r1',title:'Moving Day',ko:'이사 날',min:10,from:'Message from Dana',
 body:"Hi Lena,\n\nThanks for offering to help on the twenty-second. I wanted to give you the details before the week gets away from me.\n\nThe truck is booked for eight in the morning, but the elevator in my building can only be reserved in two-hour blocks, and the only slot left was ten to twelve. So the plan is to carry everything down to the lobby first and load once the elevator is ours. Marcus is coming at nine with his brother, and the two of them will take the furniture. If you can be there by nine thirty, that would be perfect — the boxes are all packed and labelled, so it is really just carrying.\n\nOne thing I should warn you about: the loading zone out front is a fifteen-minute space, and the city has been ticketing it. We will have to move the truck around the corner between loads. Marcus has done this before and says it is fine, but it means someone needs to stay with the vehicle.\n\nMy new place is in Burnaby, about forty minutes out, and I have told the building manager there we will arrive around one. If we are badly behind, I will call her — she was clear that she leaves at four and will not stay late.\n\nLunch is on me. There is a good Vietnamese place two blocks from the new apartment.\n\nDana",
 qs:[
  {q:'Why is the elevator booked from ten to twelve?',
   o:['It is the only block that was still available','Loading the truck takes two hours','The building allows moves only at that time','Marcus asked for that time'],a:0,
   ev:'the only slot left was ten to twelve',
   why:'"two-hour blocks"라는 말이 지문에 있어서 B가 그럴듯해 보여. 하지만 이유는 "남은 게 그것뿐"이야.'},
  {q:'What does Dana ask Lena to do?',
   o:['Take the furniture with Marcus','Arrive by nine thirty and carry boxes','Drive the truck between loads','Pack the remaining boxes'],a:1,
   ev:'If you can be there by nine thirty, that would be perfect — the boxes are all packed and labelled, so it is really just carrying.',
   why:'A는 Marcus와 그의 형제가 할 일, D는 "boxes are all packed"라고 이미 끝났어. 누가 뭘 하는지 바꿔치기한 선택지야.'},
  {q:'Why must the truck be moved between loads?',
   o:['The truck is too large for the zone','The city is ticketing the fifteen-minute zone','Marcus needs it for the furniture','The elevator entrance is blocked'],a:1,
   ev:'the loading zone out front is a fifteen-minute space, and the city has been ticketing it',
   why:'상식으로 "트럭이 커서"를 고르기 쉬워. 지문은 단속 때문이라고 말해.'},
  {q:'What will Dana do if the move runs late?',
   o:['Ask the manager to stay past four','Call the building manager','Rebook the elevator','Arrive the next morning'],a:1,
   ev:'If we are badly behind, I will call her',
   why:'A가 핵심 함정 — 매니저는 4시에 가고 늦게까지 안 있는다고 못박았어. 전화하는 것과 남아달라고 부탁하는 건 달라.'},
  {q:'"Lunch is on me" most nearly means',
   o:['Lunch will be at Dana\'s new home','Dana will pay for lunch','Lunch depends on Dana\'s schedule','Dana will cook lunch herself'],a:1,
   ev:'Lunch is on me.',
   why:'on의 대표 뜻(~위에)으로 풀면 틀려. 관용 표현이야.'},
  {q:'What is the main purpose of this message?',
   o:['To ask Lena to find a truck','To explain the arrangements for the day','To apologise for changing the date','To ask Lena to meet the building manager'],a:1,
   ev:'I wanted to give you the details before the week gets away from me.',
   why:'목적 문제는 첫 문단에 거의 항상 답이 있어.'}],
 rhead:'Hi Dana,',
 rtext:"Thanks for sending everything through. Nine thirty works, and I'll {7} so I'm not holding anyone up.\n\nI'm happy to {8} while the truck is around the corner — I don't mind standing outside.\n\nOne thing: I finish work at seven that morning, so I may {9}. If that happens I'll message you rather than {10}.\n\nAnd thank you for lunch — {11}.\n\nSee you on the twenty-second,\nLena",
 blanks:[
  {o:['arrive a little early','book the elevator','bring my own truck','start loading at eight'],a:0,
   ev:'If you can be there by nine thirty',ko:'9시 반까지 오라고 했으니 "조금 일찍 간다"가 자연스러워.'},
  {o:['carry the furniture down','stay with the vehicle','drive to Burnaby','talk to the building manager'],a:1,
   ev:'it means someone needs to stay with the vehicle',ko:'트럭이 모퉁이에 있는 동안 누군가 차에 남아야 한다고 했어.'},
  {o:['be a few minutes late','miss the whole day','need to leave at four','arrive before eight'],a:0,
   ev:'If you can be there by nine thirty',ko:'7시에 퇴근이면 조금 늦을 수 있다는 흐름.'},
  {o:['just turning up late','booking another elevator','calling Marcus','parking around the corner'],a:0,
   ev:'I will call her',ko:'"말없이 늦게 나타나는 것보다 연락하겠다"는 대조야.'},
  {o:["I've been meaning to try that Vietnamese place",'I\'ll bring something from home','I\'ll cook at the new apartment','we can eat before we start'],a:0,
   ev:'There is a good Vietnamese place two blocks from the new apartment.',ko:'Dana가 베트남 식당을 언급했으니 그걸 받는 답장이야.'}]},

{id:'r2',title:'Studio Term',ko:'공방 학기',min:10,from:'Message from Theo',
 body:"Hi Rosa,\n\nI'm writing about the Tuesday evening pottery class you signed up for. The studio's kiln failed its inspection last week, and the replacement will not be installed until the eighteenth. Rather than cancel the term, we are moving the first three sessions to the annex on Fraser Street, where there is a working kiln but only six wheels.\n\nBecause of that, the class is split. Students whose surnames begin A through L keep the Tuesday slot; M through Z move to Thursday for those three weeks. You are in the Thursday group. After the eighteenth everyone returns to Tuesday at the main studio.\n\nThe annex has no parking of its own, but the lot behind the library is free after six and it is a short walk. I would not rely on street parking — the permit zone starts at five.\n\nYour materials fee already covers the clay for the term, so there is nothing more to pay. If Thursdays genuinely do not work, I can move you to the morning section, though it meets at ten and I know you work.\n\nLet me know by Friday either way.\n\nTheo",
 qs:[
  {q:'Why are the first three sessions moving?',
   o:['The studio has too many students','The kiln will not be replaced until the eighteenth','The annex has more wheels','The main studio is closed for the term'],a:1,
   ev:'the kiln failed its inspection last week, and the replacement will not be installed until the eighteenth',
   why:'C는 정반대야 — annex는 물레가 여섯 대뿐이라 더 적어.'},
  {q:'Which day will Rosa attend for the next three weeks?',
   o:['Tuesday','Thursday','Friday','Ten in the morning'],a:1,
   ev:'M through Z move to Thursday for those three weeks. You are in the Thursday group.',
   why:'성 첫 글자 규칙을 읽고 자기에게 적용해야 해. 규칙만 보고 Tuesday를 고르기 쉬워.'},
  {q:'What does Theo advise about parking?',
   o:["Use the annex's own lot",'Use the library lot, which is free after six','Park on the street before five','Buy a permit'],a:1,
   ev:'the lot behind the library is free after six and it is a short walk',
   why:'A는 "annex has no parking of its own"과 정반대. C는 permit zone이 5시에 시작하니 위험해.'},
  {q:'What does Rosa need to pay?',
   o:['A new materials fee','Nothing more','A fee for the annex','A parking permit'],a:1,
   ev:'Your materials fee already covers the clay for the term, so there is nothing more to pay.',
   why:'"fee"라는 단어가 여러 번 나와서 뭔가 내야 할 것 같지만 이미 포함이야.'},
  {q:'If Thursdays do not work, what does Theo offer?',
   o:['A refund','The morning section','A place in the A–L group','Starting after the eighteenth'],a:1,
   ev:'I can move you to the morning section, though it meets at ten',
   why:'지문에 없는 환불을 상식으로 떠올리기 쉬워.'},
  {q:'What is the main purpose of this message?',
   o:['To explain a temporary schedule change','To collect a fee','To cancel the term','To advertise a new studio'],a:0,
   ev:"I'm writing about the Tuesday evening pottery class you signed up for.",
   why:''}],
 rhead:'Hi Theo,',
 rtext:"Thanks for letting me know. Thursday is fine for the three weeks — I'll {7}.\n\nI'll use the {8} as you suggested, since I won't get there before six anyway.\n\nI did want to check one thing: after the eighteenth we're {9}, is that right? I'd rather not {10} if I can help it.\n\nAnd good to hear the {11}.\n\nRosa",
 blanks:[
  {o:['go to the annex on Fraser Street','keep the Tuesday slot','switch to the morning section','wait until the eighteenth'],a:0,
   ev:'we are moving the first three sessions to the annex on Fraser Street',ko:'3주간은 annex로 간다고 했어.'},
  {o:['street parking','library lot','annex lot','permit zone'],a:1,
   ev:'the lot behind the library is free after six',ko:'6시 이후 무료인 곳이야.'},
  {o:['back at the main studio on Tuesday','still at the annex','on Thursdays permanently','in the morning section'],a:0,
   ev:'After the eighteenth everyone returns to Tuesday at the main studio.',ko:'18일 이후는 원래대로야.'},
  {o:['change days again','pay more','buy a wheel','miss the first class'],a:0,
   ev:'M through Z move to Thursday for those three weeks',ko:'요일이 또 바뀌는 걸 피하고 싶다는 흐름.'},
  {o:['clay is already covered','kiln is fixed','class is cancelled','fee has gone up'],a:0,
   ev:'Your materials fee already covers the clay for the term',ko:'좋은 소식으로 받을 수 있는 건 재료비 포함이야.'}]},

{id:'r3',title:'Swim Club',ko:'수영 클럽',min:10,from:'Message from Marguerite',
 body:"Hi Sam,\n\nA few changes to the Tuesday swim before you turn up and find the pool full.\n\nThe city has given the six-to-seven slot to a children's lesson programme for the rest of the fall, so our club now has seven to eight. That is the only change to the time. The lanes are the bigger issue: we had four and we now have two, which means we will split into two groups and alternate weeks rather than squeeze eight people into a lane.\n\nYou are in Group B, so your first session is the week of the tenth, not this week. I know that is annoying when you have just paid.\n\nOn the deck: the far door by the sauna is locked after six now, so come through the main entrance and down the stairs. Your membership card will not open the turnstile after six either — tell the front desk you are with the swim club and they will buzz you through.\n\nIf two weeks between swims is too thin, the public lanes are open nine to ten on Thursdays and your membership covers that. It is not coached, but it is water.\n\nMarguerite",
 qs:[
  {q:"Why did the club's swim time change?",o:['The club asked for a later time',"The city gave the earlier slot to a children's programme",'The pool now closes at seven','There are fewer lanes available'],a:1,
   ev:'The city has given the six-to-seven slot to a children\'s lesson programme',
   why:'D도 지문에 있지만 그건 레인 문제고 시간 변경 이유가 아니야. 한 글에 문제가 둘이면 섞어서 낸다.'},
  {q:'Why will the club alternate weeks?',o:['Fewer members have paid','The club now has two lanes instead of four','The coach is only free every other week','The children use the pool weekly'],a:1,
   ev:'we had four and we now have two, which means we will split into two groups and alternate weeks',why:''},
  {q:"When is Sam's first session?",o:['This week','The week of the tenth','Thursday at nine','After the fall programme ends'],a:1,
   ev:'You are in Group B, so your first session is the week of the tenth, not this week.',
   why:'C는 공용 레인 시간이지 클럽 세션이 아니야. 지문에 있는 시간이라고 다 답은 아니야.'},
  {q:'How should Sam get onto the deck?',o:['Through the far door by the sauna','Through the main entrance and down the stairs','Through the turnstile with his card','With a coach after six'],a:1,
   ev:'the far door by the sauna is locked after six now, so come through the main entrance and down the stairs',
   why:'A와 C는 지문이 "안 된다"고 짚은 것들이야. 부정문을 긍정으로 뒤집은 선택지.'},
  {q:'"It is not coached, but it is water." Marguerite means',o:['The public lanes are free','The public swim has no instructor but is still practice','The water quality is poor','The club will coach on Thursdays'],a:1,
   ev:'It is not coached, but it is water.',why:'직역하면 "그건 물이다"야. 문맥은 "그래도 연습은 된다"는 뜻.'},
  {q:'What is the main purpose of this message?',o:['To announce changes before the next session','To collect a membership fee','To close the club','To ask Sam to coach'],a:0,
   ev:'A few changes to the Tuesday swim before you turn up and find the pool full.',why:''}],
 rhead:'Hi Marguerite,',
 rtext:"Thanks for the warning. I'll {7} and tell the front desk I'm with the club.\n\nTwo weeks between swims is thin, so I'll {8} on the Thursdays in between.\n\nJust to confirm — I'm {9}, so I'm not coming this week.\n\nThe lane situation is a shame, but {10} is better than eight people in one lane.\n\nAnd thanks for sorting out {11}.\n\nSam",
 blanks:[
  {o:['come through the main entrance','use the sauna door','arrive at six','buy a new card'],a:0,ev:'come through the main entrance and down the stairs',ko:'사우나 쪽 문은 6시 이후 잠겨.'},
  {o:['use the public lanes','join Group A','skip the term','book a private coach'],a:0,ev:'the public lanes are open nine to ten on Thursdays',ko:'목요일 공용 레인을 권했어.'},
  {o:['in Group B','in Group A','in the children\'s programme','on the waiting list'],a:0,ev:'You are in Group B',ko:'B조라서 이번 주가 아니야.'},
  {o:['alternating weeks','losing the slot','swimming at nine','a locked door'],a:0,ev:'we will split into two groups and alternate weeks rather than squeeze eight people into a lane',ko:'한 레인에 여덟보다는 격주가 낫다는 흐름.'},
  {o:['the arrangement with the front desk','a refund','the extra lanes','the children\'s programme'],a:0,ev:'tell the front desk you are with the swim club and they will buzz you through',ko:'프런트에 말해두면 통과시켜 준다고 했어.'}]},

{id:'r4',title:'Used Lens',ko:'중고 렌즈',min:10,from:'Message from Owen',
 body:"Hi Nabila,\n\nSorry for the slow reply — I was away for the long weekend.\n\nThe lens is still available. To be straight with you: the autofocus works, but the zoom ring has a slight grind at the wide end. It does not affect images and I have shot with it for two years, but I would rather you hear it from me than find it yourself. That is why I have it at three fifty instead of the four twenty they go for used.\n\nI am in Mount Pleasant and I can meet most evenings after six. The coffee place on Main at Eleventh has power outlets, so you can put it on a body and test it properly rather than looking at it in a parking lot. Bring a card if you have one — mine is full.\n\nCash or e-transfer both work. If you e-transfer, do it while we are sitting there, not in advance; I have had one go missing before.\n\nOne more thing: I also have the original hood and a filter that fits. I was going to sell them separately but you can have both with the lens if you take it this week.\n\nOwen",
 qs:[
  {q:'What is wrong with the lens?',o:['The autofocus does not work','The zoom ring grinds at the wide end','Images come out soft','The hood is missing'],a:1,
   ev:'the zoom ring has a slight grind at the wide end',
   why:'A·C·D는 전부 지문이 "괜찮다" 또는 "있다"고 말한 것들을 뒤집은 거야.'},
  {q:'Why is the price three fifty?',o:['That is the standard used price','Owen lowered it because of the fault','It includes the hood and filter','Nabila asked for a discount'],a:1,
   ev:'That is why I have it at three fifty instead of the four twenty they go for used.',
   why:'C는 지문에 있지만 이번 주 조건이지 가격을 정한 이유가 아니야. 420이라는 숫자도 함정.'},
  {q:'Why does Owen suggest the coffee place?',o:['It is close to his home','So she can test the lens properly with power','It is safer than a parking lot','The coffee is good'],a:1,
   ev:'has power outlets, so you can put it on a body and test it properly',
   why:'주차장이 언급되긴 하지만 "안전"은 지문에 없어. 있는 단어로 없는 이유를 만들면 틀려.'},
  {q:'What does Owen ask Nabila to bring?',o:['Cash','A memory card','A tripod','The original hood'],a:1,
   ev:'Bring a card if you have one — mine is full.',why:''},
  {q:'What does Owen say about e-transfer?',o:['Send it before meeting','Send it during the meeting','Avoid e-transfer','Split it into two payments'],a:1,
   ev:'do it while we are sitting there, not in advance',why:'A가 정확히 정반대야. not in advance를 놓치면 걸려.'},
  {q:'When are the hood and filter included?',o:['If she pays cash','If she takes the lens this week','If she pays four twenty','They are always included'],a:1,
   ev:'you can have both with the lens if you take it this week',why:''}],
 rhead:'Hi Owen,',
 rtext:"Thanks for being upfront about the {7} — I'd rather know.\n\nThree fifty works. I'll {8} so I can shoot a few frames there.\n\nWednesday after six suits me. I'll {9} rather than cash, and I'll send it {10}.\n\nAnd yes — I'll take it this week, so {11}.\n\nNabila",
 blanks:[
  {o:['zoom ring','autofocus','price increase','missing hood'],a:0,ev:'the zoom ring has a slight grind at the wide end',ko:'그가 미리 말해준 결함이야.'},
  {o:['bring a card','bring cash','meet in a parking lot','borrow your body'],a:0,ev:'Bring a card if you have one',ko:'테스트하려면 카드가 필요해.'},
  {o:['e-transfer','pay later','trade something','pay in instalments'],a:0,ev:'Cash or e-transfer both work.',ko:'현금 말고 다른 쪽이야.'},
  {o:["while we're sitting there",'the night before','after I get home','in two parts'],a:0,ev:'do it while we are sitting there, not in advance',ko:'미리 보내지 말라고 했어.'},
  {o:['the hood and filter are included',"I'll pay four twenty",'you can sell them separately',"I'll come next month"],a:0,ev:'you can have both with the lens if you take it this week',ko:'이번 주에 가져가면 포함이야.'}]},

{id:'r5',title:'Cat Sitting',ko:'고양이 돌봄',min:10,from:'Message from Reza',
 body:"Hi Mina,\n\nThank you again for taking this on. I will be away from the third to the ninth.\n\nJuniper eats twice a day, half a tin in the morning and half at night, and the tins are in the cupboard above the kettle. She will tell you she has not been fed. She is lying. There is a note on the fridge with the amount so you do not have to take her word for it.\n\nThe litter is in the hall closet. Once a day is plenty.\n\nIf she will not sit still for her morning brushing, my neighbour Fatima on the second floor has done it before and does not mind being asked. Her number is on the fridge too.\n\nThe building door code changed last month: it is now 4417, not the old one. The buzzer still does not work, so do not rely on it.\n\nIf anything seems wrong, the clinic on Commercial is open until eight and they have her file. I would rather you called them than waited for me — I will be six hours behind.\n\nReza",
 qs:[
  {q:'How much does Juniper eat?',o:['One tin twice a day','Half a tin twice a day','Half a tin once a day','As much as she asks for'],a:1,
   ev:'half a tin in the morning and half at night',
   why:'D는 상식으로 메운 답이야. 지문은 고양이 말을 믿지 말라고 대놓고 경고해.'},
  {q:'Why is there a note on the fridge about food?',o:['Because Reza may change the amount',"So Mina does not have to rely on Juniper's behaviour",'Because Fatima feeds her too','Because the tins are hard to find'],a:1,
   ev:'There is a note on the fridge with the amount so you do not have to take her word for it.',why:''},
  {q:'Who can help if Juniper will not sit still?',o:['The clinic on Commercial','Fatima on the second floor','Reza, by phone','The building manager'],a:1,
   ev:'my neighbour Fatima on the second floor has done it before and does not mind being asked',
   why:'A는 지문에 있는 다른 용도야. 이름이 나왔다고 아무 역할이나 붙이면 안 돼.'},
  {q:'What should Mina know about getting into the building?',o:['The buzzer will let her in','The code is now 4417','Fatima will open the door','The door is unlocked until eight'],a:1,
   ev:'it is now 4417, not the old one. The buzzer still does not work',
   why:'A는 "작동 안 한다"고 못박은 걸 뒤집은 거야.'},
  {q:'"I will be six hours behind." means',o:['Reza will arrive six hours late','Reza will be in a different time zone','Reza will reply within six hours','The flight is delayed by six hours'],a:1,
   ev:'I would rather you called them than waited for me — I will be six hours behind.',
   why:'behind의 대표 뜻(늦다)으로 풀면 틀려. 시차 얘기야.'},
  {q:'What does Reza want Mina to do if something seems wrong?',o:['Wait for Reza to reply','Call the clinic','Ask Fatima first','Message the building manager'],a:1,
   ev:'I would rather you called them than waited for me',why:''}],
 rhead:'Hi Reza,',
 rtext:"All noted. {7} twice a day, and I won't believe her.\n\nI'll do the brushing myself and only ask {8} if she won't sit still.\n\nThanks for the code — I'd have been stuck, since {9}.\n\nIf anything looks off I'll {10} rather than wait for you.\n\nHave a good trip. I'll {11} so you can see she's fine.\n\nMina",
 blanks:[
  {o:['Half a tin','A full tin','Whatever she asks for','One meal'],a:0,ev:'half a tin in the morning and half at night',ko:'한 번에 반 캔씩이야.'},
  {o:['Fatima','the clinic','the building manager','you'],a:0,ev:'my neighbour Fatima on the second floor has done it before',ko:'이웃 파티마가 해본 적 있어.'},
  {o:["the buzzer doesn't work",'the door is always open','Fatima has a key','the code is the old one'],a:0,ev:'The buzzer still does not work, so do not rely on it.',ko:'버저가 안 되니 코드가 없으면 못 들어가.'},
  {o:['call the clinic','message you','wait until the ninth','ask Fatima'],a:0,ev:'I would rather you called them than waited for me',ko:'기다리지 말고 병원에 전화하라고 했어.'},
  {o:['send you a photo','call every hour','leave a note on the fridge','change the code'],a:0,ev:'If anything seems wrong, the clinic on Commercial is open until eight',ko:'잘 있다는 걸 보여주는 자연스러운 방법.'}]},

{id:'r6',title:'Shoot Changes',ko:'촬영 변경',min:10,from:'Message from Priya',
 body:"Hi Lee,\n\nA few things have moved on our end, so I want to get them to you before you start planning.\n\nThe shoot is still the fourteenth, but we have lost the boardroom for the afternoon — a board meeting was booked over it. We can have it from eight until eleven thirty, and after that we are in the small meeting room on the third floor, which has one window and no table big enough for the product shots. If the product shots need the boardroom, they have to happen in the morning.\n\nSecond, our new operations lead starts that week and I would like her in the piece. She has not done this before and is nervous about it, so if there is a way to do her part seated and short, that would help.\n\nThird — and I am sorry about this — legal has asked that we not show the warehouse floor. Anything with pallets or racking is out. The loading bay is fine.\n\nBudget has not changed. If the split rooms mean an extra hour, tell me now and I will get it approved rather than discover it later.\n\nPriya",
 qs:[
  {q:'Why is the boardroom unavailable in the afternoon?',o:['It is being renovated','A board meeting was booked over it','The product shots take all morning','Legal has restricted it'],a:1,
   ev:'we have lost the boardroom for the afternoon — a board meeting was booked over it',
   why:'D는 지문에 있는 다른 제약(창고)이야. 제약이 여러 개면 서로 바꿔 끼운 선택지가 나와.'},
  {q:'What must happen in the morning?',o:["The operations lead's interview",'The product shots, if they need the boardroom','The warehouse footage','The loading bay shots'],a:1,
   ev:'If the product shots need the boardroom, they have to happen in the morning.',why:''},
  {q:'What does Priya ask about the new operations lead?',o:['To leave her out','To keep her part seated and short','To film her in the warehouse','To interview her after the fourteenth'],a:1,
   ev:'if there is a way to do her part seated and short, that would help',why:''},
  {q:'What is not allowed on camera?',o:['The loading bay','The warehouse floor','The third-floor meeting room','The boardroom'],a:1,
   ev:'legal has asked that we not show the warehouse floor. Anything with pallets or racking is out. The loading bay is fine.',
   why:'A는 바로 다음 문장에서 "괜찮다"고 한 거야. 붙어 있는 두 문장을 반대로 읽는 실수.'},
  {q:'What does Priya ask Lee to do if more time is needed?',o:['Absorb the extra hour','Tell her now so she can get it approved','Reduce the number of shots','Invoice for it afterwards'],a:1,
   ev:'tell me now and I will get it approved rather than discover it later',
   why:'D가 상식적으로 보이지만 지문은 정확히 그 반대를 요청해.'},
  {q:'What is the main purpose of this message?',o:['To cancel the shoot','To pass on changes before planning starts','To negotiate the budget','To introduce a new employee'],a:1,
   ev:'I want to get them to you before you start planning.',why:''}],
 rhead:'Hi Priya,',
 rtext:"Thanks for getting ahead of it. I'll {7} in the morning while we still have the boardroom.\n\nFor your new ops lead, I'll {8} — it's easier on camera anyway.\n\nUnderstood on the {9}; I'll keep everything to the loading bay.\n\nThe room change does add setup time, so {10}.\n\nNothing else from me — {11}.\n\nLee",
 blanks:[
  {o:['do the product shots','film the interviews','scout the third floor','shoot the loading bay'],a:0,ev:'If the product shots need the boardroom, they have to happen in the morning.',ko:'보드룸이 필요한 건 제품 컷이야.'},
  {o:['keep it seated and short','do a walking interview','film her last','skip her part'],a:0,ev:'do her part seated and short',ko:'긴장한 사람에게 맞춘 요청이야.'},
  {o:['warehouse floor','loading bay','boardroom','budget'],a:0,ev:'legal has asked that we not show the warehouse floor',ko:'법무팀이 막은 건 창고 바닥이야.'},
  {o:["I'll need one extra hour","I'll work faster",'we should move the date',"I'll cut the product shots"],a:0,ev:'If the split rooms mean an extra hour, tell me now',ko:'미리 말해달라고 했으니 지금 말하는 게 맞아.'},
  {o:['see you on the fourteenth','send me the new budget',"I'll confirm the warehouse","let's move to the afternoon"],a:0,ev:'The shoot is still the fourteenth',ko:'날짜는 그대로야.'}]}
];
var LISTEN=[{
 id:'p1-bike', part:'Part 1 · 문제 해결',
 title:'Bike Room', ko:'자전거 보관실',
 segs:[
  {src:'audio/p1-1.mp3', sec:57, qs:[
   {q:'Why didn\'t Greg respond to Nadia\'s message?',
    o:['A) He never received it','B) He was working at another building','C) The front desk staff forgot to pass it on','D) He was waiting for more information'],a:1,
    ev:'I was covering the Cambie building all week.',
    why:'A·C는 그럴듯하지만 안 나온 말이야. 로그 얘기는 뒤에 나오지, 답을 안 한 이유로 말한 게 아니야.'},
   {q:'What happened to Nadia\'s bike?',
    o:['A) It was stolen from the bike room','B) It was unlocked and moved outside','C) Its front wheel was damaged and it had been moved','D) Its lock was cut and a bag was taken'],a:2,
    ev:'my front wheel was bent... it had been moved',
    why:'A는 상식으로 메운 답. 자물쇠는 걸려 있었고 없어진 건 없어.'},
   {q:'Why did Nadia\'s report not reach Greg?',
    o:['A) Priya forgot to write it down','B) The log is kept for the overnight staff','C) She reported it at the wrong building','D) She only reported it verbally'],a:1,
    ev:'The log is for the overnight staff, so it may not have reached me.',
    why:'A가 핵심 함정 — Priya는 지문에 있고 "로그에 쓰겠다"고 했지만, "까먹었다"는 말은 어디에도 없어.'}
  ],
  tx:[['Nadia','Hi, are you Greg? I\'m Nadia, from eleven-oh-four. I left a message at the front desk yesterday about the bike room.'],
      ['Greg','Right, yes. Sorry I didn\'t get back to you. I was covering the Cambie building all week. Something about your bike?'],
      ['Nadia','Yeah. I went down Sunday morning and my front wheel was bent. Pretty badly. The bike was still locked to the rack, but it had been moved. It was on the completely other side of the room.'],
      ['Greg','Moved? That\'s odd. Did you report it to the front desk?'],
      ['Nadia','I told the woman on duty, Priya I think, and she said she\'d write it in the log. But nobody called me.'],
      ['Greg','Hm. The log is for the overnight staff, so it may not have reached me. Was anything else taken? A helmet, a bag?'],
      ['Nadia','No, nothing. Just the wheel.']]},
  {src:'audio/p1-2.mp3', sec:44, qs:[
   {q:'Why can\'t the security footage be checked?',
    o:['A) The cameras broke in August','B) The bike room has no camera','C) The recording is older than the system keeps','D) Only the strata council may view it'],a:2,
    ev:'only keeps footage for seven days. Sunday was the fifth.',
    why:'August는 지문에 있는 단어지만 교체 시점이지 고장이 아니야. 5일과 11일을 직접 빼야 풀려.'},
   {q:'Why does Greg say he will file an incident report?',
    o:['A) It is required before insurance will pay','B) It will help if the problem happens again','C) It allows the police to investigate','D) It is the only way to recover the footage'],a:1,
    ev:'That\'s useful if it happens again, because the strata won\'t act on a single complaint.',
    why:'A는 뒤에 나오는 보험 얘기와 엮은 함정. police는 아예 안 나와.'},
   {q:'Why won\'t the building\'s insurance pay for the wheel?',
    o:['A) The building is not responsible for the bike room','B) The bike was not locked properly','C) The cost is far below the deductible','D) Nadia reported it too late'],a:2,
    ev:'has a two-thousand-dollar deductible, so a wheel wouldn\'t come close',
    why:'A가 상식 답. 그렉이 말한 이유는 책임이 아니라 금액이야.'},
   {q:'What does Greg suggest Nadia do herself?',
    o:['A) File an incident report','B) Contact the strata council','C) Call her own tenant insurance','D) Buy a stronger lock'],a:2,
    ev:'What I\'d suggest is checking your own tenant insurance... you\'d have to call and ask.',
    why:'A가 핵심 함정 — incident report는 그렉이 하는 일이야. 누가 하는지를 바꿔치기했어.'},
   {q:'"the strata won\'t act on a single complaint" — act on most nearly means',
    o:['A) perform','B) pretend','C) take action about','D) replace'],a:2,
    ev:'the strata won\'t act on a single complaint',
    why:'A가 단어의 대표 뜻. 9월 리딩에서 forward로 똑같이 틀렸던 유형이야.'}
  ],
  tx:[['Nadia','Is there a camera in the bike room?'],
      ['Greg','There is. But we had the whole system replaced in August, and the new one only keeps footage for seven days. Sunday was the fifth.'],
      ['Nadia','Today\'s the eleventh. So it\'s gone?'],
      ['Greg','It\'s gone. I\'m sorry. I can still file an incident report. That\'s useful if it happens again, because the strata won\'t act on a single complaint.'],
      ['Greg','Not usually, no. The building\'s insurance has a two-thousand-dollar deductible, so a wheel wouldn\'t come close. What I\'d suggest is checking your own tenant insurance. Most policies here cover a bike in a locked common room, but you\'d have to call and ask.']]},
  {src:'audio/p1-3.mp3', sec:33, qs:[
   {q:'Why is the bike room not secure at the moment?',
    o:['A) The fob reader is broken','B) The door has been propped open with a wedge','C) The door closer was removed in the summer','D) Residents share their fobs'],a:1,
    ev:'it\'s been propped open with a wedge since the summer',
    why:'fob reader는 나오지만 고장났다는 말은 없어. 있는 단어 + 없는 상태.'},
   {q:'When will anyone vote on Greg\'s request?',
    o:['A) Within two days','B) At the council meeting, about two weeks away','C) As soon as the wedge is removed','D) After the new door closer is fitted'],a:1,
    ev:'they meet on the last Thursday of the month. So two weeks, realistically, before anyone votes on it.',
    why:'C·D는 순서를 뒤집은 함정. 투표가 먼저고 설치가 나중이야.'},
   {q:'What does Greg recommend Nadia do until then?',
    o:['A) Use a second lock','B) Keep the bike in her apartment','C) Park the bike outside the building','D) Wait for the strata council\'s decision'],a:1,
    ev:'I\'d bring the bike up to your unit if you can.',
    why:'D는 그렉이 "그때까지"라고 말한 것과 정반대야.'}
  ],
  tx:[['Nadia','And in the meantime? I use that bike to get to work.'],
      ['Greg','The bike room door has a fob reader, but it\'s been propped open with a wedge since the summer. People carrying groceries. I\'ve asked twice. If you want, I\'ll put in a request to have the wedge removed and a door closer fitted.'],
      ['Nadia','How long does that take?'],
      ['Greg','The request goes to the strata council, and they meet on the last Thursday of the month. So two weeks, realistically, before anyone votes on it.'],
      ['Nadia','Two weeks. And until then?'],
      ['Greg','I\'d bring the bike up to your unit if you can. I know that\'s not what you want to hear.']]}
 ],
 vocab:[['I left a message about ~','~에 대해 메시지를 남겼다'],['Sorry I didn\'t get back to you','답을 못 드려 죄송합니다'],
        ['I was covering ~','~를 대신 맡고 있었다'],['Was anything else taken?','다른 건 없어졌나요?'],
        ['What I\'d suggest is ~ing','제가 권하는 건 ~입니다'],['but you\'d have to call and ask','다만 전화해서 물어보셔야 해요'],
        ['It wouldn\'t come close','턱없이 모자랍니다'],['in the meantime','그동안에는']]
}];
var SPEED=[
 {q:['What did you eat for breakfast yesterday?','What are you doing right now?','How often do you take the SkyTrain?','What is your cat doing at the moment?','Where did you go last weekend?','What are you planning to do tonight?','How long have you lived in Vancouver?','What is the weather like outside?'],
  m:['I ate toast and a boiled egg.','I am sitting at my desk and practising English.','I take it about three times a week.','She is sleeping on the sofa.','We went to Stanley Park.','I am going to edit a video.','I have lived here since May.','It is cloudy and a bit cold.']},
 {q:['What did you work on yesterday?','Who are you meeting this week?','What do you usually do on Sunday mornings?','What is the last thing you bought?','Where were you at eight last night?','What are you worried about right now?','How did you get to work today?','What will you do if it rains tomorrow?'],
  m:['I edited two short videos for a client.','I am meeting a client on Thursday.','I usually go for a walk and get coffee.','I bought a new microphone.','I was at home, cooking dinner.','I am a little worried about a deadline.','I walked, because it is only fifteen minutes.','If it rains, I will work from home.']},
 {q:['What is your favourite meal to cook?','What did you do on your last birthday?','What are your neighbours like?','How many times have you moved house?','What is sitting on your desk right now?','What did you learn this week?','What do you miss about Korea?','What are you looking forward to?'],
  m:['I like making kimchi fried rice.','I went out for dinner with my wife.','They are quiet and friendly.','I have moved four times.','There is a laptop, a notebook and a cup of tea.','I learned how to fix my subject-verb agreement.','I miss the late-night food.','I am looking forward to the summer.']},
 {q:['What time did you wake up today?','What are you wearing?','What do you do for a living?','Where did you last travel?','What is happening outside your window?','What did you forget to do yesterday?','How do you relax after work?','What would you change about your week?'],
  m:['I woke up at seven.','I am wearing a grey hoodie and jeans.','I make video marketing content.','I last travelled to Jeju.','People are walking their dogs.','I forgot to reply to an email.','I watch something light and cook.','I would start earlier in the morning.']}
];
var ROLE=[
 {c:'Derek · 뻔뻔한 클라이언트',s:'3주 전에 영상 작업을 끝냈어. 그쪽은 컨펌했고, 올렸고, 인보이스는 안 냈어. 지금 전화하는 중이야.',
  l:['Oh hey! Yeah, no — the video looks great, we love it. Listen, about the invoice… our finance person is away this week, so it\'s kind of out of my hands. Can you circle back in a couple of weeks?',
     'Right, right. I hear you. But honestly, nobody here has even looked at the paperwork yet. You know how it is. Can you just resend the invoice and I\'ll try to chase it?',
     'Okay okay. Look — I can probably get you half this week, and the rest at the end of the month. That works, right?'],
  b:['As we agreed,…','I\'m afraid I can\'t…','I\'d appreciate it if…','Could you give me a specific date?']},
 {c:'Marion · 월세 올리는 집주인',s:'집주인이 다음 갱신 때 월세를 20% 올리겠다고 문자를 보냈어. 지금 만나서 이야기하는 중이야.',
  l:['Look, I know it\'s a jump. But everything has gone up — insurance, property tax, all of it. Twenty percent is honestly below what the unit could get on the market right now.',
     'Well, if you check the listings nearby you\'ll see similar places going for more. I\'m not trying to push anyone out. I just need the numbers to work.',
     'Hmm. What if I did fifteen instead, but you sign for two years?'],
  b:['I understand that…','However, I\'d like to point out…','Would you be willing to…','That\'s more than I can manage.']},
 {c:'Chris · 일을 더 얹는 클라이언트',s:'영상 3편 계약이었는데, 클라이언트가 "간단한 거"라며 숏폼 5개를 더 요청했어.',
  l:['Hey! So the three videos are perfect. Quick thing — could you also cut five shorts out of them? Should be quick, right? It\'s the same footage.',
     'Oh, I wasn\'t thinking of it as extra work, really. It\'s just trimming. Our last person used to throw those in.',
     'I see. So what would that look like, cost-wise?'],
  b:['That would be outside our original scope.','I\'d be happy to, but…','My rate for that would be…','Shall I send you an updated quote?']},
 {c:'Reza · 밤마다 드릴질하는 이웃',s:'윗집이 일주일째 밤 11시에 공사를 하고 있어. 복도에서 마주쳤어.',
  l:['Oh — hi! Yeah, sorry about the noise. We\'re redoing the bathroom. It\'s only for a little while longer.',
     'I know, I know. The thing is, I work days, so evenings are the only time I can get it done. I try to stop by midnight.',
     'Okay. What time would actually work for you?'],
  b:['I\'m sure you don\'t mean to,…','The problem for me is…','Would it be possible to…','I\'d really appreciate it.']},
 {c:'Dana · 환불을 거절하는 매장 직원',s:'온라인으로 산 카메라 렌즈가 고장난 채로 왔어. 반품 기한이 어제 끝났어.',
  l:['I\'m sorry, but our return window is thirty days and that closed yesterday. The system won\'t even let me process it.',
     'I understand it\'s frustrating. But I\'d be going around policy, and that\'s not something I can do at the counter.',
     'Let me see… I could possibly offer store credit. Would that help?'],
  b:['I\'d like to explain the situation.','The item arrived damaged, so…','Is there a manager I could speak to?','What options do I actually have?']},
 {c:'Jess · 날짜를 미루는 협력자',s:'같이 촬영하기로 한 사람이 촬영 이틀 전에 날짜를 바꾸자고 해. 이미 장비를 빌려놨어.',
  l:['Hey, so — something came up and I don\'t think Thursday works anymore. Could we push it a week?',
     'I know it\'s short notice. It\'s just one week though, and the location isn\'t going anywhere.',
     'Okay, I didn\'t realise you\'d already paid for things. What do you need from me?'],
  b:['Unfortunately I\'ve already…','That would mean…','Could we keep Thursday if…','I\'d need you to cover…']}
];
var HOT=[
 'Cities should remove street parking downtown and give the space to bikes and wider sidewalks.',
 'Employers have every right to require staff to come back to the office five days a week.',
 'Learning a language with an app is a waste of time compared to just talking to people.',
 'All AI-generated images and videos should be labelled by law, everywhere they appear.',
 'Social media has done more harm than good for people who moved to a new country.',
 'Newcomers should get free language classes for their first two years, paid by taxes.',
 'Working for yourself is more stressful than any office job, and people romanticise it.',
 'Children should not start a second language before they are fluent in their first one.'
];
var EMAIL=[
 '지난달에 예약한 스튜디오가 당일에 "중복 예약"이라며 취소됐어. 보증금은 아직 안 돌아왔고. 스튜디오에 메일을 써.',
 '아파트 세탁실이 3주째 고장인데 공지에 적힌 수리 날짜가 지나도 안 바뀌었어. 관리인에게 메일을 써.',
 '온라인으로 주문한 장비가 다른 모델로 왔어. 반품 라벨과 올바른 제품 발송을 요청하는 메일을 써.',
 '시청에서 네 동네 가로등 교체 계획에 대한 의견을 받고 있어. 늦은 시간 안전 문제를 들어 찬성하는 메일을 써.',
 '작년에 함께 일한 클라이언트에게 다시 연락해서 새 프로젝트를 제안하는 메일을 써.',
 '참석하기로 한 워크숍에 갑자기 못 가게 됐어. 주최자에게 사정을 설명하고 가능하면 다음 회차로 옮겨달라고 메일을 써.'
];
var SPEAK=[
 {n:1,t:'Giving Advice',ko:'조언하기',sec:90,tip:'구체적인 행동 2~3개 + 각각 왜인지 한 줄.',
  b:['If I were you, I would…','I\'d suggest that you…','It might be worth…','The most important thing is…'],
  p:['Your friend has just moved to Vancouver and feels lonely. Give them advice on how to meet people.',
     'A friend wants to start freelancing but is afraid of losing a steady income. Advise them.',
     'A friend keeps starting English study and quitting after two weeks. Tell them what to do differently.',
     'Your coworker has been offered a job in another city. Help them decide.',
     'A friend wants to visit Korea for the first time. Advise them on how to plan it.',
     'Your cousin wants to adopt a cat but lives in a small apartment. Give them advice.']},
 {n:2,t:'Personal Experience',ko:'경험 말하기',sec:60,tip:'⚠️ 전부 과거시제. went, was, looked, came. 끝은 현재로 한 줄.',
  b:['A few years ago,…','At that time,…','What surprised me was…','I still think about it.'],
  p:['Describe a time you had to solve a problem without help.',
     'Talk about a meal you will never forget.',
     'Describe your first week after moving to a new country.',
     'Talk about a time someone helped you when you did not expect it.',
     'Describe a project you were proud of finishing.',
     'Talk about a time you had to say no to someone.']},
 {n:3,t:'Describing a Scene',ko:'장면 묘사',sec:60,tip:'앞 → 좌우 → 뒤. 사람 동작은 전부 be + -ing. 마지막은 추측.',
  b:['In the foreground, there is…','On the left, there are…','In the background, I can see…','They appear to be…'],
  p:['Look out of your window right now and describe exactly what you see.',
     'Open your camera roll, pick the most recent photo with people, and describe it.',
     'Describe the room you are in as if the listener cannot see it.',
     'Picture the last café you visited. Describe the scene inside.',
     'Pick any photo from a trip and describe what is happening in it.',
     'Describe the street outside your building on a busy afternoon.']},
 {n:4,t:'Making Predictions',ko:'예측하기',sec:60,tip:'will / is going to 를 섞고, 근거를 하나는 붙여.',
  b:['I think they will…','It looks like…','In a few minutes,…','There is a good chance that…'],
  p:['Two people stand in front of a moving truck with boxes. Predict what happens next.',
     'Predict what your neighbourhood will look like in ten years.',
     'A cat sits on a counter next to a full glass of water. Predict what happens next.',
     'Predict how people will learn languages twenty years from now.',
     'Someone checks a map on a corner with a suitcase. Predict what they do next.',
     'Predict what your own work will look like five years from now.']},
 {n:5,t:'Comparing and Persuading',ko:'비교·설득',sec:60,tip:'둘 다 언급하되 하나를 분명히 밀어. 반대 이유를 한 번 인정하고 뒤집어.',
  b:['Both options have…','However, I would go with…','The main advantage is…','That is why I think…'],
  p:['Your parents are visiting. Persuade them to stay in a hotel rather than your apartment.',
     'Compare transit and driving in your city, and persuade a friend to pick one.',
     'Persuade a client to choose a short video series over one long video.',
     'Compare cooking at home and eating out, and persuade your partner to pick one.',
     'Persuade a friend to take an in-person class instead of an online one.',
     'Compare living downtown and the suburbs, and persuade someone to choose one.']},
 {n:6,t:'Difficult Situation',ko:'곤란한 상황',sec:60,tip:'공손하지만 단호하게. 인정 → 사실 → 요청.',
  b:['I\'m afraid…','As we agreed,…','I\'d appreciate it if…','Would it be possible to…'],
  p:['A client approved your work three weeks ago but has not paid. Call them.',
     'Your landlord wants to raise the rent by 20%. Respond.',
     'A photographer you booked wants to move your date. Tell them it does not work.',
     'A neighbour has been drilling late at night for a week. Speak to them.',
     'Equipment arrived damaged, one day after the return window closed. Call the store.',
     'A friend asked to borrow your camera for a month. You do not want to. Tell them.']},
 {n:7,t:'Expressing Opinions',ko:'의견 말하기',sec:90,tip:'입장 → 이유1+예시 → 이유2 → 반대 인정 → 재확인. Writing Task 2 템플릿 그대로.',
  b:['In my opinion,…','The main reason is that…','On the other hand,…','For these reasons,…'],
  p:['Some cities are removing street parking to add bike lanes. What do you think?',
     'Should employers require staff to return to the office full time?',
     'Is it better for children to learn a second language before age ten?',
     'Should AI-generated content be labelled everywhere it appears?',
     'Some people say social media does more harm than good. Do you agree?',
     'Should newcomers get free language classes for their first two years?']},
 {n:8,t:'Unusual Situation',ko:'이상한 것 설명',sec:60,tip:'이름을 모를수록 좋아. 모양 → 크기 → 용도 추측으로 돌려 말해.',
  b:['It looks like a kind of…','It is about the size of…','I\'m not sure what it\'s called, but…','It seems to be used for…'],
  p:['You see an object in a shop and cannot name it. Describe it and ask what it is.',
     'Describe a Korean dish to someone who has never heard of it, without using its name.',
     'A strange machine appears in your lobby. Describe it and ask the manager about it.',
     'Describe an object on your desk to someone who cannot see it, without naming it.',
     'You found something odd in a parcel. Describe it to customer service.',
     'Describe a piece of equipment from your work to someone outside your field.']}
];
var TYPES=[
 {id:'speak',ic:'🎤',nm:'1분 스피킹',df:3,mn:5,ds:'준비 30초, 말하기 60초. 마이크로 속도·무음까지 잰다.',ai:false},
 {id:'repair',ic:'🛠️',nm:'문장 수리소',df:2,mn:6,ds:'네가 실제로 틀렸던 문장 8개가 고장난 채로 온다.',ai:false},
 {id:'traphunt',ic:'🔍',nm:'함정 사냥',df:2,mn:6,ds:'답만으론 점수 없다. 근거 문장까지 짚어야 한다.',ai:false},
 {id:'listen',ic:'🎧',nm:'리스닝',df:3,mn:10,ds:'한 번만 듣는다. 찍은 문제엔 ⭐를 붙여야 한다.',ai:false},
 {id:'readp1',ic:'📨',nm:'리딩 Part 1',df:3,mn:10,ds:'실제 시험 형식 그대로. 드롭다운 6개 + 답장 빈칸 5개, 10분.',ai:false},
 {id:'speed',ic:'⚡',nm:'스피드 라운드',df:1,mn:5,ds:'질문 8개. 한 줄씩. 생각하지 말고 바로.',ai:false},
 {id:'roleplay',ic:'🥊',nm:'역할극',df:3,mn:8,ds:'변명하는 상대와 3라운드. 밀리면 진다.',ai:true},
 {id:'hottake',ic:'🔥',nm:'핫테이크',df:3,mn:5,ds:'도발적인 주장에 80단어로 반박하거나 편들어라.',ai:true},
 {id:'email',ic:'✉️',nm:'긴급 이메일',df:2,mn:8,ds:'상황 하나. 실제로 보낼 메일을 쓴다.',ai:true}
];

/* ============ 상태 ============ */
var KEY='celpip_arena_v1', AKEY='celpip_arena_key', MKEY='celpip_arena_model';
var S={xp:SEED,bosses:{},runs:[]};
BOSSES.forEach(function(b){S.bosses[b.id]=b.hp});
var apiKey='', model='';
function load(){
  try{var v=JSON.parse(localStorage.getItem(KEY)||'null');
    if(v){S.xp=v.xp||SEED;S.runs=v.runs||[];BOSSES.forEach(function(b){S.bosses[b.id]=(v.bosses&&v.bosses[b.id]!=null)?v.bosses[b.id]:b.hp})}
  }catch(e){}
  try{apiKey=localStorage.getItem(AKEY)||'';model=localStorage.getItem(MKEY)||''}catch(e){}
}
function save(){try{localStorage.setItem(KEY,JSON.stringify({xp:S.xp,bosses:S.bosses,runs:S.runs.slice(-150)}))}catch(e){}}
function today(){try{return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Vancouver',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}catch(e){return new Date().toISOString().slice(0,10)}}
function shift(k,n){var p=k.split('-');var d=new Date(Date.UTC(+p[0],+p[1]-1,+p[2]));d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
var TD=today();
function lvl(x){var i=0;for(var k=0;k<LEVELS.length;k++)if(x>=LEVELS[k][0])i=k;return i}

/* CELPIP 점수 = CLB 레벨 (IRCC 공식 환산, 4~10 구간 1:1).
   아래 정답률 → 밴드 변환은 공식이 아니라 추정치다. */
function clbBand(pct){
  if(pct>=92)return{lo:9,hi:10};
  if(pct>=85)return{lo:8,hi:9};
  if(pct>=76)return{lo:7,hi:8};
  if(pct>=66)return{lo:6,hi:7};
  if(pct>=55)return{lo:5,hi:6};
  if(pct>=42)return{lo:4,hi:5};
  return{lo:3,hi:4};
}
function bandTxt(c){return c?(c.lo===c.hi?('CLB '+c.lo):('CLB '+c.lo+'–'+c.hi)):'—'}
function bandHtml(c,note){
  if(!c)return '';
  var ok=c.lo>=7;
  return '<div class="clb'+(ok?' ok':'')+'"><div class="clbn">'+esc(bandTxt(c))+'</div>'+
    '<div class="clbd">추정 · 목표 CLB 7'+(note?' · '+esc(note):'')+'</div>'+
    '<div class="clbbar"><i style="width:'+Math.max(4,Math.min(100,(c.hi/10*100)))+'%"></i><b style="left:70%"></b></div></div>';
}

/* ============ 렌더 ============ */
function renderHud(){
  var L=lvl(S.xp),nm=LEVELS[L],nx=LEVELS[L+1];
  $('lvb').textContent='LV '+(L+1); $('lvn').textContent=nm[1];
  $('xpn').innerHTML=S.xp+'<small> XP</small>';
  $('xpf').style.width=Math.max(2,Math.min(100,nx?((S.xp-nm[0])/(nx[0]-nm[0])*100):100))+'%';
  $('xpa').textContent='Lv.'+(L+1)+' '+nm[1];
  $('xpb').textContent=nx?('다음까지 '+(nx[0]-S.xp)):'MAX';
  var st=0,cur=TD;
  if(!S.runs.some(function(r){return r.date===TD}))cur=shift(TD,-1);
  while(S.runs.some(function(r){return r.date===cur})){st++;cur=shift(cur,-1)}
  $('s-streak').textContent=st+'일'; $('s-runs').textContent=S.runs.length;
  var cb=S.runs.filter(function(r){return r.clb}).slice(-8);
  if(cb.length){
    var mid=cb.reduce(function(a,r){return a+(r.clb.lo+r.clb.hi)/2},0)/cb.length;
    var el=$('s-avg');el.textContent=(Math.round(mid*10)/10).toFixed(1);
    el.className=mid>=7?'ok':(mid>=6?'':'bad');
  } else { $('s-avg').textContent='—'; $('s-avg').className=''; }
  $('s-kill').textContent=BOSSES.filter(function(b){return(S.bosses[b.id]||0)<=0}).length+'/'+BOSSES.length;
}
function renderBosses(){
  $('bosses').innerHTML=BOSSES.slice().sort(function(a,b){return(S.bosses[b.id]||0)-(S.bosses[a.id]||0)}).map(function(b){
    var hp=S.bosses[b.id]||0,dead=hp<=0;
    return '<div class="boss'+(dead?' dead':'')+'"><div><div class="bn">'+esc(b.n)+'</div><div class="bd">'+esc(b.d)+'</div></div>'+
      '<div class="hp"><i style="width:'+hp+'%"></i></div><div class="hpn">'+(dead?'격파':hp)+'</div></div>';
  }).join('');
}
function renderHist(){
  var el=$('hist');
  if(!S.runs.length){el.innerHTML='<div class="empty">아직 전투 기록이 없어. 위에서 첫 챌린지를 시작해.</div>';return}
  el.innerHTML=S.runs.slice(-30).reverse().map(function(r){
    var t=TYPES.filter(function(x){return x.id===r.type})[0]||{ic:'🎲',nm:r.type},b='';
    if(r.prompt)b+='<div class="hlab">받은 문제</div><div class="hq">'+esc(r.prompt)+'</div>';
    if(r.answer)b+='<div class="hlab">내 답</div><div class="hans">'+esc(r.answer)+'</div>';
    if(r.metrics)b+='<div class="hmm"><span>'+r.metrics.words+' 단어</span><span>'+r.metrics.wpm+' wpm</span><span>무음 '+r.metrics.qpct+'%</span><span>최장 '+r.metrics.longest+'s</span></div>';
    if(r.clb)b+='<div class="hmm"><span style="color:var(--gold);font-weight:700">추정 '+esc(bandTxt(r.clb))+'</span></div>';
    if(r.verdict)b+='<div class="hlab">총평</div><p style="font-size:14px">'+esc(r.verdict)+'</p>';
    if(r.corrections&&r.corrections.length)b+='<div class="hlab">교정 '+r.corrections.length+'개</div><div class="fixes">'+r.corrections.map(function(c){
      return '<div class="fix"><span class="w">'+esc(c.wrong)+'</span> → <span class="r">'+esc(c.right)+'</span>'+(c.why?'<span class="y">'+esc(c.why)+'</span>':'')+'</div>'}).join('')+'</div>';
    if(r.next)b+='<p class="vd" style="margin-top:11px;font-size:13.5px">→ '+esc(r.next)+'</p>';
    return '<details class="hrow"><summary><span class="hd">'+esc(r.date.slice(5))+'</span><span>'+t.ic+' '+esc(t.nm)+'</span><span class="hs">+'+(r.score||0)+'</span></summary><div class="hb">'+(b||'<p class="hd">세부 기록 없음</p>')+'</div></details>';
  }).join('');
}
function renderNb(){
  var el=$('nb'),map={};
  S.runs.forEach(function(r){(r.corrections||[]).forEach(function(c){
    var k=c.boss||(r.errorsFound&&r.errorsFound[0])||'misc';(map[k]=map[k]||[]).push({c:c,d:r.date})})});
  var ks=Object.keys(map).sort(function(a,b){return map[b].length-map[a].length});
  if(!ks.length){el.innerHTML='<div class="empty">교정이 쌓이면 여기 모여.</div>';return}
  el.innerHTML=ks.map(function(k){
    var b=BOSSES.filter(function(x){return x.id===k})[0];
    return '<div class="nbg"><div class="nt">'+esc(b?b.n:'기타')+' <span class="nc">'+map[k].length+'</span></div><ul class="nbl">'+
      map[k].slice(-8).reverse().map(function(it){return '<li><span class="dt">'+esc(it.d.slice(5))+'</span><span class="w">'+esc(it.c.wrong)+'</span> → <span class="r">'+esc(it.c.right)+'</span></li>'}).join('')+'</ul></div>';
  }).join('');
}
function renderTypes(){
  $('types').innerHTML=TYPES.map(function(t){
    return '<div class="type"><div class="ti">'+t.ic+'</div><div class="tn">'+esc(t.nm)+(t.ai?' <span class="pill">AI</span>':'')+'</div><div class="td">'+esc(t.ds)+'</div></div>'}).join('');
}

/* ============ 챌린지 ============ */
var T=null,C=null,busy=false,tick=null,t0=0;
function setHead(t){
  T=t;$('c-ic').textContent=t.ic;$('c-nm').textContent=t.nm;
  $('c-mt').textContent=TD+' · 약 '+t.mn+'분 · 100 PT'+(t.ai?' · AI 채점':'');
  $('c-st').textContent='★★★'.slice(0,t.df)+'☆☆☆'.slice(0,3-t.df);
  $('c-ds').textContent=t.ds;
}
function act(h){$('c-act').innerHTML=h}
function idle(t){
  clearInterval(tick);$('card').classList.remove('live');
  var avail=TYPES.filter(function(x){return !x.ai||apiKey});
  var last=S.runs.length?S.runs[S.runs.length-1].type:null;
  var pool=avail.filter(function(x){return x.id!==last}); if(!pool.length)pool=avail;
  setHead(t||one(pool));
  $('c-body').innerHTML='';$('c-res').innerHTML='';
  var sel='<select id="pk"><option value="">🎲 아무거나</option>'+TYPES.map(function(x){
    return '<option value="'+x.id+'"'+(x.id===T.id?' selected':'')+(x.ai&&!apiKey?' disabled':'')+'>'+x.ic+' '+x.nm+(x.ai&&!apiKey?' (키 필요)':'')+'</option>'}).join('')+'</select>';
  act('<button class="btn" id="go">시작</button><button class="btn2" id="re">🎲 다시 뽑기</button>'+sel);
  $('go').onclick=start;
  $('re').onclick=function(){idle(one(pool))};
  $('pk').onchange=function(){var v=this.value;idle(v?TYPES.filter(function(x){return x.id===v})[0]:null)};
}
function start(){
  $('c-res').innerHTML='';$('card').classList.add('live');t0=Date.now();
  if(T.id==='speak')return buildSpeak();
  if(T.id==='repair')return buildRepair();
  if(T.id==='traphunt')return buildTrap();
  if(T.id==='listen')return buildListen();
  if(T.id==='readp1')return buildRead();
  if(T.id==='speed')return buildSpeed();
  return buildWrite();
}
function timerUI(){
  act('<button class="btn" id="sub">제출 · 채점</button><span class="tmr" id="tm">0:00</span>');
  clearInterval(tick);
  tick=setInterval(function(){var e=$('tm');if(!e){clearInterval(tick);return}e.textContent=fmt((Date.now()-t0)/1000)},1000);
}

/* --- 문장 수리소 --- */
function buildRepair(){
  var items=pickN(REPAIR,8);
  C={kind:'repair',items:items};
  $('c-body').innerHTML='<div class="scen">아래 8문장에 각각 <strong>오류가 하나씩</strong> 있어. 고친 문장을 한 줄에 하나씩 써.</div>'+
    '<ul class="items">'+items.map(function(i){return '<li>'+esc(i[0])+'</li>'}).join('')+'</ul>'+
    '<textarea id="ans" placeholder="1. ...&#10;2. ..."></textarea><div class="cnt" id="cnt">0 단어</div>';
  wire(); timerUI(); $('sub').onclick=gradeRepair;
}
function gradeRepair(){
  clearInterval(tick);
  var lines=($('ans').value||'').split('\n').map(function(s){return s.replace(/^\s*\d+[.)]\s*/,'').trim()}).filter(Boolean);
  var norm=function(s){return s.toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim()};
  var cors=[],hit=0,avoided={},found={};
  C.items.forEach(function(it,i){
    var mine=lines[i]||'', ok=norm(mine)===norm(it[1]);
    if(!ok&&mine){ // 관대한 채점: 핵심 수정어가 들어갔으면 정답
      var diff=norm(it[1]).split(' ').filter(function(w){return norm(it[0]).split(' ').indexOf(w)<0});
      ok = diff.length>0 && diff.every(function(w){return norm(mine).indexOf(w)>=0});
    }
    if(ok){hit++;avoided[it[2]]=1}
    else{found[it[2]]=1;cors.push({wrong:mine||'(빈칸)',right:it[1],why:it[3]||'',boss:it[2]})}
  });
  var score=Math.round(hit/C.items.length*100);
  finish(score,{verdict:hit+' / 8 정답.'+(hit>=7?' 거의 다 잡았어.':hit>=5?' 절반은 넘었어.':' 아래 교정을 소리 내서 한 번 읽어.'),
    corrections:cors,errorsFound:Object.keys(found),errorsAvoided:Object.keys(avoided),
    next:cors.length?('다음 타깃: '+(BOSSES.filter(function(b){return b.id===cors[0].boss})[0]||{n:''}).n):'8개 전부 정답. 난이도를 올릴 때야.'},
    $('ans').value);
}

/* --- 함정 사냥 --- */
function buildTrap(){
  var it=one(TRAP); C={kind:'trap',it:it,pick:-1};
  $('c-body').innerHTML='<div class="scen">'+esc(it.p).replace(/\n/g,'<br>')+'</div>'+
    '<div class="ask"><span class="who">질문</span>'+esc(it.q)+'</div>'+
    '<ul class="opts" id="op">'+it.o.map(function(o,i){return '<li><button data-i="'+i+'">'+esc(o)+'</button></li>'}).join('')+'</ul>'+
    '<p class="cds" style="margin-top:14px;font-weight:700">그리고 — 그 답의 <u>근거 문장</u>을 지문에서 그대로 옮겨 적어.</p>'+
    '<textarea id="ans" style="min-height:80px" placeholder="근거 문장을 여기에"></textarea>';
  [].forEach.call($('op').querySelectorAll('button'),function(b){
    b.onclick=function(){[].forEach.call($('op').querySelectorAll('button'),function(x){x.className=''});b.className='pick';C.pick=+b.dataset.i}});
  timerUI(); $('sub').onclick=gradeTrap;
}
function gradeTrap(){
  clearInterval(tick);
  var it=C.it, right=C.pick===it.a;
  var nz=function(s){return String(s||'').toLowerCase().replace(/n't/g,' not').replace(/cannot/g,'can not').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()};
  var ev=nz($('ans').value), target=nz(it.ev);
  var tw=target.split(' ').filter(function(w){return w.length>2}), ew=ev.split(' ');
  var hitw=tw.filter(function(w){return ew.indexOf(w)>=0}).length;
  var evOk=ev.length>8 && tw.length>0 && hitw/tw.length>=0.6;
  [].forEach.call($('op').querySelectorAll('button'),function(b,i){b.className=i===it.a?'right':(i===C.pick?'wrong':'')});
  var score=(right?60:0)+(evOk?40:0);
  var cors=[];
  if(!right)cors.push({wrong:it.o[C.pick]||'(미선택)',right:it.o[it.a],why:it.why,boss:'misc'});
  if(!evOk)cors.push({wrong:$('ans').value||'(빈칸)',right:it.ev,why:'근거 문장은 지문에서 그대로 옮겨야 해.',boss:'misc'});
  finish(score,{verdict:right?(evOk?'정답 + 근거까지. 이게 만점 풀이야.':'답은 맞았는데 근거를 못 짚었어 — 운일 수도 있다는 뜻이야.'):'오답. 지문 밖에서 답을 가져왔어.',
    corrections:cors,errorsFound:[],errorsAvoided:[],
    clb:right?(evOk?clbBand(90):clbBand(70)):clbBand(40),clbNote:'Reading 1문항 · 참고용',
    next:'답을 고르기 전에 "이 답의 근거가 몇 번째 문장이지?"를 1초만 물어.'},
    '선택: '+(it.o[C.pick]||'-')+'\n근거: '+($('ans').value||'-'));
}

/* --- 리딩 Part 1 (실제 시험 형식) --- */
function buildRead(){
  var set=one(READ);
  C={kind:'readp1',set:set,ans:[],left:set.min*60};
  $('c-mt').textContent=TD+' · Reading Part 1 · 11문항 · '+set.min+'분 · 100 PT';
  var sel=function(i,o){
    return '<select class="dd" data-q="'+i+'"><option value="">—</option>'+
      o.map(function(x,k){return '<option value="'+k+'">'+esc(x)+'</option>'}).join('')+'</select>';
  };
  var rep=esc(set.rtext).replace(/\{(\d+)\}/g,function(m,n){
    var i=parseInt(n,10)-1;return '<span class="bl">'+n+'. '+sel(i,set.blanks[i-6].o)+'</span>';
  }).replace(/\n/g,'<br>');
  $('c-body').innerHTML=
    '<div class="scen"><b>Reading Part 1 · Reading Correspondence.</b> 왼쪽 글을 읽고 오른쪽 1~6번을 드롭다운으로 고른 다음, 아래 답장의 빈칸 7~11번을 채워. <b>'+set.min+'분.</b> 실제 시험과 같은 형식이야.</div>'+
    '<div class="rsplit"><div class="rpas"><div class="rphead">Read the following message.</div>'+
      '<div class="rpbody"><b>'+esc(set.from)+'</b><br><br>'+esc(set.body).replace(/\n/g,'<br>')+'</div></div>'+
    '<div class="rq"><div class="rqhead">Questions 1–6 — choose the best option.</div>'+
      set.qs.map(function(q,i){
        return '<div class="rqr"><span class="rqn">'+(i+1)+'.</span><span class="rqt">'+esc(q.q)+'</span>'+sel(i,q.o)+'</div>';
      }).join('')+
      '<div class="rqhead" style="margin-top:18px">Questions 7–11 — complete the reply.</div>'+
      '<div class="rrep"><b>'+esc(set.rhead)+'</b><br><br>'+rep+'</div>'+
    '</div></div>';
  [].forEach.call($('c-body').querySelectorAll('.dd'),function(s){
    s.onchange=function(){C.ans[+s.getAttribute('data-q')]=s.value===''?undefined:+s.value;
      s.className='dd'+(s.value===''?'':' set')};
  });
  act('<button class="btn" id="sub">제출 · 채점</button><span class="tmr" id="tm">'+fmt(C.left)+'</span>');
  clearInterval(tick);
  tick=setInterval(function(){
    C.left--;var e=$('tm');if(!e){clearInterval(tick);return}
    e.textContent=fmt(Math.max(0,C.left));
    if(C.left<=60)e.style.animation='pulse 1s infinite';
    if(C.left<=0){clearInterval(tick);gradeRead()}
  },1000);
  $('sub').onclick=gradeRead;
}
function gradeRead(){
  clearInterval(tick);
  var set=C.set,all=[],i;
  for(i=0;i<6;i++)all.push({n:i+1,q:set.qs[i].q,o:set.qs[i].o,a:set.qs[i].a,ev:set.qs[i].ev,why:set.qs[i].why});
  for(i=0;i<5;i++)all.push({n:i+7,q:'빈칸 '+(i+7),o:set.blanks[i].o,a:set.blanks[i].a,ev:set.blanks[i].ev,why:set.blanks[i].ko});
  var hit=0,blank=0,cors=[],part1=0,part2=0;
  all.forEach(function(it,k){
    var mine=C.ans[k],ok=mine===it.a;
    if(mine===undefined)blank++;
    if(ok){hit++;if(k<6)part1++;else part2++}
    else cors.push({wrong:it.n+'. '+(mine===undefined?'(미선택)':it.o[mine]),right:it.o[it.a],
      why:(it.why?it.why+'  ▸ ':'')+'근거: "'+it.ev+'"',boss:'misc'});
  });
  var total=set.min*60,secs=total-Math.max(0,C.left);
  var score=Math.round(hit/all.length*100);
  var v=hit+' / 11 정답 (이해 '+part1+'/6 · 빈칸 '+part2+'/5) · '+fmt(secs)+' 사용.';
  if(blank)v+=' 미선택 '+blank+'개.';
  if(C.left>120&&hit<9)v+=' 시간을 '+fmt(C.left)+' 남기고 냈어 — 9월부터 반복되는 습관이야. 남는 시간은 확신 없는 문제 재검토에 써.';
  else if(part2<part1-1)v+=' 빈칸(7~11)이 이해 문제보다 약해. 답장 빈칸은 원문의 어느 문장을 받는지 짚으면 풀려.';
  var bonus=0,bn=[];
  if(!blank){bonus+=10;bn.push('완주 +10')}
  if(secs>=total*0.6){bonus+=15;bn.push('시간 완주 +15')}
  if(secs>=total*0.6&&hit>=9){bonus+=25;bn.push('재검토 +25')}
  finish(score,{verdict:v,corrections:cors,errorsFound:[],errorsAvoided:[],
    bonus:bonus,bonusNote:bn.join(' · '),
    clb:clbBand(score),clbNote:'Reading '+hit+'/11',
    next:blank?'끝까지 다 고르고 내. 빈칸은 0점이야.':'틀린 문제의 근거 문장을 지문에서 찾아 형광펜 긋듯 짚어봐.'},
    all.map(function(it,k){return it.n+'. '+(C.ans[k]===undefined?'-':it.o[C.ans[k]])}).join('\n'));
  $('c-res').insertAdjacentHTML('beforeend',
    '<details class="hrow" style="margin-top:14px"><summary><span class="hd">PASSAGE</span><span>지문 다시 보기</span><span class="hs"></span></summary>'+
    '<div class="hb"><div class="hq">'+esc(set.body)+'</div></div></details>');
}

/* --- 리스닝 --- */
function buildListen(){
  var set=LISTEN[0],total=0;
  set.segs.forEach(function(s){total+=s.qs.length});
  C={kind:'listen',set:set,seg:0,ans:[],star:[],total:total};
  $('c-mt').textContent=TD+' · '+set.part+' · '+total+'문항 · 100 PT';
  renderSeg();
}
function renderSeg(){
  var set=C.set,i=C.seg,s=set.segs[i],n=set.segs.length,done='';
  for(var k=0;k<i;k++)done+='<div class="segdone">✓ 세그먼트 '+(k+1)+' · '+set.segs[k].qs.length+'문항 완료</div>';
  $('c-body').innerHTML=done+
    (i===0?'<div class="scen"><strong>'+esc(set.title)+' · '+esc(set.ko)+'</strong> — 주민 Nadia와 건물 매니저 Greg의 대화야.<br><br>'+
      '<b>규칙 하나.</b> 한 번만 듣는다. 재생이 끝나면 플레이어가 사라지고 문제가 나와. 메모는 해도 돼.<br>'+
      '<b>규칙 둘.</b> 확신이 없으면 <b>⭐ 찍었어</b>를 눌러. 안 누르면 운으로 맞은 게 실력으로 기록돼.</div>':'')+
    '<div class="seghead">세그먼트 '+(i+1)+' / '+n+'<span>'+fmt(s.sec)+'</span></div>'+
    '<div id="player"><audio id="au" controls preload="auto" src="'+esc(s.src)+'"></audio>'+
    '<p class="note" id="aerr" hidden></p>'+
    '<div class="row"><button class="btn2" id="skipq">다 들었어 — 문제 보기</button></div></div>'+
    '<div id="qs"></div>';
  var au=$('au');
  au.onended=showQs;
  au.onerror=function(){var e=$('aerr');e.hidden=false;
    e.innerHTML='음원을 못 찾았어 — <code>'+esc(s.src)+'</code> 가 리포에 있는지 확인해줘.'};
  $('skipq').onclick=showQs;
  act('');
}
function showQs(){
  var s=C.set.segs[C.seg],base=0,k;
  for(k=0;k<C.seg;k++)base+=C.set.segs[k].qs.length;
  var p=$('player'); if(p)p.hidden=true;
  var last=C.seg+1>=C.set.segs.length;
  $('qs').innerHTML=s.qs.map(function(q,j){
    var gi=base+j;
    return '<div class="qb" data-q="'+gi+'"><div class="qn">Q'+(gi+1)+'</div><p class="qt">'+esc(q.q)+'</p>'+
      '<ul class="opts">'+q.o.map(function(o,oi){return '<li><button data-i="'+oi+'">'+esc(o)+'</button></li>'}).join('')+'</ul>'+
      '<button class="star" data-s="'+gi+'">⭐ 찍었어</button></div>';
  }).join('')+'<div class="row"><button class="btn" id="nextseg">'+(last?'제출 · 채점':'다음 세그먼트')+'</button></div>';
  [].forEach.call($('qs').querySelectorAll('.qb'),function(b){
    var gi=+b.getAttribute('data-q');
    [].forEach.call(b.querySelectorAll('.opts button'),function(btn){
      btn.onclick=function(){
        [].forEach.call(b.querySelectorAll('.opts button'),function(x){x.className=''});
        btn.className='pick';C.ans[gi]=+btn.getAttribute('data-i');
      };
    });
    var st=b.querySelector('.star');
    st.onclick=function(){C.star[gi]=!C.star[gi];st.className='star'+(C.star[gi]?' on':'')};
  });
  $('nextseg').onclick=function(){
    if(C.seg+1<C.set.segs.length){C.seg++;renderSeg();window.scrollTo({top:$('card').offsetTop-20,behavior:'smooth'})}
    else gradeListen();
  };
}
function gradeListen(){
  clearInterval(tick);
  var all=[],n=0;
  C.set.segs.forEach(function(s,si){s.qs.forEach(function(q){all.push({q:q,seg:si,i:n++})})});
  var hit=0,sure=0,sureHit=0,guess=0,guessHit=0,cors=[];
  all.forEach(function(it){
    var mine=C.ans[it.i],ok=mine===it.q.a,st=!!C.star[it.i];
    if(ok)hit++;
    if(st){guess++;if(ok)guessHit++}else{sure++;if(ok)sureHit++}
    if(!ok)cors.push({wrong:'Q'+(it.i+1)+' '+(it.q.o[mine]||'(미선택)'),right:it.q.o[it.q.a],
      why:it.q.why+'  ▸ 근거: "'+it.q.ev+'"',boss:'misc'});
    else if(st)cors.push({wrong:'Q'+(it.i+1)+' 찍어서 맞음',right:it.q.o[it.q.a],
      why:'근거: "'+it.q.ev+'" — 운이야. 이 문장을 다시 들어.',boss:'misc'});
  });
  var score=Math.round(hit/all.length*100);
  var v=hit+' / '+all.length+' 정답 · 확신 '+sureHit+'/'+sure+' · 찍기 '+guessHit+'/'+guess+'.';
  if(guess===0)v+=' 찍은 게 하나도 없다고 했어 — 사실이면 아주 좋은 신호야.';
  else if(sure>0&&sureHit/sure>=0.85&&guessHit/guess<0.5)v+=' 9월 리딩과 똑같은 모양이야 — 아는 건 다 맞히고 찍으면 떨어져. 실력이 아니라 근거 없이 고르는 습관이 문제야.';
  else if(guessHit/Math.max(1,guess)>=0.7)v+=' 찍었다는 것치고 많이 맞았어. 사실은 들린 건데 확신을 못 한 걸 수도 있어.';
  finish(score,{verdict:v,corrections:cors,errorsFound:[],errorsAvoided:[],
    clb:clbBand(Math.round(hit/all.length*100)),clbNote:'Listening '+hit+'/'+all.length,
    next:guess>0?'찍은 문제의 근거 문장을 스크립트에서 찾아 소리 내서 한 번 읽어.':'다음엔 메모 없이 해봐.'},
    all.map(function(it){return 'Q'+(it.i+1)+': '+(it.q.o[C.ans[it.i]]||'-')+(C.star[it.i]?' ⭐':'')}).join('\n'));
  var nz2=function(x){return String(x||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()};
  var qno=0;
  var rev=C.set.segs.map(function(s,k){
    var mark={};
    s.qs.forEach(function(q){
      qno++;
      var ew=nz2(q.ev).split(' ').filter(function(w){return w.length>3}),best=-1,bs=0;
      s.tx.forEach(function(t,ti){
        var lw=nz2(t[1]).split(' '),h=ew.filter(function(w){return lw.indexOf(w)>=0}).length;
        if(h>bs){bs=h;best=ti}
      });
      if(best>=0&&bs>=Math.max(2,ew.length*0.5))(mark[best]=mark[best]||[]).push(qno);
    });
    var lines=s.tx.map(function(t,ti){
      var tag=mark[ti]?'<span class="evq">Q'+mark[ti].join(', Q')+'</span>':'';
      return '<div class="txl'+(mark[ti]?' ev':'')+'"><b>'+esc(t[0])+'</b> '+esc(t[1])+tag+'</div>';
    }).join('');
    return '<div class="seghead" style="margin-top:14px">세그먼트 '+(k+1)+'<span>'+fmt(s.sec)+'</span></div>'+
      '<audio class="rv" controls preload="none" src="'+esc(s.src)+'"></audio>'+
      '<div class="txw">'+lines+'</div>';
  }).join('');
  var vb=C.set.vocab.map(function(p){return '<div class="fix"><span class="r">'+esc(p[0])+'</span><span class="y">'+esc(p[1])+'</span></div>'}).join('');
  $('c-res').insertAdjacentHTML('beforeend',
    '<details class="hrow" style="margin-top:14px"><summary><span class="hd">REVIEW</span><span>다시 듣기 + 스크립트</span><span class="hs"></span></summary>'+
    '<div class="hb"><p class="hd" style="margin-bottom:9px">채점이 끝났으니 이제 다시 들어도 돼. 못 들은 문장을 스크립트에서 눈으로 따라가면서 들어.</p>'+
    '<div class="row" style="margin-top:0"><span class="hlab" style="margin:0">속도</span>'+
    '<button class="btn2 sp on" data-r="1">1.0×</button><button class="btn2 sp" data-r="0.85">0.85×</button><button class="btn2 sp" data-r="0.7">0.7×</button></div>'+
    rev+'<div class="hlab">가져갈 표현</div><div class="fixes">'+vb+'</div></div></details>');
  var box=$('c-res').lastElementChild;
  [].forEach.call(box.querySelectorAll('.sp'),function(b){
    b.onclick=function(){
      [].forEach.call(box.querySelectorAll('.sp'),function(x){x.className='btn2 sp'});
      b.className='btn2 sp on';
      var r=parseFloat(b.getAttribute('data-r'));
      [].forEach.call(box.querySelectorAll('audio.rv'),function(a){a.playbackRate=r});
    };
  });
}

/* --- 스피드 --- */
function buildSpeed(){
  var set=one(SPEED); C={kind:'speed',set:set};
  $('c-body').innerHTML='<div class="scen">8개 질문에 <strong>한 문장씩</strong> 영어로. 빠르게, 고치지 말고.</div>'+
    '<ul class="items">'+set.q.map(function(q){return '<li>'+esc(q)+'</li>'}).join('')+'</ul>'+
    '<textarea id="ans" placeholder="1. ...&#10;2. ..."></textarea><div class="cnt" id="cnt">0 단어</div>';
  wire(); timerUI(); $('sub').onclick=gradeSpeed;
}
function gradeSpeed(){
  clearInterval(tick);
  var secs=Math.round((Date.now()-t0)/1000);
  var lines=($('ans').value||'').split('\n').map(function(s){return s.replace(/^\s*\d+[.)]\s*/,'').trim()}).filter(Boolean);
  var done=Math.min(8,lines.length);
  var fast=secs<=240, score=Math.round(done/8*70)+(fast?30:Math.max(0,30-Math.round((secs-240)/10)));
  var cors=C.set.q.map(function(q,i){return {wrong:lines[i]||'(빈칸)',right:C.set.m[i],why:q,boss:'misc'}}).slice(0,8);
  finish(Math.min(100,score),{verdict:done+'/8 작성 · '+fmt(secs)+'. '+(fast?'속도 좋아.':'4분 안쪽을 목표로.'),
    corrections:cors,errorsFound:[],errorsAvoided:[],
    next:'모범답안과 비교해서 네 문장이 더 짧거나 시제가 틀린 곳만 표시해둬.'},$('ans').value);
}

/* --- 자유 작문 (AI) --- */
function buildWrite(){
  var body='',ask='',bonus=[],scen='';
  if(T.id==='roleplay'){
    var r=one(ROLE); C={kind:'role',r:r,round:0,log:[]};
    scen=r.s; bonus=r.b;
    body='<p class="cmt" style="margin-top:12px">상대 — '+esc(r.c)+'</p><div class="ask"><span class="who">ROUND 1</span>“'+esc(r.l[0])+'”</div>';
    ask='영어로 반박해. 30~60단어.';
  } else if(T.id==='hottake'){
    var h=one(HOT); C={kind:'hot',s:h};
    scen='아래 주장에 찬성하거나 반대해. 이유 하나와 구체적인 예 하나를 꼭 넣어.';
    body='<div class="ask"><span class="who">주장</span>“'+esc(h)+'”</div>';
    bonus=['In my opinion,…','The main reason is that…','For example,…','On the other hand,…'];
    ask='80단어 내외, 5분.';
  } else {
    var e=one(EMAIL); C={kind:'email',s:e};
    scen=e;
    bonus=['I am writing about…','As we agreed,…','Could you please let me know…','I look forward to hearing from you.'];
    ask='90~130단어. 인사 → 문제 → 요청 → 마무리.';
  }
  $('c-body').innerHTML='<div class="scen">'+esc(scen)+'</div>'+body+
    '<div class="bonus">'+bonus.map(function(b){return '<span class="chip">'+esc(b)+'</span>'}).join('')+'</div>'+
    '<p class="cds" style="margin-top:14px;font-weight:700">'+esc(ask)+'</p>'+
    '<textarea id="ans"></textarea><div class="cnt" id="cnt">0 단어</div>';
  wire(); timerUI();
  $('sub').onclick=function(){
    if(C.kind==='role'&&C.round<2){
      C.log.push({them:C.r.l[C.round],me:$('ans').value});
      C.round++;
      $('c-body').insertAdjacentHTML('beforeend','<div class="ask" style="margin-top:16px"><span class="who">ROUND '+(C.round+1)+'</span>“'+esc(C.r.l[C.round])+'”</div>');
      $('ans').value='';$('ans').focus();
      $('c-body').lastElementChild.scrollIntoView({block:'center'});
      return;
    }
    if(C.kind==='role')C.log.push({them:C.r.l[C.round],me:$('ans').value});
    gradeAI();
  };
}
function wire(){
  var ta=$('ans'); if(!ta)return;
  ta.addEventListener('input',function(){var c=$('cnt');if(c){var w=ta.value.trim();c.textContent=(w?w.split(/\s+/).length:0)+' 단어'}});
  ta.focus();
}

/* --- 스피킹 --- */
var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
var sp={rec:null,stream:null,ac:null,raf:0,committed:'',sess:'',interim:'',gaps:[],speaking:false,silStart:0,start:0,mr:null,chunks:[],url:''};
function buildSpeak(){
  var t=one(SPEAK),p=one(t.p);
  C={kind:'speak',t:t,p:p};
  $('c-mt').textContent=TD+' · Task '+t.n+' · '+t.sec+'초 · 100 PT';
  $('c-body').innerHTML='<div class="scen"><strong>Task '+t.n+' · '+esc(t.ko)+'</strong> — '+esc(t.tip)+'</div>'+
    '<div class="ask"><span class="who">prompt</span>'+esc(p)+'</div>'+
    '<div class="bonus">'+t.b.map(function(b){return '<span class="chip">'+esc(b)+'</span>'}).join('')+'</div>'+
    '<div class="stage" id="stg"><div class="phase" id="ph">준비</div><div class="bigt prep" id="bt">0:30</div>'+
    '<div class="ring"><i id="rg"></i></div><div class="meter" id="mtr"></div></div>'+
    '<div class="trans" id="tr"></div>'+
    '<dl class="vst"><div><dt>단어</dt><dd id="v-w">—</dd></div><div><dt>속도</dt><dd id="v-s">—</dd></div>'+
    '<div><dt>무음</dt><dd id="v-q">—</dd></div><div><dt>최장 침묵</dt><dd id="v-l">—</dd></div></dl>';
  for(var i=0;i<15;i++)$('mtr').appendChild(document.createElement('b'));
  act('<button class="btn" id="pr">준비 30초</button><button class="btn2" id="sk">바로 말하기</button>');
  $('pr').onclick=function(){prep(30)}; $('sk').onclick=speak;
}
function prep(n){
  var left=n;clearInterval(tick);
  $('ph').textContent='준비 — 무슨 말을 할지만 정해';$('bt').className='bigt prep';$('bt').textContent=fmt(left);$('rg').style.width='100%';
  act('<button class="btn2" id="sk">바로 말하기</button>');$('sk').onclick=function(){clearInterval(tick);speak()};
  tick=setInterval(function(){left--;$('bt').textContent=fmt(Math.max(0,left));$('rg').style.width=(left/n*100)+'%';
    if(left<=0){clearInterval(tick);speak()}},1000);
}
function speak(){
  sp.committed='';sp.sess='';sp.interim='';sp.gaps=[];sp.speaking=false;sp.start=Date.now();sp.silStart=Date.now();
  var N=C.t.sec,left=N;
  $('tr').innerHTML='';$('ph').textContent='말하는 중 — 멈추지 마';$('bt').className='bigt live';$('bt').textContent=fmt(left);$('rg').style.width='100%';
  act('<button class="btn2" id="st">끝내기</button>');$('st').onclick=stopSpeak;
  navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}}).then(function(stream){
    sp.stream=stream;
    if(sp.url){try{URL.revokeObjectURL(sp.url)}catch(e){}sp.url=''}
    sp.chunks=[];
    try{
      var mr=new MediaRecorder(stream);sp.mr=mr;
      mr.ondataavailable=function(e){if(e.data&&e.data.size)sp.chunks.push(e.data)};
      mr.onstop=function(){
        if(!sp.chunks.length)return;
        try{
          sp.url=URL.createObjectURL(new Blob(sp.chunks,{type:sp.chunks[0].type||'audio/webm'}));
          var slot=$('rec-slot');
          if(slot)slot.innerHTML='<div class="hlab">내 녹음 다시 듣기</div><audio class="rv" controls src="'+sp.url+'"></audio>'+
            '<p class="hd" style="margin-top:5px">침묵이 어디서 났는지는 숫자보다 귀로 듣는 게 빨라.</p>';
        }catch(e){}
      };
      mr.start();
    }catch(e){sp.mr=null}
    var AC=window.AudioContext||window.webkitAudioContext;sp.ac=new AC();
    var src=sp.ac.createMediaStreamSource(stream),an=sp.ac.createAnalyser();an.fftSize=1024;an.smoothingTimeConstant=.3;src.connect(an);
    var buf=new Uint8Array(an.fftSize);
    (function loop(){
      sp.raf=requestAnimationFrame(loop);an.getByteTimeDomainData(buf);
      var s=0;for(var i=0;i<buf.length;i++){var v=(buf[i]-128)/128;s+=v*v}
      var rms=Math.sqrt(s/buf.length),on=rms>0.015,now=Date.now();
      if(on&&!sp.speaking){var q=now-sp.silStart;if(q>900)sp.gaps.push(q);sp.speaking=true}
      else if(!on&&sp.speaking){sp.speaking=false;sp.silStart=now}
      var bars=$('mtr').children,lv=Math.min(1,rms*14);
      for(var k=0;k<bars.length;k++){var d=Math.abs(k-7)/7;
        bars[k].style.height=(4+lv*24*(1-d*.6)*(.7+Math.random()*.5)).toFixed(0)+'px';bars[k].className=lv>.08?'on':''}
    })();
    startSR();
  }).catch(function(err){
    clearInterval(tick);cancelAnimationFrame(sp.raf);
    $('ph').textContent='마이크를 못 열었어';$('bt').className='bigt';$('bt').textContent='—';
    $('c-res').innerHTML='<div class="warn">'+(err&&err.name==='NotAllowedError'
      ?'마이크 권한이 거부됐어. 주소창 왼쪽 자물쇠 → 마이크 → <b>허용</b> → 새로고침.'
      :'마이크를 열 수 없어 ('+esc(err&&err.name||'')+').')+'</div>';
    act('<button class="btn2" id="rt">다시</button>');$('rt').onclick=function(){idle(T)};
  });
  clearInterval(tick);
  tick=setInterval(function(){left--;$('bt').textContent=fmt(Math.max(0,left));$('rg').style.width=(left/N*100)+'%';
    if(left<=0){clearInterval(tick);stopSpeak()}},1000);
}
function startSR(){
  if(!SR){$('c-res').innerHTML='<div class="warn">이 브라우저는 실시간 받아쓰기를 지원하지 않아. <b>Chrome / Edge</b>를 써줘. 수치는 그대로 측정돼.</div>';return}
  try{
    var rec=new SR();sp.rec=rec;rec.lang='en-CA';rec.continuous=true;rec.interimResults=true;
    rec.onresult=function(e){
      var f='',it='';
      for(var i=0;i<e.results.length;i++){if(e.results[i].isFinal)f+=e.results[i][0].transcript+' ';else it+=e.results[i][0].transcript+' '}
      sp.sess=f;sp.interim=it;
      var all=sp.committed+f;
      $('tr').innerHTML=esc(all)+'<span class="int">'+esc(it)+'</span>';
      var w=(all+' '+it).trim();$('v-w').textContent=w?w.split(/\s+/).length:0;
    };
    rec.onerror=function(){};
    rec.onend=function(){sp.committed+=(sp.sess||sp.interim||'');sp.sess='';sp.interim='';if(sp.rec){try{rec.start()}catch(e){}}};
    rec.start();
  }catch(e){}
}
function stopSpeak(){
  clearInterval(tick);cancelAnimationFrame(sp.raf);
  if(sp.rec){var r=sp.rec;sp.rec=null;sp.committed+=(sp.sess||sp.interim||'');sp.sess='';sp.interim='';try{r.onend=null;r.stop()}catch(e){}}
  if(sp.mr){try{if(sp.mr.state!=='inactive')sp.mr.stop()}catch(e){}sp.mr=null}
  if(sp.stream){sp.stream.getTracks().forEach(function(t){t.stop()});sp.stream=null}
  if(sp.ac){try{sp.ac.close()}catch(e){}sp.ac=null}
  var secs=Math.max(3,Math.round((Date.now()-sp.start)/1000));
  if(!sp.speaking){var tail=Date.now()-sp.silStart;if(tail>900)sp.gaps.push(tail)}
  var text=sp.committed.trim().replace(/\s+/g,' ');
  var words=text?text.split(/\s+/).length:0,wpm=Math.round(words/secs*60);
  var quiet=sp.gaps.reduce(function(a,g){return a+g},0)/1000;
  var qpct=Math.max(0,Math.min(99,Math.round(quiet/secs*100)));
  var longest=sp.gaps.length?+(Math.max.apply(null,sp.gaps)/1000).toFixed(1):0;
  $('ph').textContent='끝';$('bt').className='bigt done';$('bt').textContent='✓';
  [].forEach.call($('mtr').children,function(b){b.className='';b.style.height='4px'});
  $('v-w').textContent=words;
  var a=$('v-s');a.textContent=wpm;a.className=wpm>=110?'ok':(wpm>=90?'':'bad');
  var b=$('v-q');b.textContent=qpct+'%';b.className=qpct<=20?'ok':(qpct<=30?'':'bad');
  var c=$('v-l');c.textContent=longest+'s';c.className=longest<=2?'ok':(longest<=2.5?'':'bad');
  C.metrics={words:words,wpm:wpm,qpct:qpct,longest:longest,secs:secs};
  C.text=text;
  if(!words){finish(20,{verdict:'받아쓰기가 안 잡혔어. 마이크 입력과 브라우저를 확인해줘.',corrections:[],errorsFound:[],errorsAvoided:[]},'',C.metrics);return}
  if(apiKey)gradeAI();
  else{
    var base=Math.round(Math.min(45,words/ (C.t.sec/60) /110*45) + (qpct<=20?30:qpct<=30?20:8) + (longest<=2?25:longest<=2.5?15:5));
    var av=[],fo=[];
    if(longest<=2)av.push('freeze'); else if(longest>=3)fo.push('freeze');
    finish(Math.min(100,base),{verdict:'수치 기준 채점이야. 문법 채점은 API 키를 넣으면 돼.',
      corrections:[],errorsFound:fo,errorsAvoided:av,
      next:qpct>20?'무음부터 줄이자 — 막히면 some kind of ___ 로 넘어가.':(wpm<110?'이제 속도야. 같은 내용을 더 빨리.':'좋아. 문법 채점을 받아보자.')},text,C.metrics);
  }
}

/* ============ AI 채점 ============ */
function gradeAI(){
  if(busy)return;busy=true;clearInterval(tick);
  act('<button class="btn" disabled><span class="load"></span>채점 중…</button>');
  var bossList=BOSSES.filter(function(b){return S.bosses[b.id]>0}).map(function(b){return b.id+' = '+b.n+' ('+b.d+')'}).join('; ');
  var task='',ans='',extra='';
  if(C.kind==='role'){
    task='Roleplay — she is pushing back against: '+C.r.c+'. Situation: '+C.r.s;
    ans=C.log.map(function(x,i){return '[Them] '+x.them+'\n[Her] '+x.me}).join('\n\n');
  } else if(C.kind==='hot'){ task='Hot take — she must agree or disagree with: "'+C.s+'" in about 80 words.'; ans=$('ans').value; }
  else if(C.kind==='email'){ task='Email — situation (Korean): '+C.s; ans=$('ans').value; }
  else if(C.kind==='speak'){
    task='CELPIP Speaking Task '+C.t.n+' ('+C.t.t+'), '+C.t.sec+' seconds. Prompt: '+C.p;
    ans=C.text;
    extra='\n\nThis is an automatic speech-to-text transcript, so some words are misheard — judge grammar and content, ignore obvious transcription noise. MEASURED: '+C.metrics.words+' words in '+C.metrics.secs+'s = '+C.metrics.wpm+' wpm; silence '+C.metrics.qpct+'%; longest pause '+C.metrics.longest+'s. CLB 7 needs roughly 110+ wpm and under 20% silence. Factor these into the score.';
  }
  var rub='"rubric": {"content": 0-12, "vocabulary": 0-12, "readability": 0-12, "task": 0-12} — the four official CELPIP Writing criteria (Content/Coherence, Vocabulary, Readability, Task Fulfillment). 12 = CELPIP 12. Grade each independently and say in "rubricNote" one Korean sentence naming the LOWEST one and why,\n"rubricNote": that sentence,\n';
  var prompt='You are grading English for a Korean learner preparing for CELPIP. She is around CELPIP 4-5 and aiming for 7. Be accurate and specific, never flattering, and write all Korean naturally.\n\nTASK: '+task+extra+'\n\nHER ANSWER:\n"""\n'+String(ans).slice(0,4000)+'\n"""\n\nHer recurring error bosses (use these exact ids): '+bossList+'\n\nReturn ONLY a JSON object, no markdown fence:\n{"score": integer 0-100 (a complete, understandable answer earns 55-75 even with errors; 85+ only if nearly clean),\n'+rub+'"verdict": one direct Korean sentence naming the single most important issue,\n"corrections": up to 6 objects {"wrong": exact wrong text, "right": fixed version, "why": short Korean reason, "boss": one boss id or "misc"},\n"errorsFound": array of boss ids that actually appeared,\n"errorsAvoided": array of boss ids that had a clear chance to appear but she got right,\n"win": one short Korean sentence on what she did well,\n"next": one short Korean sentence - the single thing to fix next time}';
  fetch('https://api.anthropic.com/v1/messages',{method:'POST',
    headers:{'content-type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
    body:JSON.stringify({model:model||'claude-sonnet-4-5',max_tokens:1600,messages:[{role:'user',content:prompt}]})
  }).then(function(r){return r.json()}).then(function(d){
    busy=false;
    if(d.error)throw new Error(d.error.message||'API error');
    var txt=(d.content&&d.content[0]&&d.content[0].text)||'';
    var m=txt.match(/\{[\s\S]*\}/); var j=m?JSON.parse(m[0]):null;
    if(!j)throw new Error('응답을 읽지 못했어');
    finish(Math.max(0,Math.min(100,j.score|0)),j,ans,C.metrics);
  }).catch(function(e){
    busy=false;
    $('c-res').innerHTML='<div class="warn"><b>채점 실패</b> — '+esc(e.message||e)+'<br>설정에서 키와 모델을 확인해줘.</div>';
    finish(55,{verdict:'채점을 못 했어. 답은 기록해둘게.',corrections:[],errorsFound:[],errorsAvoided:[]},ans,C.metrics);
  });
}

/* ============ 마무리 ============ */
function finish(score,g,answer,metrics){
  clearInterval(tick);$('card').classList.remove('live');
  g=g||{};g.corrections=g.corrections||[];g.errorsFound=g.errorsFound||[];g.errorsAvoided=g.errorsAvoided||[];
  var repeat=S.runs.some(function(r){return r.date===TD});
  var bonus=g.bonus|0;
  var gain=repeat?Math.round((score+bonus)/2):(score+bonus);
  S.xp+=gain;
  var killed=[];
  g.errorsAvoided.forEach(function(id){if(S.bosses[id]>0){S.bosses[id]=Math.max(0,S.bosses[id]-12);if(S.bosses[id]===0)killed.push(id)}});
  g.errorsFound.forEach(function(id){if(S.bosses[id]!=null)S.bosses[id]=Math.min(100,S.bosses[id]+8)});
  var prompt='';
  if(C){ if(C.kind==='speak')prompt='Task '+C.t.n+' · '+C.t.ko+'\n'+C.p;
    else if(C.kind==='role')prompt=C.r.c+'\n'+C.r.s;
    else if(C.kind==='hot')prompt=C.s;
    else if(C.kind==='email')prompt=C.s;
    else if(C.kind==='repair')prompt=C.items.map(function(x,i){return (i+1)+'. '+x[0]}).join('\n');
    else if(C.kind==='trap')prompt=C.it.q+'\n'+C.it.o.join('  ');
    else if(C.kind==='speed')prompt=C.set.q.map(function(x,i){return (i+1)+'. '+x}).join('\n');
    else if(C.kind==='readp1')prompt='Reading Part 1 · '+C.set.title+'\n'+C.set.from+'\n'+C.set.qs.map(function(q,i){return (i+1)+'. '+q.q}).join('\n');
    else if(C.kind==='listen'){var qn=0;prompt=C.set.part+' · '+C.set.title+'\n'+
      C.set.segs.map(function(s){return s.qs.map(function(q){return 'Q'+(++qn)+'. '+q.q}).join('\n')}).join('\n')} }
  if(g.rubric&&!g.clb){
    var rk=['content','vocabulary','readability','task'];
    var rm=Math.round(rk.reduce(function(a,k){return a+(g.rubric[k]|0)},0)/4);
    g.clb={lo:rm,hi:rm};g.clbNote='4항목 평균';
  }
  var rec={date:TD,type:T.id,score:gain,ts:Date.now(),prompt:prompt,answer:String(answer||'').slice(0,4000),
    verdict:g.verdict||'',corrections:g.corrections.slice(0,8),next:g.next||'',
    errorsFound:g.errorsFound,errorsAvoided:g.errorsAvoided};
  if(metrics)rec.metrics=metrics;
  if(g.clb)rec.clb=g.clb;
  S.runs.push(rec);save();

  var h='<div class="res"><div class="score"><span class="scn">'+score+'</span><span class="scx">/ 100'+(repeat?' · 오늘 두 번째라 절반 적립':'')+'</span></div>';
  if(g.verdict)h+='<p class="vd">'+esc(g.verdict)+'</p>';
  if(g.rubric){
    var RB=[['content','내용·전개'],['vocabulary','어휘'],['readability','가독성'],['task','과제 충족']];
    var lo=RB.reduce(function(a,b){return (g.rubric[b[0]]|0)<(g.rubric[a[0]]|0)?b:a});
    h+='<div class="rub">'+RB.map(function(r){
      var v=Math.max(0,Math.min(12,g.rubric[r[0]]|0));
      return '<div class="rb'+(r[0]===lo[0]?' low':'')+'"><div class="rbn">'+esc(r[1])+'</div>'+
        '<div class="rbr"><i style="width:'+(v/12*100)+'%"></i></div><div class="rbv">'+v+'</div></div>';
    }).join('')+'</div>';
    h+='<p class="hd" style="margin-top:6px">CELPIP 공식 4항목 · 12점 만점 · 목표 7</p>';
    if(g.rubricNote)h+='<p class="vd" style="margin-top:7px">'+esc(g.rubricNote)+'</p>';
  }
  if(g.clb)h+=bandHtml(g.clb,g.clbNote);
  if(g.corrections.length)h+='<div class="fixes">'+g.corrections.map(function(c){
    return '<div class="fix"><span class="w">'+esc(c.wrong)+'</span> → <span class="r">'+esc(c.right)+'</span>'+(c.why?'<span class="y">'+esc(c.why)+'</span>':'')+'</div>'}).join('')+'</div>';
  if(bonus)h+='<p class="bonus">🏅 '+esc(g.bonusNote||'보너스')+' = +'+bonus+'</p>';
  h+='<p class="gain">+'+gain+' XP'+(g.errorsAvoided.length?' · 보스 '+g.errorsAvoided.length+'체 타격':'')+
     (killed.length?' · 🏆 '+killed.map(function(k){return(BOSSES.filter(function(b){return b.id===k})[0]||{}).n}).join(', ')+' 격파!':'')+'</p>';
  if(g.win)h+='<p class="vd" style="color:var(--good);margin-top:7px">⬆ '+esc(g.win)+'</p>';
  if(g.next)h+='<p class="vd" style="margin-top:4px">→ 다음엔: '+esc(g.next)+'</p>';
  if(C&&C.kind==='speak')h+='<div id="rec-slot">'+(sp.url?'<div class="hlab">내 녹음 다시 듣기</div><audio class="rv" controls src="'+sp.url+'"></audio>':'')+'</div>';
  h+='</div>';
  $('c-res').insertAdjacentHTML('beforeend',h);
  act('<button class="btn" id="nx">다음 챌린지</button><button class="btn2" id="ag">같은 걸 한 번 더</button>');
  $('nx').onclick=function(){idle()};
  $('ag').onclick=function(){idle(T);start()};
  renderHud();renderBosses();renderHist();renderNb();
  window.scrollTo({top:$('card').offsetTop-20,behavior:'smooth'});
}

/* ============ 설정 ============ */
function keyUI(){
  $('kst').textContent=apiKey?'연결됨':'없음';
  $('kst').className='pill'+(apiKey?' on':'');
  if(apiKey)$('k').value='';
}
function loadModels(){
  if(!apiKey)return;
  fetch('https://api.anthropic.com/v1/models?limit=40',{headers:{'x-api-key':apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'}})
   .then(function(r){return r.json()}).then(function(d){
     if(!d.data)return;
     var sel=$('model');
     sel.innerHTML=d.data.map(function(m){return '<option value="'+esc(m.id)+'"'+(m.id===model?' selected':'')+'>'+esc(m.display_name||m.id)+'</option>'}).join('');
     if(!model&&d.data.length){model=d.data[0].id;try{localStorage.setItem(MKEY,model)}catch(e){}}
   }).catch(function(){});
}
$('ksave').onclick=function(){
  var v=$('k').value.trim(); if(!v)return;
  apiKey=v;try{localStorage.setItem(AKEY,v)}catch(e){}
  keyUI();loadModels();idle();
};
$('kclear').onclick=function(){apiKey='';model='';try{localStorage.removeItem(AKEY);localStorage.removeItem(MKEY)}catch(e){};$('model').innerHTML='<option value="">모델</option>';keyUI();idle()};
$('model').onchange=function(){model=this.value;try{localStorage.setItem(MKEY,model)}catch(e){}};
$('exp').onclick=function(){
  var s=S.runs.slice(-40).map(function(r){
    return '['+r.date+'] '+r.type+' +'+r.score+'\n'+(r.prompt?'문제: '+r.prompt+'\n':'')+(r.answer?'답: '+r.answer+'\n':'')+
      (r.metrics?'수치: '+r.metrics.words+'단어 '+r.metrics.wpm+'wpm 무음'+r.metrics.qpct+'% 최장'+r.metrics.longest+'s\n':'')+
      (r.verdict?'총평: '+r.verdict+'\n':'')+
      (r.corrections||[]).map(function(c){return ' · '+c.wrong+' → '+c.right}).join('\n');
  }).join('\n\n---\n\n');
  var t='[셀핍 아레나 기록] Lv.'+(lvl(S.xp)+1)+' / '+S.xp+'XP\n\n'+s;
  if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){$('exp').textContent='✓ 복사됨';setTimeout(function(){$('exp').textContent='📋 전체 기록 복사'},1600)});
};
$('wipe').onclick=function(){
  if(!confirm('전투 기록·XP·보스 HP를 전부 지울까? 되돌릴 수 없어.'))return;
  S={xp:SEED,bosses:{},runs:[]};BOSSES.forEach(function(b){S.bosses[b.id]=b.hp});save();
  renderHud();renderBosses();renderHist();renderNb();idle();
};

/* ============ 부팅 ============ */
load();keyUI();if(apiKey)loadModels();
renderHud();renderBosses();renderHist();renderNb();renderTypes();idle();
})();
