import React, { createContext, useContext, useState, useEffect } from "react";

export interface FlashSale {
  id: string;
  title: string;
  description: string;
  productIds: string[];
  discountType: "percentage" | "fixed" | "buy_x_get_y";
  discountValue: number;
  originalPrice?: number;
  flashPrice?: number;
  buyQuantity?: number;
  getQuantity?: number;
  startTime: Date;
  endTime: Date;
  maxQuantityPerUser: number;
  totalQuantityAvailable: number;
  quantitySold: number;
  isActive: boolean;
  priority: number;
  tags: string[];
  image?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashSaleStats {
  totalSales: number;
  totalRevenue: number;
  averageDiscount: number;
  topSellingProduct: string;
  conversionRate: number;
  timeToSellOut: number | null;
}

interface FlashSalesContextType {
  flashSales: FlashSale[];
  activeFlashSales: FlashSale[];
  upcomingFlashSales: FlashSale[];
  expiredFlashSales: FlashSale[];
  createFlashSale: (sale: Omit<FlashSale, "id" | "quantitySold" | "createdAt" | "updatedAt">) => FlashSale;
  updateFlashSale: (saleId: string, updates: Partial<FlashSale>) => void;
  deleteFlashSale: (saleId: string) => void;
  getFlashSaleByProduct: (productId: string) => FlashSale | null;
  getFlashSaleStats: (saleId: string) => FlashSaleStats;
  purchaseFlashSaleItem: (saleId: string, quantity: number, userId: string) => boolean;
  getUserPurchases: (userId: string, saleId: string) => number;
  canUserPurchase: (userId: string, saleId: string, quantity: number) => boolean;
  getTimeRemaining: (saleId: string) => { hours: number; minutes: number; seconds: number } | null;
  isFlashSaleActive: (saleId: string) => boolean;
  getDiscountedPrice: (saleId: string, originalPrice: number) => number;
  getFlashSalesByTag: (tag: string) => FlashSale[];
}

const FlashSalesContext = createContext<FlashSalesContextType | undefined>(undefined);

export const useFlashSales = () => {
  const context = useContext(FlashSalesContext);
  if (context === undefined) {
    throw new Error("useFlashSales must be used within a FlashSalesProvider");
  }
  return context;
};

export const FlashSalesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [userPurchases, setUserPurchases] = useState<Record<string, Record<string, number>>>({});

