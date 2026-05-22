import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Badge } from '@capawesome/capacitor-badge';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const checkPermission = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const status = await LocalNotifications.checkPermissions();
          setPermission(status.display === 'granted' ? 'granted' : (status.display === 'denied' ? 'denied' : 'default'));
        } catch (e) {
          console.error(e);
        }
      } else if ('Notification' in window) {
        setPermission(Notification.permission);
      }
    };
    checkPermission();
  }, []);

  const requestPermission = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const status = await LocalNotifications.requestPermissions();
        const granted = status.display === 'granted';
        setPermission(granted ? 'granted' : 'denied');
        if (granted) {
          await LocalNotifications.schedule({
            notifications: [
              {
                title: '¡Notificaciones activadas!',
                body: 'Te avisaremos cuando haya tarjetas a punto de vencer.',
                id: Math.floor(Math.random() * 1000000),
                schedule: { at: new Date(Date.now() + 1000) }
              }
            ]
          });
        }
        return granted;
      } catch (error) {
        console.error('Error al solicitar permiso de notificaciones (Capacitor):', error);
        return false;
      }
    }

    if (!('Notification' in window)) {
      alert('Tu dispositivo/navegador no soporta notificaciones web.');
      return false;
    }
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        new Notification('¡Notificaciones activadas!', {
          body: 'Te avisaremos cuando haya tarjetas a punto de vencer.'
        });
      }
      return result === 'granted';
    } catch (error) {
      console.error('Error al solicitar permiso de notificaciones:', error);
      return false;
    }
  };

  const sendNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (Capacitor.isNativePlatform()) {
      if (permission === 'granted') {
        try {
          await LocalNotifications.schedule({
            notifications: [
              {
                title,
                body: options?.body || '',
                id: Math.floor(Math.random() * 1000000),
                schedule: { at: new Date(Date.now() + 500) }
              }
            ]
          });
        } catch (e) {
          console.error('Error scheduling local notification', e);
        }
      }
    } else if (permission === 'granted' && 'Notification' in window) {
      try {
        new Notification(title, {
          ...options,
        });
      } catch (e) {
        // Fallback for some mobile browsers that require Service Worker for notifications
        console.error('Error sending notification directly', e);
      }
    }
  }, [permission]);

  const scheduleCardExpirations = useCallback(async (children: any[]) => {
    if (!Capacitor.isNativePlatform() || permission !== 'granted') return;
    
    try {
      // Fetch and cancel pending notifications to start fresh and avoid duplicates
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }

      const notifications: import('@capacitor/local-notifications').LocalNotificationSchema[] = [];
      const now = Date.now();
      
      children.forEach(c => {
        if (c.isLost) return;
        const expDate = new Date(c.expirationDate);
        expDate.setHours(9, 0, 0, 0); // Notify at 9 AM
        
        // 7 days before
        const sevenDaysBefore = new Date(expDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (sevenDaysBefore.getTime() > now) {
          notifications.push({
            id: Math.floor(Math.random() * 2000000000), // Int32
            title: 'Tarjeta por caducar',
            body: `La tarjeta de ${c.name} caducará en 7 días (${expDate.toLocaleDateString()}). ¡Entra a la app para gestionarla!`,
            schedule: { at: sevenDaysBefore, allowWhileIdle: true }
          });
        }
        
        // Expiration day
        if (expDate.getTime() > now) {
          notifications.push({
            id: Math.floor(Math.random() * 2000000000),
            title: 'Tarjeta caducada',
            body: `La tarjeta de ${c.name} caduca HOY y necesita ser renovada.`,
            schedule: { at: expDate, allowWhileIdle: true }
          });
        }
      });
      
      if (notifications.length > 0) {
        // Schedule in batches if required, usually up to ~50 is fine
        await LocalNotifications.schedule({ notifications: notifications.slice(0, 50) });
      }
    } catch (e) {
      console.error('Error scheduling expirations:', e);
    }
  }, [permission]);

  const updateAppBadge = useCallback(async (count: number) => {
    if (Capacitor.isNativePlatform()) {

      try {
        if (count > 0) {
          await Badge.set({ count });
        } else {
          await Badge.clear();
        }
      } catch (e) {
        console.error('Error setting app badge in Capacitor', e);
      }
    } else if ('setAppBadge' in navigator) {
      if (count > 0) {
        (navigator as any).setAppBadge(count).catch(console.error);
      } else {
        (navigator as any).clearAppBadge().catch(console.error);
      }
    }
  }, []);

  return { permission, requestPermission, sendNotification, updateAppBadge, scheduleCardExpirations };
};
