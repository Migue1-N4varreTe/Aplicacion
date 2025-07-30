import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Minus, Plus, Scale, Package } from "lucide-react";
import { Product } from "@/lib/data";
import { useCart } from "@/contexts/CartContext";
import { useCartActions } from "@/hooks/use-cart-actions";
import { formatUnit } from "@/lib/product-audit";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  product: Product;
  onAddToCart?: (quantity: number) => void;
  children: React.ReactNode;
}

const QuantitySelector = ({ product, onAddToCart, children }: QuantitySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(product.sellByWeight ? 0.5 : 1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCartWithNotification } = useCartActions();
  const { getItemQuantity } = useCart();

  // Reset quantity when dialog opens
  useEffect(() => {
    if (open) {
      const currentQuantity = getItemQuantity(product.id);
      if (currentQuantity > 0) {
        setQuantity(currentQuantity);
      } else {
        if (product.sellByWeight) {
          if (product.unit === "kg") {
            setQuantity(0.5);
          } else if (product.unit === "gramo") {
            setQuantity(250);
          } else {
            setQuantity(0.5);
          }
        } else {
          setQuantity(1);
        }
      }
    }
  }, [open, product.id, product.sellByWeight, product.unit, getItemQuantity]);

  const handleQuantityChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      if (product.sellByWeight) {
        if (product.unit === "kg") {
          // Para productos por kg, permitir decimales con hasta 1 decimal
          setQuantity(Math.max(0.1, Math.round(numValue * 10) / 10));
        } else if (product.unit === "gramo") {
          // Para productos por gramo, solo números enteros
          setQuantity(Math.max(100, Math.round(numValue)));
        } else {
          setQuantity(Math.max(0.1, Math.round(numValue * 1000) / 1000));
        }
      } else {
        // Para productos por pieza, solo enteros
        setQuantity(Math.max(1, Math.floor(numValue)));
      }
    }
  };

  const incrementQuantity = () => {
    if (product.sellByWeight) {
      if (product.unit === "kg") {
        setQuantity(prev => Math.round((prev + 0.1) * 10) / 10);
      } else if (product.unit === "gramo") {
        setQuantity(prev => prev + 50);
      } else {
        setQuantity(prev => Math.round((prev + 0.1) * 10) / 10);
      }
    } else {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (product.sellByWeight) {
      if (product.unit === "kg") {
        setQuantity(prev => Math.max(0.1, Math.round((prev - 0.1) * 10) / 10));
      } else if (product.unit === "gramo") {
        setQuantity(prev => Math.max(100, prev - 50));
      } else {
        setQuantity(prev => Math.max(0.1, Math.round((prev - 0.1) * 10) / 10));
      }
    } else {
      setQuantity(prev => Math.max(1, prev - 1));
    }
  };

  const handleAddToCart = async () => {
    if (!product.inStock || quantity <= 0) return;

    setIsAddingToCart(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      const success = addToCartWithNotification(product.id, quantity, product.name);
      
      if (success && onAddToCart) {
        onAddToCart(quantity);
      }

      if (success) {
        setOpen(false);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const calculatePrice = () => {
    if (product.sellByWeight) {
      if (product.unit === "gramo") {
        // El precio está por kg, convertir gramos a kg
        return (product.price * quantity) / 1000;
      } else if (product.unit === "kg") {
        return product.price * quantity;
      }
    }
    return product.price * quantity;
  };

  const getStepValue = () => {
    if (product.sellByWeight) {
      if (product.unit === "kg") return "0.1";
      if (product.unit === "gramo") return "50";
      return "0.1";
    }
    return "1";
  };

  const getMinValue = () => {
    if (product.sellByWeight) {
      if (product.unit === "kg") return "0.1";
      if (product.unit === "gramo") return "100";
      return "0.1";
    }
    return "1";
  };

  const formatQuantityDisplay = () => {
    if (product.sellByWeight) {
      if (product.unit === "kg") {
        return quantity < 1 ? `${Math.round(quantity * 1000)}g` : `${quantity.toFixed(1)}kg`;
      }
      if (product.unit === "gramo") {
        if (quantity >= 1000) {
          return `${(quantity / 1000).toFixed(1)}kg`;
        }
        return `${Math.round(quantity)}g`;
      }
      return `${quantity.toFixed(1)} ${product.unit}`;
    }
    return `${quantity} ${quantity === 1 ? product.unit : product.unit + 's'}`;
  };

  const isStockAvailable = () => {
    if (!product.stock) return true;
    return quantity <= product.stock;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {product.sellByWeight ? (
              <Scale className="h-5 w-5 text-green-600" />
            ) : (
              <Package className="h-5 w-5 text-blue-600" />
            )}
            Seleccionar cantidad
          </DialogTitle>
          <DialogDescription>
            Elige la cantidad de <strong>{product.name}</strong> que deseas agregar al carrito.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <img
              src={product.image}
              alt={product.name}
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1">
              <h4 className="font-medium text-sm">{product.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-gray-900">
                  ${product.price}
                </span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    product.sellByWeight 
                      ? "text-green-700 bg-green-50" 
                      : "text-blue-700 bg-blue-50"
                  )}
                >
                  por {product.unit}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-3">
            <Label htmlFor="quantity" className="text-sm font-medium">
              Cantidad {product.sellByWeight && product.unit === "kg" && "(en kg/gramos)"}
              {product.sellByWeight && product.unit === "gramo" && "(en gramos)"}
            </Label>
            
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={decrementQuantity}
                disabled={quantity <= (product.sellByWeight ? (product.unit === "gramo" ? 100 : 0.1) : 1)}
                className="h-10 w-10 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                step={getStepValue()}
                min={getMinValue()}
                max={product.stock || undefined}
                className="text-center h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={incrementQuantity}
                disabled={product.stock ? quantity >= product.stock : false}
                className="h-10 w-10 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick quantity buttons for weight products */}
            {product.sellByWeight && (
              <div className="flex gap-2 flex-wrap">
                {product.unit === "kg" && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(0.25)}
                      className="text-xs"
                    >
                      250g
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(0.5)}
                      className="text-xs"
                    >
                      500g
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(1)}
                      className="text-xs"
                    >
                      1kg
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(2)}
                      className="text-xs"
                    >
                      2kg
                    </Button>
                  </>
                )}
                {product.unit === "gramo" && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(100)}
                      className="text-xs"
                    >
                      100g
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(250)}
                      className="text-xs"
                    >
                      250g
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(500)}
                      className="text-xs"
                    >
                      500g
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(1000)}
                      className="text-xs"
                    >
                      1kg
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Quantity Display */}
            <div className="text-center p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Cantidad seleccionada: </span>
              <span className="font-medium">{formatQuantityDisplay()}</span>
            </div>
          </div>

          {/* Price Calculation */}
          <div className="flex items-center justify-between p-3 bg-brand-50 rounded-lg">
            <span className="text-sm text-gray-700">Total a pagar:</span>
            <span className="text-lg font-bold text-brand-600">
              ${calculatePrice().toFixed(2)}
            </span>
          </div>

          {/* Stock Warning */}
          {!isStockAvailable() && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                Solo quedan {product.stock} unidades disponibles.
              </p>
            </div>
          )}

          {/* Stock Info */}
          {product.stock && product.stock <= 10 && isStockAvailable() && (
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                {product.stock <= 5 ? "⚠️ " : ""}
                {product.stock} unidades disponibles
              </Badge>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock || quantity <= 0 || !isStockAvailable() || isAddingToCart}
            className="w-full h-12"
          >
            {isAddingToCart ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Agregando...
              </>
            ) : !product.inStock ? (
              "Producto agotado"
            ) : !isStockAvailable() ? (
              "Stock insuficiente"
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Agregar al carrito
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuantitySelector;
