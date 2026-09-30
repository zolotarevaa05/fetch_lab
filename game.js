const MODS=[
{id:"live",icon:"◉",name:"Живой запрос",title:"Живой запрос",desc:"Проследи путь запроса от действия пользователя до обновления страницы."},
{id:"route",icon:"↔",name:"Собери маршрут",title:"Собери путь данных",desc:"Расставь этапы в правильном порядке и запусти модель."},
{id:"code",icon:"</>",name:"Собери код",title:"Восстанови программу",desc:"Порядок строк имеет значение."},
{id:"http",icon:"⇄",name:"HTTP Lab",title:"HTTP-конструктор",desc:"Подбери метод под действие с ресурсом."},
{id:"status",icon:"#",name:"HTTP-статусы",title:"HTTP-статусы",desc:"Разбери, чем закончился запрос: 2xx, 4xx или 5xx."},
{id:"response",icon:"{}",name:"Response Lab",title:"Response ≠ данные",desc:"Разбери ответ сервера и преврати тело в данные."},
{id:"promise",icon:"◌",name:"Promise Lab",title:"Асинхронность во времени",desc:"Сравни ожидание и завершение нескольких операций."},
{id:"break",icon:"⚒",name:"Сломай систему",title:"А что будет, если…",desc:"Меняй условия и наблюдай последствия."},
{id:"debug",icon:"⚠",name:"Debug Lab",title:"Найди поломку",desc:"Используй Network и Console, а не угадывай."},
{id:"practice",icon:"⌨",name:"Практика",title:"Напиши fetch самостоятельно",desc:"10 самостоятельных мини-задач по fetch()."},
{id:"final",icon:"★",name:"Финальная миссия",title:"Запусти информационную систему",desc:"Собери цепочку, выбери HTTP и допиши код."}
];

const SESSION_KEY="fetchLabSessionV3";
function readSession(){
  try{return JSON.parse(localStorage.getItem(SESSION_KEY)||"{}")}catch(e){return {}}
}
function saveSession(patch={}){
  try{
    const old=readSession();
    localStorage.setItem(SESSION_KEY,JSON.stringify({...old,...patch,updatedAt:Date.now()}));
  }catch(e){}
}
function clearSession(){
  try{localStorage.removeItem(SESSION_KEY)}catch(e){}
}
function saveModuleState(moduleName, patch={}){
  const s=readSession();
  const modules=s.modules||{};
  modules[moduleName]={...(modules[moduleName]||{}),...patch};
  saveSession({modules});
}
function getModuleState(moduleName){
  const s=readSession();
  return (s.modules&&s.modules[moduleName])||{};
}
function resetModuleState(moduleName){
  const s=readSession();
  const modules={...(s.modules||{})};
  delete modules[moduleName];
  saveSession({modules});
}
function resetEverything(){
  clearSession();
  try{localStorage.removeItem("fetchlab2")}catch(e){}
  try{localStorage.removeItem("fetchLabState")}catch(e){}
}
const S=JSON.parse(localStorage.getItem("fetchlab2")||'{"score":0,"done":{},"errors":0,"hints":0}');
let current="live"; const $=s=>document.querySelector(s);
function save(){localStorage.setItem("fetchlab2",JSON.stringify(S));stats()}
function stats(){let n=Object.keys(S.done).length,p=Math.round(n/MODS.length*100);$("#score").textContent=S.score;$("#done").textContent=n;$("#progressText").textContent=p+"%";$("#progressBar").style.width=p+"%";document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("done",!!S.done[b.dataset.id]))}
function complete(id,pts=100){if(!S.done[id]){S.done[id]=1;S.score+=pts;save();toast("+"+pts+" баллов")}}
function toast(t){let e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1100)}
function nav(){let n=$("#nav");n.innerHTML="";MODS.forEach(m=>{let b=document.createElement("button");b.className="nav "+(m.id===current?"active":"");b.dataset.id=m.id;b.innerHTML=`<span>${m.icon}</span><span>${m.name}</span>`;b.onclick=()=>openMod(m.id);n.appendChild(b)});stats()}
function openMod(id){
  const __mod=arguments[0];
  if(__mod && readSession().started===true) saveSession({module:__mod});
current=id;let m=MODS.find(x=>x.id===id);$("#title").textContent=m.title;$("#desc").textContent=m.desc;nav();R[id]()}
function typeText(el,text,speed=13,cb){el.textContent="";el.classList.add("cursor");let i=0;let timer=setInterval(()=>{el.textContent+=text[i++]||"";if(i>text.length){clearInterval(timer);el.classList.remove("cursor");cb&&cb()}},speed);el.dataset.timer=timer;return timer}
// Touch + mouse + keyboard support for all card-ordering exercises.
// A tap selects a card; a tap on an empty/occupied position places or swaps it.
// Dragging remains available with a mouse and by holding/moving a finger.
function dnd(scope=document){
  const cards=[...scope.querySelectorAll('.drag')];
  const zones=[...scope.querySelectorAll('.drop')];
  let selected=null, moving=null, ghost=null, dragStart=null, dragMoved=false;
  const bank=scope.querySelector('.bank.drop');
  const isBank=z=>z?.classList.contains('bank');
  const zoneOf=e=>e?.parentElement?.closest('.drop');
  const clearMarks=()=>{scope.querySelectorAll('.answerBad,.answerGood').forEach(e=>e.classList.remove('answerBad','answerGood'))};
  const clearSelected=()=>{
    cards.forEach(c=>{c.classList.remove('cardPicked');c.setAttribute('aria-pressed','false')});
    zones.forEach(z=>z.classList.remove('dropReady'));
    selected=null;
  };
  const pick=c=>{
    if(selected===c){clearSelected();return}
    clearSelected(); selected=c;
    c.classList.add('cardPicked');c.setAttribute('aria-pressed','true');
    zones.forEach(z=>{if(z!==zoneOf(c)) z.classList.add('dropReady')});
  };
  const place=(card,zone)=>{
    if(!card||!zone) return;
    const old=zoneOf(card);
    if(old===zone){clearSelected();return}
    const occupant=!isBank(zone)?[...zone.children].find(el=>el.classList?.contains('drag')&&el!==card):null;
    if(occupant){
      // Swapping must never discard a card or create an extra card.
      const fallback=old || bank;
      if(fallback && fallback!==zone) fallback.appendChild(occupant);
      else if(bank) bank.appendChild(occupant);
    }
    zone.appendChild(card);
    clearMarks();clearSelected();
  };
  const bankInstruction='Нажми на карточку, затем на нужное место. Чтобы исправить порядок, выбери карточку и нажми другое место. Можно также перетаскивать.';
  if(bank){
    const hint=document.createElement('p');
    hint.className='touchDnDHelp';hint.textContent=bankInstruction;
    // Place instruction before the first sorting task, instead of inside the bank.
    const container=bank.closest('.panel')||bank.parentElement;
    const targets=container?.querySelector('.slot, #finalSlots');
    if(targets) targets.before(hint); else bank.before(hint);
  }
  cards.forEach(card=>{
    card.draggable=true;
    card.tabIndex=0;
    card.setAttribute('role','button');
    card.setAttribute('aria-pressed','false');
    card.setAttribute('aria-label',`Выбрать карточку: ${card.textContent.trim()}`);
    card.addEventListener('click',e=>{
      if(card.dataset.swallowClick==='1') {card.dataset.swallowClick='';return}
      e.stopPropagation();pick(card);
    });
    card.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(card)}
    });
    card.addEventListener('dragstart',e=>{
      moving=card;pick(card);e.dataTransfer?.setData('text/plain',card.textContent);
      if(e.dataTransfer)e.dataTransfer.effectAllowed='move';
    });
    card.addEventListener('dragend',()=>{moving=null;clearSelected()});
    // Pointer-based finger dragging: threshold avoids interfering with normal taps.
    card.addEventListener('pointerdown',e=>{
      if(e.pointerType==='mouse')return;
      dragStart={card,x:e.clientX,y:e.clientY,id:e.pointerId};dragMoved=false;
    });
    card.addEventListener('pointermove',e=>{
      if(!dragStart||dragStart.card!==card||e.pointerId!==dragStart.id)return;
      if(!dragMoved&&Math.hypot(e.clientX-dragStart.x,e.clientY-dragStart.y)>13){
        dragMoved=true;moving=card;pick(card);
        ghost=card.cloneNode(true);ghost.classList.add('dragGhost');ghost.removeAttribute('id');
        document.body.appendChild(ghost);
      }
      if(dragMoved){
        if(e.cancelable)e.preventDefault();
        ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';
        zones.forEach(z=>z.classList.remove('over'));
        const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest('.drop');
        if(hit && scope.contains(hit)) hit.classList.add('over');
      }
    },{passive:false});
    const endPointer=e=>{
      if(!dragStart||dragStart.card!==card||e.pointerId!==dragStart.id)return;
      if(dragMoved){
        const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.drop');
        if(target&&scope.contains(target))place(card,target);
        else clearSelected();
        card.dataset.swallowClick='1';
        // In browsers that suppress click after touch dragging, don't suppress the next real tap.
        setTimeout(()=>{card.dataset.swallowClick=''},120);
      }
      ghost?.remove();ghost=null;moving=null;dragStart=null;dragMoved=false;
      zones.forEach(z=>z.classList.remove('over'));
    };
    card.addEventListener('pointerup',endPointer);
    card.addEventListener('pointercancel',()=>{
      ghost?.remove();ghost=null;moving=null;dragStart=null;dragMoved=false;
      zones.forEach(z=>z.classList.remove('over'));
    });
  });
  zones.forEach(zone=>{
    zone.tabIndex=0;
    zone.setAttribute('role','button');
    zone.setAttribute('aria-label',isBank(zone)?'Вернуть карточку в набор':'Поместить выбранную карточку сюда');
    zone.addEventListener('click',()=>{if(selected)place(selected,zone)});
    zone.addEventListener('keydown',e=>{
      if((e.key==='Enter'||e.key===' ')&&selected){e.preventDefault();place(selected,zone)}
    });
    zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('over')});
    zone.addEventListener('dragleave',()=>zone.classList.remove('over'));
    zone.addEventListener('drop',e=>{
      e.preventDefault();zone.classList.remove('over');
      const item=moving||selected;if(item)place(item,zone);
      moving=null;
    });
  });
}

