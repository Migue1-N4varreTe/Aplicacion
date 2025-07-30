import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { allProducts } from "@/lib/data";
import { useDebounce, useStableCallback } from "@/hooks/use-common-utils";
import { productCache } from "@/lib/cache-manager";
import { logger } from "@/lib/logger";

export const useCartActions = () => {
  const {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
  } = useCart();
  const { toast } = useToast();

  const addToCartWithNotification = useStableCallback((
    productId: string,
    quantity: number = 1,
    productName?: string,
  ) => {
    // Try to get product from cache first
    let product = productCache.get(productId);

    // If not in cache, find in products and cache it
    if (!product) {
      product = allProducts.find((p) => p.id === productId);
      if (product) {
        productCache.set(productId, product);
      }
    }

    if (!product) {
      toast({
        title: "Error",
        description: "Producto no encontrado",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }

    if (!product.inStock) {
      toast({
        title: "Producto agotado",
        description: `${productName || product.name} está agotado`,
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }

    const currentQuantity = getItemQuantity(productId);
    const newTotalQuantity = currentQuantity + quantity;

    if (product.stock && newTotalQuantity > product.stock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo quedan ${product.stock} unidades disponibles${currentQuantity > 0 ? `. Ya tienes ${currentQuantity} en tu carrito` : ""}`,
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }

    // Add to cart if all validations pass
    addToCart(productId, quantity);

    // Log user action
    logger.userAction('product_added_to_cart', {
      productId,
      productName: productName || product.name,
      quantity,
      currentCartSize: getItemQuantity(productId) + quantity
    });

    toast({
      title: "Producto agregado",
      description: `${productName || product.name} se agregó al carrito`,
      duration: 2000,
    });

    return true;
  }, [addToCart, getItemQuantity, toast]);

  const removeFromCartWithNotification = useStableCallback((
    productId: string,
    productName?: string,
  ) => {
    const currentQuantity = getItemQuantity(productId);

    removeFromCart(productId);

    // Log user action
    logger.userAction('product_removed_from_cart', {
      productId,
      productName,
      removedQuantity: currentQuantity
    });

    toast({
      title: "Producto eliminado",
      description: `${productName || "El producto"} se eliminó del carrito`,
      duration: 2000,
    });
  }, [removeFromCart, getItemQuantity, toast]);

  const clearCartWithConfirmation = useStableCallback(() => {
    const currentCartSize = Object.keys(cartItems || {}).length;

    clearCart();

    // Log user action
    logger.userAction('cart_cleared', {
      itemsRemoved: currentCartSize
    });

    toast({
      title: "Carrito vaciado",
      description: "Se eliminaron todos los productos del carrito",
      duration: 3000,
    });
  }, [clearCart, toast]);

  const updateQuantityWithValidation = useStableCallback((
    productId: string,
    quantity: number,
    maxStock?: number,
  ) => {
    const previousQuantity = getItemQuantity(productId);

    if (quantity < 1) {
      removeFromCart(productId);

      logger.userAction('product_quantity_updated_to_zero', {
        productId,
        previousQuantity
      });
      return;
    }

    if (maxStock && quantity > maxStock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo quedan ${maxStock} unidades disponibles`,
        variant: "destructive",
        duration: 3000,
      });

      logger.userAction('quantity_update_failed_insufficient_stock', {
        productId,
        requestedQuantity: quantity,
        maxStock,
        previousQuantity
      });
      return;
    }

    updateQuantity(productId, quantity);

    logger.userAction('product_quantity_updated', {
      productId,
      previousQuantity,
      newQuantity: quantity,
      difference: quantity - previousQuantity
    });
  }, [removeFromCart, updateQuantity, getItemQuantity, toast]);

  // Debounced version for rapid quantity changes
  const debouncedUpdateQuantity = useDebounce(updateQuantityWithValidation, 300);

  return {
    addToCartWithNotification,
    removeFromCartWithNotification,
    clearCartWithConfirmation,
    updateQuantityWithValidation,
    debouncedUpdateQuantity,
  };
};
