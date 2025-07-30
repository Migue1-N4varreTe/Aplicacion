import { useState, useEffect, useCallback } from 'react';
import { pwaService } from '@/services/pwa';
import { notificationService } from '@/services/notifications';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface PWAState {
  isInstalled: boolean;
  canInstall: boolean;
  isOffline: boolean;
  isUpdateAvailable: boolean;
  installPrompt: any;
}

interface NotificationState {
  permission: NotificationPermission;
  isSupported: boolean;
  subscribed: boolean;
}

interface PWAIntegrationState {
  pwa: PWAState;
  notifications: NotificationState;
  isReady: boolean;
}

export const usePWAIntegration = () => {
  const { toast } = useToast();
  const [state, setState] = useState<PWAIntegrationState>({
    pwa: {
      isInstalled: false,
      canInstall: false,
      isOffline: false,
      isUpdateAvailable: false,
      installPrompt: null,
    },
    notifications: {
      permission: 'default',
      isSupported: false,
      subscribed: false,
    },
    isReady: false,
  });

  // Initialize PWA and notification services
  useEffect(() => {
    const initialize = async () => {
      try {
        logger.info('Initializing PWA and notification services');

        // Initialize PWA service safely
        let pwaStatus = { updateAvailable: false, installPrompt: null };
        try {
          pwaStatus = await pwaService.initialize();
        } catch (error) {
          logger.warn('PWA service initialization failed', { error });
        }

        // Initialize notification service safely
        let notificationStatus = {
          permission: 'default' as NotificationPermission,
          supported: false,
          subscribed: false
        };
        try {
          notificationStatus = await notificationService.initialize();
        } catch (error) {
          logger.warn('Notification service initialization failed', { error });
        }

        setState(prev => ({
          ...prev,
          pwa: {
            isInstalled: pwaService.isInstalled(),
            canInstall: pwaService.canInstall(),
            isOffline: !navigator.onLine,
            isUpdateAvailable: pwaStatus.updateAvailable || false,
            installPrompt: pwaStatus.installPrompt,
          },
          notifications: {
            permission: notificationStatus.permission,
            isSupported: notificationStatus.supported,
            subscribed: notificationStatus.subscribed || false,
          },
          isReady: true,
        }));

        logger.info('PWA and notification services initialized', {
          pwa: pwaStatus,
          notifications: notificationStatus,
        });

      } catch (error) {
        logger.error('Failed to initialize PWA/notification services', error as Error);
        setState(prev => ({ ...prev, isReady: true }));
      }
    };

    initialize();
  }, []);

  // Listen for online/offline changes
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({
        ...prev,
        pwa: { ...prev.pwa, isOffline: false }
      }));
      
      toast({
        title: 'Conexión restablecida',
        description: 'Ya estás conectado a internet',
      });
    };

    const handleOffline = () => {
      setState(prev => ({
        ...prev,
        pwa: { ...prev.pwa, isOffline: true }
      }));
      
      toast({
        title: 'Sin conexión',
        description: 'Algunas funciones pueden estar limitadas',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Listen for app update events
  useEffect(() => {
    const handleUpdateAvailable = () => {
      setState(prev => ({
        ...prev,
        pwa: { ...prev.pwa, isUpdateAvailable: true }
      }));

      toast({
        title: 'Actualización disponible',
        description: 'Hay una nueva versión de la app disponible',
        action: {
          altText: 'Actualizar',
          onClick: () => pwaService.updateApp(),
        },
      });
    };

    // Listen for PWA update events
    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, [toast]);

  // PWA installation
  const installApp = useCallback(async () => {
    try {
      let success = false;
      try {
        success = await pwaService.installApp();
      } catch (error) {
        logger.warn('PWA install failed', { error });
        return false;
      }
      if (success) {
        setState(prev => ({
          ...prev,
          pwa: { 
            ...prev.pwa, 
            isInstalled: true, 
            canInstall: false,
            installPrompt: null,
          }
        }));

        toast({
          title: 'App instalada',
          description: 'La app se ha instalado correctamente',
        });

        logger.userAction('pwa_installed');
      }
      return success;
    } catch (error) {
      logger.error('Failed to install PWA', error as Error);
      toast({
        title: 'Error al instalar',
        description: 'No se pudo instalar la aplicación',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  // Notification permission request
  const requestNotificationPermission = useCallback(async () => {
    try {
      let permission: NotificationPermission = 'default';
      try {
        permission = await notificationService.requestPermission();
      } catch (error) {
        logger.warn('Notification permission request failed', { error });
        return false;
      }
      
      setState(prev => ({
        ...prev,
        notifications: { 
          ...prev.notifications, 
          permission,
          subscribed: permission === 'granted',
        }
      }));

      if (permission === 'granted') {
        toast({
          title: 'Notificaciones activadas',
          description: 'Recibirás notificaciones importantes',
        });

        logger.userAction('notifications_enabled');
      } else {
        toast({
          title: 'Notificaciones denegadas',
          description: 'No podrás recibir notificaciones push',
          variant: 'destructive',
        });
      }

      return permission === 'granted';
    } catch (error) {
      logger.error('Failed to request notification permission', error as Error);
      return false;
    }
  }, [toast]);

  // Send test notification
  const sendTestNotification = useCallback(async () => {
    try {
      if (state.notifications.permission !== 'granted') {
        const granted = await requestNotificationPermission();
        if (!granted) return false;
      }

      try {
        await notificationService.showNotification('test', {
          title: 'Notificación de prueba',
          message: 'Las notificaciones están funcionando correctamente',
        });
      } catch (error) {
        logger.warn('Test notification failed', { error });
        return false;
      }

      logger.userAction('test_notification_sent');
      return true;
    } catch (error) {
      logger.error('Failed to send test notification', error as Error);
      toast({
        title: 'Error en notificación',
        description: 'No se pudo enviar la notificación de prueba',
        variant: 'destructive',
      });
      return false;
    }
  }, [state.notifications.permission, requestNotificationPermission, toast]);

  // Quick notification helpers for common scenarios
  const notifyOrderUpdate = useCallback(async (orderData: any) => {
    if (state.notifications.permission !== 'granted') return;

    try {
      await notificationService.showNotification('orderUpdate', {
        orderId: orderData.id,
        status: orderData.status,
        total: orderData.total,
      });
    } catch (error) {
      logger.error('Failed to send order update notification', error as Error);
    }
  }, [state.notifications.permission]);

  const notifyPickupReady = useCallback(async (pickupData: any) => {
    if (state.notifications.permission !== 'granted') return;

    try {
      await notificationService.showNotification('pickupReady', {
        orderId: pickupData.orderId,
        store: pickupData.store,
        code: pickupData.code,
      });
    } catch (error) {
      logger.error('Failed to send pickup ready notification', error as Error);
    }
  }, [state.notifications.permission]);

  const notifyFlashSale = useCallback(async (saleData: any) => {
    if (state.notifications.permission !== 'granted') return;

    try {
      await notificationService.showNotification('flashSale', {
        productName: saleData.productName,
        discount: saleData.discount,
        timeLeft: saleData.timeLeft,
      });
    } catch (error) {
      logger.error('Failed to send flash sale notification', error as Error);
    }
  }, [state.notifications.permission]);

  // App capabilities check
  const getAppCapabilities = useCallback(() => {
    return {
      canInstall: state.pwa.canInstall,
      canNotify: state.notifications.isSupported,
      canWorkOffline: 'serviceWorker' in navigator,
      canShare: 'share' in navigator,
      canVibrate: 'vibrate' in navigator,
      canFullscreen: 'requestFullscreen' in document.documentElement,
      canCamera: 'mediaDevices' in navigator,
      canLocation: 'geolocation' in navigator,
    };
  }, [state]);

  return {
    // State
    ...state,
    
    // Actions
    installApp,
    requestNotificationPermission,
    sendTestNotification,
    
    // Notification helpers
    notifyOrderUpdate,
    notifyPickupReady,
    notifyFlashSale,
    
    // Utils
    getAppCapabilities,
    
    // Services access
    pwaService,
    notificationService,
  };
};

// Hook for managing app shortcuts
export const useAppShortcuts = () => {
  const [shortcuts, setShortcuts] = useState<any[]>([]);

  useEffect(() => {
    const updateShortcuts = async () => {
      try {
        if ('getInstalledRelatedApps' in navigator) {
          // @ts-ignore
          const relatedApps = await navigator.getInstalledRelatedApps();
          setShortcuts(relatedApps);
        }
      } catch (error) {
        logger.debug('Failed to get app shortcuts', { error });
      }
    };

    updateShortcuts();
  }, []);

  const addShortcut = useCallback(async (shortcut: any) => {
    try {
      // Implementation would depend on PWA manifest
      logger.userAction('add_app_shortcut', { shortcut });
      return true;
    } catch (error) {
      logger.error('Failed to add app shortcut', error as Error);
      return false;
    }
  }, []);

  return {
    shortcuts,
    addShortcut,
  };
};
