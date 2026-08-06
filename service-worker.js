// A unique name for your PWA cache
const CACHE_NAME = 'texanotes-cache-v1';

// List of assets to precache immediately on install
const ASSETS_TO_PRECACHE = [
    // Core HTML Pages
    '/',
    '/index.html',
    '/pages/academics.html',
    '/pages/admin.html',
    '/pages/admins-list.html',
    '/pages/all-notes.html',
    '/pages/announcements.html',
    '/pages/auth-center.html',
    '/pages/edit-note.html',
    '/pages/forgot-password.html',
    '/pages/logIn.html',
    '/pages/manage-notes.html',
    '/pages/manage-users.html',
    '/pages/notes-auth-center.html',
    '/pages/notes.html',
    '/pages/others.html',
    '/pages/profile.html',
    '/pages/routines.html',
    '/pages/signup.html',
    '/pages/syllabus.html',
    '/pages/upload.html',
    '/pages/user-auth-center.html',
    // CSS Stylesheets
    '/style.css',
    '/stylesheets/academics.css',
    '/stylesheets/admin.css',
    '/stylesheets/admins-list.css',
    '/stylesheets/all-notes.css',
    '/stylesheets/auth-center.css',
    '/stylesheets/edit-note.css',
    '/stylesheets/forgot-password.css',
    '/stylesheets/logIn.css',
    '/stylesheets/manage-notes.css',
    '/stylesheets/manage-users.css',
    '/stylesheets/notes-auth-center.css',
    '/stylesheets/notes.css',
    '/stylesheets/profile.css',
    '/stylesheets/routines.css',
    '/stylesheets/signup.css',
    '/stylesheets/upload.css',
    '/stylesheets/user-auth-center.css',
    // JavaScript Files
    '/script.js',
    '/javascript/admin-guard.js',
    '/javascript/admin.js',
    '/javascript/admins-list.js',
    '/javascript/all-notes.js',
    '/javascript/auth-center.js',
    '/javascript/auth-guard.js',
    '/javascript/block-guard.js',
    '/javascript/developer-guard.js',
    '/javascript/edit-note.js',
    '/javascript/forgot-password.js',
    '/javascript/logIn-block.js',
    '/javascript/logIn.js',
    '/javascript/manage-notes.js',
    '/javascript/manage-users.js',
    '/javascript/notes-auth-center.js',
    '/javascript/notes.js',
    '/javascript/profile.js',
    '/javascript/signup.js',
    '/javascript/upload.js',
    '/javascript/user-auth-center.js',
    // Images/Icons
    '/assets/logo.png'
];

// --- Install Event ---
// Precaches all required assets during the install phase.
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Precaching core assets');
            return cache.addAll(ASSETS_TO_PRECACHE);
        }).then(() => self.skipWaiting()) // Force the new SW to activate
    );
});

// --- Activate Event ---
// Cleans up old caches from previous versions of the service worker.
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Claim controlling all open clients immediately
    );
});

// --- Fetch Event: Cache-First, Network-Fallback Strategy ---
// Intercepts network requests and serves from cache first.
// If not found in cache, it tries the network and caches the response.
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse; // Serve from cache
            }

            // If not in cache, try the network
            return fetch(event.request).then((networkResponse) => {
                // If the network response is valid, clone it and save to cache
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // --- Offline Fallback ---
                // If network fails (user is offline), return an offline page
                // You would need to create /pages/offline.html and precache it.
                // return caches.match('/pages/offline.html');
            });
        })
    );
});