/* ═══════════ ⚙️ الإعدادات (مصدر واحد للثلاث صفحات) ═══════════ */
var WA='966561365019';
var CH='bashawat-x9f3k7q2';
var ADMIN_PASS='1234';
var DRIVER_PASS='5678';
var SIZES=['صغير','وسط','كبير'];
var PAGE=document.body.dataset.page||'cust';
function $(s){return document.getElementById(s);}

/* ═══════════ 📡 النقل اللحظي (قناة سرية موحّدة) ═══════════ */
async function send(evt){
  evt.ts=Date.now();
  var body=JSON.stringify(evt);
  try{ await fetch('https://ntfy.sh/'+CH,{method:'POST',body:body}); }
  catch(e){
    try{ await fetch('https://ntfy.sh/'+CH,{method:'POST',body:body}); }
    catch(e2){ toast('⚠️ تعذر البث — تحقق من الإنترنت'); }
  }
}
function listen(cb){
  if(!('EventSource' in window)){ toast('⚠️ المتصفح لا يدعم الاتصال اللحظي'); return; }
  var es=new EventSource('https://ntfy.sh/'+CH+'/sse?since=12h');
  es.onopen=function(){ setConn(true); };
  es.onerror=function(){ setConn(false); };
  es.onmessage=function(m){
    var e; try{ e=JSON.parse(m.data.message); }catch(err){ return; }
    cb(e);
  };
}
function setConn(on){
  var els=document.querySelectorAll('.conn');
  for(var i=0;i<els.length;i++){ els[i].textContent=on?'🟢 متصل':'🔴 اتصال…'; els[i].classList.toggle('on',on); }
}
function fresh(e){ return Date.now()-(e.ts||0)<15000; }

/* ═══════════ الحالة المشتركة ═══════════ */
var S=new Map();
var ST={pending:['⏳ جديد','#c9973b'],approved:['✅ مؤكد','#2e7d32'],preparing:['👨 تحضير','#e65100'],ready:['📦 جاهز','#1565c0'],delivering:['🛵 توصيل','#6a1b9a'],delivered:['🎉 سُلّم','#33691e'],rejected:['❌ اعتذار','#b71c1c']};
var trackId=null, echoId=null, hT=null;
function handle(e){
  if(e.t==='order'&&!S.has(e.o.id)){
    S.set(e.o.id,{o:e.o,status:'pending',loc:null,ts:e.ts});
    if(PAGE==='admin'&&fresh(e)){ beep(); toast('🆕 طلب جديد #'+e.o.id); }
    if(PAGE==='cust'&&e.o.id===echoId){ echoId=null; toast('📡 تم البث — المطعم يستلم الآن'); }
  }else if(e.t==='status'){
    var r=S.get(e.id);
    if(r){ r.status=e.s; r.reason=e.reason||'';
      if(PAGE==='driver'&&e.s==='ready'&&fresh(e)){ var d=$('driverDash'); if(d&&!d.hidden){ beep(); toast('📦 طلب جاهز للاستلام #'+e.id); } }
    }
  }else if(e.t==='loc'){
    var r2=S.get(e.id);
    if(r2){ r2.loc=[e.lat,e.lng]; if(PAGE!=='driver')moveMarker(e.id); }
  }
  clearTimeout(hT);
  hT=setTimeout(function(){
    if(PAGE==='admin')renderAdmin();
    if(PAGE==='driver')renderDriver();
    if(PAGE==='cust'){ updateTrack(); var f=$('fabTrack'); if(f)f.hidden=!activeMy(); }
  },150);
}

