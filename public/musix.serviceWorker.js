//@ts-check
const musixCache = "musixCacheV1";

self.addEventListener("install", (event) => {
    console.log("ServiceWorker installation successful");
});

self.addEventListener("activate", async (event) => {
    const keyList = await caches.keys();
    keyList.map((key) => {
        if (key !== musixCache) {
            return caches.delete(key);
        }
    });
    console.log("ServiceWorker activation successful");
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.open(musixCache).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    //Case: A cached response already exists
                    console.log("Serving: " + event.request.url);
                    return cachedResponse;
                } else if (event.request.url.includes("/playlists")) {
                    //Case: A cached response doesn't exist and needs to be cached
                    //Request, cache and respond with required resource
                    return fetch(event.request).then((fetchedResponse) => {
                        console.log("Caching: " + event.request.url);
                        cache.put(event.request, fetchedResponse.clone());
                        return fetchedResponse;
                    }).catch((error) => {
                        return new Response(JSON.stringify({status: false, serverError: "Oops! Something's up with the network connection"}));
                    });
                } else {
                    //Case: A cached response doesn't exist and no need of caching
                    //Request and respond with required resource without caching
                    return fetch(event.request).catch((error) => {
                        return new Response(JSON.stringify({status: false, serverError: "Oops! Something's up with the network connection"}));
                    });
                }
            });
        })
    );
});