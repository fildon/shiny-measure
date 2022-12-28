const fetchThenCache = async (request: RequestInfo) => {
  // Start network request and cache opening in parallel.
  const networkPromise = fetch(request);
  const cachePromise = caches.open("v1");

  // Have to wait until the network has responded
  const responseFromNetwork = await networkPromise;

  // But then we can immediately return the network response
  // Without having to wait for the cache update to complete.
  void cachePromise.then((caches) =>
    // response may only be used once
    // we need to save a clone to put one copy in cache
    // and serve second one
    caches.put(request, responseFromNetwork.clone())
  );

  return responseFromNetwork;
};

const staleWhileRevalidate = (request: RequestInfo) => {
  // Always try to hit both the cache and the network (in parallel).
  const cachePromise = caches.match(request);
  const networkPromise = fetchThenCache(request);

  return cachePromise
    .then(
      (responseFromCache) => responseFromCache ?? Promise.reject("Cache miss")
    )
    .catch(() => networkPromise)
    .catch((error) => {
      console.error(error);
      // when both the cache and the network are unavailable,
      // there is nothing we can do, but we must always
      // return a Response object
      return new Response("Both cache and network unavailable.", {
        status: 408,
        headers: { "Content-Type": "text/plain" },
      });
    });
};

self.addEventListener("install", (event) => {
  // At time of writing TS does not have good support for the InstallEvent type
  const installEvent = event as Event & {
    waitUntil: (promise: Promise<unknown>) => unknown;
  };
  installEvent.waitUntil(
    caches
      .open("v1")
      .then((cache) =>
        cache.addAll([
          "/shiny-measure/",
          "/shiny-measure/index.html",
          "/shiny-measure/index.js",
          "/shiny-measure/reset.css",
          "/shiny-measure/styles.css",
        ])
      )
  );
});

/**
 * Listen for request events
 */
self.addEventListener("fetch", (event) => {
  // At time of writing TS does not have good support for the FetchEvent type
  const fetchEvent = event as Event & {
    request: RequestInfo;
    respondWith: (response: Response | Promise<Response>) => void;
  };
  fetchEvent.respondWith(staleWhileRevalidate(fetchEvent.request));
});
