import React, { createContext, useContext, useState, useEffect } from "react";

export interface Address {
  id: string;
  title: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  email?: string;
  type: "home" | "work" | "other";
  isDefault: boolean;
  deliveryInstructions?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface AddressContextType {
  addresses: Address[];
  defaultAddress: Address | null;
  addAddress: (address: Omit<Address, "id" | "createdAt" | "updatedAt" | "isActive">) => Address;
  updateAddress: (id: string, updates: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  getAddressesByType: (type: Address["type"]) => Address[];
  validateAddress: (address: Partial<Address>) => { isValid: boolean; errors: string[] };
  searchAddresses: (query: string) => Address[];
  getDeliveryFee: (addressId: string) => number;
  isInDeliveryZone: (addressId: string) => boolean;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const useAddresses = () => {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error("useAddresses must be used within an AddressProvider");
  }
  return context;
};

const DELIVERY_ZONES = {
  zone1: { maxDistance: 5, fee: 0 }, // Free delivery
  zone2: { maxDistance: 10, fee: 50 },
  zone3: { maxDistance: 20, fee: 100 },
  zone4: { maxDistance: 30, fee: 150 },
};

export const AddressProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Load addresses from localStorage on mount
  useEffect(() => {
    const savedAddresses = localStorage.getItem("la_economica_addresses");
    if (savedAddresses) {
      try {
        const parsedAddresses = JSON.parse(savedAddresses);
        const addressesWithDates = parsedAddresses.map((address: any) => ({
          ...address,
          createdAt: new Date(address.createdAt),
          updatedAt: new Date(address.updatedAt),
        }));
        setAddresses(addressesWithDates);
      } catch (error) {
        console.error("Error loading addresses:", error);
        localStorage.removeItem("la_economica_addresses");
      }
    }
  }, []);

  // Save addresses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("la_economica_addresses", JSON.stringify(addresses));
  }, [addresses]);

  const generateId = () => `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const defaultAddress = addresses.find(addr => addr.isDefault && addr.isActive) || null;

  const addAddress = (addressData: Omit<Address, "id" | "createdAt" | "updatedAt" | "isActive">): Address => {
    const newAddress: Address = {
      ...addressData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    // If this is the first address or marked as default, make it default
    if (addresses.length === 0 || addressData.isDefault) {
      // Remove default from other addresses
      setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })));
      newAddress.isDefault = true;
    }

    setAddresses(prev => [newAddress, ...prev]);
    return newAddress;
  };

  const updateAddress = (id: string, updates: Partial<Address>) => {
    setAddresses(prev => prev.map(addr => {
      if (addr.id !== id) return addr;

      const updatedAddr = {
        ...addr,
        ...updates,
        updatedAt: new Date(),
      };

      // If setting as default, remove default from others
      if (updates.isDefault === true) {
        // This will be handled in a separate update
        setTimeout(() => {
          setAddresses(current => current.map(a => 
            a.id !== id ? { ...a, isDefault: false } : a
          ));
        }, 0);
      }

      return updatedAddr;
    }));
  };

  const deleteAddress = (id: string) => {
    const addressToDelete = addresses.find(addr => addr.id === id);
    
    setAddresses(prev => prev.map(addr => 
      addr.id === id ? { ...addr, isActive: false, updatedAt: new Date() } : addr
    ));

    // If deleted address was default, set first remaining address as default
    if (addressToDelete?.isDefault) {
      const remainingAddresses = addresses.filter(addr => addr.id !== id && addr.isActive);
      if (remainingAddresses.length > 0) {
        setTimeout(() => {
          updateAddress(remainingAddresses[0].id, { isDefault: true });
        }, 100);
      }
    }
  };

  const setDefaultAddress = (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
      updatedAt: addr.id === id ? new Date() : addr.updatedAt,
    })));
  };

  const getAddressesByType = (type: Address["type"]): Address[] => {
    return addresses.filter(addr => addr.type === type && addr.isActive);
  };

  const validateAddress = (address: Partial<Address>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!address.title?.trim()) {
      errors.push("El título es requerido");
    }

    if (!address.fullName?.trim()) {
      errors.push("El nombre completo es requerido");
    }

    if (!address.street?.trim()) {
      errors.push("La dirección es requerida");
    }

    if (!address.city?.trim()) {
      errors.push("La ciudad es requerida");
    }

    if (!address.state?.trim()) {
      errors.push("El estado es requerido");
    }

    if (!address.zipCode?.trim()) {
      errors.push("El código postal es requerido");
    } else if (!/^\d{5}(-\d{4})?$/.test(address.zipCode)) {
      errors.push("Código postal inválido");
    }

    if (!address.country?.trim()) {
      errors.push("El país es requerido");
    }

    if (address.phone && !/^\+?[\d\s\-\(\)]+$/.test(address.phone)) {
      errors.push("Número de teléfono inválido");
    }

    if (address.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
      errors.push("Email inválido");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const searchAddresses = (query: string): Address[] => {
    const searchTerm = query.toLowerCase();
    return addresses.filter(addr => 
      addr.isActive && (
        addr.title.toLowerCase().includes(searchTerm) ||
        addr.fullName.toLowerCase().includes(searchTerm) ||
        addr.street.toLowerCase().includes(searchTerm) ||
        addr.city.toLowerCase().includes(searchTerm) ||
        addr.state.toLowerCase().includes(searchTerm)
      )
    );
  };

  const calculateDistance = (address: Address): number => {
    // Simulated distance calculation
    // In a real app, you'd use Google Maps API or similar
    if (!address.coordinates) {
      // Default distance based on city (simulation)
      const cityDistances: { [key: string]: number } = {
        "ciudad de méxico": 5,
        "guadalajara": 15,
        "monterrey": 25,
        "puebla": 12,
        "toluca": 8,
      };
      return cityDistances[address.city.toLowerCase()] || 20;
    }

    // Calculate distance from store coordinates (simulated)
    const storeCoords = { lat: 19.4326, lng: -99.1332 }; // Mexico City center
    const distance = Math.sqrt(
      Math.pow(address.coordinates.lat - storeCoords.lat, 2) +
      Math.pow(address.coordinates.lng - storeCoords.lng, 2)
    ) * 111; // Rough conversion to km

    return Math.round(distance);
  };

  const getDeliveryFee = (addressId: string): number => {
    const address = addresses.find(addr => addr.id === addressId);
    if (!address) return 0;

    const distance = calculateDistance(address);

    for (const [zone, config] of Object.entries(DELIVERY_ZONES)) {
      if (distance <= config.maxDistance) {
        return config.fee;
      }
    }

    return 200; // Outside all zones
  };

  const isInDeliveryZone = (addressId: string): boolean => {
    const address = addresses.find(addr => addr.id === addressId);
    if (!address) return false;

    const distance = calculateDistance(address);
    const maxDeliveryDistance = Math.max(...Object.values(DELIVERY_ZONES).map(z => z.maxDistance));
    
    return distance <= maxDeliveryDistance;
  };

  const value: AddressContextType = {
    addresses: addresses.filter(addr => addr.isActive),
    defaultAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getAddressesByType,
    validateAddress,
    searchAddresses,
    getDeliveryFee,
    isInDeliveryZone,
  };

  return (
    <AddressContext.Provider value={value}>
      {children}
    </AddressContext.Provider>
  );
};
