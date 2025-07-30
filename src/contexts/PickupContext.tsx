import React, { createContext, useContext, useState, useEffect } from "react";

export interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  openHours: {
    monday: { open: string; close: string; closed?: boolean };
    tuesday: { open: string; close: string; closed?: boolean };
    wednesday: { open: string; close: string; closed?: boolean };
    thursday: { open: string; close: string; closed?: boolean };
    friday: { open: string; close: string; closed?: boolean };
    saturday: { open: string; close: string; closed?: boolean };
    sunday: { open: string; close: string; closed?: boolean };
  };
  features: string[]; // parking, wheelchair_accessible, pharmacy, etc.
  pickupAvailable: boolean;
  estimatedPickupTime: number; // minutes
  maxPickupTime: number; // hours
  isActive: boolean;
}

export interface PickupOrder {
  id: string;
  storeId: string;
  userId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    notes?: string;
  }[];
  customerInfo: {
    name: string;
    phone: string;
    email: string;
    idDocument?: string;
  };
  scheduledTime?: Date;
  status: "pending" | "preparing" | "ready" | "picked_up" | "cancelled" | "expired";
  preparationTime: number; // estimated minutes
  actualReadyTime?: Date;
  pickupCode: string;
  notes?: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  notificationsSent: {
    orderReceived: boolean;
    preparing: boolean;
    ready: boolean;
    reminderSent: boolean;
  };
}

export interface PickupTimeSlot {
  time: string;
  available: boolean;
  capacity: number;
  booked: number;
}

interface PickupContextType {
  stores: Store[];
  pickupOrders: PickupOrder[];
  getAvailableStores: () => Store[];
  getStoreById: (storeId: string) => Store | null;
  getNearbyStores: (userLat: number, userLng: number, radius?: number) => Store[];
  getStoreDistance: (storeId: string, userLat: number, userLng: number) => number;
  isStoreOpen: (storeId: string, time?: Date) => boolean;
  getAvailableTimeSlots: (storeId: string, date: Date) => PickupTimeSlot[];
  createPickupOrder: (order: Omit<PickupOrder, "id" | "status" | "pickupCode" | "createdAt" | "updatedAt" | "expiresAt" | "notificationsSent">) => PickupOrder;
  updatePickupOrder: (orderId: string, updates: Partial<PickupOrder>) => void;
  cancelPickupOrder: (orderId: string) => void;
  getUserPickupOrders: (userId: string) => PickupOrder[];
  getStorePickupOrders: (storeId: string) => PickupOrder[];
  checkPickupCode: (code: string) => PickupOrder | null;
  markOrderReady: (orderId: string) => void;
  markOrderPickedUp: (orderId: string) => void;
  getOrdersByStatus: (status: PickupOrder["status"]) => PickupOrder[];
  calculateEstimatedTime: (storeId: string, itemCount: number) => number;
}

const PickupContext = createContext<PickupContextType | undefined>(undefined);

export const usePickup = () => {
  const context = useContext(PickupContext);
  if (context === undefined) {
    throw new Error("usePickup must be used within a PickupProvider");
  }
  return context;
};

