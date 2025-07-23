import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Star, Clock, MapPin } from "lucide-react";
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

  const handleAddToCart = async () => {
    if (!product.inStock) {
      return;
    }

    setIsAddingToCart(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Try to add to cart with validations
      const success = addToCartWithNotification(product.id, 1, product.name);

      if (!success) {
        // Error was already shown in the toast, just log for debugging
        console.log(`Failed to add ${product.name} to cart`);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
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
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
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

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
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
            ) : isInCart(product.id) ? (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                En carrito ({getItemQuantity(product.id)})
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Agregar al carrito
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