function xray(step){let names=["click","JavaScript","fetch()","Promise pending","HTTP Request","PHP","данные","JSON Response","response.json()","data","DOM"];return `<div class="xray">${names.map((n,i)=>`<div class="xitem ${i<step?'done':''} ${i===step?'now':''}">${i<step?"✓":i===step?"●":"○"} ${n}</div>`).join("")}</div>`}
const R={};

R.live=()=>{
let step=-1;
const steps=[
 {title:"Нажата кнопка",text:"Пользователь нажал «Загрузить расписание». Браузер создаёт событие click.",line:0,state:0,net:"idle",ui:"loading"},
 {title:"JavaScript получил событие",text:"Обработчик запускает функцию loadSchedule().",line:0,state:1,net:"idle",ui:"loading",more:"Кнопка находится в HTML, а обработчик события написан в script.js."},
 {title:"JavaScript вызвал fetch()",text:"Код вызывает fetch(\"api/schedule.php\"). Браузер готовит HTTP-запрос к реальному PHP-файлу на сервере.",line:2,state:2,net:"prepared",ui:"loading",more:"api/schedule.php — это путь к PHP-файлу в нашем учебном проекте. В отличие от абстрактного /api/schedule, здесь студент может увидеть конкретный файл."},
 {title:"Promise ожидает результат",text:"fetch() сразу возвращает Promise. Пока сервер не ответил, он находится в состоянии pending.",line:2,state:3,net:"pending",ui:"loading",more:"await приостанавливает только эту async-функцию и ждёт результат fetch()."},
 {title:"HTTP-запрос отправлен",text:"Браузер отправляет GET-запрос к api/schedule.php.",line:2,state:4,net:"request",ui:"loading",more:"GET означает: получить данные. Сам JavaScript к базе данных не подключается."},
 {title:"Сервер запускает PHP",text:"Веб-сервер находит файл api/schedule.php и запускает его PHP-код.",line:2,state:5,net:"php",ui:"loading",more:"В учебной модели запрос приходит в конкретный PHP-файл. PHP выполняется на сервере, а его исходный код не отправляется в браузер."},
 {title:"PHP получает данные",text:"schedule.php получает расписание. В простом примере данные могут быть массивом; в реальном проекте PHP может запросить их из базы данных.",line:2,state:6,net:"database",ui:"loading",more:"Связка с базой выглядит так: JavaScript → PHP → БД → PHP. Браузер обычно не обращается к БД напрямую."},
 {title:"PHP формирует JSON-ответ",text:"PHP превращает данные в JSON с помощью json_encode() и отправляет HTTP Response браузеру.",line:2,state:7,net:"response",ui:"loading",more:"header(\"Content-Type: application/json\") сообщает клиенту формат тела ответа."},
 {title:"JSON преобразован",text:"JavaScript вызывает response.json() и получает данные из JSON-тела ответа.",line:3,state:8,net:"body",ui:"loading",more:"response.json() читает тело Response. Сам объект Response и данные внутри его тела — не одно и то же."},
 {title:"Данные сохранены в JavaScript",text:"Результат response.json() сохраняется в переменную data.",line:3,state:9,net:"data",ui:"loading"},
 {title:"DOM обновлён",text:"render(data) использует полученные данные и показывает расписание на странице.",line:4,state:10,net:"done",ui:"done",more:"Полная цепочка: HTML → JavaScript → HTTP → PHP → данные/БД → JSON Response → JavaScript → DOM."}
]
const process=[
"Пользователь нажал кнопку",
"JavaScript получил событие",
"Вызван fetch()",
"Promise ожидает результат",
"GET api/schedule.php отправлен",
"Сервер запустил schedule.php",
"PHP получил данные",
"PHP сформировал JSON Response",
"response.json() прочитал JSON",
"Данные сохранены в JavaScript",
"DOM обновлён"
]
const codeLines=[
'button.addEventListener("click", loadSchedule);',
'async function loadSchedule() {',
'  const response = await fetch("api/schedule.php");',
'  const data = await response.json();',
'  render(data);',
'}'
];

$("#app").innerHTML=`
<div class="liveIntro">
  <p>Нажми кнопку загрузки, а затем разбери весь путь данных по шагам.</p>
</div>

<section class="userView panel">
  <h2>Что видит пользователь</h2>
  <div class="scheduleDemo">
    <div class="scheduleTop">Расписание группы 3519/1</div>
    <div id="scheduleState" class="scheduleState">Данные ещё не загружены.</div>
    <button id="realLoad" class="btn primary liveLoad">Загрузить расписание</button>
  </div>
</section>

<section id="insideSection" class="insideSection panel mutedSection">
  <h2>Что происходит внутри</h2>
  <div class="systemFlow">
    <div class="flowNode" id="browserNode"><b>Браузер</b><span>JavaScript</span></div>
    <div class="flowLane">
      <div class="flowLine"></div>
      <div id="requestPacket" class="networkPacket requestPacket">GET api/schedule.php →</div>
      <div id="responsePacket" class="networkPacket responsePacket">← 200 OK · Response</div>
      <span>Сеть · HTTP</span>
    </div>
    <div class="flowNode" id="serverNode"><b>Сервер</b><span>PHP</span></div>
  </div>
  <div id="networkDetail" class="networkDetail"></div>
</section>

<div class="liveColumns">
  <section class="panel">
    <h2>Код</h2>
    <div id="liveCode" class="liveCode">${codeLines.map((l,i)=>`<div class="liveCodeLine" data-line="${i}">${l.replace(/</g,"&lt;")}</div>`).join("")}</div>
  </section>

  <section class="panel explanationPanel">
    <h2>Объяснение</h2>
    <h3 id="stepTitle">Начнём с действия пользователя</h3>
    <div id="guideText" class="liveExplain">Нажми «Загрузить расписание».</div>
    <button id="moreBtn" class="textButton" style="display:none">Подробнее</button>
    <div id="moreText" class="liveMore"></div>
  </section>
</div>

<section class="panel processPanel">
  <h2>Что происходит</h2>
  <div id="processList" class="processList">${process.map((x,i)=>`<div class="processItem" data-step="${i}"><span class="processDot">○</span><span>${x}</span></div>`).join("")}</div>
  <div class="processActions">
    <button id="prevLive" class="btn" disabled>← Назад</button>
    <button id="nextLive" class="btn primary" disabled>Следующий шаг →</button>
    <button id="restartLive" class="textButton" style="display:none">Начать заново</button>
  </div>
</section>`;

let typing=null,currentFull="";
function write(text){
  if(typing)clearInterval(typing);
  const el=$("#guideText"); currentFull=text; el.textContent="";
  let i=0;
  typing=setInterval(()=>{el.textContent+=text[i++]||"";if(i>text.length){clearInterval(typing);typing=null}},8);
  el.onclick=()=>{if(typing){clearInterval(typing);typing=null;el.textContent=currentFull}}
}
function renderProcess(state){
  document.querySelectorAll(".processItem").forEach((el,i)=>{
    el.classList.remove("done","current");
    let dot=el.querySelector(".processDot");
    if(i<state){el.classList.add("done");dot.textContent="✓"}
    else if(i===state){el.classList.add("current");dot.textContent="●"}
    else dot.textContent="○";
  });
}
function highlight(line){
 document.querySelectorAll(".liveCodeLine").forEach(x=>x.classList.toggle("active",+x.dataset.line===line));
}
function setUI(mode){
 const state=$("#scheduleState"),btn=$("#realLoad");
 if(mode==="loading"){state.innerHTML='<span class="loadingDot"></span> Загрузка расписания…';btn.style.display="none"}
 if(mode==="done"){state.innerHTML='<div class="lessonResult"><b>Основы алгоритмизации и программирования</b><span>09:00 · кабинет 305</span></div>';btn.style.display="none"}
}
function animateStep(s){
 const req=$("#requestPacket"),res=$("#responsePacket"),detail=$("#networkDetail");
 const bn=$("#browserNode"),sn=$("#serverNode");
 bn.classList.remove("active");sn.classList.remove("active");
 req.className="networkPacket requestPacket";
 res.className="networkPacket responsePacket";
 req.style.opacity="0";res.style.opacity="0";
 detail.innerHTML="";

 const requestInfo=`
   <div class="netCard requestInfo">
     <div class="netCardTitle">HTTP Request</div>
     <div class="netRows">
       <div><span>Method</span><b>GET</b></div>
       <div><span>URL</span><code>api/schedule.php</code></div>
       <div><span>Назначение</span><b>получить расписание</b></div>
     </div>
   </div>`;
 const responseInfo=`
   <div class="netCard responseInfo">
     <div class="netCardTitle">HTTP Response</div>
     <div class="netRows">
       <div><span>Status</span><b class="statusOk">200 OK</b></div>
       <div><span>Content-Type</span><code>application/json</code></div>
     </div>
     <div class="responseBodyTitle">Body</div>
     <pre>{
  "subject": "Основы алгоритмизации и программирования",
  "time": "09:00",
  "room": "305"
}</pre>
   </div>`;

 if(s.net==="idle") {bn.classList.add("active");return}
 if(s.net==="prepared"||s.net==="pending"){
   bn.classList.add("active");
   req.style.opacity="1";req.classList.add("atBrowser");
   detail.innerHTML=requestInfo;
   if(s.net==="pending") detail.insertAdjacentHTML("beforeend",'<div class="promiseState"><span>Promise</span><b>pending</b></div>');
   return;
 }
 if(s.net==="request"){
   bn.classList.add("active");req.style.opacity="1";detail.innerHTML=requestInfo;
   requestAnimationFrame(()=>requestAnimationFrame(()=>req.classList.add("travelToServer")));
   return;
 }
 if(s.net==="php"){
   sn.classList.add("active");req.style.opacity="1";req.classList.add("atServer");
   detail.innerHTML=requestInfo+`<div class="phpFlow"><div class="projectTree"><b>Файлы проекта</b><pre>project/\n├── index.html\n├── script.js\n└── api/\n    └── <mark>schedule.php</mark></pre></div><div class="phpCode"><b>Сервер выполняет schedule.php</b><pre>&lt;?php\nheader("Content-Type: application/json");\n\n$schedule = getSchedule();\necho json_encode($schedule);</pre></div></div>`;
   return;
 }
 if(s.net==="database"){
   sn.classList.add("active");
   detail.innerHTML=`<div class="stackFlow"><div><b>schedule.php</b><span>серверный код</span></div><i>→</i><div><b>Данные / БД</b><span>расписание</span></div><i>→</i><div><b>schedule.php</b><span>готовит ответ</span></div></div><div class="stackNote"><b>Важно:</b> JavaScript в браузере не подключается к базе напрямую. Это делает PHP на сервере.</div>`;
   return;
 }
 if(s.net==="response"){
   bn.classList.add("active");sn.classList.add("active");
   res.style.opacity="1";res.classList.add("atServer");detail.innerHTML=responseInfo;
   requestAnimationFrame(()=>requestAnimationFrame(()=>res.classList.add("travelToBrowser")));
   return;
 }
 if(s.net==="body"){
   bn.classList.add("active");detail.innerHTML=responseInfo+
   '<div class="transformArrow">response.json() ↓</div><div class="jsObject"><b>JavaScript object</b><pre>{ subject: "Основы алгоритмизации и программирования",\\n  time: "09:00", room: "305" }</pre></div>';
   return;
 }
 if(s.net==="data"){
   bn.classList.add("active");detail.innerHTML=
   '<div class="dataVariable"><span>const data =</span><pre>{\\n  subject: "Основы алгоритмизации и программирования",\\n  time: "09:00",\\n  room: "305"\\n}</pre></div>';
   return;
 }
 if(s.net==="done"){
   bn.classList.add("active");
   detail.innerHTML='<div class="networkDone">Сетевой обмен завершён <b>✓</b><span>Данные уже находятся в JavaScript и передаются в render(data).</span></div>';
 }
}
function show(n){
 step=Math.max(0,Math.min(steps.length-1,n));
 saveModuleState("live",{started:true,step});
 const s=steps[step];
 $("#insideSection").classList.remove("mutedSection");
 $("#stepTitle").textContent=s.title;
 write(s.text);
 highlight(s.line);
 renderProcess(s.state);
 animateStep(s);
 setUI(s.ui);
 $("#prevLive").disabled=step===0;
 $("#nextLive").disabled=false;
 $("#nextLive").textContent=step===steps.length-1?"Завершить":"Следующий шаг →";
 $("#moreText").classList.remove("show");
 $("#moreText").textContent=s.more||"";
 $("#moreBtn").style.display=s.more?"inline-block":"none";
 if(step===steps.length-1)$("#restartLive").style.display="inline-block";
}
$("#realLoad").onclick=()=>{saveSession({started:true,module:"live"});saveModuleState("live",{started:true,step:0});show(0)};
$("#nextLive").onclick=()=>{
 if(step===steps.length-1){complete("live",150);$("#nextLive").disabled=true;toast("Разбор завершён");return}
 show(step+1)
};
$("#prevLive").onclick=()=>show(step-1);
$("#restartLive").onclick=()=>{
  resetModuleState("live");
  R.live();
};
$("#moreBtn").onclick=()=>$("#moreText").classList.toggle("show");
const __resume=getModuleState("live");
if(__resume.started===true && Number.isInteger(__resume.step)){
  show(__resume.step);
}
};
R.route=()=>{
const correct=["HTML","JavaScript","fetch()","HTTP Request","PHP","Данные / БД","JSON Response","response.json()","DOM"];
const all=[...correct,"CSS","localStorage","console.log()"].sort(()=>Math.random()-.5);
let hint=0;
$("#app").innerHTML=`<div class="panel"><h2>Построй маршрут запроса</h2><p>Расставь этапы по порядку. Лишние карточки оставь в банке.</p><div id="slots">${correct.map((_,i)=>`<div class="slot"><b>${i+1}</b><div class="drop"></div></div>`).join("")}</div><div class="bank drop">${all.map(x=>`<div class="drag" data-v="${x}">${x}</div>`).join("")}</div><div class="actions"><button id="checkRoute" class="btn primary">Проверить</button><button id="hintRoute" class="ghost">Подсказка 1</button></div><div id="rf" class="feedback"></div><div id="routeScene"></div></div>`;dnd($("#app"));
const hints=["Начни со страницы: HTML подключает JavaScript.","После fetch() браузер отправляет HTTP Request к PHP-файлу на сервере.","PHP получает данные (при необходимости из БД), формирует JSON Response; затем JavaScript читает JSON и обновляет DOM."];
$("#hintRoute").onclick=()=>{hint=Math.min(2,hint);$("#rf").textContent=hints[hint];hint++;$("#hintRoute").textContent=`Подсказка ${Math.min(3,hint+1)}`;S.hints++;save()};
$("#checkRoute").onclick=()=>{let drops=[...$("#slots").querySelectorAll(".drop")],got=drops.map(z=>z.querySelector(".drag")?.dataset.v||"");drops.forEach((z,i)=>{z.classList.remove("answerGood","answerBad");z.classList.add(got[i]===correct[i]?"answerGood":"answerBad")});let ok=correct.every((x,i)=>x===got[i]);$("#rf").className="feedback "+(ok?"good":"bad");if(!ok){S.errors++;save();$("#rf").textContent="Красным отмечены места, которые нужно переставить.";return}$("#rf").textContent="Верно. Смотри, как проходит путь данных.";$("#routeScene").innerHTML=`<div class="routeRun">${correct.map((x,i)=>`<span id="rr${i}">${x}</span>`).join('<b>→</b>')}</div>`;correct.forEach((_,i)=>setTimeout(()=>{$(`#rr${i}`).classList.add("active")},i*650));setTimeout(()=>complete("route"),correct.length*650)}
};

