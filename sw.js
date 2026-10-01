const CACHE_NAME = "h-link-v3";

const CORE_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-512.png",

  "./home.png",
  "./departments.png",
  "./local.png",
  "./district.png",
  "./repair.png"
];


/* 설치할 때 핵심 화면을 미리 저장 */
self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_FILES))
  );

  self.skipWaiting();

});


/* 예전 캐시만 삭제 */
self.addEventListener("activate", event => {

  event.waitUntil(
    caches.keys().then(keys => {

      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );

    })
  );

  self.clients.claim();

});


/* 이미지 = 캐시 우선
   HTML = 인터넷 우선 */
self.addEventListener("fetch", event => {

  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);


  /* PNG / JPG / WEBP / 아이콘은 캐시 우선 */
  if (
    request.destination === "image" ||
    /\.(png|jpg|jpeg|webp)$/i.test(url.pathname)
  ) {

    event.respondWith(

      caches.match(request)
        .then(cached => {

          if (cached) {
            return cached;
          }

          return fetch(request)
            .then(response => {

              if (
                response &&
                response.status === 200
              ) {

                const copy = response.clone();

                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(request, copy);
                  });

              }

              return response;

            });

        })

    );

    return;
  }


  /* HTML/JS 등은 최신 버전 우선 */
  event.respondWith(

    fetch(request)
      .then(response => {

        return response;

      })
      .catch(() => {

        return caches.match(request);

      })

  );

});
