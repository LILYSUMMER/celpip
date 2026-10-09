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
/* ---- 듣기 함정 (CELPIP Listening Part 1 축소판: 대화 1편 + 문항 4 + 재진술 1) ---- */
var LISTEN=[
 {t:'세탁실 수리',sp:['Jordan','Ms. Park'],
  l:[[0,"Hi, this is Jordan from unit 804. I'm calling about the laundry room on the third floor."],
     [1,"Oh, hi Jordan. Let me guess. The dryer again?"],
     [0,"Actually, both dryers now. The one on the left stopped heating last week, and the other one has been making a loud noise for two weeks."],
     [1,"I'm sorry about that. The repair company came on Monday, but they only had the part for one machine."],
     [0,"So when are they coming back?"],
     [1,"They said Thursday, but I'd rather tell you Friday to be safe. I'll put a notice in the lobby once they confirm."],
     [0,"Okay. In the meantime, is there anything we can do? I've got a week of laundry piling up."],
     [1,"The laundry room in the east tower is open to everyone in the building this week. You just need your fob."],
     [0,"I didn't know that. Is it the same price?"],
     [1,"It's actually a bit cheaper, two dollars a load instead of two fifty, because those machines are older."],
     [0,"Good to know. One more thing, could you email me when the notice goes up? I don't always check the lobby."],
     [1,"Sure. I'll send it to the address on your lease. Thanks for letting me know about the noise."]],
  q:[{q:'Why is Jordan calling?',o:['A) To report a problem with both dryers','B) To complain about noise from the hallway','C) To ask for a refund for a load','D) To report a problem with the washing machines'],a:0,
      why:'D가 함정. "laundry room"이 나왔다고 washing machine이 아니야. 고장 난 건 dryers.'},
     {q:"Why didn't the repair company fix both machines on Monday?",o:['A) They ran out of time','B) They only brought one part','C) They could not find the second machine','D) The second dryer was still working'],a:1,
      why:'"they only had the part for one machine"을 그대로 들어야 해. D는 상식으로 메운 추론.'},
     {q:'What does Ms. Park say about the east tower laundry room?',o:['A) It costs more','B) It is only for east tower residents','C) It is cheaper because the machines are older','D) It is closed this week'],a:2,
      why:'"two dollars instead of two fifty, because those machines are older"'},
     {q:'What does Jordan ask Ms. Park to do?',o:['A) Call him when the repair is done','B) Email him when the notice goes up','C) Lower the laundry price','D) Put a notice in the east tower'],a:1,
      why:'A는 지문에 있는 사람 + 지문에 없는 행동. 그는 "email me"라고 했어.'}],
  k:{ask:'Ms. Park이 이번 주 세탁 문제의 대안으로 말한 문장을 들은 대로 써.',ev:'The laundry room in the east tower is open to everyone in the building this week.'}},
 {t:'촬영 일정 변경',sp:['Sam','Mina'],
  l:[[0,"Mina, do you have a minute? It's about Thursday's shoot at the waterfront."],
     [1,"Sure. Is the client still happy with the location?"],
     [0,"They love it, but the weather is the problem. The forecast says heavy rain all afternoon."],
     [1,"Hmm. We can't shoot a product video in the rain. Can we move it to the morning?"],
     [0,"The client's team can't come before noon. They're flying in from Calgary that day."],
     [1,"Then let's push it to Friday. Is the location available?"],
     [0,"I checked. Friday is free, but the permit fee goes up on Fridays and weekends. It's an extra eighty dollars."],
     [1,"That's fine. Rain would cost us a lot more. What about the camera rental?"],
     [0,"That's the tricky part. The rental shop closes at six on Thursday, and we'd need to return the gear by then."],
     [1,"Call them and ask if they can extend it one day. If they say no, we'll rent from the place on Granville instead."],
     [0,"Got it. Should I tell the client about the change now?"],
     [1,"Yes, but say it's tentative until we hear back about the camera. I'd rather not change the date twice."]],
  q:[{q:"What is the main problem with Thursday's shoot?",o:['A) The client does not like the location','B) Heavy rain is expected in the afternoon','C) The camera rental is too expensive','D) The permit has expired'],a:1,why:'"heavy rain all afternoon"'},
     {q:"Why can't the shoot move to Thursday morning?",o:['A) The location is booked','B) The client\'s team arrives from Calgary at noon','C) Mina has another meeting','D) The rental shop is closed in the morning'],a:1,
      why:'D는 지문에 있는 단어(rental shop)로 만든 함정. 가게는 "closes at six"지 아침 얘기가 아니야.'},
     {q:'What does Mina say about the extra permit fee?',o:['A) It is too expensive','B) The client should pay it','C) It is acceptable because rain would cost more','D) It only applies on weekends'],a:2,why:'"That\'s fine. Rain would cost us a lot more."'},
     {q:'What should Sam tell the client?',o:['A) The shoot is cancelled','B) The new date is confirmed','C) The date may still change until the camera is sorted out','D) To bring their own camera'],a:2,why:'"say it\'s tentative until we hear back about the camera"'}],
  k:{ask:'카메라 대여에 대해 Mina가 지시한 문장을 들은 대로 써.',ev:'Call them and ask if they can extend it one day.'}},
 {t:'동물병원 예약',sp:['Omar','Yuna'],
  l:[[0,"Westside Animal Clinic, this is Omar."],
     [1,"Hi, I'm calling about my cat, Mochi. She's booked for a check-up on Saturday at ten."],
     [0,"Let me find that. Yes, Mochi, Saturday at ten with Dr. Lee."],
     [1,"The thing is, she hasn't been eating well since yesterday, and I'm a little worried. Is there any way to see someone sooner?"],
     [0,"Dr. Lee is fully booked today, but Dr. Chen has an opening at four thirty this afternoon."],
     [1,"Four thirty works. Should I bring anything?"],
     [0,"If you can, bring a sample of the food she's been refusing, and a note of how much water she's drinking."],
     [1,"Okay. And should I keep the Saturday appointment?"],
     [0,"Let's cancel it for now. If Dr. Chen wants a follow-up, we'll book it before you leave."],
     [1,"Sounds good. Oh, is parking still behind the building?"],
     [0,"It is, but the lot is being repaved this week, so it's only half open. Give yourself an extra ten minutes."],
     [1,"Thanks, I'll be there at four thirty."]],
  q:[{q:'Why does Yuna want an earlier appointment?',o:['A) Her cat has not been eating well','B) She is busy on Saturday','C) Dr. Lee is away on Saturday','D) Her cat was injured'],a:0,why:'"she hasn\'t been eating well since yesterday"'},
     {q:'Who will see Mochi this afternoon?',o:['A) Dr. Lee','B) Dr. Chen','C) Omar','D) Any available vet'],a:1,why:'Dr. Lee는 "fully booked today". 이름이 먼저 나왔다고 답이 아니야.'},
     {q:'What does Omar ask Yuna to bring?',o:['A) Mochi\'s vaccination record','B) A sample of the food and a note about water','C) A urine sample','D) Her Saturday booking number'],a:1,why:'"a sample of the food... and a note of how much water"'},
     {q:'Why should Yuna arrive early?',o:['A) The clinic is busy','B) The parking lot is partly closed','C) She needs to fill out forms','D) Dr. Chen leaves at five'],a:1,why:'"the lot is being repaved... only half open"'}],
  k:{ask:'토요일 예약을 어떻게 할지 Omar가 한 말을 들은 대로 써.',ev:"If Dr. Chen wants a follow-up, we'll book it before you leave."}},
 {t:'수영 강습 등록',sp:['Priya','Daniel'],
  l:[[0,"Hi, how can I help you?"],
     [1,"I'd like to sign up for the adult beginner swim class. The one on Tuesday evenings."],
     [0,"The Tuesday class is full, I'm afraid. We do have spots on Wednesday at seven and Saturday at nine in the morning."],
     [1,"Wednesday at seven would work. How long is the session?"],
     [0,"Eight weeks, forty-five minutes each. It starts next week, so you'd be joining from the first class."],
     [1,"Great. And the price?"],
     [0,"It's one hundred and twenty dollars for residents, or one forty if you live outside the city. Do you have a Vancouver address?"],
     [1,"I do. I just moved here, though, so my ID still shows my old address in Burnaby."],
     [0,"That's okay. A utility bill or a lease with your new address is enough."],
     [1,"I have a copy of my lease on my phone. Will that do?"],
     [0,"That works. One more thing, the pool is closed for cleaning the last week of the month, so there's no class that Wednesday. We add one at the end instead."],
     [1,"Perfect. Let's do it."]],
  q:[{q:"Why can't Daniel take the Tuesday class?",o:['A) It is too expensive','B) It is full','C) It is for children','D) It starts too late'],a:1,why:'"The Tuesday class is full"'},
     {q:'How long is each class?',o:['A) Forty minutes','B) Forty-five minutes','C) One hour','D) Eight weeks'],a:1,why:'D는 코스 전체 길이. 숫자가 들렸다고 답이 아니야.'},
     {q:'Why does Priya ask for a utility bill or a lease?',o:['A) To confirm his new Vancouver address','B) To check his swimming level','C) Because his ID has expired','D) Because he is a student'],a:0,why:'ID에 옛 주소(Burnaby)가 있어서 새 주소 증명이 필요한 거야.'},
     {q:'What happens in the last week of the month?',o:['A) The price goes up','B) The class moves to Saturday','C) There is no class because the pool is closed','D) The course ends'],a:2,why:'"the pool is closed for cleaning... no class that Wednesday"'}],
  k:{ask:'주소 증명으로 뭐가 필요한지 Priya가 한 말을 들은 대로 써.',ev:'A utility bill or a lease with your new address is enough.'}}
];
/* ---- 철자 받아쓰기. 앞 6개는 그녀의 실제 오철자. 나머지는 그녀 글(Task 2 템플릿·수리소 문장)에 실제로 쓰이는 단어.
        안키 7번 덱(25장) 목록을 받으면 그걸로 교체할 것. ---- */
