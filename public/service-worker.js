const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/localdb.js",
    "/manifest.webmanifest",
    "/style.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
]; 

const CACHE_NAME = "precache-v2";
const DATA_CACHE_NAME = "cache-runtime";

// install
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then( (cache) => cache.addAll(FILES_TO_CACHE))
        .then(self.skipWaiting())
    );
});

// activate
self.addEventListener("activate", (event) => {
    const currentCaches = [CACHE_NAME, DATA_CACHE_NAME];
    event.waitUntil(
        caches.keys().then( (keyList) => {
            return keyList.filter( (key) => !currentCaches.includes(key));
        }).then( (keysToDelete) => {
            return Promise.all(keysToDelete.map( (key) => {
                return caches.delete(key);
            }));
        }).then( () => self.clients.claim())
    );
});

// fetch
self.addEventListener("fetch", (event) => {
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request).then( (cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return caches.open(DATA_CACHE_NAME).then( (cache) => {
                    return fetch(event.request).then( (response) => {
                        return cache.put(event.request.url, response.clone()).then(() => {
                            return response;
                        });
                    })
                    .catch( (err) => {
                        console.log(err);
                        return cache.match(event.request);
                    });
                });
            })
        );
    } 
});