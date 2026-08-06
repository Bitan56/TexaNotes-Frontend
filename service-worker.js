// Name your cache
const CACHE_NAME = 'texanotes-cache-v1';

// Files to cache immediately when the service worker installs
const ASSETS_TO_CACHE = [
    // Core HTML Pages
    './',
    './index.html',
    './pages/academics.html',
    './pages/admin.html',
    './pages/admins-list.html',
    './pages/all-notes.html',
    './pages/announcements.html',
    './pages/auth-center.html',
    './pages/edit-note.html',
    './pages/forgot-password.html',
    './pages/logIn.html',
    './pages/manage-notes.html',
    './pages/manage-users.html',
    './pages/notes-auth-center.html',
    './pages/notes.html',
    './pages/others.html',
    './pages/profile.html',
    './pages/routines.html',
    './pages/signup.html',
    './pages/syllabus.html',
    './pages/upload.html',
    './pages/user-auth-center.html',
    './pages/offline.html',
    './pages/settings.html',
    // CSS Stylesheets
    './style.css',
    './stylesheets/academics.css',
    './stylesheets/admin.css',
    './stylesheets/admins-list.css',
    './stylesheets/all-notes.css',
    './stylesheets/auth-center.css',
    './stylesheets/edit-note.css',
    './stylesheets/forgot-password.css',
    './stylesheets/logIn.css',
    './stylesheets/manage-notes.css',
    './stylesheets/manage-users.css',
    './stylesheets/notes-auth-center.css',
    './stylesheets/notes.css',
    './stylesheets/profile.css',
    './stylesheets/routines.css',
    './stylesheets/signup.css',
    './stylesheets/upload.css',
    './stylesheets/user-auth-center.css',
    // JavaScript Files
    './script.js',
    './javascript/admin-guard.js',
    './javascript/admin.js',
    './javascript/admins-list.js',
    './javascript/all-notes.js',
    './javascript/auth-center.js',
    './javascript/auth-guard.js',
    './javascript/block-guard.js',
    './javascript/developer-guard.js',
    './javascript/edit-note.js',
    './javascript/forgot-password.js',
    './javascript/logIn-block.js',
    './javascript/logIn.js',
    './javascript/manage-notes.js',
    './javascript/manage-users.js',
    './javascript/notes-auth-center.js',
    './javascript/notes.js',
    './javascript/profile.js',
    './javascript/signup.js',
    './javascript/upload.js',
    './javascript/user-auth-center.js',
    './utility/pwa-register.js',
    './utility/settings.js',
    // Images/Icons
    './assets/logo.png',
];

// 1. INSTALL EVENT - Cache the core files and skip waiting
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(ASSETS_TO_CACHE))
        .then(() => self.skipWaiting()) // Forces the SW to activate immediately
    );
});

// 2. ACTIVATE EVENT - Clean up any old, unused caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // If the cache name doesn't match our current one, delete it
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => self.clients.claim()) // Takes control of all open tabs immediately
    );
});

// 3. FETCH EVENT - Network-First Strategy
self.addEventListener('fetch', (event) => {
    // We only want to handle GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        // Step A: Try to fetch the file from the network (Vercel)
        fetch(event.request)
            .then((networkResponse) => {
                // If we get a good response, open the cache
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        // Step B: Save this fresh file into the cache, replacing the old one
                        cache.put(event.request, responseClone);
                    });
                }
                // Return the fresh network file to the user
                return networkResponse;
            })
            .catch(() => {
                // Step C: If the network fetch fails (offline), look in the cache
                return caches.match(event.request);
            })
    );
});