R.code=()=>{
let correct=['const response = await fetch(url);','const data = await response.json();','render(data);'],all=['render(data);','const data = await response.json();','const response = await fetch(url);','const data = fetch.json();','await render.fetch();'];
$("#app").innerHTML=`<div class="grid2"><div class="panel"><div class="top"><h2>Собери loadData()</h2><span class="tag">СОБЕРИ ПО ПОРЯДКУ</span></div><div class="code">async function loadData(url) {</div><div id="codeSlots">${correct.map((_,i)=>`<div class="slot"><b>${i+1}</b><div class="drop"></div></div>`).join("")}</div><div class="code">}</div><div class="bank drop">${all.map(x=>`<div class="drag">${x}</div>`).join("")}</div><div class="actions"><button id="runCode" class="btn primary">▶ Запустить</button></div><div id="cf" class="feedback"></div></div><div class="panel"><h3>Результат</h3><div id="console" class="dev">CONSOLE\nReady.</div><div class="browser" style="margin-top:12px"><div class="browserbar">preview</div><div id="preview" class="browserbody">Данные не загружены.</div></div></div></div>`;dnd($("#app"));
$("#runCode").onclick=()=>{let got=[...$("#codeSlots").querySelectorAll(".drop")].map(z=>z.querySelector(".drag")?.textContent||""),ok=correct.every((x,i)=>x===got[i]);$("#cf").className="feedback "+(ok?"good":"bad");if(ok){$("#cf").textContent="Код собран правильно.";$("#console").textContent="GET api/schedule.php → 200 OK\nJSON parsed ✓\nrender(data) ✓";$("#preview").innerHTML='<b>Данные получены</b><div class="card">Группа 3519/1 · кабинет 305</div>';complete("code")}else{S.errors++;save();$("#cf").textContent="Проверь причинную последовательность: получить Response → разобрать тело → показать данные.";$("#console").textContent="SequenceError: неверный порядок операций."}}
};