  // Load flash sales from localStorage on mount
  useEffect(() => {
    const savedSales = localStorage.getItem("la_economica_flash_sales");
    if (savedSales) {
      try {
        const parsedSales = JSON.parse(savedSales);
        const salesWithDates = parsedSales.map((sale: any) => ({
          ...sale,
          startTime: new Date(sale.startTime),
          endTime: new Date(sale.endTime),
          createdAt: new Date(sale.createdAt),
          updatedAt: new Date(sale.updatedAt),
        }));
        setFlashSales(salesWithDates);
      } catch (error) {
        console.error("Error loading flash sales:", error);
        localStorage.removeItem("la_economica_flash_sales");
      }
    }

    const savedPurchases = localStorage.getItem("la_economica_flash_purchases");
    if (savedPurchases) {
      try {
        setUserPurchases(JSON.parse(savedPurchases));
      } catch (error) {
        console.error("Error loading user purchases:", error);
        localStorage.removeItem("la_economica_flash_purchases");
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("la_economica_flash_sales", JSON.stringify(flashSales));
  }, [flashSales]);

  useEffect(() => {
    localStorage.setItem("la_economica_flash_purchases", JSON.stringify(userPurchases));
  }, [userPurchases]);

  // Auto-update sale status
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setFlashSales(prev => prev.map(sale => {
        const isActiveNow = now >= sale.startTime && now <= sale.endTime && sale.quantitySold < sale.totalQuantityAvailable;
        return { ...sale, isActive: isActiveNow };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const generateId = () => `flash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const activeFlashSales = flashSales.filter(sale => {
    const now = new Date();
    return sale.isActive && now >= sale.startTime && now <= sale.endTime && sale.quantitySold < sale.totalQuantityAvailable;
  });

  const upcomingFlashSales = flashSales.filter(sale => {
    const now = new Date();
    return sale.isActive && now < sale.startTime;
  });

  const expiredFlashSales = flashSales.filter(sale => {
    const now = new Date();
    return !sale.isActive || now > sale.endTime || sale.quantitySold >= sale.totalQuantityAvailable;
  });

  const createFlashSale = (saleData: Omit<FlashSale, "id" | "quantitySold" | "createdAt" | "updatedAt">): FlashSale => {
    const newSale: FlashSale = {
      ...saleData,
      id: generateId(),
      quantitySold: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setFlashSales(prev => [newSale, ...prev]);
    return newSale;
  };

  const updateFlashSale = (saleId: string, updates: Partial<FlashSale>) => {
    setFlashSales(prev => prev.map(sale => 
      sale.id === saleId 
        ? { ...sale, ...updates, updatedAt: new Date() }
        : sale
    ));
  };

  const deleteFlashSale = (saleId: string) => {
    setFlashSales(prev => prev.filter(sale => sale.id !== saleId));
  };

  const getFlashSaleByProduct = (productId: string): FlashSale | null => {
    return activeFlashSales.find(sale => sale.productIds.includes(productId)) || null;
  };

  const getFlashSaleStats = (saleId: string): FlashSaleStats => {
    const sale = flashSales.find(s => s.id === saleId);
    if (!sale) {
      return {
        totalSales: 0,
        totalRevenue: 0,
        averageDiscount: 0,
        topSellingProduct: "",
        conversionRate: 0,
        timeToSellOut: null,
      };
    }

    const totalSales = sale.quantitySold;
    const estimatedRevenue = sale.flashPrice ? totalSales * sale.flashPrice : 0;
    const averageDiscount = sale.discountType === "percentage" ? sale.discountValue : 0;

    return {
      totalSales,
      totalRevenue: estimatedRevenue,
      averageDiscount,
      topSellingProduct: sale.productIds[0] || "",
      conversionRate: sale.totalQuantityAvailable > 0 ? (totalSales / sale.totalQuantityAvailable) * 100 : 0,
      timeToSellOut: sale.quantitySold >= sale.totalQuantityAvailable ? 
        sale.endTime.getTime() - sale.startTime.getTime() : null,
    };
  };

  const getUserPurchases = (userId: string, saleId: string): number => {
    return userPurchases[userId]?.[saleId] || 0;
  };

  const canUserPurchase = (userId: string, saleId: string, quantity: number): boolean => {
    const sale = flashSales.find(s => s.id === saleId);
    if (!sale) return false;

    const userCurrentPurchases = getUserPurchases(userId, saleId);
    const totalUserPurchases = userCurrentPurchases + quantity;

    return (
      isFlashSaleActive(saleId) &&
      totalUserPurchases <= sale.maxQuantityPerUser &&
      sale.quantitySold + quantity <= sale.totalQuantityAvailable
    );
  };

  const purchaseFlashSaleItem = (saleId: string, quantity: number, userId: string): boolean => {
    if (!canUserPurchase(userId, saleId, quantity)) {
      return false;
    }

    // Update sale quantity
    updateFlashSale(saleId, { 
      quantitySold: flashSales.find(s => s.id === saleId)!.quantitySold + quantity 
    });

    // Update user purchases
    setUserPurchases(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [saleId]: (prev[userId]?.[saleId] || 0) + quantity,
      }
    }));

    return true;
  };

  const getTimeRemaining = (saleId: string): { hours: number; minutes: number; seconds: number } | null => {
    const sale = flashSales.find(s => s.id === saleId);
    if (!sale) return null;

    const now = new Date();
    const targetTime = now < sale.startTime ? sale.startTime : sale.endTime;
    const timeDiff = targetTime.getTime() - now.getTime();

    if (timeDiff <= 0) return null;

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  };

  const isFlashSaleActive = (saleId: string): boolean => {
    const sale = flashSales.find(s => s.id === saleId);
    if (!sale) return false;

    const now = new Date();
    return (
      sale.isActive &&
      now >= sale.startTime &&
      now <= sale.endTime &&
      sale.quantitySold < sale.totalQuantityAvailable
    );
  };

  const getDiscountedPrice = (saleId: string, originalPrice: number): number => {
    const sale = flashSales.find(s => s.id === saleId);
    if (!sale || !isFlashSaleActive(saleId)) return originalPrice;

    switch (sale.discountType) {
      case "percentage":
        return originalPrice * (1 - sale.discountValue / 100);
      case "fixed":
        return Math.max(0, originalPrice - sale.discountValue);
      default:
        return sale.flashPrice || originalPrice;
    }
  };

  const getFlashSalesByTag = (tag: string): FlashSale[] => {
    return activeFlashSales.filter(sale => sale.tags.includes(tag));
  };

  const value: FlashSalesContextType = {
    flashSales,
    activeFlashSales,
    upcomingFlashSales,
    expiredFlashSales,
    createFlashSale,
    updateFlashSale,
    deleteFlashSale,
    getFlashSaleByProduct,
    getFlashSaleStats,
    purchaseFlashSaleItem,
    getUserPurchases,
    canUserPurchase,
    getTimeRemaining,
    isFlashSaleActive,
    getDiscountedPrice,
    getFlashSalesByTag,
  };

  return (
    <FlashSalesContext.Provider value={value}>
      {children}
    </FlashSalesContext.Provider>
  );
};
