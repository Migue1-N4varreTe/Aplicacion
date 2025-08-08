import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, allProducts } from "@/lib/data";

export interface CartItem {
  id: string;
  quantity: number;
  weight?: number; // For weight-based products
  addedAt: Date;
}

export interface CartItemWithProduct extends Omit<Product, "id"> {
  id: string;
  quantity: number;
  weight?: number; // For weight-based products
  addedAt: Date;
  calculatedPrice?: number; // Price calculated based on weight or quantity
}

interface CartContextType {
  cartItems: CartItem[];
  cartProducts: CartItemWithProduct[];
  cartCount: number;
  cartTotal: number;
  cartSubtotal: number;
  addToCart: (productId: string, quantity?: number, weight?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number, weight?: number) => void;
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
      if (!product) return null;

      // Calculate price based on weight or quantity
      let calculatedPrice = product.price;
      if (product.sellByWeight && item.weight) {
        calculatedPrice = product.price * item.weight;
      } else {
        calculatedPrice = product.price * item.quantity;
      }

      return {
        ...product,
        quantity: item.quantity,
        weight: item.weight,
        addedAt: item.addedAt,
        calculatedPrice
      };
    })
    .filter(Boolean) as CartItemWithProduct[];

  // Calculate cart metrics
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartProducts.reduce(
    (sum, item) => sum + (item.calculatedPrice || item.price * item.quantity),
    0,
  );
  const cartTotal = cartSubtotal; // Can add taxes, delivery, etc. later

  const addToCart = (productId: string, quantity: number = 1, weight?: number) => {
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

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === productId);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        // Check if new quantity exceeds available stock
        if (product.stock && newQuantity > product.stock) {
          console.error(
            `Cannot add ${quantity} more of ${productId}. Stock: ${product.stock}, Current in cart: ${existingItem.quantity}`,
          );
          return prev;
        }

        // Update quantity of existing item
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item,
        );
      } else {
        // Check if initial quantity exceeds stock
        if (product.stock && quantity > product.stock) {
          console.error(
            `Cannot add ${quantity} of ${productId}. Available stock: ${product.stock}`,
          );
          return prev;
        }

        // Add new item to cart
        return [
          ...prev,
          {
            id: productId,
            quantity,
            weight,
            addedAt: new Date(),
          },
        ];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number, weight?: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity, weight } : item,
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
