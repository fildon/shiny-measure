// On install, cache core assets
self.addEventListener("install", (event) => {
  console.info("Installing service worker");
  try {
    // Cache core assets
    event.waitUntil(
      caches
        .open("v1")
        .then((cache) =>
          cache.addAll([
            "/shiny-measure/index.html",
            "/shiny-measure/index.js",
            "/shiny-measure/reset.css",
            "/shiny-measure/styles.css",
            "/shiny-measure/favicon.ico",
          ])
        )
    );
  } catch (error) {
    console.error(`Error during installation: ${error}`);
  }
});

const fetchThenCache = (request) =>
  fetch(request).then((responseFromNetwork) => {
    // response may be used only once
    // we need to save clone to put one copy in cache
    // and serve second one
    caches
      .open("v1")
      .then((cache) => cache.put(request, responseFromNetwork.clone()));
    return responseFromNetwork;
  });

const cacheFirst = async (request) => {
  // First try to get the resource from the cache
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    console.info(`Successful cache hit for: ${request}`);
    return responseFromCache;
  } else {
    console.info(`No cache found for: ${request}`);
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

// Listen for request events
self.addEventListener("fetch", (event) => {
  event.respondWith(cacheFirst(event.request));
});