R.http=()=>{
const theory=`<div class="miniTheory"><b>HTTP-метод показывает действие с ресурсом.</b><div><code>GET</code> получить · <code>POST</code> создать · <code>PATCH</code> изменить · <code>DELETE</code> удалить</div><span>Пример: получить расписание → GET api/schedule.php</span></div>`;
let qs=[["Получить расписание","GET","api/schedule.php"],["Создать занятие","POST","api/lesson-create.php"],["Изменить кабинет занятия №42","PATCH","api/lesson-update.php?id=42"],["Удалить занятие №42","DELETE","api/lesson-delete.php?id=42"],["Получить преподавателей","GET","api/teachers.php"]],st=getModuleState("http"),i=st.index||0,s=st.score||0;
function draw(){if(i>=qs.length){complete("http");$("#app").innerHTML=`<div class="panel result"><div class="big">${s}/5</div><h2>HTTP-конструктор завершён</h2><button class="btn" id="restartHttp">Пройти ещё раз</button></div>`;$("#restartHttp").onclick=()=>{resetModuleState("http");R.http()};return}let q=qs[i];$("#app").innerHTML=`${theory}<div class="panel httpLesson"><div class="httpCounter">Задача ${i+1} / 5</div><h2>${q[0]}</h2><div class="httpUrl">${q[2]}</div><h3>Какой HTTP-метод нужен?</h3><div class="httpMethods">${["GET","POST","PATCH","DELETE"].map(x=>`<button class="methodBtn" data-v="${x}">${x}</button>`).join("")}</div><div id="httpResult" class="httpResult"></div><div class="httpFlight"><div class="httpPoint">Клиент</div><div class="httpTrack"><div id="httpPacket" class="httpPacket"></div></div><div class="httpPoint">Сервер</div></div><button id="nextHttp" class="btn primary" style="display:none">Следующая задача →</button></div>`;
document.querySelectorAll(".methodBtn").forEach(b=>b.onclick=()=>{let ok=b.dataset.v===q[1];b.classList.add(ok?"correct":"wrong");if(!ok){S.errors++;save();$("#httpResult").innerHTML=`<b>Не подходит.</b> Определи действие: получить, создать, изменить или удалить.`;return}document.querySelectorAll(".methodBtn").forEach(x=>x.disabled=true);s++;saveModuleState("http",{index:i,score:s});$("#httpResult").innerHTML=`<b>Выбрано: ${q[1]}</b><p>${q[1]} ${q[2]}</p><button id="sendHttp" class="btn primary">Отправить запрос</button>`;$("#sendHttp").onclick=()=>{let p=$("#httpPacket");p.textContent=q[1];p.className="httpPacket go";$("#httpResult").innerHTML=`<b>Запрос отправлен</b><p>Браузер отправил <code>${q[1]} ${q[2]}</code> на сервер.</p>`;setTimeout(()=>{$("#httpResult").innerHTML=`<b>Сервер получил запрос</b><p>Запрос готов к обработке.</p><button id="getResponse" class="btn">Что ответил сервер?</button>`;$("#getResponse").onclick=()=>{p.className="httpPacket back";p.textContent="200 OK";$("#httpResult").innerHTML=`<b>Ответ получен</b><p><code>200 OK</code> возвращается клиенту.</p>`;setTimeout(()=>$("#nextHttp").style.display="inline-block",700)}},1100)}});$("#nextHttp").onclick=()=>{i++;saveModuleState("http",{index:i,score:s});draw()}}
draw()};

R.status=()=>{
 const groups=[["2xx","Успешно","Запрос обработан успешно."],["4xx","Ошибка запроса","Проблема связана с запросом клиента."],["5xx","Ошибка сервера","Сервер не смог корректно обработать запрос."]];
 const codes=[["200","OK","Запрос выполнен успешно."],["201","Created","Новый ресурс создан."],["400","Bad Request","Некорректный запрос."],["401","Unauthorized","Требуется аутентификация."],["403","Forbidden","Доступ запрещён."],["404","Not Found","Ресурс не найден."],["500","Internal Server Error","Внутренняя ошибка сервера."]];
 const tasks=[["Расписание успешно получено.","200"],["Новое занятие успешно создано.","201"],["В запросе некорректные данные.","400"],["Ресурс требует входа в систему.","401"],["Пользователь вошёл, но у него нет права доступа.","403"],["Занятия с таким ID нет.","404"],["На сервере произошла внутренняя ошибка.","500"]];
 let st=getModuleState("status"),phase=st.phase||"learn",i=Number.isInteger(st.index)?st.index:0,score=Number.isInteger(st.score)?st.score:0;
 const store=()=>saveModuleState("status",{phase,index:i,score});
 function learn(){
  $("#app").innerHTML=`<div class="statusLab"><div class="panel"><h2>HTTP-статусы</h2><p class="statusLead">Код статуса показывает, чем закончилась обработка запроса сервером.</p><div class="statusGroups">${groups.map(x=>`<div class="statusGroup"><b>${x[0]}</b><strong>${x[1]}</strong><span>${x[2]}</span></div>`).join("")}</div></div><div class="panel"><h2>Основные коды</h2><p class="statusLead">Нажми на код, чтобы посмотреть его значение.</p><div class="statusCards">${codes.map((x,n)=>`<button class="statusCard" data-i="${n}"><b>${x[0]}</b><span>${x[1]}</span></button>`).join("")}</div><div id="statusInfo" class="statusInfo">Выбери любой статус.</div><button id="goStatus" class="btn primary">Перейти к практике</button></div></div>`;
  document.querySelectorAll(".statusCard").forEach(b=>b.onclick=()=>{let x=codes[+b.dataset.i];document.querySelectorAll(".statusCard").forEach(c=>c.classList.remove("selected"));b.classList.add("selected");$("#statusInfo").innerHTML=`<div class="statusBig">${x[0]}</div><div><b>${x[1]}</b><p>${x[2]}</p></div>`});
  $("#goStatus").onclick=()=>{phase="practice";i=0;score=0;store();practice()};
 }
 function practice(){
  if(i>=tasks.length){complete("status",150);$("#app").innerHTML=`<div class="panel statusFinish"><div class="big">${score}/${tasks.length}</div><h2>HTTP-статусы пройдены</h2><button id="againStatus" class="btn">Пройти ещё раз</button></div>`;$("#againStatus").onclick=()=>{resetModuleState("status");R.status()};return}
  let q=tasks[i];
  $("#app").innerHTML=`<div class="panel statusPractice"><div class="httpCounter">${i+1} / ${tasks.length}</div><h2>Какой статус вернёт сервер?</h2><div class="statusSituation">${q[0]}</div><div class="statusChoices">${codes.map(x=>`<button class="statusChoice" data-code="${x[0]}"><b>${x[0]}</b><span>${x[1]}</span></button>`).join("")}</div><div id="statusFeedback" class="statusFeedback"></div><button id="nextStatus" class="btn primary" style="display:none">Следующая ситуация →</button></div>`;
  document.querySelectorAll(".statusChoice").forEach(b=>b.onclick=()=>{if($("#nextStatus").style.display!=="none")return;if(b.dataset.code!==q[1]){S.errors++;save();b.classList.add("wrong");$("#statusFeedback").innerHTML="<b>Пока нет.</b><span>Сначала определи группу: 2xx, 4xx или 5xx.</span>";return}score++;store();b.classList.add("correct");document.querySelectorAll(".statusChoice").forEach(x=>x.disabled=true);let x=codes.find(x=>x[0]===q[1]);$("#statusFeedback").innerHTML=`<b>${x[0]} ${x[1]}</b><span>${x[2]}</span>`;$("#nextStatus").style.display="inline-block"});
  $("#nextStatus").onclick=()=>{i++;store();practice()};
 }
 phase==="practice"?practice():learn();
};

