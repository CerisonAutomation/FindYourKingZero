// Push notification service worker — handles background push events
// VAPID keys must be set in Supabase secrets

self.addEventListener('push', (event) => {
    if (!event.data) return;

    let payload;
    try {
        payload = event.data.json();
    } catch {
        payload = {title: 'New notification', body: event.data.text()};
    }

    const {
        title = 'MACHOBB',
        body = '',
        icon = '/icons/icon-192.png',
        badge = '/icons/icon-72.png',
        data = {}
    } = payload;

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon,
            badge,
            data,
            vibrate: [100, 50, 100],
            requireInteraction: false,
            actions: data.conversationId
                ? [{action: 'reply', title: 'Reply'}, {action: 'dismiss', title: 'Dismiss'}]
                : [],
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const {conversationId, url} = event.notification.data || {};
    const target = url || (conversationId ? `/app/chat/${conversationId}` : '/app/grid');

    event.waitUntil(
        clients
            .matchAll({type: 'window', includeUncontrolled: true})
            .then((clientList) => {
                for (const client of clientList) {
                    if ('focus' in client) {
                        client.focus();
                        client.navigate(target);
                        return;
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(target);
                }
            })
    );
});
