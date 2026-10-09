/* 셀핍 아레나 서비스워커.
   전략: 네트워크 우선, 실패하면 캐시. 온라인이면 항상 최신 배포본을 받고,
   지하철·비행기 모드에서도 앱이 열린다. 버전을 올리면 옛 캐시는 지워진다. */
var VERSION='celpip-v1';
var SHELL=['./','./index.html','./app.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){return c.addAll(SHELL)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==VERSION}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;
  var url=new URL(req.url);
  if(url.origin!==self.location.origin)return;   /* 폰트·API는 건드리지 않는다 */
  e.respondWith(
    fetch(req).then(function(res){
      if(res&&res.ok){var copy=res.clone();caches.open(VERSION).then(function(c){c.put(req,copy)})}
      return res;
    }).catch(function(){
      return caches.match(req).then(function(hit){return hit||caches.match('./index.html')});
    })
  );
});
