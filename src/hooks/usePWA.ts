import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  isStandalone: boolean;
}

interface PWAActions {
  install: () => Promise<boolean>;
  skipUpdate: () => void;
  updateApp: () => void;
  showInstallBanner: () => void;
  hideInstallBanner: () => void;
}

export const usePWA = () => {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    updateAvailable: false,
    isStandalone: false,
  });

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  // Check if app is running in standalone mode (installed)
  useEffect(() => {
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://");

      setState((prev) => ({
        ...prev,
        isStandalone,
        isInstalled: isStandalone,
      }));
    };

    checkStandalone();

    // Listen for display mode changes
    window
      .matchMedia("(display-mode: standalone)")
      .addEventListener("change", checkStandalone);

    return () => {
      window
        .matchMedia("(display-mode: standalone)")
        .removeEventListener("change", checkStandalone);
    };
  }, []);

  // Register service worker and handle updates
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registered:", reg);
          setRegistration(reg);

          // Check for updates
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  setState((prev) => ({ ...prev, updateAvailable: true }));
                }
              });
            }
          });

          // Handle controlled state change
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            window.location.reload();
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const e = event as BeforeInstallPromptEvent;
      setDeferredPrompt(e);
      setState((prev) => ({ ...prev, isInstallable: true }));

      // Show install banner after a delay (if not already installed)
      if (!state.isInstalled) {
        setTimeout(() => {
          setShowInstallBanner(true);
        }, 5000);
      }
    };

    const handleAppInstalled = () => {
      console.log("PWA was installed");
      setState((prev) => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
      }));
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [state.isInstalled]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () =>
      setState((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () =>
      setState((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // PWA Actions
  const actions: PWAActions = {
    install: async (): Promise<boolean> => {
      if (!deferredPrompt) {
        return false;
      }

      try {
        await deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;

        if (result.outcome === "accepted") {
          console.log("User accepted the install prompt");
          setState((prev) => ({
            ...prev,
            isInstalled: true,
            isInstallable: false,
          }));
          setShowInstallBanner(false);
          setDeferredPrompt(null);
          return true;
        } else {
          console.log("User dismissed the install prompt");
          setShowInstallBanner(false);
          return false;
        }
      } catch (error) {
        console.error("Error during installation:", error);
        return false;
      }
    },

    skipUpdate: () => {
      setState((prev) => ({ ...prev, updateAvailable: false }));
    },

    updateApp: () => {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    },

    showInstallBanner: () => {
      setShowInstallBanner(true);
    },

    hideInstallBanner: () => {
      setShowInstallBanner(false);
    },
  };

  return {
    ...state,
    showInstallBanner,
    ...actions,
  };
};

// Hook for managing offline data
export const useOfflineStorage = () => {
  const [offlineData, setOfflineData] = useState<any[]>([]);

  const saveOfflineData = async (type: string, data: any) => {
    try {
      if ("caches" in window) {
        const cache = await caches.open(`${type}-offline`);
        const response = new Response(JSON.stringify(data));
        await cache.put(`/${type}/${data.id || Date.now()}`, response);

        // Update local state
        setOfflineData((prev) => [...prev, { type, data }]);

        // Register background sync if available
        if (
          "serviceWorker" in navigator &&
          "sync" in window.ServiceWorkerRegistration.prototype
        ) {
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register(`sync-${type}`);
        }

        return true;
      }
    } catch (error) {
      console.error("Failed to save offline data:", error);
      return false;
    }
  };

  const getOfflineData = async (type: string) => {
    try {
      if ("caches" in window) {
        const cache = await caches.open(`${type}-offline`);
        const requests = await cache.keys();
        const data = [];

        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const item = await response.json();
            data.push(item);
          }
        }

        return data;
      }
    } catch (error) {
      console.error("Failed to get offline data:", error);
      return [];
    }
  };

  const clearOfflineData = async (type: string) => {
    try {
      if ("caches" in window) {
        await caches.delete(`${type}-offline`);
        setOfflineData((prev) => prev.filter((item) => item.type !== type));
        return true;
      }
    } catch (error) {
      console.error("Failed to clear offline data:", error);
      return false;
    }
  };

  return {
    offlineData,
    saveOfflineData,
    getOfflineData,
    clearOfflineData,
  };
};

// Hook for push notifications
export const usePushNotifications = () => {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  const subscribeToPush = async (): Promise<PushSubscription | null> => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications are not supported");
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY, // Add your VAPID key
      });

      setSubscription(subscription);

      // Send subscription to server
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      return subscription;
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      return null;
    }
  };

  const unsubscribeFromPush = async (): Promise<boolean> => {
    if (!subscription) return false;

    try {
      await subscription.unsubscribe();
      setSubscription(null);

      // Notify server
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      return true;
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error);
      return false;
    }
  };

  return {
    permission,
    subscription,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
  };
};

export default usePWA;
