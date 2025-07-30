// PWA Service - Enhanced functionality for installation and offline mode

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAService {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private isInstalled = false;
  private isOnline = navigator.onLine;
  private installListeners: ((canInstall: boolean) => void)[] = [];
  private connectionListeners: ((isOnline: boolean) => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as any;
      this.notifyInstallListeners(true);
    });

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.notifyInstallListeners(false);
      console.log('PWA was installed');
    });

    // Listen for connection changes
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyConnectionListeners(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyConnectionListeners(false);
    });

    // Check if already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }

    // Register service worker if not already registered
    this.registerServiceWorker();
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered: ', registration);
        
        // Listen for service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available
                this.showUpdateAvailable();
              }
            });
          }
        });
      } catch (error) {
        console.log('SW registration failed: ', error);
      }
    }
  }

  private showUpdateAvailable() {
    // Show user that new content is available
    const event = new CustomEvent('pwa-update-available');
    window.dispatchEvent(event);
  }

  public async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error during install:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
      this.notifyInstallListeners(false);
    }
  }

  public canInstall(): boolean {
    return this.deferredPrompt !== null && !this.isInstalled;
  }

  public isAppInstalled(): boolean {
    return this.isInstalled;
  }

  public isOnlineMode(): boolean {
    return this.isOnline;
  }

  public onInstallStateChange(callback: (canInstall: boolean) => void) {
    this.installListeners.push(callback);
    // Call immediately with current state
    callback(this.canInstall());
  }

  public onConnectionChange(callback: (isOnline: boolean) => void) {
    this.connectionListeners.push(callback);
    // Call immediately with current state
    callback(this.isOnline);
  }

  private notifyInstallListeners(canInstall: boolean) {
    this.installListeners.forEach(callback => callback(canInstall));
  }

  private notifyConnectionListeners(isOnline: boolean) {
    this.connectionListeners.forEach(callback => callback(isOnline));
  }

  public async updateApp() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.update();
      }
    }
  }

  // Offline cache management
  public async getCacheSize(): Promise<number> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        totalSize += keys.length;
      }
      
      return totalSize;
    }
    return 0;
  }

  public async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  }

  // Check if specific content is cached
  public async isContentCached(url: string): Promise<boolean> {
    if ('caches' in window) {
      const cache = await caches.open('la-economica-cache');
      const response = await cache.match(url);
      return !!response;
    }
    return false;
  }

  // Preload important content for offline use
  public async preloadContent(urls: string[]): Promise<void> {
    if ('caches' in window) {
      const cache = await caches.open('la-economica-cache');
      await Promise.all(
        urls.map(url => 
          fetch(url).then(response => {
            if (response.ok) {
              cache.put(url, response.clone());
            }
          }).catch(console.error)
        )
      );
    }
  }

  // Get network status
  public getNetworkInfo(): {
    isOnline: boolean;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  } {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      isOnline: this.isOnline,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
    };
  }

  // Share API integration
  public async shareContent(data: {
    title: string;
    text?: string;
    url?: string;
  }): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Error sharing:', error);
        return false;
      }
    }
    
    // Fallback: copy to clipboard
    if (navigator.clipboard && data.url) {
      try {
        await navigator.clipboard.writeText(data.url);
        return true;
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
    
    return false;
  }

  // Check PWA capabilities
  public getCapabilities(): {
    canInstall: boolean;
    hasServiceWorker: boolean;
    hasNotifications: boolean;
    hasShare: boolean;
    hasClipboard: boolean;
    hasGeolocation: boolean;
    hasCamera: boolean;
    isStandalone: boolean;
  } {
    return {
      canInstall: this.canInstall(),
      hasServiceWorker: 'serviceWorker' in navigator,
      hasNotifications: 'Notification' in window,
      hasShare: 'share' in navigator,
      hasClipboard: 'clipboard' in navigator,
      hasGeolocation: 'geolocation' in navigator,
      hasCamera: 'mediaDevices' in navigator,
      isStandalone: this.isInstalled,
    };
  }
}

export const pwaService = new PWAService();
export default pwaService;
