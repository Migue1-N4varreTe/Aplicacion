import { useState, useEffect } from 'react';
import { pwaService } from '@/services/pwa';
import { notificationsService } from '@/services/notifications';

export const usePWA = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isInstalling, setIsInstalling] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Initialize states
    setCanInstall(pwaService.canInstall());
    setIsInstalled(pwaService.isAppInstalled());
    setIsOnline(pwaService.isOnlineMode());
    setNotificationPermission(notificationsService.getPermission());

    // Listen for install state changes
    pwaService.onInstallStateChange(setCanInstall);
    
    // Listen for connection changes
    pwaService.onConnectionChange(setIsOnline);

    // Listen for app updates
    const handleUpdateAvailable = () => setUpdateAvailable(true);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    if (!canInstall) return false;
    
    setIsInstalling(true);
    try {
      const result = await pwaService.installApp();
      if (result) {
        setIsInstalled(true);
        setCanInstall(false);
      }
      return result;
    } finally {
      setIsInstalling(false);
    }
  };

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    const permission = await notificationsService.requestPermission();
    setNotificationPermission(permission);
    return permission;
  };

  const updateApp = async () => {
    await pwaService.updateApp();
    setUpdateAvailable(false);
    // Reload after a short delay to allow SW to update
    setTimeout(() => window.location.reload(), 1000);
  };

  const shareContent = async (data: { title: string; text?: string; url?: string }) => {
    return pwaService.shareContent(data);
  };

  const getCapabilities = () => pwaService.getCapabilities();
  
  const getNetworkInfo = () => pwaService.getNetworkInfo();

  return {
    // States
    canInstall,
    isInstalled,
    isOnline,
    isInstalling,
    updateAvailable,
    notificationPermission,
    
    // Actions
    install,
    updateApp,
    requestNotificationPermission,
    shareContent,
    
    // Utilities
    getCapabilities,
    getNetworkInfo,
    
    // Services (for advanced usage)
    pwaService,
    notificationsService,
  };
};

export default usePWA;