var SPELL=[
 ['believe','I believe that online shopping saves time.'],
 ['quality','The quality of the food was excellent.'],
 ['survey','I am writing in response to your survey.'],
 ['important','It is important to arrive on time.'],
 ['outside','We ate outside because the weather was nice.'],
 ['healthier','Cooking at home is healthier than eating out.'],
 ['because','I chose this option because it is cheaper.'],
 ['different','People have different opinions about this.'],
 ['environment','Public transit is better for the environment.'],
 ['government','The government should support small businesses.'],
 ['convenient','The new location is more convenient for me.'],
 ['necessary','It is necessary to book in advance.'],
 ['definitely','I would definitely recommend this option.'],
 ['experience','I had a great experience at the workshop.'],
 ['receive','I did not receive the package.'],
 ['separate','Please send a separate invoice for the deposit.'],
 ['through','I learned a lot through this project.'],
 ['beautiful','Stanley Park is beautiful in the fall.'],
 ['recommend','I recommend the second option.'],
 ['apartment','Our apartment is close to the station.'],
 ['restaurant','We tried a new restaurant last weekend.'],
 ['schedule','My schedule is very busy this month.'],
 ['exercise','I exercise three times a week.'],
 ['comfortable','The chairs were not very comfortable.'],
 ['especially','I like Vancouver, especially in summer.'],
 ['available','Is the studio available on Friday?'],
 ['community','The community centre offers free classes.'],
 ['decision','It was a difficult decision for our family.'],
 ['opinion','In my opinion, the first plan is better.'],
 ['benefit','Another benefit is that it saves money.']
];

