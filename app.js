/* ═══════════ ⚙️ الإعدادات ═══════════ */
const WA='966561365019';
const CH='bashawat-x9f3k7q2';
const CRYPT_PASS='bashawat-secure-2026';
const ADMIN_PASS='1234';
const DRIVER_PASS='5678';
const SIZES=['صغير','وسط','كبير'];
const PAGE=document.body.dataset.page;
const $=s=>document.getElementById(s);

/* ═══════════ 🔐 التشفير ═══════════ */
let _k;
async function key(){ if(_k)return _k;
  const kb=await crypto.subtle.importKey('raw',new TextEncoder().encode(CRYPT_PASS),'PBKDF2',false,['deriveKey']);
  _k=await crypto.subtle.deriveKey({name:'PBKDF2',salt:new TextEncoder().encode(CH),iterations:50000,hash:'SHA-256'},kb,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  return _k;}
async function enc(o){ const k=await key(), iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(JSON.stringify(o))));
  const b=new Uint8Array(12+ct.length); b.set(iv); b.set(ct,12);
  return btoa(String.fromCharCode(...b));}
async function dec(s){ try{ const k=await key(), bin=Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:bin.slice(0,12)},k,bin.slice(12));
  return JSON.parse(new TextDecoder().decode(pt));}catch(e){return null;}}
async function send(evt){ evt.ts=Date.now();
  await fetch('https://ntfy.sh/'+CH,{method:'POST',body:await enc(evt)});}
function listen(cb){ const es=new EventSource('https://ntfy.sh/'+CH+'/sse?since=12h');
  es.onopen=()=>setConn(true); es.onerror=()=>setConn(false);
  es.onmessage=async m=>{ const e=await dec(m.data.message); if(e)cb(e); };}
function setConn(on){ document.querySelectorAll('.conn').forEach(c=>{
  c.textContent=on?'🟢 متصل':'🔴 اتصال…'; c.classList.toggle('on',on);});}

/* ═══════════ الحالة ═══════════ */
const S={orders:new Map()};
const ST={pending:['⏳ جديد','#c9973b'],approved:['✅ مؤكد','#2e7d32'],preparing:['👨 تحضير','#e65100'],ready:['📦 جاهز','#1565c0'],delivering:['🛵 توصيل','#6a1b9a'],delivered:['🎉 سُلّم','#33691e'],rejected:['❌ اعتذار','#b71c1c']};
let trackId=null;
function handle(e){
  if(e.t==='order'&&!S.orders.has(e.o.id)){ S.orders.set(e.o.id,{o:e.o,status:'pending',loc:null,ts:e.ts});
    if(PAGE==='admin'){beep();toast('🆕 طلب جديد #'+e.o.id);} }
  else if(e.t==='status'){ const r=S.orders.get(e.id); if(r){r.status=e.s;r.reason=e.reason||'';} }
  else if(e.t==='loc'){ const r=S.orders.get(e.id); if(r){r.loc=[e.lat,e.lng]; moveMarker(e.id);} }
  dyn();}
let dT; function dyn(){ clearTimeout(dT); dT=setTimeout(()=>{
  if(PAGE==='admin')renderAdmin();
  if(PAGE==='driver')renderDriver();
  if(PAGE==='cust'){updateTrack(); const f=$('fabTrack'); if(f)f.hidden=!activeMy();} },150);}