R.response=()=>{
$("#app").innerHTML=`<div class="grid2"><div class="panel"><h2>Из чего состоит Response?</h2><p>Разложи HTTP-ответ на части.</p>${[["status","Status"],["headers","Headers"],["body","Body"]].map((x,i)=>`<div class="slot"><b>${i+1}</b><div><b>${x[1]}</b><div class="drop" data-r="${x[0]}"></div></div></div>`).join("")}<div class="bank drop"><div class="drag" data-v="body">{ "group": "3519/1" }</div><div class="drag" data-v="status">200 OK</div><div class="drag" data-v="headers">Content-Type: application/json</div></div><button id="respCheck" class="btn primary">Проверить</button><div id="respf" class="feedback"></div></div><div class="panel"><h2>Откуда появился Response?</h2><div class="phpOrigin"><code>schedule.php</code><pre>&lt;?php
header("Content-Type: application/json");
echo json_encode($schedule);</pre><span>PHP формирует тело ответа на сервере. Браузер получает уже результат выполнения PHP, а не PHP-код.</span></div><h2>Посмотри внутрь Response</h2><div id="responseBox" class="responseBox"><b>Response</b><button id="openResponse" class="btn">Посмотреть, что внутри</button></div><div id="responseInside"></div></div></div>`;dnd($("#app"));
$("#openResponse").onclick=()=>{$("#responseInside").innerHTML=`<div class="responseParts"><div><b>Status</b><span>200 OK</span></div><div><b>Headers</b><span>Content-Type: application/json</span></div><div class="jsonBody"><b>Body</b><pre>{ "group": "3519/1" }</pre></div></div><button id="parseJson" class="btn primary">await response.json()</button>`;$("#parseJson").onclick=()=>{$("#responseInside").innerHTML+=`<div class="transformArrow">↓ читаем JSON-тело ↓</div><div class="jsObject"><b>JavaScript Object</b><pre>{ group: "3519/1" }</pre></div>`}};
$("#respCheck").onclick=()=>{let zones=[...document.querySelectorAll("[data-r]")],ok=true;zones.forEach(z=>{let yes=z.querySelector(".drag")?.dataset.v===z.dataset.r;z.classList.add(yes?"answerGood":"answerBad");ok&&=yes});$("#respf").className="feedback "+(ok?"good":"bad");$("#respf").textContent=ok?"Верно.":"Красным отмечены неверные части.";if(ok)complete("response");else{S.errors++;save()}}
};

R.promise=()=>{
$("#app").innerHTML=`<div class="panel"><h2>Запусти три запроса одновременно</h2><p>Все три запроса стартуют в один момент. Смотри, какой ответ придёт раньше, пока остальные ещё выполняются.</p><button id="startP" class="btn primary">▶ Запустить</button><div class="asyncClock"><b id="asyncTime">0.0 с</b><span>общее время</span></div><div class="asyncScale"><span>0</span><span>0.5</span><span>1.0</span><span>1.5</span><span>1.8 с</span></div><div id="plist" class="asyncList">${[["Студенты","students.php","0.5"],["Расписание","schedule.php","1.1"],["Преподаватели","teachers.php","1.8"]].map((x,i)=>`<div class="asyncRow"><div><b>${x[0]}</b><small>${x[1]}</small></div><div class="asyncTrack"><i id="bar${i}"></i></div><strong id="state${i}">не запущен</strong></div>`).join("")}</div><div id="pguide" class="stepExplain">Нажми «Запустить». Все полосы начнут двигаться одновременно.</div></div><div class="panel"><h3>Что здесь показывает асинхронность?</h3><div id="asyncOrder" class="asyncOrder"><p>После запуска здесь появится порядок получения ответов.</p></div><div class="code">const students = fetch("api/students.php");
const schedule = fetch("api/schedule.php");
const teachers = fetch("api/teachers.php");</div><p>JavaScript запустил все три операции, не дожидаясь завершения предыдущей. Каждый Promise завершается в своё время.</p></div>`;
$("#startP").onclick=()=>{let start=performance.now(),dur=[500,1100,1800],names=["students.php","schedule.php","teachers.php"],done=[];$("#startP").disabled=true;[0,1,2].forEach(i=>{$(`#state${i}`).textContent="pending…";$(`#bar${i}`).style.transition=`width ${dur[i]}ms linear`;$(`#bar${i}`).style.width="0%";requestAnimationFrame(()=>requestAnimationFrame(()=>{$(`#bar${i}`).style.width="100%"}))});$("#pguide").textContent="Три запроса уже выполняются одновременно. Следи: короткая полоса завершится, пока длинные ещё движутся.";let clock=setInterval(()=>{$("#asyncTime").textContent=Math.min((performance.now()-start)/1000,1.8).toFixed(1)+" с"},50);dur.forEach((d,i)=>setTimeout(()=>{done.push(`${done.length+1}. ${names[i]} — ${(d/1000).toFixed(1)} с`);$(`#state${i}`).textContent=`✓ fulfilled · ${(d/1000).toFixed(1)} с`;$("#asyncOrder").innerHTML=`<b>Ответы приходят независимо:</b>${done.map(x=>`<div>${x}</div>`).join("")}`;let left=3-done.length;$("#pguide").textContent=left?`Ответ от ${names[i]} уже получен. Ещё ${left} ${left===1?"запрос продолжает":"запроса продолжают"} выполняться.`:"Все ответы получены. Они стартовали вместе, но завершились в разное время.";if(i===2){clearInterval(clock);$("#asyncTime").textContent="1.8 с";$("#startP").disabled=false;setTimeout(()=>complete("promise"),500)}},d))}
};

R.break=()=>{
const cases=[
{id:"noawait",name:"Убрать await",steps:["Было: const response = await fetch(url);","Стало: const response = fetch(url);","response теперь содержит Promise","Следующая строка вызывает response.json()"],net:"GET api/schedule.php → pending",con:"TypeError: response.json is not a function",user:"Данные на странице не появятся.",ex:"Код использует результат до получения Response."},
{id:"badurl",name:"Сломать URL",steps:["Отправляем запрос по неверному адресу","Сервер ищет ресурс","Ресурс не найден"],net:"GET api/schedul.php → 404",con:"HTTP 404 Not Found",user:"Расписание не загрузится.",ex:"Проверь путь к PHP-файлу: существует ли api/schedule.php и нет ли опечатки."},
{id:"server",name:"Сервер 500",steps:["Запрос отправлен","Сервер получил запрос","Во время обработки произошла ошибка"],net:"GET api/schedule.php → 500",con:"HTTP 500 Internal Server Error",user:"Показываем сообщение об ошибке загрузки.",ex:"fetch получает Response даже при HTTP 500; статус нужно проверить через response.ok/status."},
{id:"slow",name:"Медленный сервер",steps:["Запрос отправлен","Promise остаётся pending","Ответ приходит позже"],net:"GET api/schedule.php → pending… 3.0 s",con:"Waiting…",user:"Сначала «Загрузка…», затем расписание.",ex:"Интерфейс не обязан зависать, пока сервер отвечает."},
{id:"badjson",name:"Некорректный JSON",steps:["schedule.php вернул Response: 200 OK","Вызывается response.json()","Разбор тела завершается ошибкой"],net:"200 OK · text/html",con:"SyntaxError while parsing JSON",user:"Данные не отображаются.",ex:"HTTP-запрос успешен, ошибка возникает при разборе тела."}
];
$("#app").innerHTML=`<div class="grid2"><div class="panel"><h2>Экспериментальная панель</h2><p>Выбери изменение и наблюдай последствия.</p><div class="quiz">${cases.map(c=>`<button class="btn breaker" data-id="${c.id}">${c.name}</button>`).join("")}</div><div id="selectedBreak" class="selectedAction">Ничего не выбрано</div></div><div class="panel"><h2>Что происходит</h2><div id="breakSteps" class="breakSteps">Выбери эксперимент.</div><div id="breakNet" class="dev bigDev">NETWORK\n—</div><div id="breakConsole" class="dev bigDev">CONSOLE\n—</div><div id="breakUser" class="userResult"></div><div id="breakExplain" class="feedback"></div><button id="repeatBreak" class="ghost" style="display:none">Повторить</button></div></div>`;
let seen=new Set,cur;function run(c){cur=c;document.querySelectorAll(".breaker").forEach(x=>x.classList.toggle("selected",x.dataset.id===c.id));$("#selectedBreak").innerHTML=`Выбрано: <b>${c.name}</b>`;$("#breakSteps").innerHTML=c.steps.map((x,i)=>`<div id="bs${i}" class="breakStep">${i+1}. ${x}</div>`).join("");$("#breakNet").textContent="NETWORK\n—";$("#breakConsole").textContent="CONSOLE\n—";$("#breakUser").innerHTML="";$("#breakExplain").textContent="";c.steps.forEach((_,i)=>setTimeout(()=>{$(`#bs${i}`).classList.add("show");if(i===c.steps.length-1){$("#breakNet").textContent="NETWORK\n"+c.net;setTimeout(()=>{$("#breakConsole").textContent="CONSOLE\n"+c.con;$("#breakUser").innerHTML=`<b>Что увидит пользователь</b><p>${c.user}</p>`;typeText($("#breakExplain"),c.ex,18);$("#repeatBreak").style.display="inline-block"},650)}},i*800))}
document.querySelectorAll(".breaker").forEach(b=>b.onclick=()=>{let c=cases.find(x=>x.id===b.dataset.id);seen.add(c.id);run(c);if(seen.size>=3)complete("break")});$("#repeatBreak").onclick=()=>cur&&run(cur)
};