var TYPES=[
 {id:'speak',ic:'🎤',nm:'1분 스피킹',df:3,mn:5,ds:'준비 30초, 말하기 60초. 마이크로 속도·무음까지 잰다.',ai:false},
 {id:'repair',ic:'🛠️',nm:'문장 수리소',df:2,mn:6,ds:'네가 실제로 틀렸던 문장 8개가 고장난 채로 온다.',ai:false},
 {id:'traphunt',ic:'🔍',nm:'함정 사냥',df:2,mn:6,ds:'답만으론 점수 없다. 근거 문장까지 짚어야 한다.',ai:false},
 {id:'speed',ic:'⚡',nm:'스피드 라운드',df:1,mn:5,ds:'질문 8개. 한 줄씩. 생각하지 말고 바로.',ai:false},
 {id:'listen',ic:'🎧',nm:'듣기 함정',df:2,mn:6,ds:'대화를 한 번만 들려준다. 문항 4개 + 들은 문장 재진술.',ai:false},
 {id:'spell',ic:'🔤',nm:'철자 받아쓰기',df:1,mn:4,ds:'단어 10개를 불러준다. 시험엔 스펠체크가 없다.',ai:false},
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
  $('s-avg').textContent=S.runs.length?Math.round(S.runs.reduce(function(a,r){return a+(r.score||0)},0)/S.runs.length):'—';
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
  hush();
  if(sp.warm){sp.warm.then(function(st){st.getTracks().forEach(function(x){x.stop()})}).catch(function(){});sp.warm=null}
  if(sp.ac&&!sp.stream){try{sp.ac.close()}catch(e){}sp.ac=null}
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
  if(T.id==='speed')return buildSpeed();
  if(T.id==='listen')return buildListen();
  if(T.id==='spell')return buildSpell();
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
    next:'답을 고르기 전에 "이 답의 근거가 몇 번째 문장이지?"를 1초만 물어.'},
    '선택: '+(it.o[C.pick]||'-')+'\n근거: '+($('ans').value||'-'));
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

