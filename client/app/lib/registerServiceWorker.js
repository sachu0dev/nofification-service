export function registerServiceWorker() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(function(registration) {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(function(error) {
        console.error('Service Worker registration failed:', error);
      });
  }
}