/* ═══════════ بيانات المنيو ═══════════ */
var MENU=[
{t:'الكشري',i:'🍚',items:[['طبق كشري كبير',[12],260],['طبق كشري وسط',[10],210],['طبق كشري سوبر',[8],180],['طبق كشري كمالة',[5],285],['طبق كشري عائلي وسط',[25],290],['طبق كشري عائلي كبير',[35],295],['عيش توست',[2],150],['أرز بلبن',[6],160]]},
{t:'طواجن وحواوشي',i:'🍲',items:[['طاجن مكرونة لحم',[12],255],['طاجن مكرونة فراخ',[10],265],['طاجن مكرونة بالدجاج والموزاريلا',[12],220],['طاجن مكرونة باللحمة والموزاريلا',[14],225],['رغيف حواوشي سادة',[12],230],['رغيف حواوشي بالموزاريلا',[14],350]]},
{t:'السندوتشات',i:'🥙',items:[['فلافل مشكل',[3],138],['فلافل مشكل بالبيض',[4],178],['فلافل محشية سادة',[3],140],['فول بالبيض',[4],140],['فول بالسلطة',[3],140],['مسقعة',[3],150],['بطاطس مهروسة',[3],158],['بطاطس مهروسة بالبيض',[4],124],['عجة فرنساوي',[3],168],['بطاطس بانية',[3],158],['جبنة قديمة (مش مصري)',[3],145],['جبنة فيتا بالخيار',[3],162],['زهرة - قرنبيط',[3],162],['بطاطس محمرة بالكاتشب',[3],145],['بيض مسلوق بالخلطة',[3],140],['بطاطس شيبسي',[3],145],['بطاطس شيبسي بالبيض',[4],150],['كبدة',[4],170],['فلافل جبنة كبير (صامولي)',[4],180],['شكشوكة (صامولي)',[2],170],['بيض مقلي (صامولي)',[2],160],['بيض أومليت (صامولي)',[2],160],['جبنة - مربى (صامولي)',[2],155],['فلافل برجر بالجبنة الشيدر (صامولي)',[4],175]]},
{t:'الصحون',i:'🍽️',items:[['بيض مسلوق 5 حبات بالطحينة',[8],210],['بطاطس أصابع محمرة بالكاتشب',[2,3,5],180],['بطاطس شيبسي',[2,3,5],115],['كبدة اسكندراني',[5,8,12],120],['فول بزيت الزيتون والطحينة',[7],140],['فول بالزيت الحار والطحينة',[7],75],['بطاطس بانية',[2,3,5],150],['قرنبيط بانية',[2,3,5],255],['باذنجان مخلل',[2,3,5],320],['مسقعة',[2,3,5],480],['باذنجان مقلي بالليمون',[2,3,5],514],['مقبلات مشكل محلي',[7],420],['جبنة قديمة بالطحينة (مش مصري)',[3,5,7],178],['خبز مصري بلدي 3 حبات',[1],168],['بيض بالبسطرمة',[10],320],['فول بالصلصة',[6],149],['فول بالسحق',[10],149],['مسقعة بالحمص',[7],149],['سلطة بالمقبلات (فيتا - رومي - زيتون)',[10],210],['فلافل عادي 4 حبات',[1],155],['فلافل محشية (الحبة بريال)',[1],150],['قرص فلافل بالجبنة الكبيرة',[2],180],['علبة عجينة فلافل كبيرة',[2,3,5],200]]},
{t:'المقبلات',i:'🥗',items:[['سلطة خضراء',[2,3,5],260],['جبنة قديمة',[3,5,7],210],['باذنجان دقة البشوات',[2,3,5],180],['جبنة بالخيار',[3,5,7],285],['جبنة بالطماطم',[3,5,7],210],['بابا غنوج',[3,5,7],310],['مشكل البشوات',[10,15,17],320],['باذنجان مقلي بالطحينة والدقة',[2,3,5],350]]},
{t:'الاضافات',i:'➕',items:[['تقلية',[2],150],['عدس',[2],150],['صلصة',[2],150]]},
{t:'مشروبات',i:'🥤',items:[['كينزا',[3],149],['حمضيات',[3],149],['ليمون صودا',[3],149],['ماء',[1],null]]}];

