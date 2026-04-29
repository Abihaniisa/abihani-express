// ============================================
// Service Worker for Abihani Express PWA
// Professional caching strategy
// ============================================
var CACHE_NAME = 'abihani-express-v2';
var STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/env.js',
    '/js/config.js',
    '/js/app.js',
    '/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Playfair+Display:wght@400;500;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.0/dist/umd/supabase.min.js'
];

// Install — cache static assets
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(STATIC_ASSETS).catch(function(err) {
                console.log('SW: Some assets not cached', err);
            });
        })
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(key) {
                    return key !== CACHE_NAME;
                }).map(function(key) {
                    return caches.delete(key);
                })
            );
        })
    );
    e.waitUntil(clients.claim());
});

// Fetch — network first with cache fallback
self.addEventListener('fetch', function(e) {
    // Intercept Resend API calls and route through our serverless function
    if (e.request.url.indexOf('resend.com') !== -1) {
        e.respondWith(
            (async function() {
                try {
                    var body = await e.request.clone().text();
                    return await fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: body
                    });
                } catch (err) {
                    return new Response(JSON.stringify({ error: err.message }), {
                        status: 500,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            })()
        );
        return;
    }

    // Skip Supabase API calls — don't cache database responses
    if (e.request.url.indexOf('supabase.co') !== -1) {
        e.respondWith(fetch(e.request).catch(function() {
            return new Response(JSON.stringify({ error: 'You are offline' }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            });
        }));
        return;
    }

    // Skip external CDN fonts/images — let browser handle normally
    if (e.request.url.indexOf('fonts.googleapis.com') !== -1 ||
        e.request.url.indexOf('fonts.gstatic.com') !== -1 ||
        e.request.url.indexOf('cdnjs.cloudflare.com') !== -1 ||
        e.request.url.indexOf('cdn.jsdelivr.net') !== -1) {
        e.respondWith(
            caches.match(e.request).then(function(cached) {
                return cached || fetch(e.request);
            })
        );
        return;
    }

    // For HTML pages and static assets — network first, fallback to cache
    e.respondWith(
        fetch(e.request).then(function(response) {
            var cloned = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
                if (e.request.method === 'GET' && response.status === 200) {
                    cache.put(e.request, cloned);
                }
            });
            return response;
        }).catch(function() {
            return caches.match(e.request).then(function(cached) {
                if (cached) return cached;
                if (e.request.headers.get('Accept') && e.request.headers.get('Accept').indexOf('text/html') !== -1) {
                    return caches.match('/index.html');
                }
                return new Response('You are offline. Please check your connection.');
            });
        })
    );
});
