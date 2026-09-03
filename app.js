/* ═══════ ️ الإعدادات (مطابقة في الصفحات الثلاث) ═══════ */
const WA='966561365019';
const CH='bashawat-x9f3k7q2';
const SIZES=['صغير','وسط','كبير'];
const $=s=>document.getElementById(s);

/* ═══════ 📡 البث والاستقبال (بروتوكول موحّد بسيط) ═══════ */
async function send(evt){ evt.ts=Date.now(); const body=JSON.stringify(evt);
  try{ await fetch('https://ntfy.sh/'+CH,{method:'POST',body}); }
  catch(e){ await new Promise(r=>setTimeout(r,900)); await fetch('https://ntfy.sh/'+CH,{method:'POST',body}); }}
function listen(cb){ const es=new EventSource('https://ntfy.sh/'+CH+'/sse?since=12h');
  es.onmessage=m=>{ try{ cb(JSON.parse(m.data.message)); }catch(e){} };}

/* ═══════ الحالة ═══════ */
const S={orders:new Map()};
let echoId=null;
function handle(e){
  if(e.t==='order'&&!S.orders.has(e.o.id)){ S.orders.set(e.o.id,{o:e.o,status:'pending',loc:null,ts:e.ts});
    if(e.o.id===echoId){echoId=null;toast('📡 تم البث — المدير يستلم الآن');} }
  else if(e.t==='status'){ const r=S.orders.get(e.id); if(r){r.status=e.s;r.reason=e.reason||'';} }
  else if(e.t==='loc'){ const r=S.orders.get(e.id); if(r){r.loc=[e.lat,e.lng]; moveMarker(e.id);} }
  clearTimeout(hT); hT=setTimeout(()=>{updateTrack(); const f=$('fabTrack'); if(f)f.hidden=!activeMy();},150);}
let hT;

/* ═══════ المنيو ═══════ */
const MENU=[
{t:'الكشري',i:'🍚',items:[['طبق كشري كبير',[12],260],['طبق كشري وسط',[10],210],['طبق كشري سوبر',[8],180],['طبق كشري كمالة',[5],285],['طبق كشري عائلي وسط',[25],290],['طبق كشري عائلي كبير',[35],295],['عيش توست',[2],150],['أرز بلبن',[6],160]]},
{t:'طواجن وحواوشي',i:'🍲',items:[['طاجن مكرونة لحم',[12],255],['طاجن مكرونة فراخ',[10],265],['طاجن مكرونة بالدجاج والموزاريلا',[12],220],['طاجن مكرونة باللحمة والموزاريلا',[14],225],['رغيف حواوشي سادة',[12],230],['رغيف حواوشي بالموزاريلا',[14],350]]},
{t:'السندوتشات',i:'🥙',items:[['فلافل مشكل',[3],138],['فلافل مشكل بالبيض',[4],178],['فلافل محشية سادة',[3],140],['فول بالبيض',[4],140],['فول بالسلطة',[3],140],['مسقعة',[3],150],['بطاطس مهروسة',[3],158],['بطاطس مهروسة بالبيض',[4],124],['عجة فرنساوي',[3],168],['بطاطس بانية',[3],158],['جبنة قديمة (مش مصري)',[3],145],['جبنة فيتا بالخيار',[3],162],['زهرة - قرنبيط',[3],162],['بطاطس محمرة بالكاتشب',[3],145],['بيض مسلوق بالخلطة',[3],140],['بطاطس شيبسي',[3],145],['بطاطس شيبسي بالبيض',[4],150],['كبدة',[4],170],['فلافل جبنة كبير (صامولي)',[4],180],['شكشوكة (صامولي)',[2],170],['بيض مقلي (صامولي)',[2],160],['بيض أومليت (صامولي)',[2],160],['جبنة - مربى (صامولي)',[2],155],['فلافل برجر بالجبنة الشيدر (صامولي)',[4],175]]},
{t:'الصحون',i:'🍽️',items:[['بيض مسلوق 5 حبات بالطحينة',[8],210],['بطاطس أصابع محمرة بالكاتشب',[2,3,5],180],['بطاطس شيبسي',[2,3,5],115],['كبدة اسكندراني',[5,8,12],120],['فول بزيت الزيتون والطحينة',[7],140],['فول بالزيت الحار والطحينة',[7],75],['بطاطس بانية',[2,3,5],150],['قرنبيط بانية',[2,3,5],255],['باذنجان مخلل',[2,3,5],320],['مسقعة',[2,3,5],480],['باذنجان مقلي بالليمون',[2,3,5],514],['مقبلات مشكل محلي',[7],420],['جبنة قديمة بالطحينة (مش مصري)',[3,5,7],178],['خبز مصري بلدي 3 حبات',[1],168],['بيض بالبسطرمة',[10],320],['فول بالصلصة',[6],149],['فول بالسحق',[10],149],['مسقعة بالحمص',[7],149],['سلطة بالمقبلات (فيتا - رومي - زيتون)',[10],210],['فلافل عادي 4 حبات',[1],155],['فلافل محشية (الحبة بريال)',[1],150],['قرص فلافل بالجبنة الكبيرة',[2],180],['علبة عجينة فلافل كبيرة',[2,3,5],200]]},
{t:'المقبلات',i:'🥗',items:[['سلطة خضراء',[2,3,5],260],['جبنة قديمة',[3,5,7],210],['باذنجان دقة البشوات',[2,3,5],180],['جبنة بالخيار',[3,5,7],285],['جبنة بالطماطم',[3,5,7],210],['بابا غنوج',[3,5,7],310],['مشكل البشوات',[10,15,17],320],['باذنجان مقلي بالطحينة والدقة',[2,3,5],350]]},
{t:'الاضافات',i:'➕',items:[['تقلية',[2],150],['عدس',[2],150],['صلصة',[2],150]]},
{t:'مشروبات',i:'🥤',items:[['كينزا',[3],149],['حمضيات',[3],149],['ليمون صودا',[3],149],['ماء',[1],null]]}];

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

