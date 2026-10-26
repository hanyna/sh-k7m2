/* כרטסיית שידוכים — קובץ רקע (service worker)
   מאפשר להתקין את הכלי כאפליקציה ולפתוח אותו גם בלי אינטרנט.
   תמיד מנסים קודם את הגרסה העדכנית מהרשת, והעותק השמור משמש רק כשאין חיבור —
   כך עדכונים מגיעים מיד, ולא נתקעים על גרסה ישנה.
   הנתונים עצמם לא עוברים כאן: הם מוצפנים בדפדפן ולא נשמרים בקובץ הזה. */
const CACHE = "shidduchim-app-v14";
const CORE = ["./shidduchim_3.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          /* גוגל, AI וספריות — לא נוגעים */
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("./shidduchim_3.html")))
  );
});
