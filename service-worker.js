// Nom du cache
const CACHE_NAME = 'v1';

// Liste des fichiers à mettre en cache
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    // Ajoutez d'autres fichiers que vous souhaitez mettre en cache
];

// Événement d'installation
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache ouvert :', CACHE_NAME);
                return cache.addAll(CACHE_ASSETS);
            })
    );
});

// Événement d'activation
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        console.log('Suppression du cache obsolète :', name);
                        return caches.delete(name);
                    }
                })
            );
        })
    );
});

// Événement de récupération
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Retourner la réponse mise en cache si elle existe, sinon faire la requête réseau
            return response || fetch(event.request);
        })
    );
});