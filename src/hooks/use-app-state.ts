import { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useShoppingList } from '@/contexts/ShoppingListContext';
import { useAddresses } from '@/contexts/AddressContext';
import { useReviews } from '@/contexts/ReviewsContext';
import { usePickup } from '@/contexts/PickupContext';
import { useFlashSales } from '@/contexts/FlashSalesContext';
import { logger } from '@/lib/logger';

interface AppStats {
  cartItemsCount: number;
  favoritesCount: number;
  shoppingListsCount: number;
  addressesCount: number;
  reviewsCount: number;
  activePickupOrders: number;
  activeFlashSales: number;
  isUserLoggedIn: boolean;
  totalActiveFeatures: number;
}

interface AppNotifications {
  lowStock: number;
  flashSaleEnding: number;
  pickupReady: number;
  unreadReviews: number;
  total: number;
}

export const useAppState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Contexts
  const { cartCount } = useCart();
  const { favorites } = useFavorites();
  const { user } = useAuth();
  const { lists } = useShoppingList();
  const { addresses } = useAddresses();
  const { reviews } = useReviews();
  const { orders: pickupOrders } = usePickup();
  const { sales: flashSales } = useFlashSales();

  // Calculate app statistics
  const appStats: AppStats = {
    cartItemsCount: cartCount,
    favoritesCount: favorites.length,
    shoppingListsCount: lists.length,
    addressesCount: addresses.length,
    reviewsCount: reviews.length,
    activePickupOrders: pickupOrders.filter(order => 
      order.status === 'pending' || order.status === 'ready'
    ).length,
    activeFlashSales: flashSales.filter(sale => sale.isActive).length,
    isUserLoggedIn: !!user,
    totalActiveFeatures: 0,
  };

  // Calculate active features
  appStats.totalActiveFeatures = [
    appStats.cartItemsCount > 0,
    appStats.favoritesCount > 0,
    appStats.shoppingListsCount > 0,
    appStats.addressesCount > 0,
    appStats.activePickupOrders > 0,
    appStats.activeFlashSales > 0,
  ].filter(Boolean).length;

  // Calculate notifications
  const notifications: AppNotifications = {
    lowStock: 0, // Would be calculated from inventory
    flashSaleEnding: flashSales.filter(sale => {
      if (!sale.isActive) return false;
      const timeRemaining = new Date(sale.endTime).getTime() - Date.now();
      return timeRemaining > 0 && timeRemaining < 3600000; // Less than 1 hour
    }).length,
    pickupReady: pickupOrders.filter(order => order.status === 'ready').length,
    unreadReviews: 0, // Would be calculated from review responses
    total: 0,
  };

  notifications.total = notifications.lowStock + 
                      notifications.flashSaleEnding + 
                      notifications.pickupReady + 
                      notifications.unreadReviews;

  // Log app state changes for debugging
  useEffect(() => {
    logger.debug('App state updated', {
      stats: appStats,
      notifications,
      timestamp: new Date().toISOString(),
    });
    setLastUpdate(new Date());
  }, [
    cartCount,
    favorites.length,
    lists.length,
    addresses.length,
    reviews.length,
    pickupOrders.length,
    flashSales.length,
    user?.id,
  ]);

  // Initialize app state
  useEffect(() => {
    const initializeApp = async () => {
      try {
        logger.info('Initializing app state');
        setIsLoading(false);
      } catch (error) {
        logger.error('Failed to initialize app state', error as Error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Helper functions
  const refreshAppState = useCallback(() => {
    setLastUpdate(new Date());
    logger.userAction('Manual app state refresh');
  }, []);

  const getFeatureUsage = useCallback(() => {
    const usage = {
      cart: cartCount > 0,
      favorites: favorites.length > 0,
      shoppingLists: lists.length > 0,
      addresses: addresses.length > 0,
      reviews: reviews.length > 0,
      pickup: pickupOrders.length > 0,
      flashSales: flashSales.some(sale => sale.isActive),
    };

    const activeFeatures = Object.entries(usage)
      .filter(([_, isActive]) => isActive)
      .map(([feature, _]) => feature);

    return {
      usage,
      activeFeatures,
      totalActive: activeFeatures.length,
      engagementScore: Math.round((activeFeatures.length / 7) * 100),
    };
  }, [cartCount, favorites.length, lists.length, addresses.length, reviews.length, pickupOrders.length, flashSales]);

  const getQuickActions = useCallback(() => {
    const actions = [];

    if (cartCount > 0) {
      actions.push({
        id: 'checkout',
        label: 'Finalizar compra',
        path: '/checkout',
        priority: 'high' as const,
        count: cartCount,
      });
    }

    if (notifications.pickupReady > 0) {
      actions.push({
        id: 'pickup',
        label: 'Órdenes listas',
        path: '/pickup',
        priority: 'high' as const,
        count: notifications.pickupReady,
      });
    }

    if (notifications.flashSaleEnding > 0) {
      actions.push({
        id: 'flash-sales',
        label: 'Ofertas por terminar',
        path: '/flash-sales',
        priority: 'medium' as const,
        count: notifications.flashSaleEnding,
      });
    }

    if (favorites.length > 0) {
      actions.push({
        id: 'favorites',
        label: 'Ver favoritos',
        path: '/favorites',
        priority: 'low' as const,
        count: favorites.length,
      });
    }

    return actions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [cartCount, favorites.length, notifications]);

  const getAppHealth = useCallback(() => {
    const issues = [];

    if (cartCount > 10) {
      issues.push({
        type: 'warning',
        message: 'Carrito con muchos productos - considere finalizar la compra',
      });
    }

    if (lists.length > 5) {
      issues.push({
        type: 'info',
        message: 'Muchas listas de compras - considere organizar o eliminar las no usadas',
      });
    }

    return {
      status: issues.length === 0 ? 'healthy' : 'has-issues',
      issues,
      score: Math.max(100 - (issues.length * 20), 0),
    };
  }, [cartCount, lists.length]);

  return {
    // State
    isLoading,
    lastUpdate,
    appStats,
    notifications,
    
    // Computed values
    featureUsage: getFeatureUsage(),
    quickActions: getQuickActions(),
    appHealth: getAppHealth(),
    
    // Actions
    refreshAppState,
  };
};

// Hook for app performance monitoring
export const useAppPerformance = () => {
  const [metrics, setMetrics] = useState({
    pageLoadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkStatus: navigator.onLine,
  });

  useEffect(() => {
    // Measure page load time
    if (performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      setMetrics(prev => ({ ...prev, pageLoadTime: loadTime }));
      logger.performanceMetric('page_load_time', loadTime);
    }

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      setMetrics(prev => ({ 
        ...prev, 
        memoryUsage: memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit * 100 
      }));
    }

    // Monitor network status
    const handleOnline = () => setMetrics(prev => ({ ...prev, networkStatus: true }));
    const handleOffline = () => setMetrics(prev => ({ ...prev, networkStatus: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return metrics;
};
