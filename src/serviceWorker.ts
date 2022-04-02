const fetchThenCache = async (request: RequestInfo) => {
  const [responseFromNetwork, cache] = await Promise.all([
    fetch(request),
    caches.open("v1"),
  ]);
  // response may be used only once
  // we need to save clone to put one copy in cache
  // and serve second one
  await cache.put(request, responseFromNetwork.clone());
  return responseFromNetwork;
};

const cacheFirst = async (request: RequestInfo) => {
  // First try to get the resource from the cache
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    console.info(`Successful cache hit for: ${request.toString()}`);
    return responseFromCache;
  } else {
    console.info(`No cache found for: ${request.toString()}`);
  }

  // Next try to get the resource from the network
  return fetchThenCache(request).catch((error) => {
    console.error(error);
    // when both the cache and the network are unavailable,
    // there is nothing we can do, but we must always
    // return a Response object
    return new Response("Network error happened", {
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
  fetchEvent.respondWith(cacheFirst(fetchEvent.request));
});
