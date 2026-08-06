// pwa-register.js

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Note: Make sure the path to service-worker.js is correct relative to the root of your domain
        navigator.serviceWorker.register('../service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    });
}