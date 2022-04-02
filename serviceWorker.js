// On install, cache core assets
self.addEventListener("install", function (event) {
  // Cache core assets
  event.waitUntil(
    caches
      .open("v1")
      .then((cache) =>
        cache.addAll(["/index.html", "/index.js", "/reset.css", "/styles.css"])
      )
  );
});

const requestThenCache = async (request) => {
  const responseFromNetwork = await fetch(request);
  // response may be used only once
  // we need to save clone to put one copy in cache
  // and serve second one
  caches
    .open("v1")
    .then((cache) => cache.put(request, responseFromNetwork.clone()));
  return responseFromNetwork;
};

const cacheFirst = async (request) => {
  // First try to get the resource from the cache
  const responseFromCache = await caches.match(request);
  if (responseFromCache) return responseFromCache;

  // Next try to get the resource from the network
  return requestThenCache().catch(
    () =>
      // when both the cache and the network are unavailable,
      // there is nothing we can do, but we must always
      // return a Response object
      new Response("Network error happened", {
        status: 408,
        headers: { "Content-Type": "text/plain" },
      })
  );
};

// Listen for request events
self.addEventListener("fetch", (event) => {
  event.respondWith(cacheFirst(event.request));
});