/* --- 브라우저 TTS (듣기·철자 공용) --- */
var tts={v:[],on:!!window.speechSynthesis};
function ttsLoad(){
  if(!tts.on)return;
  var grab=function(){var v=window.speechSynthesis.getVoices()||[];if(v.length)tts.v=v};
  grab(); try{window.speechSynthesis.onvoiceschanged=grab}catch(e){}
}
function ttsVoices(){
  /* 영어 음성 둘. 북미 영어 우선, 같은 이름 중복 제거. 하나뿐이면 음높이로 구분. */
  var en=tts.v.filter(function(v){return /^en[-_]/i.test(v.lang)});
  var score=function(v){var l=v.lang.toLowerCase(),n=(v.name||'').toLowerCase();
    return (l==='en-ca'?4:l==='en-us'?3:l==='en-gb'||l==='en-au'?1:2)+(/google|samantha|daniel|karen|moira|natural|neural/.test(n)?2:0)+(v.localService?0:1)};
  en.sort(function(a,b){return score(b)-score(a)});
  var a=en[0]||null,b=null;
  for(var i=1;i<en.length;i++){if(en[i].name!==a.name){b=en[i];break}}
  return [a,b];
}
function say(text,voice,pitch,rate){
  return new Promise(function(res){
    if(!tts.on){res();return}
    var u=new SpeechSynthesisUtterance(text);
    if(voice)u.voice=voice; u.lang=(voice&&voice.lang)||'en-CA'; u.rate=rate||0.95; u.pitch=pitch||1;
    var done=false,fin=function(){if(!done){done=true;res()}};
    u.onend=fin;u.onerror=fin;
    /* 일부 브라우저가 onend를 안 쏘는 경우 대비 */
    setTimeout(fin,Math.max(3000,text.length*120));
    try{window.speechSynthesis.speak(u)}catch(e){fin()}
  });
}
function hush(){try{if(tts.on)window.speechSynthesis.cancel()}catch(e){}}
function ttsNote(){
  if(tts.on)return '';
  var e=env();
  return '<div class="warn"><b>이 브라우저는 음성 합성이 안 돼.</b> '+(e.ios?'Safari로 열어줘.':'Chrome으로 열어줘.')+' 아래 대본을 읽고 푸는 걸로 대체할게.</div>';
}

