import { useState, useEffect, useCallback } from 'react';

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
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Mock data until contexts are properly available
  const appStats: AppStats = {
    cartItemsCount: 0,
    favoritesCount: 0,
    shoppingListsCount: 0,
    addressesCount: 0,
    reviewsCount: 0,
    activePickupOrders: 0,
    activeFlashSales: 0,
    isUserLoggedIn: false,
    totalActiveFeatures: 0,
  };

  const notifications: AppNotifications = {
    lowStock: 0,
    flashSaleEnding: 0,
    pickupReady: 0,
    unreadReviews: 0,
    total: 0,
  };

  const quickActions: any[] = [];

  const appHealth = {
    status: 'healthy' as const,
    issues: [],
    score: 100,
  };

  const featureUsage = {
    usage: {
      cart: false,
      favorites: false,
      shoppingLists: false,
      addresses: false,
      reviews: false,
      pickup: false,
      flashSales: false,
    },
    activeFeatures: [],
    totalActive: 0,
    engagementScore: 0,
  };

  const refreshAppState = useCallback(() => {
    setLastUpdate(new Date());
  }, []);

  return {
    // State
    isLoading,
    lastUpdate,
    appStats,
    notifications,
    
    // Computed values
    featureUsage,
    quickActions,
    appHealth,
    
    // Actions
    refreshAppState,
  };
};

export const useAppPerformance = () => {
  const [metrics] = useState({
    pageLoadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkStatus: navigator.onLine,
  });

  return metrics;
};
