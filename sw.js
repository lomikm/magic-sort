// 게임을 수정해서 다시 올릴 때는 아래 버전 숫자를 올려 주세요 (v1 -> v2)
const CACHE='magic-sort-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png','./favicon.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  // 페이지: 온라인이면 최신, 오프라인이면 저장본
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return res})
      .catch(()=>caches.match('./index.html')));
    return;
  }
  // 그 외(아이콘, 글꼴 등): 저장본을 먼저 쓰고 뒤에서 갱신
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{
      if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}
      return res;
    }).catch(()=>hit);
    return hit||net;
  }));
});