/* ═══════════ المنيو ═══════════ */
const MENU=[
{t:'الكشري',i:'🍚',items:[['طبق كشري كبير',[12],260],['طبق كشري وسط',[10],210],['طبق كشري سوبر',[8],180],['طبق كشري كمالة',[5],285],['طبق كشري عائلي وسط',[25],290],['طبق كشري عائلي كبير',[35],295],['عيش توست',[2],150],['أرز بلبن',[6],160]]},
{t:'طواجن وحواوشي',i:'🍲',items:[['طاجن مكرونة لحم',[12],255],['طاجن مكرونة فراخ',[10],265],['طاجن مكرونة بالدجاج والموزاريلا',[12],220],['طاجن مكرونة باللحمة والموزاريلا',[14],225],['رغيف حواوشي سادة',[12],230],['رغيف حواوشي بالموزاريلا',[14],350]]},
{t:'السندوتشات',i:'🥙',items:[['فلافل مشكل',[3],138],['فلافل مشكل بالبيض',[4],178],['فلافل محشية سادة',[3],140],['فول بالبيض',[4],140],['فول بالسلطة',[3],140],['مسقعة',[3],150],['بطاطس مهروسة',[3],158],['بطاطس مهروسة بالبيض',[4],124],['عجة فرنساوي',[3],168],['بطاطس بانية',[3],158],['جبنة قديمة (مش مصري)',[3],145],['جبنة فيتا بالخيار',[3],162],['زهرة - قرنبيط',[3],162],['بطاطس محمرة بالكاتشب',[3],145],['بيض مسلوق بالخلطة',[3],140],['بطاطس شيبسي',[3],145],['بطاطس شيبسي بالبيض',[4],150],['كبدة',[4],170],['فلافل جبنة كبير (صامولي)',[4],180],['شكشوكة (صامولي)',[2],170],['بيض مقلي (صامولي)',[2],160],['بيض أومليت (صامولي)',[2],160],['جبنة - مربى (صامولي)',[2],155],['فلافل برجر بالجبنة الشيدر (صامولي)',[4],175]]},
{t:'الصحون',i:'🍽️',items:[['بيض مسلوق 5 حبات بالطحينة',[8],210],['بطاطس أصابع محمرة بالكاتشب',[2,3,5],180],['بطاطس شيبسي',[2,3,5],115],['كبدة اسكندراني',[5,8,12],120],['فول بزيت الزيتون والطحينة',[7],140],['فول بالزيت الحار والطحينة',[7],75],['بطاطس بانية',[2,3,5],150],['قرنبيط بانية',[2,3,5],255],['باذنجان مخلل',[2,3,5],320],['مسقعة',[2,3,5],480],['باذنجان مقلي بالليمون',[2,3,5],514],['مقبلات مشكل محلي',[7],420],['جبنة قديمة بالطحينة (مش مصري)',[3,5,7],178],['خبز مصري بلدي 3 حبات',[1],168],['بيض بالبسطرمة',[10],320],['فول بالصلصة',[6],149],['فول بالسحق',[10],149],['مسقعة بالحمص',[7],149],['سلطة بالمقبلات (فيتا - رومي - زيتون)',[10],210],['فلافل عادي 4 حبات',[1],155],['فلافل محشية (الحبة بريال)',[1],150],['قرص فلافل بالجبنة الكبيرة',[2],180],['علبة عجينة فلافل كبيرة',[2,3,5],200]]},
{t:'المقبلات',i:'🥗',items:[['سلطة خضراء',[2,3,5],260],['جبنة قديمة',[3,5,7],210],['باذنجان دقة البشوات',[2,3,5],180],['جبنة بالخيار',[3,5,7],285],['جبنة بالطماطم',[3,5,7],210],['بابا غنوج',[3,5,7],310],['مشكل البشوات',[10,15,17],320],['باذنجان مقلي بالطحينة والدقة',[2,3,5],350]]},
{t:'الاضافات',i:'➕',items:[['تقلية',[2],150],['عدس',[2],150],['صلصة',[2],150]]},
{t:'مشروبات',i:'🥤',items:[['كينزا',[3],149],['حمضيات',[3],149],['ليمون صودا',[3],149],['ماء',[1],null]]}];

