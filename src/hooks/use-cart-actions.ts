import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { allProducts } from "@/lib/data";

export const useCartActions = () => {
  const {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
  } = useCart();
  const { toast } = useToast();

  const addToCartWithNotification = (
    productId: string,
    quantity: number = 1,
    productName?: string,
    weight?: number,
  ) => {
    // Find the product to validate before adding
    const product = allProducts.find((p) => p.id === productId);

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
    addToCart(productId, quantity, weight);

    const description = product.sellByWeight && weight
      ? `${productName || product.name} (${weight} ${product.unit}) se agregó al carrito`
      : `${productName || product.name} se agregó al carrito`;

    toast({
      title: "Producto agregado",
      description,
      duration: 2000,
    });

    return true;
  };

  const removeFromCartWithNotification = (
    productId: string,
    productName?: string,
  ) => {
    removeFromCart(productId);
    toast({
      title: "Producto eliminado",
      description: `${productName || "El producto"} se eliminó del carrito`,
      duration: 2000,
    });
  };

  const clearCartWithConfirmation = () => {
    clearCart();
    toast({
      title: "Carrito vaciado",
      description: "Se eliminaron todos los productos del carrito",
      duration: 3000,
    });
  };

  const updateQuantityWithValidation = (
    productId: string,
    quantity: number,
    maxStock?: number,
    weight?: number,
  ) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    if (maxStock && quantity > maxStock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo quedan ${maxStock} unidades disponibles`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    updateQuantity(productId, quantity, weight);
  };

  return {
    addToCartWithNotification,
    removeFromCartWithNotification,
    clearCartWithConfirmation,
    updateQuantityWithValidation,
  };
};