/* ═══════ السلة ═══════ */
const cart=new Map();
document.addEventListener('click',e=>{
  const b=e.target.closest('.st'); if(!b)return;
  const st=b.closest('.step'), it=MENU[+st.dataset.si].items[+st.dataset.ii];
  let size='',price=it[1][0]; const sel=st.closest('.card').querySelector('select');
  if(sel){size=SIZES[+sel.value];price=it[1][+sel.value];}
  const k=it[0]+'|'+size, cur=cart.get(k)||{name:it[0],size,price,qty:0};
  b.classList.contains('inc')?cur.qty++:cur.qty--;
  cur.qty<=0?cart.delete(k):cart.set(k,cur); updateCart();});
document.addEventListener('change',e=>{if(e.target.matches('.size'))refreshSteps();});
function refreshSteps(){ document.querySelectorAll('.step').forEach(st=>{
  const it=MENU[+st.dataset.si].items[+st.dataset.ii]; let size='';
  const sel=st.closest('.card').querySelector('select'); if(sel)size=SIZES[+sel.value];
  const q=(cart.get(it[0]+'|'+size)||{}).qty||0;
  st.querySelector('.qnum').textContent=q; st.classList.toggle('on',q>0);});}
$('dItems').addEventListener('click',e=>{ const b=e.target.closest('.q'); if(!b)return;
  const it=cart.get(b.dataset.k); b.dataset.a==='inc'?it.qty++:it.qty--;
  if(it.qty<=0)cart.delete(b.dataset.k); updateCart();});
function updateCart(){ let c=0,t=0; cart.forEach(i=>{c+=i.qty;t+=i.qty*i.price;});
  document.querySelectorAll('.count').forEach(x=>x.textContent=c);
  $('dTotal').textContent=t+' ريال';
  $('dItems').innerHTML=cart.size?[...cart.entries()].map(([k,i])=>`<div class="ci">
    <div class="ci-info"><b>${i.name}${i.size?`<span class="ci-size">${i.size}</span>`:''}</b><span class="ci-price">${i.price} ريال</span></div>
    <div class="ci-ctrl"><button class="q" data-k="${k}" data-a="dec">−</button><span>${i.qty}</span><button class="q" data-k="${k}" data-a="inc">+</button></div>
    <div class="ci-total">${i.qty*i.price} ريال</div></div>`).join('')
  :`<div class="empty">🛒<br>سلتك فارغة..</div>`; refreshSteps();}
function openCart(){$('drawer').classList.add('show');$('overlay').classList.add('show');}
function closeCart(){$('drawer').classList.remove('show');$('overlay').classList.remove('show');}
function closeWelcome(){$('welcome').classList.remove('show');}

/* ═══════ 🚀 إرسال الطلب ═══════ */
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
  echoId=id; setTimeout(()=>{if(echoId===id){echoId=null;toast('⚠️ تأخر البث — استخدم نسخة واتساب');}},7000);
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
  if(cmapObj){cmapObj.remove();cmapObj=null;cmapMk=null;} $('cmap').style.display='none';}
const TLSTEPS=['pending','approved','preparing','ready','delivering','delivered'];
const TLLBL={pending:'⏳ بانتظار الموافقة',approved:'✅ تم تأكيد الطلب',preparing:'👨 جاري التحضير',ready:'📦 جاهز للتوصيل',delivering:'🛵 في الطريق إليك',delivered:'🎉 تم التسليم'};
let cmapObj=null,cmapMk=null,trackId=null;
function updateTrack(){ if(!$('trackOv').classList.contains('show'))return;
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
function moveMarker(id){ if($('trackOv').classList.contains('show')&&trackId===id){const r=S.orders.get(id); if(r&&r.loc)showCMap(r);}}
function waMsg(o){ let m=`السلام عليكم *ركن البشوات* 🌟\nطلب ${o.id}:\n`;
  o.items.forEach(i=>m+=`▪️ ${i.q}× ${i.n}${i.s?' ('+i.s+')':''} = ${i.q*i.p} ريال\n`);
  m+=`*الإجمالي: ${o.total} ريال*\n👤 ${o.name}\n📍 ${o.addr}`; if(o.phone)m+=`\n📞 ${o.phone}`; return m;}

/* ═══════ عام ═══════ */
let tT; function toast(m){ const s=$('toastMsg'); s.textContent=m; s.classList.add('show'); clearTimeout(tT); tT=setTimeout(()=>s.classList.remove('show'),2200);}
if(!localStorage.getItem('rb_welcome_seen')){ setTimeout(()=>$('welcome').classList.add('show'),700); localStorage.setItem('rb_welcome_seen','1'); }
$('welcome').addEventListener('click',e=>{if(e.target.id==='welcome')closeWelcome();});
document.querySelectorAll('.wa-link').forEach(a=>a.href='https://wa.me/'+WA+'?text='+encodeURIComponent('السلام عليكم ركن البشوات 🌟 أبغى أطلب'));
$('fabTrack').hidden=!activeMy();
updateCart(); listen(handle);