/* ═══════════ 🥙 صفحة العميل ══════════ */
var cart=new Map();
function initCust(){
  var cats=$('cats'), search=$('search'), main=$('menu'), cur=0;
  MENU.forEach(function(sec,si){
    var chip=document.createElement('button'); chip.className='chip'; chip.textContent=sec.i+' '+sec.t;
    chip.onclick=function(){ showSec(si,true); }; cats.appendChild(chip);
    var s=document.createElement('section'); s.className='section'; s.id='sec-'+si;
    s.innerHTML='<h3 class="ribbon">'+sec.i+' '+sec.t+'</h3><div class="grid"></div>';
    var g=s.querySelector('.grid');
    sec.items.forEach(function(it,ii){
      var name=it[0], prices=it[1], cal=it[2], multi=prices.length>1;
      var c=document.createElement('div'); c.className='card'; c.dataset.name=name;
      var html='<div class="c-top"><h4>'+name+'</h4><span class="cal">'+(cal?'🔥 '+cal+' سعرة':'💧 صفر سعرات')+'</span></div>';
      if(multi){ var opts=''; for(var i=0;i<prices.length;i++){ opts+='<option value="'+i+'">'+SIZES[i]+' • '+prices[i]+' ريال</option>'; } html+='<select class="size">'+opts+'</select>'; }
      html+='<div class="c-bot"><div class="price">'+(multi?'من '+prices[0]+' ريال':prices[0]+' ريال')+'</div>'+
        '<div class="step" data-si="'+si+'" data-ii="'+ii+'"><button class="st inc">+</button><span class="qnum">0</span><button class="st dec">−</button></div></div>';
      c.innerHTML=html; g.appendChild(c);});
    var n=MENU.length, prev=(si-1+n)%n, next=(si+1)%n;
    var nav=document.createElement('div'); nav.className='sec-nav';
    nav.innerHTML='<button class="nav-btn" data-go="'+prev+'"><span class="arr">→</span><span class="lbl"><small>السابق</small><b>'+MENU[prev].i+' '+MENU[prev].t+'</b></span></button>'+
      '<button class="nav-btn" data-go="'+next+'"><span class="lbl"><small>التالي</small><b>'+MENU[next].i+' '+MENU[next].t+'</b></span><span class="arr">←</span></button>';
    s.appendChild(nav); main.appendChild(s);});
  function showSec(si,scroll){ cur=si;
    document.querySelectorAll('.section').forEach(function(s,i){ s.style.display=(i===si)?'':'none'; });
    document.querySelectorAll('.chip').forEach(function(c,i){ c.classList.toggle('active',i===si); });
    if(scroll)requestAnimationFrame(function(){ document.getElementById('sec-'+si).scrollIntoView({behavior:'smooth'}); });}
  showSec(0);
  search.addEventListener('input',function(e){ var q=e.target.value.trim();
    if(!q){ showSec(cur); return; }
    document.querySelectorAll('.section').forEach(function(s){ s.style.display='';
      s.querySelectorAll('.card').forEach(function(c){ c.style.display=c.dataset.name.includes(q)?'':'none'; });
      var any=[].slice.call(s.querySelectorAll('.card')).some(function(c){ return c.style.display!=='none'; });
      s.style.display=any?'':'none'; });});
  main.addEventListener('click',function(e){ var b=e.target.closest('.nav-btn'); if(b)showSec(+b.dataset.go,true); });
  document.addEventListener('click',function(e){ var b=e.target.closest('.st'); if(!b)return;
    var st=b.closest('.step'), it=MENU[+st.dataset.si].items[+st.dataset.ii];
    var size='', price=it[1][0], sel=st.closest('.card').querySelector('select');
    if(sel){ size=SIZES[+sel.value]; price=it[1][+sel.value]; }
    var k=it[0]+'|'+size, c=cart.get(k)||{name:it[0],size:size,price:price,qty:0};
    if(b.classList.contains('inc')){ c.qty++; }else{ c.qty--; }
    if(c.qty<=0){ cart.delete(k); }else{ cart.set(k,c); }
    updateCart();});
  document.addEventListener('change',function(e){ if(e.target.matches('.size'))refreshSteps(); });
  $('dItems').addEventListener('click',function(e){ var b=e.target.closest('.q'); if(!b)return;
    var it=cart.get(b.dataset.k); if(b.dataset.a==='inc'){ it.qty++; }else{ it.qty--; }
    if(it.qty<=0)cart.delete(b.dataset.k); updateCart();});
  if(!localStorage.getItem('rb_welcome_seen')){ setTimeout(function(){ $('welcome').classList.add('show'); },700); localStorage.setItem('rb_welcome_seen','1'); }
  $('welcome').addEventListener('click',function(e){ if(e.target.id==='welcome')closeWelcome(); });
  document.querySelectorAll('.wa-link').forEach(function(a){ a.href='https://wa.me/'+WA+'?text='+encodeURIComponent('السلام عليكم ركن البشوات 🌟 أبغى أطلب'); });
  $('fabTrack').hidden=!activeMy();
  updateCart();}