/* --- 듣기 함정 --- */
function buildListen(){
  var it=one(LISTEN); C={kind:'listen',it:it,pick:[],plays:0,playing:false,heard:false};
  var vs=ttsVoices();C.va=vs[0];C.vb=vs[1];
  $('c-body').innerHTML='<div class="scen"><strong>'+esc(it.t)+'</strong> — '+esc(it.sp[0])+'와 '+esc(it.sp[1])+'의 대화. 시험처럼 <strong>한 번만</strong> 들려준다. 메모는 해도 돼.</div>'+
    ttsNote()+
    '<div class="stage" id="stg"><div class="phase" id="ph">듣기</div><div class="bigt prep" id="bt">▶</div>'+
    '<div class="ring"><i id="rg" style="width:0"></i></div><p class="cmt" id="who" style="margin-top:10px;min-height:1.4em"></p></div>'+
    '<div id="lq"></div>';
  if(!tts.on){ // 폴백: 읽기 모드
    C.heard=true;
    $('stg').hidden=true;
    $('lq').innerHTML='<div class="scen">'+it.l.map(function(x){return '<strong>'+esc(it.sp[x[0]])+':</strong> '+esc(x[1])}).join('<br>')+'</div>';
    listenQs();return;
  }
  act('<button class="btn" id="pl">▶ 듣기 시작</button>');
  $('pl').onclick=function(){playListen()};
}
function playListen(){
  if(C.playing)return;
  var it=C.it;C.playing=true;C.plays++;hush();
  $('bt').className='bigt live';$('bt').textContent='●';$('ph').textContent=C.plays>1?'다시 듣는 중 (−10)':'듣는 중';
  act('<button class="btn2" disabled>듣는 중…</button>');
  var i=0,n=it.l.length;
  (function next(){
    if(i>=n||C.kind!=='listen'){ C.playing=false;
      if(C.kind!=='listen')return;
      $('bt').className='bigt done';$('bt').textContent='✓';$('ph').textContent='끝';$('who').textContent='';$('rg').style.width='100%';
      if(!C.heard){C.heard=true;listenQs()} else {act('<button class="btn" id="sub">제출 · 채점</button>');$('sub').onclick=gradeListen}
      return }
    var ln=it.l[i];i++;
    $('who').textContent=it.sp[ln[0]]+' …';$('rg').style.width=Math.round(i/n*100)+'%';
    var v=ln[0]===0?C.va:(C.vb||C.va),pitch=ln[0]===0?1:(C.vb?1:0.8);
    say(ln[1],v,pitch,0.95).then(function(){setTimeout(next,350)});
  })();
}
function listenQs(){
  var it=C.it;
  $('lq').innerHTML=it.q.map(function(q,qi){
    return '<div class="ask" style="margin-top:14px"><span class="who">Q'+(qi+1)+'</span>'+esc(q.q)+'</div>'+
      '<ul class="opts" data-q="'+qi+'">'+q.o.map(function(o,i){return '<li><button data-i="'+i+'">'+esc(o)+'</button></li>'}).join('')+'</ul>'}).join('')+
    '<p class="cds" style="margin-top:16px;font-weight:700">'+esc(it.k.ask)+'</p>'+
    '<textarea id="ans" style="min-height:70px" placeholder="들은 대로. 틀려도 돼, 안 쓰는 게 0점이야."></textarea>';
  [].forEach.call($('lq').querySelectorAll('.opts'),function(ul){
    var qi=+ul.dataset.q;
    [].forEach.call(ul.querySelectorAll('button'),function(b){b.onclick=function(){
      [].forEach.call(ul.querySelectorAll('button'),function(x){x.className=''});b.className='pick';C.pick[qi]=+b.dataset.i}});
  });
  act('<button class="btn" id="sub">제출 · 채점</button>'+(tts.on?'<button class="btn2" id="ag">한 번 더 듣기 (−10)</button>':''));
  $('sub').onclick=gradeListen; if($('ag'))$('ag').onclick=playListen;
}
function gradeListen(){
  hush();clearInterval(tick);
  var it=C.it,hit=0,cors=[];
  it.q.forEach(function(q,qi){
    var p=C.pick[qi],ok=p===q.a; if(ok)hit++;
    else cors.push({wrong:'Q'+(qi+1)+' '+(q.o[p]||'(미선택)'),right:q.o[q.a],why:q.why,boss:'misc'});
    var ul=$('lq').querySelector('.opts[data-q="'+qi+'"]');
    if(ul)[].forEach.call(ul.querySelectorAll('button'),function(b,i){b.className=i===q.a?'right':(i===p?'wrong':'')});
  });
  var nz=function(s){return String(s||'').toLowerCase().replace(/n't/g,' not').replace(/'ll/g,' will').replace(/cannot/g,'can not').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()};
  var ev=nz($('ans').value),tw=nz(it.k.ev).split(' ').filter(function(w){return w.length>2}),ew=ev.split(' ');
  var hitw=tw.filter(function(w){return ew.indexOf(w)>=0}).length;
  var evOk=ev.length>8&&tw.length>0&&hitw/tw.length>=0.6;
  if(!evOk)cors.push({wrong:$('ans').value||'(빈칸)',right:it.k.ev,why:'핵심 문장은 단어 60% 이상 맞으면 인정해.',boss:'misc'});
  var pen=Math.max(0,C.plays-1)*10;
  var score=Math.max(0,hit*15+(evOk?40:0)-pen);
  /* 대본 공개 */
  $('lq').insertAdjacentHTML('beforeend','<div class="hlab" style="margin-top:16px">대본</div><div class="scen">'+it.l.map(function(x){
    var t=esc(x[1]);if(x[1]===it.k.ev)t='<mark>'+t+'</mark>';return '<strong>'+esc(it.sp[x[0]])+':</strong> '+t}).join('<br>')+'</div>');
  finish(score,{verdict:hit+'/4 정답'+(evOk?' + 재진술 성공':' · 재진술 실패')+(pen?' · 다시 듣기 −'+pen:'')+'.'+(hit===4?' 함정을 다 피했어.':hit>=2?' 틀린 문항의 함정 설명을 읽어.':' 대본을 다시 읽고 어디서 끊겼는지 봐.'),
    corrections:cors,errorsFound:[],errorsAvoided:[],
    next:evOk?'다음엔 숫자·요일·이름이 나올 때 바로 메모해.':'핵심 문장을 통째로 기억하려 하지 말고 동사 하나만 잡아. 나머지는 거기서 재구성돼.'},
    it.q.map(function(q,qi){return 'Q'+(qi+1)+': '+(q.o[C.pick[qi]]||'-')}).join('\n')+'\n재진술: '+($('ans').value||'-'));
}