R.debug=()=>{
const cases=[
{net:["schedule.php","GET","404","82 ms"],con:"HTTP 404 Not Found",q:"Где искать причину в первую очередь?",a:"Путь к PHP-файлу",o:["DOM","Путь к PHP-файлу","CSS","JSON"],ex:"Статус 404 означает: запрос дошёл до сервера, но нужный ресурс не найден. Сначала проверяем адрес и имя PHP-файла."},
{net:["schedule.php","GET","500","310 ms"],con:"HTTP 500 Internal Server Error",q:"Какой участок вероятнее всего неисправен?",a:"PHP на сервере",o:["DOM","PHP на сервере","Кнопка","CSS"],ex:"500 — сервер получил запрос, но не смог нормально его обработать. Причину ищем в PHP-коде или серверной части."},
{net:["schedule.php","GET","200","420 ms"],con:"data = [{...}] ✓\nЭкран пуст",q:"Где искать проблему?",a:"render / DOM",o:["DNS","Сервер","render / DOM","GET"],ex:"200 и полученные data показывают, что сеть и сервер сработали. Если экран пуст, проверяем вывод данных: render() и DOM."},
{net:["schedule.php","GET","—","—"],con:"TypeError: Failed to fetch",q:"Что проверяем в первую очередь?",a:"Сеть / доступность запроса",o:["200 OK","Сеть / доступность запроса","DOM","JSON уже готов"],ex:"HTTP-ответа вообще нет. Сначала проверяем, доступен ли сервер и может ли браузер выполнить запрос."},
{net:["schedule.php","GET","pending","—"],con:"Promise используется как Response",q:"Что вероятнее всего пропущено?",a:"await",o:["CSS","await","DELETE","innerHTML"],ex:"Запрос ещё не завершён, а код уже пытается использовать результат как Response. Обычно здесь пропущен await."}
];let st=getModuleState("debug"),i=Number.isInteger(st.current)?st.current:0,solved=st.solved||{},answers=st.answers||{};
function store(){saveModuleState("debug",{current:i,solved,answers})}
function draw(){let c=cases[i],ans=answers[i];$("#app").innerHTML=`<div class="debugQuestionNav">${cases.map((_,n)=>`<button class="debugQ ${n===i?"active":""} ${solved[n]?"solved":""}" data-i="${n}">${n+1}</button>`).join("")}</div><div class="grid2 debugGrid"><div class="panel"><div class="httpCounter">Ситуация ${i+1} / ${cases.length}</div><div class="devtabs"><button class="devtab on" data-tab="net">Network</button><button class="devtab" data-tab="con">Console</button></div><div id="netPane" class="devPane"><table class="networkTable"><thead><tr><th>Name</th><th>Method</th><th>Status</th><th>Time</th></tr></thead><tbody><tr>${c.net.map((x,j)=>`<td class="${j===2&&x!=="200"?"statusAlert":""}">${x}</td>`).join("")}</tr></tbody></table></div><div id="conPane" class="devPane" style="display:none"><pre>${c.con}</pre></div><h3>${c.q}</h3><div class="quiz">${c.o.map(x=>`<button class="btn dbg ${ans===x?(x===c.a?"correct":"wrong"):""}" data-v="${x}">${x}</button>`).join("")}</div><div id="df" class="feedback ${solved[i]?"good":""}">${solved[i]?`<b>✓ Верно.</b><div class="debugExplanation">${c.ex}</div>`:"Выбери ответ. После проверки пояснение останется здесь."}</div><div class="debugMove"><button id="prevDbg" class="ghost" ${i===0?"disabled":""}>← Предыдущая</button><button id="nextDbg" class="btn" ${i===cases.length-1?"disabled":""}>Следующая →</button></div></div><div class="panel"><h3>Правило диагностики</h3><div class="guideBody diagnosis">1. Был ли запрос?\n2. Пришёл ли HTTP-ответ?\n3. Какой статус?\n4. Получены ли данные?\n5. Обновился ли DOM?</div><p class="mut">Можно переходить между ситуациями в любом порядке. Ответы и пояснения сохраняются.</p><div class="debugSolved">Решено: <b>${Object.values(solved).filter(Boolean).length} / ${cases.length}</b></div></div></div>`;
document.querySelectorAll(".debugQ").forEach(b=>b.onclick=()=>{i=+b.dataset.i;store();draw()});document.querySelectorAll(".devtab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".devtab").forEach(x=>x.classList.remove("on"));b.classList.add("on");$("#netPane").style.display=b.dataset.tab==="net"?"block":"none";$("#conPane").style.display=b.dataset.tab==="con"?"block":"none"});document.querySelectorAll(".dbg").forEach(b=>b.onclick=()=>{let ok=b.dataset.v===c.a;answers[i]=b.dataset.v;if(ok){solved[i]=true;document.querySelectorAll(".dbg").forEach(x=>x.classList.toggle("correct",x.dataset.v===c.a));$("#df").className="feedback good";$("#df").innerHTML=`<b>✓ Верно.</b><div class="debugExplanation">${c.ex}</div>`;if(Object.values(solved).filter(Boolean).length===cases.length)complete("debug",150)}else{S.errors++;save();b.classList.add("wrong");$("#df").className="feedback bad";$("#df").innerHTML="Пока нет. Сопоставь данные в Network и Console."}store()});$("#prevDbg").onclick=()=>{if(i>0){i--;store();draw()}};$("#nextDbg").onclick=()=>{if(i<cases.length-1){i++;store();draw()}}}
draw()
};

R.practice=()=>{
const tasks=[
{
 title:"Получить Response",
 context:"Функция loadData(url) получает адрес серверного PHP-файла в переменной url. Нужно отправить запрос и дождаться ответа.",
 desc:"Сохрани полученный Response в переменную response.",
 start:"async function loadData(url) {\n  \n}",
 checks:[
  ["использован fetch(url)",v=>/fetch\s*\(\s*url\s*\)/.test(v)],
  ["результат сохранён в response",v=>/response\s*=\s*await\s+fetch/.test(v)]
 ],
 h:["Используй fetch с адресом url.","Запрос асинхронный — дождись результата через await.","Начало строки: const response = await …"]
},
{
 title:"Обработка HTTP-ошибки",
 context:"Response уже получен и хранится в переменной response. У него есть свойство ok, которое показывает, был ли HTTP-ответ успешным.",
 desc:"Если response.ok равен false, останови выполнение и выброси Error.",
 start:"async function loadData(url) {\n  const response = await fetch(url);\n  \n}",
 checks:[
  ["проверяется response.ok",v=>/!\s*response\.ok|response\.ok\s*===\s*false/.test(v)],
  ["при ошибке выполняется throw new Error",v=>/throw\s+new\s+Error(?:\s*\([^)]*\))?\s*;?/.test(v)]
 ],
 h:["Проверь свойство response.ok.","Нужна проверка неуспешного ответа через if.","Используй if (!response.ok) и throw new Error(...)."]
},
{
 title:"Прочитать JSON",
 context:"Response уже получен от PHP-файла. Сервер вернул JSON в теле ответа.",
 desc:"Прочитай JSON-тело и сохрани результат в переменную data.",
 start:"async function loadData(url) {\n  const response = await fetch(url);\n  \n}",
 checks:[
  ["вызывается response.json()",v=>/response\.json\s*\(\s*\)/.test(v)],
  ["результат сохранён в data",v=>/data\s*=\s*await\s+response\.json/.test(v)]
 ],
 h:["JSON читается из Response.","response.json() тоже возвращает Promise.","const data = await response.json();"]
},
{
 title:"Показать данные",
 context:"Представим, что функция render(data) уже написана. Она получает готовые данные и выводит их на страницу.",
 given:"function render(data) {\n  // выводит данные на страницу\n}",
 desc:"Функция show(data) уже получает готовые данные. Передай их в render(data).",
 start:"async function show(data) {\n  \n}",
 checks:[
  ["вызван render(data)",v=>/render\s*\(\s*data\s*\)/.test(v)]
 ],
 h:["Писать функцию render заново не нужно.","Передай готовые данные в уже существующую функцию.","Вызови render(data)."]
},
{
 title:"GET-запрос к PHP",
 context:"На сервере существует файл api/schedule.php. Он возвращает расписание в формате JSON.",
 desc:"Получи Response из api/schedule.php и сохрани его в переменную response.",
 start:"async function loadSchedule() {\n  \n}",
 checks:[
  ["использован api/schedule.php",v=>/fetch\s*\(\s*["']api\/schedule\.php["']\s*\)/.test(v)],
  ["ответ ожидается через await",v=>/await\s+fetch/.test(v)],
  ["результат сохранён в response",v=>/response\s*=\s*await\s+fetch/.test(v)]
 ],
 h:["Нужен fetch по пути к PHP-файлу.","Дождись ответа через await.","const response = await fetch('api/schedule.php');"]
},
{
 title:"Проверить Response и получить data",
 context:"В функцию parse(response) уже передан объект Response. Повторно вызывать fetch не нужно.",
 desc:"Проверь успешность ответа. При ошибке выброси Error, иначе прочитай JSON в data.",
 start:"async function parse(response) {\n  \n}",
 checks:[
  ["проверяется response.ok",v=>/response\.ok/.test(v)],
  ["при ошибке выполняется throw new Error",v=>/throw\s+new\s+Error/.test(v)],
  ["JSON сохранён в data",v=>/data\s*=\s*await\s+response\.json/.test(v)]
 ],
 h:["Сначала проверь HTTP-ответ.","Если ответ неуспешный — останови выполнение через throw.","После проверки: const data = await response.json();"]
},
{
 title:"Обработать ошибку через try / catch",
 context:"Функция loadData(url) уже существует. Она может завершиться ошибкой, например если сервер недоступен или код сам выбросил Error.",
 given:"// loadData(url) уже существует",
 desc:"Вызови await loadData(url) внутри try и перехвати ошибку в catch.",
 start:"async function start(url) {\n  \n}",
 checks:[
  ["есть блок try",v=>/try\s*\{/.test(v)],
  ["есть await loadData(url)",v=>/await\s+loadData\s*\(\s*url\s*\)/.test(v)],
  ["есть блок catch",v=>/catch\s*\(/.test(v)]
 ],
 h:["Нужен блок для кода, который может завершиться ошибкой.","Внутри try вызови loadData(url) с await.","После try добавь catch (error) { ... }."]
},
{
 title:"Показать состояние загрузки",
 context:"Функции showLoading() и render(data) уже существуют. showLoading() показывает пользователю процесс загрузки, render(data) — готовые данные.",
 given:"// showLoading() и render(data) уже написаны",
 desc:"Сначала покажи загрузку, затем получи Response, прочитай JSON в data и только после этого вызови render(data).",
 start:"async function loadData(url) {\n  \n}",
 checks:[
  ["showLoading() вызывается",v=>/showLoading\s*\(\s*\)/.test(v)],
  ["есть await fetch",v=>/await\s+fetch/.test(v)],
  ["JSON сохранён в data",v=>/data\s*=\s*await\s+response\.json/.test(v)],
  ["есть render(data)",v=>/render\s*\(\s*data\s*\)/.test(v)]
 ],
 h:["Первым действием покажи состояние загрузки.","После fetch прочитай тело ответа через response.json().","Порядок: showLoading() → fetch → response.json() → render(data)."]
},
{
 title:"Собрать полный запрос",
 context:"Функция loadData(url) получает адрес PHP-файла. Функция render(data) уже существует.",
 given:"// render(data) выводит данные на страницу",
 desc:"Получи response, проверь response.ok, прочитай JSON в data и выведи результат через render(data).",
 start:"async function loadData(url) {\n  \n}",
 checks:[
  ["response = await fetch(url)",v=>/response\s*=\s*await\s+fetch\s*\(\s*url\s*\)/.test(v)],
  ["проверяется response.ok",v=>/response\.ok/.test(v)],
  ["data = await response.json()",v=>/data\s*=\s*await\s+response\.json/.test(v)],
  ["render(data)",v=>/render\s*\(\s*data\s*\)/.test(v)]
 ],
 h:["Собери знакомую цепочку из четырёх этапов.","fetch → response.ok → response.json().","В конце передай data в render(data)."]
},
{
 title:"Итоговая мини-задача",
 context:"На сервере есть api/schedule.php, который возвращает расписание в JSON. Функция render(data) уже написана.",
 given:"// api/schedule.php → JSON\n// render(data) → вывод на страницу",
 desc:"Загрузи расписание, проверь HTTP-ответ, прочитай JSON в data и покажи данные пользователю. Используй переменные response и data.",
 start:"async function loadSchedule() {\n  \n}",
 checks:[
  ["запрос api/schedule.php",v=>/response\s*=\s*await\s+fetch\s*\(\s*["']api\/schedule\.php["']\s*\)/.test(v)],
  ["проверка response.ok",v=>/response\.ok/.test(v)],
  ["throw new Error",v=>/throw\s+new\s+Error/.test(v)],
  ["data = await response.json()",v=>/data\s*=\s*await\s+response\.json/.test(v)],
  ["render(data)",v=>/render\s*\(\s*data\s*\)/.test(v)]
 ],
 h:["Начни с запроса к api/schedule.php и переменной response.","До чтения JSON проверь response.ok.","Заверши цепочку: data = await response.json(); render(data);"]
}
]
let st=getModuleState("practice"),idx=Number.isInteger(st.index)?st.index:0,codes=st.codes||{},solved=st.solved||{},hints=st.hints||{};
function store(){saveModuleState("practice",{index:idx,codes,solved,hints})}function draw(){let t=tasks[idx],done=Object.values(solved).filter(Boolean).length;$("#app").innerHTML=`<div class="panel practiceHead"><div><h2>Мини-задачи</h2><p>Выбирай задачу самостоятельно. Код и прогресс сохраняются.</p></div><div class="practiceProgress"><b>${done} / 10</b><span>решено</span></div></div><div class="taskNav">${tasks.map((_,i)=>`<button data-i="${i}" class="taskDot ${i===idx?'active':''} ${solved[i]?'solved':''}">${solved[i]?'✓ ':''}${i+1}</button>`).join("")}</div><div class="grid2"><div class="panel"><div class="httpCounter">Задача ${idx+1} / 10</div><h2>${t.title}</h2><div class="taskContext"><b>Контекст</b><p>${t.context}</p>${t.given?`<pre>${t.given}</pre>`:""}</div><p class="taskInstruction"><b>Задание:</b> ${t.desc}</p><textarea id="editor" class="editor largeEditor" spellcheck="false"></textarea><div class="actions"><button id="test" class="btn primary">Проверить</button><button id="hint" class="ghost">Подсказка ${Math.min(3,(hints[idx]||0)+1)}</button></div><div id="hintBox" class="feedback"></div><button id="resetPractice" class="textDanger">Сбросить прогресс задач</button></div><div class="panel"><h2>Автотест</h2><div id="tests" class="testList">${t.checks.map(x=>solved[idx]?`<div class="testGood">✓ ${x[0]}</div>`:`<div>○ ${x[0]}</div>`).join("")}</div><div id="pprev" class="browser"><div class="browserbar">Результат</div><div class="browserbody">${solved[idx]?"<b>✓ Задача выполнена</b><p>Все проверки пройдены. Решение сохранено.</p>":"Нажми «Проверить»."}</div></div></div></div>`;let ed=$("#editor");ed.value=codes[idx]??t.start;ed.oninput=()=>{codes[idx]=ed.value;store()};document.querySelectorAll(".taskDot").forEach(b=>b.onclick=()=>{codes[idx]=ed.value;idx=+b.dataset.i;store();draw()});$("#hint").onclick=()=>{let n=Math.min(3,(hints[idx]||0)+1);hints[idx]=n;S.hints++;save();store();$("#hintBox").className="feedback hintBox";$("#hintBox").innerHTML=`<b>Подсказка ${n}</b><br>${t.h[n-1]}`;$("#hint").textContent=`Подсказка ${Math.min(3,n+1)}`};$("#test").onclick=()=>{let v=ed.value.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\/\/.*$/gm,"");let results=t.checks.map(x=>[x[0],x[1](v)]);$("#tests").innerHTML=results.map(x=>`<div class="${x[1]?'testGood':'testBad'}">${x[1]?'✓':'✕'} ${x[0]}</div>`).join("");let ok=results.every(x=>x[1]);if(ok){solved[idx]=true;codes[idx]=ed.value;store();$("#pprev .browserbody").innerHTML="<b>✓ Задача выполнена</b><p>Все проверки пройдены. Переходим к следующей задаче…</p>";document.querySelector(`.taskDot[data-i="${idx}"]`)?.classList.add("solved");if(Object.values(solved).filter(Boolean).length===10){complete("practice",200)}else{const next=tasks.findIndex((_,n)=>n>idx&&!solved[n]);const fallback=tasks.findIndex((_,n)=>!solved[n]);setTimeout(()=>{idx=next!==-1?next:fallback;store();draw()},1200)}}else{S.errors++;save();$("#pprev .browserbody").innerHTML="<b>Есть что исправить</b><p>Красным отмечены непройденные проверки.</p>"}};$("#resetPractice").onclick=()=>{if(confirm("Сбросить код и прогресс всех 10 задач?")){codes={};solved={};hints={};idx=0;store();draw()}}}draw()
};

R.final=()=>{
let st=getModuleState("final"),routeOK=!!st.routeOK,methodOK=!!st.methodOK,codeOK=!!st.codeOK,code=st.code||"async function load(url) {\n  // используй переменные response и data\n  \n}";
const correct=["fetch()","HTTP Request","PHP","Данные / БД","JSON Response","response.json()","DOM"];
$("#app").innerHTML=`<div class="panel"><h2>Финальная миссия: расписание группы</h2><p>Приложение должно запросить api/schedule.php, получить данные через PHP и показать расписание пользователю.</p></div><div class="grid3 finalGrid"><div class="panel"><h3>1. Архитектура</h3><p>Расставь этапы.</p><div id="finalSlots">${correct.map((_,i)=>`<div class="slot"><b>${i+1}</b><div class="drop"></div></div>`).join("")}</div><div class="bank drop">${[...correct].sort(()=>Math.random()-.5).map(x=>`<div class="drag">${x}</div>`).join("")}</div><button id="finalRoute" class="btn">Проверить</button></div><div class="panel"><h3>2. HTTP</h3><p>Нужно <b>получить</b> расписание.</p><div class="quiz">${["GET","POST","PATCH","DELETE"].map(x=>`<button class="btn fm" data-v="${x}">${x}</button>`).join("")}</div></div><div class="panel"><h3>3. Код</h3><p>Адрес PHP-файла передаётся в <code>url</code> (для этой миссии — <code>api/schedule.php</code>). Ответ сохрани в <code>response</code>, данные — в <code>data</code>. Проверь <code>response.ok</code>, при ошибке выброси <code>Error</code>, затем вызови <code>render(data)</code>.</p><textarea id="finalCode" class="editor">${code}</textarea><button id="finalTest" class="btn">Автотест</button><div id="finalTests" class="testList"></div></div></div><div id="finalFb" class="panel"><h3>Статус миссии</h3><div class="checklist"><div class="check"><span>Архитектура</span><b id="fr">${routeOK?'✓':'○'}</b></div><div class="check"><span>HTTP</span><b id="fm">${methodOK?'✓':'○'}</b></div><div class="check"><span>JavaScript</span><b id="fc">${codeOK?'✓':'○'}</b></div></div><div id="missionEnd"></div></div>`;dnd($("#app"));
function store(){saveModuleState("final",{routeOK,methodOK,codeOK,code:$("#finalCode")?.value||code})}function finish(){store();if(routeOK&&methodOK&&codeOK){complete("final",300);$("#missionEnd").innerHTML=`<div class="result"><div class="big">MISSION ✓</div><p>Все части выполнены.</p><button id="certificate" class="btn primary">Получить грамоту</button></div>`;$("#certificate").onclick=showCertificate}}
$("#finalRoute").onclick=()=>{let drops=[...$("#finalSlots").querySelectorAll(".drop")],g=drops.map(z=>z.querySelector(".drag")?.textContent||"");drops.forEach((z,i)=>{z.classList.remove("answerGood","answerBad");z.classList.add(g[i]===correct[i]?"answerGood":"answerBad")});routeOK=correct.every((x,i)=>x===g[i]);$("#fr").textContent=routeOK?"✓":"✕";if(!routeOK){S.errors++;save()}finish()};document.querySelectorAll(".fm").forEach(b=>b.onclick=()=>{methodOK=b.dataset.v==="GET";b.classList.add(methodOK?"correct":"wrong");if(methodOK)document.querySelectorAll(".fm").forEach(x=>x.disabled=true);$("#fm").textContent=methodOK?"✓":"✕";if(!methodOK){S.errors++;save()}finish()});$("#finalCode").oninput=store;$("#finalTest").onclick=()=>{let v=$("#finalCode").value,tests=[["response = await fetch(url)",/response\s*=\s*await\s+fetch\s*\(\s*url\s*\)/.test(v)],["проверяется response.ok",/response\.ok/.test(v)],["throw new Error(...) при ошибке",/throw\s+new\s+Error/.test(v)],["data = await response.json()",/data\s*=\s*await\s+response\.json/.test(v)],["render(data)",/render\s*\(\s*data\s*\)/.test(v)]];$("#finalTests").innerHTML=tests.map(x=>`<div class="${x[1]?'testGood':'testBad'}">${x[1]?'✓':'✕'} ${x[0]}</div>`).join("");codeOK=tests.every(x=>x[1]);$("#fc").textContent=codeOK?"✓":"✕";if(!codeOK){S.errors++;save()}finish()};function showCertificate(){$("#app").innerHTML=`<div class="certificatePage"><div class="certificate"><div class="certMark">&lt;/&gt;</div><div class="certSmall">FETCH LAB</div><h1>ГРАМОТА</h1><p>за успешное прохождение интерактивного тренажёра</p><h2>«Взаимодействие JavaScript с сервером: fetch, HTTP и PHP»</h2><label>Имя и фамилия</label><input id="certName" placeholder="Введите имя и фамилию"><div class="certMeta"><span>Финальная миссия: выполнена ✓</span><span>${new Date().toLocaleDateString('ru-RU')}</span></div></div><div class="certActions"><button id="printCert" class="btn primary">Распечатать</button><button id="backFinal" class="ghost">Вернуться к результатам</button></div></div>`;$("#printCert").onclick=()=>window.print();$("#backFinal").onclick=()=>R.final();}finish();
};
$("#resetAll").onclick=()=>{if(confirm("Сбросить весь прогресс FETCH LAB?")){resetEverything();location.reload()}};
nav();
const welcomeScreen=document.querySelector("#welcome");
const startLearning=document.querySelector("#startLearning");
const savedSession=readSession();

function closeWelcome(){
  if(!welcomeScreen)return;
  welcomeScreen.classList.add("hide");
  document.body.classList.remove("welcomeOpen");
  setTimeout(()=>welcomeScreen?.remove(),320);
}

document.body.classList.add("welcomeOpen");

if(startLearning){
  startLearning.addEventListener("click",()=>{
    // "Начать обучение" always means a clean new run.
    resetEverything();
    saveSession({started:true,module:"live",modules:{}});
    closeWelcome();
    openMod("live");
  });
}

// If there is saved progress, offer it explicitly instead of silently skipping the start screen.
if(savedSession.started && savedSession.module && welcomeScreen){
  const continueBtn=document.createElement("button");
  continueBtn.id="continueLearning";
  continueBtn.className="continueButton";
  continueBtn.textContent="Продолжить с прошлого места";
  startLearning?.insertAdjacentElement("afterend",continueBtn);

  const resetBtn=document.createElement("button");
  resetBtn.id="resetProgress";
  resetBtn.className="resetProgressButton";
  resetBtn.textContent="Сбросить сохранённый прогресс";
  continueBtn.insertAdjacentElement("afterend",resetBtn);

  continueBtn.addEventListener("click",()=>{
    closeWelcome();
    openMod(savedSession.module);
  });

  resetBtn.addEventListener("click",()=>{
    resetEverything();
    location.reload();
  });
}
