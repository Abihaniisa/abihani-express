var CACHE_NAME = 'abihani-v3';
var STATIC_ASSETS = [
    '/','/index.html','/css/styles.css','/js/env.js','/js/config.js','/js/app.js',
    '/manifest.webmanifest',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Playfair+Display:wght@400;500;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.0/dist/umd/supabase.min.js'
];
self.addEventListener('install', function(e) {
    e.waitUntil(caches.open(CACHE_NAME).then(function(cache) {
        return cache.addAll(STATIC_ASSETS).catch(function(){});
    }));
    self.skipWaiting();
});
self.addEventListener('activate', function(e) {
    e.waitUntil(caches.keys().then(function(keys) {
        return Promise.all(keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); }));
    }));
    e.waitUntil(clients.claim());
});
self.addEventListener('fetch', function(e) {
    if (e.request.url.indexOf('resend.com') !== -1) {
        e.respondWith((async function() {
            try {
                var body = await e.request.clone().text();
                return await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body });
            } catch (err) {
                return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
            }
        })());
        return;
    }
    if (e.request.url.indexOf('supabase.co') !== -1) {
        e.respondWith(fetch(e.request).catch(function() {
            return new Response(JSON.stringify({ error: 'Offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
        }));
        return;
    }
    if (e.request.url.indexOf('fonts.googleapis.com') !== -1 || e.request.url.indexOf('fonts.gstatic.com') !== -1 || e.request.url.indexOf('cdnjs.cloudflare.com') !== -1 || e.request.url.indexOf('cdn.jsdelivr.net') !== -1) {
        e.respondWith(caches.match(e.request).then(function(c) { return c || fetch(e.request); }));
        return;
    }
    e.respondWith(fetch(e.request).then(function(r) {
        var clone = r.clone();
        caches.open(CACHE_NAME).then(function(c) { if (e.request.method === 'GET' && r.status === 200) c.put(e.request, clone); });
        return r;
    }).catch(function() {
        return caches.match(e.request).then(function(c) {
            if (c) return c;
            if (e.request.headers.get('Accept') && e.request.headers.get('Accept').indexOf('text/html') !== -1) return caches.match('/index.html');
            return new Response('Offline', { status: 503 });
        });
    }));
});