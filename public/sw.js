self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'NagarBot', {
      body: data.body || '',
      icon: data.icon || '/logo192.png',
      badge: '/logo192.png',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/my-issues'));
});