/* ═══════════ العميل ═══════════ */
function initCustomer(){
  const cats=$('cats'), search=$('search'), main=$('menu'); let currentSection=0;
  MENU.forEach((sec,si)=>{
    const chip=document.createElement('button'); chip.className='chip'; chip.textContent=sec.i+' '+sec.t;
    chip.onclick=()=>showSection(si,true); cats.appendChild(chip);
    const s=document.createElement('section'); s.className='section'; s.id='sec-'+si;
    s.innerHTML=`<h3 class="ribbon">${sec.i} ${sec.t}</h3><div class="grid"></div>`;
    const g=s.querySelector('.grid');
    sec.items.forEach((it,ii)=>{
      const [name,prices,cal]=it, multi=prices.length>1;
      const c=document.createElement('div'); c.className='card'; c.dataset.name=name;
      c.innerHTML=`<div class="c-top"><h4>${name}</h4><span class="cal">${cal?'🔥 '+cal+' سعرة':'💧 صفر سعرات'}</span></div>
      ${multi?`<select class="size">${prices.map((p,i)=>`<option value="${i}">${SIZES[i]} • ${p} ريال</option>`).join('')}</select>`:''}
      <div class="c-bot"><div class="price">${multi?'من '+prices[0]+' ريال':prices[0]+' ريال'}</div>
      <div class="step" data-si="${si}" data-ii="${ii}"><button class="st inc">+</button><span class="qnum">0</span><button class="st dec">−</button></div></div>`;
      g.appendChild(c);});
    const n=MENU.length, prev=(si-1+n)%n, next=(si+1)%n, nav=document.createElement('div'); nav.className='sec-nav';
    nav.innerHTML=`<button class="nav-btn" data-go="${prev}"><span class="arr">→</span><span class="lbl"><small>السابق</small><b>${MENU[prev].i} ${MENU[prev].t}</b></span></button>
    <button class="nav-btn" data-go="${next}"><span class="lbl"><small>التالي</small><b>${MENU[next].i} ${MENU[next].t}</b></span><span class="arr">←</span></button>`;
    s.appendChild(nav); main.appendChild(s);});
  function showSection(si,scroll){ currentSection=si;
    document.querySelectorAll('.section').forEach((s,i)=>s.style.display=i===si?'':'none');
    document.querySelectorAll('.chip').forEach((c,i)=>c.classList.toggle('active',i===si));
    if(scroll)requestAnimationFrame(()=>document.getElementById('sec-'+si).scrollIntoView({behavior:'smooth'}));}
  showSection(0);
  search.addEventListener('input',e=>{ const q=e.target.value.trim();
    if(!q){showSection(currentSection);return;}
    document.querySelectorAll('.section').forEach(s=>{ s.style.display='';
      s.querySelectorAll('.card').forEach(c=>c.style.display=c.dataset.name.includes(q)?'':'none');
      s.style.display=[...s.querySelectorAll('.card')].some(c=>c.style.display!=='none')?'':'none';});});
  main.addEventListener('click',e=>{ const b=e.target.closest('.nav-btn'); if(b)showSection(+b.dataset.go,true);});
  document.addEventListener('click',e=>{
    const b=e.target.closest('.st'); if(!b)return;
    const st=b.closest('.step'), it=MENU[+st.dataset.si].items[+st.dataset.ii];
    let size='',price=it[1][0]; const sel=st.closest('.card').querySelector('select');
    if(sel){size=SIZES[+sel.value];price=it[1][+sel.value];}
    const k=it[0]+'|'+size, cur=cart.get(k)||{name:it[0],size,price,qty:0};
    b.classList.contains('inc')?cur.qty++:cur.qty--;
    cur.qty<=0?cart.delete(k):cart.set(k,cur); updateCart();});
  document.addEventListener('change',e=>{if(e.target.matches('.size'))refreshSteps();});
  $('dItems').addEventListener('click',e=>{ const b=e.target.closest('.q'); if(!b)return;
    const it=cart.get(b.dataset.k); b.dataset.a==='inc'?it.qty++:it.qty--;
    if(it.qty<=0)cart.delete(b.dataset.k); updateCart();});
  updateCart();
  if(!localStorage.getItem('rb_welcome_seen')){ setTimeout(()=>$('welcome').classList.add('show'),700); localStorage.setItem('rb_welcome_seen','1'); }
  $('welcome').addEventListener('click',e=>{if(e.target.id==='welcome')closeWelcome();});
  document.querySelectorAll('.wa-link').forEach(a=>a.href='https://wa.me/'+WA+'?text='+encodeURIComponent('السلام عليكم ركن البشوات 🌟 أبغى أطلب'));
  $('fabTrack').hidden=!activeMy();}
const cart=new Map();
function refreshSteps(){ document.querySelectorAll('.step').forEach(st=>{
  const it=MENU[+st.dataset.si].items[+st.dataset.ii]; let size='';
  const sel=st.closest('.card').querySelector('select'); if(sel)size=SIZES[+sel.value];
  const q=(cart.get(it[0]+'|'+size)||{}).qty||0;
  st.querySelector('.qnum').textContent=q; st.classList.toggle('on',q>0);});}