/* --- 철자 받아쓰기 --- */
function buildSpell(){
  var items=pickN(SPELL,10); C={kind:'spell',items:items,i:0,ans:[]};
  var v=ttsVoices()[0];C.va=v;
  $('c-body').innerHTML='<div class="scen">단어 10개. 단어 → 예문 → 단어 순으로 불러준다. <strong>스펠체크 없이</strong> 적어.</div>'+ttsNote()+
    '<div class="stage" id="stg"><div class="phase" id="ph">단어 1 / 10</div><div class="bigt prep" id="bt">🔊</div>'+
    '<div class="ring"><i id="rg" style="width:0"></i></div></div>'+
    '<input type="text" id="sw" placeholder="들은 단어" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" style="margin-top:13px;font-family:var(--m);font-size:18px;padding:13px">'+
    (tts.on?'':'<p class="cds" id="fb" style="margin-top:8px"></p>');
  act('<button class="btn" id="go2">▶ 시작</button>');
  $('go2').onclick=function(){spellShow()};
  timerStart();
}
function timerStart(){t0=Date.now()}
function spellSay(){
  var it=C.items[C.i];hush();
  if(!tts.on){$('fb').textContent='음성 없음 — 예문: '+it[1].replace(new RegExp(it[0],'i'),'_____');return Promise.resolve()}
  return say(it[0],C.va,1,0.85).then(function(){return say(it[1],C.va,1,0.95)}).then(function(){return say(it[0],C.va,1,0.8)});
}
function spellShow(){
  $('ph').textContent='단어 '+(C.i+1)+' / 10';$('rg').style.width=Math.round(C.i/10*100)+'%';
  $('sw').value='';$('sw').focus();
  act('<button class="btn" id="nx2">'+(C.i===9?'제출 · 채점':'다음')+'</button><button class="btn2" id="rp">🔊 다시</button>');
  $('rp').onclick=spellSay;
  var go=function(){C.ans[C.i]=$('sw').value.trim();C.i++;if(C.i>=10)gradeSpell();else spellShow()};
  $('nx2').onclick=go;
  $('sw').onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();go()}};
  spellSay();
}
function gradeSpell(){
  hush();
  var hit=0,cors=[],alt={neighbourhood:'neighborhood',favourite:'favorite',colour:'color',centre:'center'};
  C.items.forEach(function(it,i){
    var a=(C.ans[i]||'').toLowerCase(),w=it[0];
    var ok=a===w||(alt[w]&&a===alt[w]);
    if(ok)hit++; else cors.push({wrong:C.ans[i]||'(빈칸)',right:w,why:it[1],boss:'spell'});
  });
  var secs=Math.round((Date.now()-t0)/1000);
  var score=hit*10;
  finish(score,{verdict:hit+'/10 정확'+(hit>=9?'. 철자 보스가 흔들린다.':hit>=7?'. 틀린 단어는 소리 내서 한 글자씩 읽어.':'. 틀린 단어를 지금 바로 3번씩 타이핑해.'),
    corrections:cors,errorsFound:hit<8?['spell']:[],errorsAvoided:hit>=8?['spell']:[],
    next:cors.length?('다음 타깃: '+cors.map(function(c){return c.right}).slice(0,3).join(', ')):'10개 전부. 다음엔 글 쓸 때 마지막 3분 철자 패스를 해봐.'},
    C.items.map(function(it,i){return (i+1)+'. '+(C.ans[i]||'-')+(C.ans[i]&&C.ans[i].toLowerCase()===it[0]?'':' ('+it[0]+')')}).join('\n'));
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
var sp={rec:null,stream:null,ac:null,raf:0,committed:'',sess:'',interim:'',gaps:[],speaking:false,silStart:0,start:0,warm:null,lock:null};
/* 폰 진단: 뭐가 되고 뭐가 안 되는지 녹음 전에 말해준다 */
function env(){
  var ua=navigator.userAgent||'';
  var ios=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  var android=/Android/.test(ua);
  var standalone=(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone===true;
  var mic=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia);
  var secure=window.isSecureContext!==false;
  return {ios:ios,android:android,mobile:ios||android,standalone:standalone,mic:mic&&secure,sr:!!SR,tts:!!window.speechSynthesis};
}
function micNote(){
  var e=env(),h='';
  if(!e.mic)h+='<div class="warn"><b>마이크를 쓸 수 없는 환경이야.</b> '+(e.ios?'아이폰이면 <b>Safari</b>로 열어줘. 홈 화면에 추가한 앱도 Safari 기준으로 돌아가.':'HTTPS 주소인지, 브라우저가 최신인지 확인해줘.')+'</div>';
  else if(!e.sr)h+='<div class="warn">받아쓰기가 안 되는 브라우저야. 수치(속도·무음)는 그대로 재지만 문장은 안 남아. '+
    (e.ios?'아이폰은 <b>Safari</b>에서만 받아쓰기가 돼. 설정 → Siri 및 받아쓰기 → <b>받아쓰기 켜기</b>도 필요해.':e.android?'안드로이드는 <b>Chrome</b>으로 열어줘.':'<b>Chrome / Edge</b>를 써줘.')+'</div>';
  else h+='<p class="oknote">마이크 ✓ 받아쓰기 ✓'+(e.mobile?' · 폰이면 조용한 곳에서, 입에서 20cm 정도.':'')+'</p>';
  return h;
}
/* 버튼을 누른 그 순간(사용자 제스처 안)에 마이크·오디오를 미리 연다.
   아이폰은 제스처 밖에서 AudioContext를 만들면 멈춘 채로 생기고, 준비 30초가 끝난 뒤 타이머에서 열면 늦다. */
function warm(){
  if(sp.warm)return;
  try{var AC=window.AudioContext||window.webkitAudioContext;if(AC&&!sp.ac){sp.ac=new AC();if(sp.ac.resume)sp.ac.resume()}}catch(e){}
  if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){
    sp.warm=navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
    sp.warm.catch(function(){});
  }
}
function lockOn(){try{if(navigator.wakeLock)navigator.wakeLock.request('screen').then(function(l){sp.lock=l}).catch(function(){})}catch(e){}}
function lockOff(){try{if(sp.lock){sp.lock.release();sp.lock=null}}catch(e){}}
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
  $('c-body').insertAdjacentHTML('beforeend',micNote());
  act('<button class="btn" id="pr">준비 30초</button><button class="btn2" id="sk">바로 말하기</button>');
  $('pr').onclick=function(){warm();prep(30)}; $('sk').onclick=function(){warm();speak()};
}
function prep(n){
  var left=n;clearInterval(tick);
  $('ph').textContent='준비 — 무슨 말을 할지만 정해';$('bt').className='bigt prep';$('bt').textContent=fmt(left);$('rg').style.width='100%';
  act('<button class="btn2" id="sk">바로 말하기</button>');$('sk').onclick=function(){warm();clearInterval(tick);speak()};
  tick=setInterval(function(){left--;$('bt').textContent=fmt(Math.max(0,left));$('rg').style.width=(left/n*100)+'%';
    if(left<=0){clearInterval(tick);speak()}},1000);
}
function speak(){
  sp.committed='';sp.sess='';sp.interim='';sp.gaps=[];sp.speaking=false;sp.start=Date.now();sp.silStart=Date.now();
  var N=C.t.sec,left=N;
  $('tr').innerHTML='';$('ph').textContent='말하는 중 — 멈추지 마';$('bt').className='bigt live';$('bt').textContent=fmt(left);$('rg').style.width='100%';
  act('<button class="btn2" id="st">끝내기</button>');$('st').onclick=stopSpeak;
  lockOn();
  var get=sp.warm||(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia?navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}}):Promise.reject({name:'NotSupported'}));
  sp.warm=null;
  get.then(function(stream){
    sp.stream=stream;var AC=window.AudioContext||window.webkitAudioContext;if(!sp.ac)sp.ac=new AC();if(sp.ac.resume)sp.ac.resume();
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
    clearInterval(tick);cancelAnimationFrame(sp.raf);lockOff();
    if(sp.ac){try{sp.ac.close()}catch(e){}sp.ac=null}
    var e=env();
    $('ph').textContent='마이크를 못 열었어';$('bt').className='bigt';$('bt').textContent='—';
    $('c-res').innerHTML='<div class="warn">'+(err&&err.name==='NotAllowedError'
      ?(e.ios?'마이크 권한이 거부됐어. 아이폰 설정 → Safari → 마이크 → <b>허용</b>. 홈 화면 앱이면 설정 → 셀핍 → 마이크.':e.android?'마이크 권한이 거부됐어. 주소창 자물쇠 → 권한 → 마이크 → <b>허용</b> → 새로고침.':'마이크 권한이 거부됐어. 주소창 왼쪽 자물쇠 → 마이크 → <b>허용</b> → 새로고침.')
      :err&&err.name==='NotSupported'?'이 브라우저는 마이크를 못 써. '+(e.ios?'<b>Safari</b>로 열어줘.':'<b>Chrome</b>으로 열어줘.')
      :'마이크를 열 수 없어 ('+esc(err&&err.name||'')+'). 다른 앱이 마이크를 쓰고 있지 않은지 확인해줘.')+'</div>';
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
  clearInterval(tick);cancelAnimationFrame(sp.raf);lockOff();
  if(sp.rec){var r=sp.rec;sp.rec=null;sp.committed+=(sp.sess||sp.interim||'');sp.sess='';sp.interim='';try{r.onend=null;r.stop()}catch(e){}}
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
  var prompt='You are grading English for a Korean learner preparing for CELPIP. She is around CELPIP 4-5 and aiming for 7. Be accurate and specific, never flattering, and write all Korean naturally.\n\nTASK: '+task+extra+'\n\nHER ANSWER:\n"""\n'+String(ans).slice(0,4000)+'\n"""\n\nHer recurring error bosses (use these exact ids): '+bossList+'\n\nReturn ONLY a JSON object, no markdown fence:\n{"score": integer 0-100 (a complete, understandable answer earns 55-75 even with errors; 85+ only if nearly clean),\n"verdict": one direct Korean sentence naming the single most important issue,\n"corrections": up to 6 objects {"wrong": exact wrong text, "right": fixed version, "why": short Korean reason, "boss": one boss id or "misc"},\n"errorsFound": array of boss ids that actually appeared,\n"errorsAvoided": array of boss ids that had a clear chance to appear but she got right,\n"win": one short Korean sentence on what she did well,\n"next": one short Korean sentence - the single thing to fix next time}';
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
  var gain=repeat?Math.round(score/2):score;
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
    else if(C.kind==='listen')prompt=C.it.t+'\n'+C.it.q.map(function(q,i){return 'Q'+(i+1)+'. '+q.q}).join('\n')+'\n'+C.it.k.ask;
    else if(C.kind==='spell')prompt=C.items.map(function(x,i){return (i+1)+'. '+x[0]}).join('  '); }
  var rec={date:TD,type:T.id,score:gain,ts:Date.now(),prompt:prompt,answer:String(answer||'').slice(0,4000),
    verdict:g.verdict||'',corrections:g.corrections.slice(0,8),next:g.next||'',
    errorsFound:g.errorsFound,errorsAvoided:g.errorsAvoided};
  if(metrics)rec.metrics=metrics;
  S.runs.push(rec);save();

  var h='<div class="res"><div class="score"><span class="scn">'+score+'</span><span class="scx">/ 100'+(repeat?' · 오늘 두 번째라 절반 적립':'')+'</span></div>';
  if(g.verdict)h+='<p class="vd">'+esc(g.verdict)+'</p>';
  if(g.corrections.length)h+='<div class="fixes">'+g.corrections.map(function(c){
    return '<div class="fix"><span class="w">'+esc(c.wrong)+'</span> → <span class="r">'+esc(c.right)+'</span>'+(c.why?'<span class="y">'+esc(c.why)+'</span>':'')+'</div>'}).join('')+'</div>';
  h+='<p class="gain">+'+gain+' XP'+(g.errorsAvoided.length?' · 보스 '+g.errorsAvoided.length+'체 타격':'')+
     (killed.length?' · 🏆 '+killed.map(function(k){return(BOSSES.filter(function(b){return b.id===k})[0]||{}).n}).join(', ')+' 격파!':'')+'</p>';
  if(g.win)h+='<p class="vd" style="color:var(--good);margin-top:7px">⬆ '+esc(g.win)+'</p>';
  if(g.next)h+='<p class="vd" style="margin-top:4px">→ 다음엔: '+esc(g.next)+'</p>';
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
if('serviceWorker' in navigator){try{navigator.serviceWorker.register('sw.js')}catch(e){}}
load();keyUI();if(apiKey)loadModels();ttsLoad();
renderHud();renderBosses();renderHist();renderNb();renderTypes();idle();
})();