// Mock stores data
const MOCK_STORES: Store[] = [
  {
    id: "store_001",
    name: "La Económica Centro",
    address: "Av. Reforma 123, Col. Centro",
    city: "Ciudad de México",
    state: "CDMX",
    zipCode: "06000",
    phone: "+52 55 1234 5678",
    email: "centro@laeconomica.com",
    coordinates: { lat: 19.4326, lng: -99.1332 },
    openHours: {
      monday: { open: "08:00", close: "22:00" },
      tuesday: { open: "08:00", close: "22:00" },
      wednesday: { open: "08:00", close: "22:00" },
      thursday: { open: "08:00", close: "22:00" },
      friday: { open: "08:00", close: "23:00" },
      saturday: { open: "08:00", close: "23:00" },
      sunday: { open: "09:00", close: "21:00" },
    },
    features: ["parking", "wheelchair_accessible", "pharmacy", "bakery"],
    pickupAvailable: true,
    estimatedPickupTime: 30,
    maxPickupTime: 24,
    isActive: true,
  },
  {
    id: "store_002",
    name: "La Económica Norte",
    address: "Av. Insurgentes Norte 456",
    city: "Ciudad de México",
    state: "CDMX",
    zipCode: "07000",
    phone: "+52 55 1234 5679",
    email: "norte@laeconomica.com",
    coordinates: { lat: 19.4569, lng: -99.1276 },
    openHours: {
      monday: { open: "07:00", close: "23:00" },
      tuesday: { open: "07:00", close: "23:00" },
      wednesday: { open: "07:00", close: "23:00" },
      thursday: { open: "07:00", close: "23:00" },
      friday: { open: "07:00", close: "24:00" },
      saturday: { open: "07:00", close: "24:00" },
      sunday: { open: "08:00", close: "22:00" },
    },
    features: ["parking", "drive_through", "pharmacy"],
    pickupAvailable: true,
    estimatedPickupTime: 25,
    maxPickupTime: 24,
    isActive: true,
  },
  {
    id: "store_003",
    name: "La Económica Sur",
    address: "Av. División del Norte 789",
    city: "Ciudad de México",
    state: "CDMX",
    zipCode: "04000",
    phone: "+52 55 1234 5680",
    email: "sur@laeconomica.com",
    coordinates: { lat: 19.3910, lng: -99.1620 },
    openHours: {
      monday: { open: "08:00", close: "21:00" },
      tuesday: { open: "08:00", close: "21:00" },
      wednesday: { open: "08:00", close: "21:00" },
      thursday: { open: "08:00", close: "21:00" },
      friday: { open: "08:00", close: "22:00" },
      saturday: { open: "08:00", close: "22:00" },
      sunday: { open: "09:00", close: "20:00" },
    },
    features: ["wheelchair_accessible", "bakery"],
    pickupAvailable: true,
    estimatedPickupTime: 35,
    maxPickupTime: 24,
    isActive: true,
  },
];

