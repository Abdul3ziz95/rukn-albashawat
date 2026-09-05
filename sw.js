/* ===== خدمة التخزين المؤقت لموقع ركن البشوات ===== */
/* 💡 عند تحديث الموقع غيّر رقم الإصدار v1 إلى v2 ليجبر الأجهزة على التحديث */
const CACHE = 'rb-cache-v1';
const ASSETS = [
  './',
  'index.html',
  'logo.png',
  'welcome.png',
  'img/f1.png','img/f2.png','img/f3.png','img/f4.png','img/f5.png','img/f6.png','img/f7.png',
  'img/f8.png','img/f9.png','img/f10.png','img/f11.png','img/f12.png','img/f13.png'
];

/* التثبيت: خزّن كل الملفات في الهاتف */
self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE)
      .then(c=> Promise.allSettled(ASSETS.map(a=> c.add(a))))
      .then(()=> self.skipWaiting())
  );
});

/* التفعيل: احذف أي نسخ قديمة */
self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=> Promise.all(keys.filter(k=> k!==CACHE).map(k=> caches.delete(k))))
      .then(()=> self.clients.claim())
  );
});

/* الاعتراض: قدّم من الهاتف فوراً + حدّث بالخلفية */
self.addEventListener('fetch', e=>{
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  /* صفحات التنقل: إنترنت مع احتياطي من الكاش (يعمل بدون نت) */
  if(e.request.mode === 'navigate'){
    e.respondWith(
      fetch(e.request).then(res=>{
        const clone = res.clone();
        caches.open(CACHE).then(c=> c.put('index.html', clone));
        return res;
      }).catch(()=> caches.match('index.html'))
    );
    return;
  }

  /* الصور والخطوط وكل الأصول: كاش أولاً (فوري) */
  if(url.origin === location.origin || url.hostname.includes('fonts.g')){
    e.respondWith(
      caches.match(e.request).then(cached=>{
        const fetched = fetch(e.request).then(res=>{
          if(res && (res.ok || res.type === 'opaque')){
            const clone = res.clone();
            caches.open(CACHE).then(c=> c.put(e.request, clone));
          }
          return res;
        }).catch(()=> cached);
        return cached || fetched;
      })
    );
  }
});