function updateCart(){ let c=0,t=0; cart.forEach(i=>{c+=i.qty;t+=i.qty*i.price;});
  document.querySelectorAll('.count').forEach(x=>x.textContent=c);
  const dt=$('dTotal'); if(dt)dt.textContent=t+' ريال';
  const box=$('dItems'); if(!box)return;
  box.innerHTML=cart.size?[...cart.entries()].map(([k,i])=>`<div class="ci">
    <div class="ci-info"><b>${i.name}${i.size?`<span class="ci-size">${i.size}</span>`:''}</b><span class="ci-price">${i.price} ريال</span></div>
    <div class="ci-ctrl"><button class="q" data-k="${k}" data-a="dec">−</button><span>${i.qty}</span><button class="q" data-k="${k}" data-a="inc">+</button></div>
    <div class="ci-total">${i.qty*i.price} ريال</div></div>`).join('')
  :`<div class="empty">🛒<br>سلتك فارغة..</div>`; refreshSteps();}
function openCart(){$('drawer').classList.add('show');$('overlay').classList.add('show');}
function closeCart(){$('drawer').classList.remove('show');$('overlay').classList.remove('show');}
function closeWelcome(){$('welcome').classList.remove('show');}
async function checkout(){
  if(!cart.size){toast('سلتك فارغة 🛒');return;}
  const name=$('cname').value.trim(), phone=$('cphone').value.trim(), addr=$('caddr').value.trim();
  if(!name||!addr){toast('⚠️ الاسم والعنوان مطلوبان');return;}
  let lat=null,lng=null;
  try{const p=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{timeout:5000}));
    lat=p.coords.latitude;lng=p.coords.longitude;}catch(e){}
  let total=0; const items=[...cart.values()].map(i=>{total+=i.qty*i.price;return{n:i.name,s:i.size,q:i.qty,p:i.price};});
  const id='B'+String(Date.now()).slice(-5);
  const o={id,name,phone,addr,notes:$('cnotes').value.trim(),items,total,lat,lng};
  S.orders.set(id,{o,status:'pending',loc:null,ts:Date.now()});
  await send({t:'order',o});
  cart.clear(); updateCart(); closeCart();
  localStorage.setItem('rb_my',id); $('fabTrack').hidden=false;
  openTrack(id); toast('تم إرسال طلبك ✅');}
function activeMy(){ const id=localStorage.getItem('rb_my'); if(!id)return null;
  const r=S.orders.get(id); return (r&&!['delivered','rejected'].includes(r.status))?id:null;}
function openTrack(id){ trackId=id||activeMy()||localStorage.getItem('rb_my');
  if(!trackId){toast('لا يوجد طلب');return;}
  $('trackOv').classList.add('show'); updateTrack();}
function closeTrack(){$('trackOv').classList.remove('show'); trackId=null;
  if(cmapObj){cmapObj.remove();cmapObj=null;cmapMk=null;} const m=$('cmap'); if(m)m.style.display='none';}
const TLSTEPS=['pending','approved','preparing','ready','delivering','delivered'];
const TLLBL={pending:'⏳ بانتظار الموافقة',approved:'✅ تم تأكيد الطلب',preparing:'👨 جاري التحضير',ready:'📦 جاهز للتوصيل',delivering:'🛵 في الطريق إليك',delivered:'🎉 تم التسليم'};
let cmapObj=null,cmapMk=null;
function updateTrack(){ const ov=$('trackOv'); if(!ov||!ov.classList.contains('show'))return;
  const r=S.orders.get(trackId); if(!r)return;
  $('trTitle').textContent='طلب #'+r.o.id+' — '+r.o.total+' ريال';
  if(r.status==='rejected'){ $('tl').innerHTML=''; $('trReason').textContent='❌ نعتذر، تم رفض الطلب'+(r.reason?': '+r.reason:''); $('cmap').style.display='none'; return;}
  $('trReason').textContent='';
  const idx=TLSTEPS.indexOf(r.status);
  $('tl').innerHTML=TLSTEPS.map((s,i)=>`<div class="tli ${i<idx?'done':i===idx?'now':''}"><span class="dot">${i<=idx?'✓':'•'}</span>${TLLBL[s]}</div>`).join('');
  if(r.status==='delivering'&&r.loc)showCMap(r); else if(r.status!=='delivering')$('cmap').style.display='none';
  const wa=$('trWA'); if(wa)wa.href='https://wa.me/'+WA+'?text='+encodeURIComponent(waMsg(r.o));}
