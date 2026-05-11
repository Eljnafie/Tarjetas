import { useState, useEffect, useCallback } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
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

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted' && 'Notification' in window) {
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

  return { permission, requestPermission, sendNotification };
};
