// cache name: <label>_<version>
const latestCache = {
  "pyodide": {
    version: "v0.18.0",
    match: url => url.startsWith("https://cdn.jsdelivr.net/pyodide/v0.18.0/")
  },
  "pypi": {
    version: `${new Date().getFullYear()}`,
    match: url => url.startsWith("https://files.pythonhosted.org")
  }
}


self.addEventListener('activate', activateHandler);
self.addEventListener('fetch', fetchHandler);

async function fetchHandler(e) {
  console.log(e);

  for (let key in latestCache) {
    if (latestCache[key].match(e.request.url)) {
      e.respondWith((async () => {
        const cache = await caches.open(`${key}_${latestCache[key].version}`);
        const stored = await cache.match(e.request);

        if (stored) {
          return stored;
        } else {
          const res = await fetch(e.request);
          cache.put(e.request, res.clone());
          return res;
        }
      })());
      return;
    }
  }
  e.respondWith(fetch(e.request))
}

async function activateHandler(e) {
  e.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (cacheName) {
            for (key in latestCache) {
              if (cacheName == latestCache[key])
                return false;
            }
            return true; // to be deleted
          })
          .map(function (cacheName) {
            return caches.delete(cacheName);
          }),
      );
    }),
  );
}