export const PickupProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [stores] = useState<Store[]>(MOCK_STORES);
  const [pickupOrders, setPickupOrders] = useState<PickupOrder[]>([]);

  // Load pickup orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem("la_economica_pickup_orders");
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        const ordersWithDates = parsedOrders.map((order: any) => ({
          ...order,
          scheduledTime: order.scheduledTime ? new Date(order.scheduledTime) : undefined,
          actualReadyTime: order.actualReadyTime ? new Date(order.actualReadyTime) : undefined,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
          expiresAt: new Date(order.expiresAt),
        }));
        setPickupOrders(ordersWithDates);
      } catch (error) {
        console.error("Error loading pickup orders:", error);
        localStorage.removeItem("la_economica_pickup_orders");
      }
    }
  }, []);

  // Save pickup orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("la_economica_pickup_orders", JSON.stringify(pickupOrders));
  }, [pickupOrders]);

  const generateId = () => `pickup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const generatePickupCode = () => Math.random().toString(36).substr(2, 8).toUpperCase();

  const getAvailableStores = (): Store[] => {
    return stores.filter(store => store.isActive && store.pickupAvailable);
  };

  const getStoreById = (storeId: string): Store | null => {
    return stores.find(store => store.id === storeId) || null;
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getNearbyStores = (userLat: number, userLng: number, radius: number = 10): Store[] => {
    return getAvailableStores()
      .map(store => ({
        ...store,
        distance: calculateDistance(userLat, userLng, store.coordinates.lat, store.coordinates.lng)
      }))
      .filter(store => store.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  };

  const getStoreDistance = (storeId: string, userLat: number, userLng: number): number => {
    const store = getStoreById(storeId);
    if (!store) return Infinity;
    return calculateDistance(userLat, userLng, store.coordinates.lat, store.coordinates.lng);
  };

  const isStoreOpen = (storeId: string, time: Date = new Date()): boolean => {
    const store = getStoreById(storeId);
    if (!store) return false;

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[time.getDay()] as keyof typeof store.openHours;
    const dayHours = store.openHours[dayName];

    if (dayHours.closed) return false;

    const currentTime = time.getHours() * 60 + time.getMinutes();
    const [openHour, openMin] = dayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = dayHours.close.split(':').map(Number);
    
    const openTime = openHour * 60 + openMin;
    let closeTime = closeHour * 60 + closeMin;
    
    // Handle stores that close after midnight
    if (closeTime < openTime) {
      closeTime += 24 * 60;
    }

    return currentTime >= openTime && currentTime <= closeTime;
  };

  const getAvailableTimeSlots = (storeId: string, date: Date): PickupTimeSlot[] => {
    const store = getStoreById(storeId);
    if (!store) return [];

    const slots: PickupTimeSlot[] = [];
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    // Generate hourly slots based on store hours
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[date.getDay()] as keyof typeof store.openHours;
    const dayHours = store.openHours[dayName];

    if (dayHours.closed) return [];

    const [openHour] = dayHours.open.split(':').map(Number);
    const [closeHour] = dayHours.close.split(':').map(Number);

    for (let hour = openHour; hour < closeHour; hour++) {
      const slotTime = `${hour.toString().padStart(2, '0')}:00`;
      const slotDateTime = new Date(date);
      slotDateTime.setHours(hour, 0, 0, 0);

      // Skip past time slots for today
      const isPastTime = isToday && slotDateTime <= today;
      
      // Calculate availability (simplified)
      const bookedOrders = pickupOrders.filter(order => 
        order.storeId === storeId &&
        order.scheduledTime &&
        order.scheduledTime.getHours() === hour &&
        order.scheduledTime.toDateString() === date.toDateString() &&
        order.status !== 'cancelled' &&
        order.status !== 'picked_up'
      ).length;

      slots.push({
        time: slotTime,
        available: !isPastTime && bookedOrders < 10, // Max 10 orders per hour
        capacity: 10,
        booked: bookedOrders,
      });
    }

    return slots;
  };

  const calculateEstimatedTime = (storeId: string, itemCount: number): number => {
    const store = getStoreById(storeId);
    if (!store) return 60; // Default 1 hour

    // Base time + additional time per item
    const baseTime = store.estimatedPickupTime;
    const additionalTime = Math.max(0, (itemCount - 5) * 2); // 2 minutes per additional item after 5
    
    return Math.min(baseTime + additionalTime, store.maxPickupTime * 60);
  };

  const createPickupOrder = (orderData: Omit<PickupOrder, "id" | "status" | "pickupCode" | "createdAt" | "updatedAt" | "expiresAt" | "notificationsSent">): PickupOrder => {
    const estimatedTime = calculateEstimatedTime(orderData.storeId, orderData.items.length);
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 24); // 24 hours to pick up

    const newOrder: PickupOrder = {
      ...orderData,
      id: generateId(),
      status: "pending",
      pickupCode: generatePickupCode(),
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: expirationTime,
      preparationTime: estimatedTime,
      notificationsSent: {
        orderReceived: false,
        preparing: false,
        ready: false,
        reminderSent: false,
      },
    };

    setPickupOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updatePickupOrder = (orderId: string, updates: Partial<PickupOrder>) => {
    setPickupOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, ...updates, updatedAt: new Date() }
        : order
    ));
  };

  const cancelPickupOrder = (orderId: string) => {
    updatePickupOrder(orderId, { status: "cancelled" });
  };

  const getUserPickupOrders = (userId: string): PickupOrder[] => {
    return pickupOrders.filter(order => order.userId === userId);
  };

  const getStorePickupOrders = (storeId: string): PickupOrder[] => {
    return pickupOrders.filter(order => order.storeId === storeId);
  };

  const checkPickupCode = (code: string): PickupOrder | null => {
    return pickupOrders.find(order => 
      order.pickupCode === code && 
      order.status === "ready"
    ) || null;
  };

  const markOrderReady = (orderId: string) => {
    updatePickupOrder(orderId, { 
      status: "ready", 
      actualReadyTime: new Date(),
      notificationsSent: { 
        orderReceived: true, 
        preparing: true, 
        ready: true, 
        reminderSent: false 
      }
    });
  };

  const markOrderPickedUp = (orderId: string) => {
    updatePickupOrder(orderId, { status: "picked_up" });
  };

  const getOrdersByStatus = (status: PickupOrder["status"]): PickupOrder[] => {
    return pickupOrders.filter(order => order.status === status);
  };

  const value: PickupContextType = {
    stores,
    pickupOrders,
    getAvailableStores,
    getStoreById,
    getNearbyStores,
    getStoreDistance,
    isStoreOpen,
    getAvailableTimeSlots,
    createPickupOrder,
    updatePickupOrder,
    cancelPickupOrder,
    getUserPickupOrders,
    getStorePickupOrders,
    checkPickupCode,
    markOrderReady,
    markOrderPickedUp,
    getOrdersByStatus,
    calculateEstimatedTime,
  };

  return (
    <PickupContext.Provider value={value}>
      {children}
    </PickupContext.Provider>
  );
};
