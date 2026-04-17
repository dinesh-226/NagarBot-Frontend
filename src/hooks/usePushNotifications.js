import { useEffect } from 'react';
import api from '../services/api';

const usePushNotifications = (user) => {
  useEffect(() => {
    if (!user || !('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const register = async () => {
      try {
        const { data } = await api.get('/vapid-public-key');
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (existing) return;

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(data.key),
        });
        await api.post('/users/push-subscription', { subscription: sub });
      } catch (e) {
        console.log('Push setup skipped:', e.message);
      }
    };

    Notification.requestPermission().then((perm) => { if (perm === 'granted') register(); });
  }, [user]);
};

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
};

export default usePushNotifications;