function refreshSteps(){ document.querySelectorAll('.step').forEach(function(st){
  var it=MENU[+st.dataset.si].items[+st.dataset.ii], size='';
  var sel=st.closest('.card').querySelector('select'); if(sel)size=SIZES[+sel.value];
  var q=(cart.get(it[0]+'|'+size)||{}).qty||0;
  st.querySelector('.qnum').textContent=q; st.classList.toggle('on',q>0);});}
function updateCart(){ var c=0,t=0; cart.forEach(function(i){ c+=i.qty; t+=i.qty*i.price; });
  document.querySelectorAll('.count').forEach(function(x){ x.textContent=c; });
  var dt=$('dTotal'); if(dt)dt.textContent=t+' ريال';
  var box=$('dItems'); if(!box)return;
  if(!cart.size){ box.innerHTML='<div class="empty">🛒<br>سلتك فارغة..</div>'; refreshSteps(); return; }
  var html=''; cart.forEach(function(i,k){
    html+='<div class="ci"><div class="ci-info"><b>'+i.name+(i.size?'<span class="ci-size">'+i.size+'</span>':'')+'</b><span class="ci-price">'+i.price+' ريال</span></div>'+
    '<div class="ci-ctrl"><button class="q" data-k="'+k+'" data-a="dec">−</button><span>'+i.qty+'</span><button class="q" data-k="'+k+'" data-a="inc">+</button></div>'+
    '<div class="ci-total">'+(i.qty*i.price)+' ريال</div></div>'; });
  box.innerHTML=html; refreshSteps();}
function openCart(){ $('drawer').classList.add('show'); $('overlay').classList.add('show'); }
function closeCart(){ $('drawer').classList.remove('show'); $('overlay').classList.remove('show'); }
function closeWelcome(){ $('welcome').classList.remove('show'); }
var sending=false;
async function checkout(){
  if(sending)return; sending=true;
  try{
    if(!cart.size){ toast('سلتك فارغة 🛒'); return; }
    var name=$('cname').value.trim(), phone=$('cphone').value.trim(), addr=$('caddr').value.trim();
    if(!name||!addr){ toast('⚠️ الاسم والعنوان مطلوبان'); return; }
    var lat=null,lng=null;
    try{ var p=await new Promise(function(res,rej){ navigator.geolocation.getCurrentPosition(res,rej,{timeout:5000}); }); lat=p.coords.latitude; lng=p.coords.longitude; }catch(e){}
    var total=0, items=[]; cart.forEach(function(i){ total+=i.qty*i.price; items.push({n:i.name,s:i.size,q:i.qty,p:i.price}); });
    var id='B'+String(Date.now()).slice(-5);
    var o={id:id,name:name,phone:phone,addr:addr,notes:$('cnotes').value.trim(),items:items,total:total,lat:lat,lng:lng};
    S.set(id,{o:o,status:'pending',loc:null,ts:Date.now()});
    echoId=id; setTimeout(function(){ if(echoId===id){ echoId=null; toast('⚠️ تأخر البث — استخدم نسخة واتساب'); } },7000);
    await send({t:'order',o:o});
    cart.clear(); updateCart(); closeCart();
    localStorage.setItem('rb_my',id); $('fabTrack').hidden=false;
    openTrack(id); toast('تم إرسال طلبك ✅');
  }finally{ sending=false; }}
function activeMy(){ var id=localStorage.getItem('rb_my'); if(!id)return null;
  var r=S.get(id); return (r&&['delivered','rejected'].indexOf(r.status)===-1)?id:null;}
