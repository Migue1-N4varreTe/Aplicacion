import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Heart, ShoppingCart, Star, Clock, MapPin, Plus, Minus, Scale, Package } from "lucide-react";
import { Product } from "@/lib/data";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";
import { useCartActions } from "@/hooks/use-cart-actions";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard = ({ product, className }: ProductCardProps) => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { isInCart, getItemQuantity } = useCart();
  const { addToCartWithNotification } = useCartActions();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const [quantity, setQuantity] = useState(product.sellByWeight ? 0.5 : 1);
  const [weight, setWeight] = useState(0.5);

  const handleAddToCart = async (selectedQuantity?: number, selectedWeight?: number) => {
    if (!product.inStock) {
      return;
    }

    setIsAddingToCart(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Use selected quantity/weight or default
      const finalQuantity = selectedQuantity || (product.sellByWeight ? 1 : quantity);
      const finalWeight = product.sellByWeight ? (selectedWeight || weight) : undefined;

      // Try to add to cart with validations
      const success = addToCartWithNotification(product.id, finalQuantity, product.name, finalWeight);

      if (success) {
        setShowQuantityDialog(false);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    if (product.sellByWeight) {
      if (product.unit === "kg") {
        setWeight(Math.min(weight + 0.1, 10));
      } else {
        setWeight(Math.min(weight + 0.05, 5));
      }
    } else {
      setQuantity(Math.min(quantity + 1, product.stock || 99));
    }
  };

  const decrementQuantity = () => {
    if (product.sellByWeight) {
      if (product.unit === "kg") {
        setWeight(Math.max(weight - 0.1, 0.1));
      } else {
        setWeight(Math.max(weight - 0.05, 0.05));
      }
    } else {
      setQuantity(Math.max(quantity - 1, 1));
    }
  };

  const formatQuantityDisplay = () => {
    if (product.sellByWeight) {
      if (product.unit === "kg") {
        return `${weight.toFixed(1)} kg`;
      } else {
        return `${(weight * 1000).toFixed(0)} g`;
      }
    }
    return `${quantity} ${quantity === 1 ? 'pieza' : 'piezas'}`;
  };

  const calculatePrice = () => {
    if (product.sellByWeight) {
      return (product.price * weight).toFixed(2);
    }
    return (product.price * quantity).toFixed(2);
  };

  const toggleFavorite = () => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product.id);
    }
  };

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 sm:hover:-translate-y-1",
        "mobile-card sm:p-4",
        !product.inStock && "opacity-75",
        className,
      )}
    >
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && (
              <Badge className="bg-purple-500 hover:bg-purple-600 text-white text-xs">
                Nuevo
              </Badge>
            )}
            {product.isOffer && discountPercentage > 0 && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs">
                -{discountPercentage}%
              </Badge>
            )}
            {!product.inStock && (
              <Badge variant="secondary" className="text-xs">
                Agotado
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "absolute top-2 right-2 h-8 w-8 rounded-full backdrop-blur-sm transition-all duration-200",
              isFavorite(product.id)
                ? "bg-red-100/90 hover:bg-red-200/90 shadow-md"
                : "bg-white/80 hover:bg-white/90",
            )}
            onClick={toggleFavorite}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isFavorite(product.id)
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600",
              )}
            />
          </Button>

          {/* Stock indicator */}
          {product.inStock && product.stock <= 5 && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="outline" className="bg-white/90 text-xs">
                Últimas {product.stock} unidades
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 sm:p-4">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {product.brand}
            </p>
          )}

          {/* Name */}
          <h3 className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2 mb-2 leading-tight">
            {product.name}
          </h3>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600 ml-1">
                {product.rating}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              ({product.reviewCount})
            </span>
          </div>

          {/* Delivery Time & Aisle */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-fresh-500" />
              <span className="text-xs text-gray-600">
                {product.deliveryTime}
              </span>
            </div>
            {product.aisle && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">{product.aisle}</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-gray-900">
                ${product.price}
              </span>
              {product.unit && (
                <span className={cn(
                  "text-xs px-2 py-1 rounded font-medium",
                  product.sellByWeight
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-500"
                )}>
                  /{product.unit}
                </span>
              )}
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Weight/Piece Indicator */}
          {product.sellByWeight && (
            <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Venta por {product.unit === "kg" ? "kilogramo" : "gramos"}
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Selecciona la cantidad exacta que necesitas
              </p>
            </div>
          )}

          {/* Add to Cart Button */}
          {product.sellByWeight || isInCart(product.id) ? (
            <Dialog open={showQuantityDialog} onOpenChange={setShowQuantityDialog}>
              <DialogTrigger asChild>
                <Button
                  disabled={!product.inStock || isAddingToCart}
                  className={cn(
                    "w-full h-12 text-sm font-bold transition-all duration-200 transform hover:scale-105 shadow-lg",
                    product.inStock
                      ? product.sellByWeight
                        ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-200 border-2 border-green-300"
                        : "btn-gradient hover:shadow-glow focus:shadow-glow"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed",
                  )}
                >
                  {!product.inStock ? (
                    "Agotado"
                  ) : isInCart(product.id) ? (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Modificar ({getItemQuantity(product.id)})
                    </>
                  ) : (
                    <>
                      {product.sellByWeight && <Scale className="h-5 w-5 mr-2 animate-pulse" />}
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {product.sellByWeight ? "🎯 Seleccionar Peso" : "Agregar al carrito"}
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg border-2 border-green-200">
                <DialogHeader className={cn(
                  "p-4 rounded-t-lg",
                  product.sellByWeight ? "bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200" : "bg-blue-50"
                )}>
                  <DialogTitle className="flex items-center gap-3 text-lg">
                    {product.sellByWeight && (
                      <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full">
                        <Scale className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-gray-900">{product.name}</div>
                      {product.sellByWeight && (
                        <div className="text-sm text-green-700 font-medium">
                          🎯 Selección por {product.unit === "kg" ? "kilogramos" : "gramos"}
                        </div>
                      )}
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Product Info */}
                  <div className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border-2",
                    product.sellByWeight
                      ? "bg-gradient-to-r from-green-50 to-green-100 border-green-200"
                      : "bg-blue-50 border-blue-200"
                  )}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg border-2 border-white shadow-md"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg">{product.name}</p>
                      <p className="text-base text-gray-700 font-medium">
                        ${product.price} / {product.unit}
                      </p>
                      <Badge
                        className={cn(
                          "text-sm px-3 py-1 font-semibold",
                          product.sellByWeight
                            ? "text-green-800 bg-green-200 border border-green-300"
                            : "text-blue-800 bg-blue-200 border border-blue-300"
                        )}
                      >
                        {product.sellByWeight ? (
                          <>⚖️ Venta por {product.unit}</>
                        ) : (
                          <>📦 Venta por pieza</>
                        )}
                      </Badge>
                    </div>
                  </div>

                  {/* Quantity/Weight Selector */}
                  <div className={cn(
                    "space-y-4 p-4 rounded-lg border-2",
                    product.sellByWeight
                      ? "bg-green-50 border-green-200"
                      : "bg-blue-50 border-blue-200"
                  )}>
                    <Label className="text-base font-bold text-gray-900 flex items-center gap-2">
                      {product.sellByWeight ? (
                        <>
                          <Scale className="h-5 w-5 text-green-600" />
                          🎯 Selecciona la cantidad {product.unit === "kg" ? "(en kilogramos)" : "(en gramos)"}
                        </>
                      ) : (
                        <>
                          <Package className="h-5 w-5 text-blue-600" />
                          📦 Selecciona cantidad (piezas)
                        </>
                      )}
                    </Label>

                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={decrementQuantity}
                        disabled={
                          product.sellByWeight ?
                            weight <= (product.unit === "kg" ? 0.1 : 0.05) :
                            quantity <= 1
                        }
                        className={cn(
                          "h-14 w-14 p-0 text-xl font-bold border-2 shadow-md",
                          product.sellByWeight
                            ? "border-green-300 hover:bg-green-100 text-green-700"
                            : "border-blue-300 hover:bg-blue-100 text-blue-700"
                        )}
                      >
                        <Minus className="h-6 w-6" />
                      </Button>

                      <div className={cn(
                        "flex-1 text-center p-4 rounded-lg border-2",
                        product.sellByWeight
                          ? "bg-white border-green-300"
                          : "bg-white border-blue-300"
                      )}>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {formatQuantityDisplay()}
                        </div>
                        <div className={cn(
                          "text-lg font-semibold",
                          product.sellByWeight ? "text-green-600" : "text-blue-600"
                        )}>
                          Total: ${calculatePrice()}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="lg"
                        onClick={incrementQuantity}
                        disabled={
                          product.sellByWeight ?
                            weight >= 10 :
                            quantity >= (product.stock || 99)
                        }
                        className={cn(
                          "h-14 w-14 p-0 text-xl font-bold border-2 shadow-md",
                          product.sellByWeight
                            ? "border-green-300 hover:bg-green-100 text-green-700"
                            : "border-blue-300 hover:bg-blue-100 text-blue-700"
                        )}
                      >
                        <Plus className="h-6 w-6" />
                      </Button>
                    </div>

                    {/* Quick quantity buttons for weight products */}
                    {product.sellByWeight && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          ⚡ Selección rápida:
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {product.unit === "kg" ? (
                            <>
                              <Button
                                variant="outline"
                                onClick={() => setWeight(0.25)}
                                className={cn(
                                  "h-12 font-bold border-2 transition-all transform hover:scale-105",
                                  weight === 0.25
                                    ? "bg-green-500 text-white border-green-600 shadow-lg"
                                    : "border-green-300 hover:bg-green-100 text-green-700"
                                )}
                              >
                                🎯 250g
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setWeight(0.5)}
                                className={cn(
                                  "h-12 font-bold border-2 transition-all transform hover:scale-105",
                                  weight === 0.5
                                    ? "bg-green-500 text-white border-green-600 shadow-lg"
                                    : "border-green-300 hover:bg-green-100 text-green-700"
                                )}
                              >
                                🎯 500g
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setWeight(1)}
                                className={cn(
                                  "h-12 font-bold border-2 transition-all transform hover:scale-105",
                                  weight === 1
                                    ? "bg-green-500 text-white border-green-600 shadow-lg"
                                    : "border-green-300 hover:bg-green-100 text-green-700"
                                )}
                              >
                                🎯 1kg
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setWeight(2)}
                                className={cn(
                                  "h-12 font-bold border-2 transition-all transform hover:scale-105",
                                  weight === 2
                                    ? "bg-green-500 text-white border-green-600 shadow-lg"
                                    : "border-green-300 hover:bg-green-100 text-green-700"
                                )}
                              >
                                🎯 2kg
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                onClick={() => setWeight(0.1)}
                                className={cn(
                                  "h-12 font-bold border-2 transition-all transform hover:scale-105",
                                  weight === 0.1
                                    ? "bg-green-500 text-white border-green-600 shadow-lg"
                                    : "border-green-300 hover:bg-green-100 text-green-700"
                                )}
                              >
                                🎯 100g
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setWeight(0.25)}
                                className={cn(
                                  "h-12 font-bold border-2 transition-all transform hover:scale-105",
                                  weight === 0.25
                                    ? "bg-green-500 text-white border-green-600 shadow-lg"
                                    : "border-green-300 hover:bg-green-100 text-green-700"
                                )}
                              >
                                🎯 250g
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setWeight(0.5)}
                                className={cn(
                                  "h-12 font-bold border-2 transition-all transform hover:scale-105 col-span-2",
                                  weight === 0.5
                                    ? "bg-green-500 text-white border-green-600 shadow-lg"
                                    : "border-green-300 hover:bg-green-100 text-green-700"
                                )}
                              >
                                🎯 500g
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stock info */}
                    {product.stock && product.stock <= 5 && (
                      <p className="text-sm text-orange-600">
                        ⚠️ Solo quedan {product.stock} unidades
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowQuantityDialog(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => handleAddToCart(
                        product.sellByWeight ? 1 : quantity,
                        product.sellByWeight ? weight : undefined
                      )}
                      disabled={isAddingToCart}
                      className="flex-1 bg-fresh-500 hover:bg-fresh-600"
                    >
                      {isAddingToCart ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Agregando...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {isInCart(product.id) ? "Actualizar" : "Agregar al carrito"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button
              onClick={() => handleAddToCart()}
              disabled={!product.inStock || isAddingToCart}
              className={cn(
                "w-full h-10 sm:h-9 text-sm font-medium transition-all duration-200 mobile-btn sm:btn-auto",
                product.inStock
                  ? "btn-gradient hover:shadow-glow focus:shadow-glow"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed",
              )}
            >
              {isAddingToCart ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Agregando...
                </>
              ) : !product.inStock ? (
                <>Agotado</>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Agregar al carrito
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
