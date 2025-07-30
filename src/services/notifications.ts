// Notifications Service - Push notifications and local notifications

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

class NotificationsService {
  private permission: NotificationPermission = 'default';
  private swRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    // Check initial permission
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }

    // Get service worker registration
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.ready;
      } catch (error) {
        console.error('Failed to get SW registration:', error);
      }
    }

    // Listen for notification clicks
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
          this.handleNotificationClick(event.data.data);
        }
      });
    }
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return 'denied';
    }

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    return this.permission;
  }

  public getPermission(): NotificationPermission {
    return this.permission;
  }

  public canSendNotifications(): boolean {
    return 'Notification' in window && this.permission === 'granted';
  }

  // Send local notification
  public async sendNotification(options: NotificationOptions): Promise<boolean> {
    if (!this.canSendNotifications()) {
      console.log('Notifications not permitted');
      return false;
    }

    try {
      if (this.swRegistration) {
        // Use service worker for better control
        await this.swRegistration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || '/icon-192x192.png',
          badge: options.badge || '/icon-96x96.png',
          image: options.image,
          tag: options.tag,
          data: options.data,
          actions: options.actions,
          requireInteraction: options.requireInteraction || false,
          silent: options.silent || false,
          vibrate: options.vibrate || [200, 100, 200],
        });
      } else {
        // Fallback to basic notification
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/icon-192x192.png',
          tag: options.tag,
          data: options.data,
          requireInteraction: options.requireInteraction || false,
          silent: options.silent || false,
        });

        // Handle click
        notification.onclick = () => {
          this.handleNotificationClick(options.data);
          notification.close();
        };
      }

      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  private handleNotificationClick(data: any) {
    // Focus the app window
    if ('clients' in self) {
      // This runs in service worker context
      (self as any).clients.openWindow('/');
    } else {
      // This runs in main thread
      window.focus();
    }

    // Handle specific notification types
    if (data) {
      switch (data.type) {
        case 'order_confirmed':
          window.location.href = `/orders/${data.orderId}`;
          break;
        case 'order_ready':
          window.location.href = `/pickup`;
          break;
        case 'flash_sale':
          window.location.href = `/flash-sales`;
          break;
        case 'delivery_update':
          window.location.href = `/live-tracking`;
          break;
        default:
          window.location.href = '/';
      }
    }
  }

  // Predefined notification templates
  public async sendOrderConfirmation(orderId: string, total: number): Promise<boolean> {
    return this.sendNotification({
      title: '🛒 Pedido Confirmado',
      body: `Tu pedido #${orderId} por $${total.toFixed(2)} ha sido confirmado`,
      tag: `order_${orderId}`,
      data: { type: 'order_confirmed', orderId },
      actions: [
        { action: 'view', title: 'Ver Pedido' },
        { action: 'track', title: 'Rastrear' }
      ],
      requireInteraction: true,
    });
  }

  public async sendOrderReady(orderId: string, storeName: string): Promise<boolean> {
    return this.sendNotification({
      title: '🎉 Pedido Listo',
      body: `Tu pedido #${orderId} está listo para recoger en ${storeName}`,
      tag: `ready_${orderId}`,
      data: { type: 'order_ready', orderId },
      actions: [
        { action: 'pickup', title: 'Ver Pickup' },
        { action: 'directions', title: 'Direcciones' }
      ],
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
    });
  }

  public async sendFlashSaleAlert(productName: string, discount: number): Promise<boolean> {
    return this.sendNotification({
      title: '⚡ Oferta Flash',
      body: `${productName} con ${discount}% de descuento. ¡Tiempo limitado!`,
      tag: 'flash_sale',
      data: { type: 'flash_sale', productName, discount },
      actions: [
        { action: 'view', title: 'Ver Oferta' },
        { action: 'dismiss', title: 'Omitir' }
      ],
      requireInteraction: true,
    });
  }

  public async sendDeliveryUpdate(status: string, estimatedTime?: number): Promise<boolean> {
    const statusMessages = {
      preparing: 'Tu pedido se está preparando',
      on_way: 'Tu repartidor está en camino',
      nearby: 'Tu repartidor está cerca',
      delivered: 'Tu pedido ha sido entregado',
    };

    const body = estimatedTime 
      ? `${statusMessages[status as keyof typeof statusMessages]} - ETA: ${estimatedTime} min`
      : statusMessages[status as keyof typeof statusMessages];

    return this.sendNotification({
      title: '🚚 Actualización de Entrega',
      body,
      tag: 'delivery_update',
      data: { type: 'delivery_update', status },
      actions: status === 'on_way' ? [
        { action: 'track', title: 'Rastrear' },
        { action: 'contact', title: 'Contactar' }
      ] : undefined,
    });
  }

  public async sendStockAlert(productName: string): Promise<boolean> {
    return this.sendNotification({
      title: '📦 Producto Disponible',
      body: `${productName} ya está disponible en stock`,
      tag: 'stock_alert',
      data: { type: 'stock_alert', productName },
      actions: [
        { action: 'buy', title: 'Comprar Ahora' },
        { action: 'view', title: 'Ver Producto' }
      ],
    });
  }

  // Schedule notification (using setTimeout for demo, in production use proper scheduling)
  public scheduleNotification(options: NotificationOptions, delay: number): void {
    setTimeout(() => {
      this.sendNotification(options);
    }, delay);
  }

  // Cancel notification by tag
  public async cancelNotification(tag: string): Promise<void> {
    if (this.swRegistration) {
      const notifications = await this.swRegistration.getNotifications({ tag });
      notifications.forEach(notification => notification.close());
    }
  }

  // Get active notifications
  public async getActiveNotifications(): Promise<Notification[]> {
    if (this.swRegistration) {
      return this.swRegistration.getNotifications();
    }
    return [];
  }

  // Clear all notifications
  public async clearAllNotifications(): Promise<void> {
    if (this.swRegistration) {
      const notifications = await this.swRegistration.getNotifications();
      notifications.forEach(notification => notification.close());
    }
  }

  // Check if notifications are supported
  public isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Get notification settings
  public getSettings(): {
    permission: NotificationPermission;
    supported: boolean;
    serviceWorkerReady: boolean;
  } {
    return {
      permission: this.permission,
      supported: this.isSupported(),
      serviceWorkerReady: !!this.swRegistration,
    };
  }

  // Subscribe to push notifications (requires VAPID keys and server setup)
  public async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      console.error('Service Worker not ready');
      return null;
    }

    try {
      // Note: In production, you need VAPID keys
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        // applicationServerKey: urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY')
      });

      // Send subscription to your server
      console.log('Push subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      return null;
    }
  }
}

export const notificationsService = new NotificationsService();
export default notificationsService;