function openTrack(id){ trackId=id||activeMy()||localStorage.getItem('rb_my');
  if(!trackId){ toast('لا يوجد طلب'); return; }
  $('trackOv').classList.add('show'); updateTrack();}
var cmapObj=null, cmapMk=null;
function closeTrack(){ $('trackOv').classList.remove('show'); trackId=null;
  if(cmapObj){ cmapObj.remove(); cmapObj=null; cmapMk=null; }
  var m=$('cmap'); if(m)m.style.display='none';}
var TLSTEPS=['pending','approved','preparing','ready','delivering','delivered'];
var TLLBL={pending:'⏳ بانتظار الموافقة',approved:'✅ تم تأكيد الطلب',preparing:'👨 جاري التحضير',ready:'📦 جاهز للتوصيل',delivering:'🛵 في الطريق إليك',delivered:'🎉 تم التسليم'};
function updateTrack(){ var ov=$('trackOv'); if(!ov||!ov.classList.contains('show'))return;
  var r=S.get(trackId); if(!r)return;
  $('trTitle').textContent='طلب #'+r.o.id+' — '+r.o.total+' ريال';
  if(r.status==='rejected'){ $('tl').innerHTML=''; $('trReason').textContent='❌ نعتذر، تم رفض الطلب'+(r.reason?': '+r.reason:''); $('cmap').style.display='none'; return; }
  $('trReason').textContent='';
  var idx=TLSTEPS.indexOf(r.status), html='';
  for(var i=0;i<TLSTEPS.length;i++){ html+='<div class="tli '+(i<idx?'done':(i===idx?'now':''))+'"><span class="dot">'+(i<=idx?'✓':'•')+'</span>'+TLLBL[TLSTEPS[i]]+'</div>'; }
  $('tl').innerHTML=html;
  if(r.status==='delivering'&&r.loc){ showCMap(r); }else if(r.status!=='delivering'){ $('cmap').style.display='none'; }
  var wa=$('trWA'); if(wa)wa.href='https://wa.me/'+WA+'?text='+encodeURIComponent(waMsg(r.o));}
function showCMap(r){ if(typeof L==='undefined')return;
  $('cmap').style.display='block';
  if(!cmapObj){ var c=r.loc||(r.o.lat!=null?[r.o.lat,r.o.lng]:null)||[24.676,46.71];
    cmapObj=L.map('cmap',{zoomControl:false}).setView(c,15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(cmapObj);
    if(r.o.lat!=null)L.marker([r.o.lat,r.o.lng]).addTo(cmapObj).bindPopup('موقعك 🏠');}
  if(r.loc){ if(!cmapMk){ cmapMk=L.marker(r.loc,{icon:L.divIcon({className:'drv',html:'🛵',iconSize:[30,30]})}).addTo(cmapObj); }else{ cmapMk.setLatLng(r.loc); }
    cmapObj.panTo(r.loc); }}
function moveMarker(id){ var ov=$('trackOv'); if(ov&&ov.classList.contains('show')&&trackId===id){ var r=S.get(id); if(r&&r.loc)showCMap(r); }}
function waMsg(o){ var m='السلام عليكم *ركن البشوات* 🌟\nطلب '+o.id+':\n';
  for(var i=0;i<o.items.length;i++){ var it=o.items[i]; m+='▪️ '+it.q+'× '+it.n+(it.s?' ('+it.s+')':'')+' = '+(it.q*it.p)+' ريال\n'; }
  m+='*الإجمالي: '+o.total+' ريال*\n👤 '+o.name+'\n📍 '+o.addr;
  if(o.phone)m+='\n📞 '+o.phone;
  return m;}

/* ═══════════ 🖥️ لوحة المدير ═══════════ */
function initAdmin(){
  $('adminPass').addEventListener('keydown',function(e){ if(e.key==='Enter')adminLogin(); });
  $('adminLogout').onclick=function(){ sessionStorage.removeItem('rb_adm'); location.reload(); };
  $('adminList').addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b)return;
    var id=b.dataset.id, a=b.dataset.a;
    if(a==='reject'){ var r=prompt('سبب الرفض:','غير متوفر حالياً
