// Service worker minimal exigé pour l'installation sur l'écran d'accueil.
// Il n'intercepte aucune requête et ne met rien en cache : aucune donnée personnelle n'est conservée hors de l'application.
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  // Purge défensive de tout cache éventuellement laissé par une version précédente.
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))).then(() => self.clients.claim()))
})

self.addEventListener('fetch', () => {})