function showCMap(r){ $('cmap').style.display='block';
  if(!cmapObj){ const c=r.loc||(r.o.lat!=null?[r.o.lat,r.o.lng]:null)||[24.676,46.71];
    cmapObj=L.map('cmap',{zoomControl:false}).setView(c,15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(cmapObj);
    if(r.o.lat!=null)L.marker([r.o.lat,r.o.lng]).addTo(cmapObj).bindPopup('موقعك 🏠');}
  if(r.loc){ if(!cmapMk)cmapMk=L.marker(r.loc,{icon:L.divIcon({className:'drv',html:'🛵',iconSize:[30,30]})}).addTo(cmapObj);
    else cmapMk.setLatLng(r.loc); cmapObj.panTo(r.loc);}}
function moveMarker(id){ const ov=$('trackOv'); if(ov&&ov.classList.contains('show')&&trackId===id){const r=S.orders.get(id); if(r&&r.loc)showCMap(r);}}
function waMsg(o){ let m=`السلام عليكم *ركن البشوات* 🌟\nطلب ${o.id}:\n`;
  o.items.forEach(i=>m+=`▪️ ${i.q}× ${i.n}${i.s?' ('+i.s+')':''} = ${i.q*i.p} ريال\n`);
  m+=`*الإجمالي: ${o.total} ريال*\n👤 ${o.name}\n📍 ${o.addr}`; if(o.phone)m+=`\n📞 ${o.phone}`; return m;}

/* ═══════════ المدير ═══════════ */
function initAdmin(){
  $('adminPass').addEventListener('keydown',e=>{if(e.key==='Enter')adminLogin();});
  $('adminLogout').onclick=()=>{sessionStorage.removeItem('rb_adm');location.reload();};
  if(sessionStorage.getItem('rb_adm')==='1')showAdmin();}
function adminLogin(){ if($('adminPass').value===ADMIN_PASS){ sessionStorage.setItem('rb_adm','1'); showAdmin(); toast('مرحباً بالمدير 👋'); } else toast('❌ كلمة سر خاطئة');}
function showAdmin(){ $('adminGate').hidden=true; $('adminDash').hidden=false; renderAdmin(); }
function renderAdmin(){
  const list=[...S.orders.values()].sort((a,b)=>(b.ts||0)-(a.ts||0));
  const cnt=s=>list.filter(r=>r.status===s).length;
  const rev=list.filter(r=>r.status==='delivered').reduce((s,r)=>s+r.o.total,0);
  $('adminStats').innerHTML=`<div class="stat">جديدة<b>${cnt('pending')}</b></div><div class="stat">تحضير<b>${cnt('approved')+cnt('preparing')}</b></div><div class="stat">جاهزة<b>${cnt('ready')}</b></div><div class="stat">توصيل<b>${cnt('delivering')}</b></div><div class="stat">مبيعات<b>${rev} ريال</b></div>`;
  $('adminList').innerHTML=list.length?list.map(r=>{
    const [lb,cl]=ST[r.status]; let acts='';
    if(r.status==='pending')acts=`<button class="act-ok" data-a="approved" data-id="${r.o.id}">✅ موافقة</button><button class="act-no" data-a="reject" data-id="${r.o.id}">❌ رفض</button>`;
    else if(r.status==='approved')acts=`<button class="act-nx" data-a="preparing" data-id="${r.o.id}">👨 بدء التحضير</button>`;
    else if(r.status==='preparing')acts=`<button class="act-nx" data-a="ready" data-id="${r.o.id}">📦 الطلب جاهز</button>`;
    else if(r.status==='ready')acts=`<span class="schip" style="background:#1565c0">⏳ بانتظار سائق</span>`;
    else if(r.status==='delivering')acts=`<button class="act-map" data-a="map" data-id="${r.o.id}">🗺️ تتبع</button><button class="act-ok" data-a="delivered" data-id="${r.o.id}">🎉 تسليم</button>`;
    return `<div class="ocard"><div class="ohead">#${r.o.id} • ${r.o.total} ريال <span class="schip" style="background:${cl}">${lb}</span></div>
    <div class="obody">👤 ${r.o.name} ${r.o.phone?'📞 '+r.o.phone:''}<br>📍 ${r.o.addr||'—'}${r.o.notes?'<br>📝 '+r.o.notes:''}<br>🧾 ${r.o.items.map(x=>`${x.q}× ${x.n}`).join('، ')}</div>
    <div class="oacts">${acts}</div></div>`;}).join('')
  :`<div class="empty">لا طلبات بعد..</div>`;}
document.addEventListener('click',e=>{ const b=e.target.closest('#adminList button'); if(!b)return;
  const id=b.dataset.id, a=b.dataset.a;
  if(a==='reject'){ const reason=prompt('سبب الرفض:','غير متوفر حالياً')||''; send({t:'status',id,s:'rejected',reason}); }
  else if(a==='map'){ openTrack(id); }
  else if(a){ send({t:'status',id,s:a}); } });
function beep(){ try{ const c=new (window.AudioContext||window.webkitAudioContext)(), o=c.createOscillator(), g=c.createGain();
  o.connect(g);g.connect(c.destination);o.frequency.value=880;g.gain.value=.25;o.start();
  setTimeout(()=>{o.stop();c.close();},350);}catch(e){} }

/* ═══════════ السائق ═══════════ */
function initDriver(){
  $('driverPass').addEventListener('keydown',e=>{if(e.key==='Enter')driverLogin();});
  $('driverLogout').onclick=()=>{sessionStorage.removeItem('rb_drv');location.reload();};
  if(sessionStorage.getItem('rb_drv')==='1')showDriver();}
function driverLogin(){ if($('driverPass').value===DRIVER_PASS){ sessionStorage.setItem('rb_drv','1'); showDriver(); toast('انطلق يا بطل 🛵'); } else toast('❌ كود خاطئ');}
function showDriver(){ $('driverGate').hidden=true; $('driverDash').hidden=false; renderDriver(); }
function renderDriver(){
  const list=[...S.orders.values()].sort((a,b)=>(a.ts||0)-(b.ts||0));
  const ready=list.filter(r=>r.status==='ready'), doing=list.filter(r=>r.status==='delivering');
  $('driverList').innerHTML=[
    ...ready.map(r=>`<div class="ocard"><div class="ohead">#${r.o.id} • ${r.o.total} ريال <span class="schip" style="background:#1565c0">📦 جاهز</span></div>
      <div class="obody">📍 ${r.o.addr||'—'}<br>👤 ${r.o.name} ${r.o.phone?'📞 '+r.o.phone:''}</div>
      <div class="oacts"><button class="act-ok" data-a="accept" data-id="${r.o.id}">🛵 قبول واستلام</button></div></div>`),
    ...doing.map(r=>`<div class="ocard"><div class="ohead">#${r.o.id} • ${r.o.total} ريال <span class="schip" style="background:#6a1b9a">🛵 توصيل</span></div>
      <div class="obody">📍 ${r.o.addr||'—'}<br>👤 ${r.o.name} ${r.o.phone?'📞 '+r.o.phone:''}</div>
      <div class="oacts">${r.o.lat!=null?`<a class="act-map" style="text-decoration:none" target="_blank" href="https://www.google.com/maps/dir/?api=1&destination=${r.o.lat},${r.o.lng}">🧭 خرائط جوجل</a>`:''}
      <button class="act-ok" data-a="delivered" data-id="${r.o.id}">✅ تم التسليم</button></div></div>`)]
  .join('')||`<div class="empty">لا طلبات جاهزة حالياً..<br>أبقِ الصفحة مفتوحة 🔔</div>`;}
document.addEventListener('click',e=>{ const b=e.target.closest('#driverList button'); if(!b)return;
  const id=b.dataset.id;
  if(b.dataset.a==='accept'){ send({t:'status',id,s:'delivering'}); startWatch(id); toast('🛵 انطلق!'); }
  else { stopWatch(); send({t:'status',id,s:'delivered'}); toast('🎉 أحسنت!'); } });
let watchId=null,lastLoc=0;
function startWatch(id){ stopWatch();
  watchId=navigator.geolocation.watchPosition(p=>{ const n=Date.now();
    if(n-lastLoc>4000){ lastLoc=n; send({t:'loc',id,lat:p.coords.latitude,lng:p.coords.longitude}); }
  },()=>{},{enableHighAccuracy:true});}
function stopWatch(){ if(watchId!=null){navigator.geolocation.clearWatch(watchId);watchId=null;} }

/* ═══════════ عام ═══════════ */
let tT; function toast(m){ const s=$('toastMsg'); s.textContent=m; s.classList.add('show'); clearTimeout(tT); tT=setTimeout(()=>s.classList.remove('show'),1800);}
if(PAGE==='cust')initCustomer();
if(PAGE==='admin')initAdmin();
if(PAGE==='driver')initDriver();
listen(handle);
