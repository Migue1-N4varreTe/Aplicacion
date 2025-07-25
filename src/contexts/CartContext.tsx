import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, allProducts } from "@/lib/data";
import { calculatePrice, formatUnit } from "@/lib/product-audit";

export interface CartItem {
  id: string;
  quantity: number;
  addedAt: Date;
  unit?: string;
  isWeightBased?: boolean;
}

export interface CartItemWithProduct extends Omit<Product, "id"> {
  id: string;
  quantity: number;
  addedAt: Date;
  unit?: string;
  isWeightBased?: boolean;
  calculatedPrice?: number;
  formattedQuantity?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartProducts: CartItemWithProduct[];
  cartCount: number;
  cartTotal: number;
  cartSubtotal: number;
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("la_economica_cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Convert addedAt strings back to Date objects
        const cartWithDates = parsedCart.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }));
        setCartItems(cartWithDates);
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        localStorage.removeItem("la_economica_cart");
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("la_economica_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Get product details for cart items
  const cartProducts: CartItemWithProduct[] = cartItems
    .map((item) => {
      const product = allProducts.find((p) => p.id === item.id);
      return product
        ? { ...product, quantity: item.quantity, addedAt: item.addedAt }
        : null;
    })
    .filter(Boolean) as CartItemWithProduct[];

  // Calculate cart metrics with weight-based pricing
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartProducts.reduce((sum, item) => {
    const product = allProducts.find(p => p.id === item.id);
    if (product) {
      return sum + calculatePrice(product, item.quantity);
    }
    return sum + item.price * item.quantity; // fallback
  }, 0);
  const cartTotal = cartSubtotal; // Can add taxes, delivery, etc. later

  const addToCart = (productId: string, quantity: number = 1) => {
    // Find the product to validate stock
    const product = allProducts.find((p) => p.id === productId);

    if (!product) {
      console.error(`Product with id ${productId} not found`);
      return;
    }

    if (!product.inStock) {
      console.error(`Product ${productId} is out of stock`);
      return;
    }

    // Set minimum quantity for weight-based products
    const minQuantity = product.sellByWeight ? 0.1 : 1;
    const validQuantity = Math.max(quantity, minQuantity);

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === productId);

      if (existingItem) {
        const newQuantity = existingItem.quantity + validQuantity;

        // Check if new quantity exceeds available stock
        if (product.stock && newQuantity > product.stock) {
          console.error(
            `Cannot add ${validQuantity} more of ${productId}. Stock: ${product.stock}, Current in cart: ${existingItem.quantity}`,
          );
          return prev;
        }

        // Update quantity of existing item
        return prev.map((item) =>
          item.id === productId ? {
            ...item,
            quantity: newQuantity,
            unit: product.unit,
            isWeightBased: product.sellByWeight
          } : item,
        );
      } else {
        // Check if initial quantity exceeds stock
        if (product.stock && validQuantity > product.stock) {
          console.error(
            `Cannot add ${validQuantity} of ${productId}. Available stock: ${product.stock}`,
          );
          return prev;
        }

        // Add new item to cart
        return [
          ...prev,
          {
            id: productId,
            quantity: validQuantity,
            addedAt: new Date(),
            unit: product.unit,
            isWeightBased: product.sellByWeight,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isInCart = (productId: string) => {
    return cartItems.some((item) => item.id === productId);
  };

  const getItemQuantity = (productId: string) => {
    const item = cartItems.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  const value: CartContextType = {
    cartItems,
    cartProducts,
    cartCount,
    cartTotal,
    cartSubtotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
