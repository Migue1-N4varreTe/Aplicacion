import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import GuestShoppingBanner from "@/components/GuestShoppingBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  MapPin,
  Clock,
  CreditCard,
  Gift,
  Tag,
  Truck,
} from "lucide-react";
import { deliveryOptions } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useCartActions } from "@/hooks/use-cart-actions";
import { useState } from "react";

const Cart = () => {
  const { cartItems, cartProducts, cartCount, cartSubtotal } = useCart();

  const {
    updateQuantityWithValidation,
    removeFromCartWithNotification,
    clearCartWithConfirmation,
  } = useCartActions();

  const [selectedDelivery, setSelectedDelivery] = useState("express");
  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Calculate totals
  const deliveryOption = deliveryOptions.find(
    (option) => option.id === selectedDelivery,
  );
  const deliveryCost = deliveryOption?.price || 0;
  const promoDiscount = promoCode === "WELCOME10" ? cartSubtotal * 0.1 : 0;
  const total = cartSubtotal + deliveryCost - promoDiscount;

  const applyPromoCode = async () => {
    setIsApplyingPromo(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsApplyingPromo(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        {/* Empty Cart State */}
        <div className="container px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="font-sans font-bold text-2xl text-gray-900 mb-4">
              Tu carrito está vacío
            </h1>
            <p className="text-gray-600 mb-8">
              Parece que aún no has agregado productos a tu carrito. ¡Explora
              nuestra tienda y encuentra lo que necesitas!
            </p>
            <div className="space-y-4">
              <Button size="lg" className="w-full btn-gradient" asChild>
                <Link to="/shop">Explorar productos</Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link to="/offers">Ver ofertas especiales</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container px-4 py-8">
        {/* Guest Shopping Banner */}
        <div className="mb-6">
          <GuestShoppingBanner />
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/shop">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Seguir comprando
            </Link>
          </Button>
          <div>
            <h1 className="font-sans font-bold text-3xl text-gray-900">
              Mi carrito
            </h1>
            <p className="text-gray-600">
              {cartCount}{" "}
              {cartCount === 1
                ? "producto seleccionado"
                : "productos seleccionados"}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartProducts.map((item, index) => {
              const discountPercentage = item.originalPrice
                ? Math.round(
                    ((item.originalPrice - item.price) / item.originalPrice) *
                      100,
                  )
                : 0;

              return (
                <Card
                  key={item.id}
                  className={`animate-slide-in delay-${index * 100}`}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-1">
                              {item.name}
                            </h3>
                            {item.brand && (
                              <p className="text-sm text-gray-500">
                                {item.brand}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeFromCartWithNotification(item.id, item.name)
                            }
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-2 mb-3">
                          {item.inStock ? (
                            <>
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span className="text-sm text-gray-600">
                                En stock
                              </span>
                              {item.stock <= 5 && (
                                <Badge variant="outline" className="text-xs">
                                  Quedan {item.stock}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-red-500 rounded-full" />
                              <span className="text-sm text-red-600">
                                Agotado
                              </span>
                            </>
                          )}
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-gray-900">
                              ${item.price}
                            </span>
                            {item.originalPrice && (
                              <>
                                <span className="text-sm text-gray-500 line-through">
                                  ${item.originalPrice}
                                </span>
                                {discountPercentage > 0 && (
                                  <Badge className="bg-red-500 text-white text-xs">
                                    -{discountPercentage}%
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateQuantityWithValidation(
                                  item.id,
                                  item.quantity - 1,
                                )
                              }
                              disabled={!item.inStock}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateQuantityWithValidation(
                                  item.id,
                                  item.quantity + 1,
                                  item.stock,
                                )
                              }
                              disabled={
                                !item.inStock || item.quantity >= item.stock
                              }
                              className="w-8 h-8 p-0"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="mt-2 text-right">
                          <span className="text-sm text-gray-600">
                            Subtotal: ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Clear Cart */}
            <div className="text-center pt-4">
              <Button
                variant="ghost"
                onClick={clearCartWithConfirmation}
                className="text-gray-500 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Vaciar carrito
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Delivery Options */}
            <Card className="animate-fade-in delay-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-delivery-500" />
                  Método de entrega
                </h3>
                <div className="space-y-3">
                  {deliveryOptions.map((option) => (
                    <label
                      key={option.id}
                      className={cn(
                        "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors",
                        selectedDelivery === option.id
                          ? "border-brand-500 bg-brand-50"
                          : "border-gray-200 hover:border-gray-300",
                      )}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value={option.id}
                        checked={selectedDelivery === option.id}
                        onChange={(e) => setSelectedDelivery(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <div className="text-xl">{option.icon}</div>
                        <div>
                          <div className="font-medium text-sm">
                            {option.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {option.time}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-sm">
                        {option.price === 0 ? "Gratis" : `$${option.price}`}
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card className="animate-fade-in delay-300">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-green-500" />
                  Código promocional
                </h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ingresa tu código"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={applyPromoCode}
                    disabled={!promoCode || isApplyingPromo}
                    className="btn-gradient"
                  >
                    {isApplyingPromo ? "..." : "Aplicar"}
                  </Button>
                </div>
                {promoCode === "WELCOME10" && promoDiscount > 0 && (
                  <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <Gift className="w-4 h-4" />
                    ¡Código aplicado! Descuento del 10%
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Prueba el código: WELCOME10
                </p>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="animate-fade-in delay-400">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">
                  Resumen del pedido
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>
                      Subtotal ({cartCount}{" "}
                      {cartCount === 1 ? "producto" : "productos"})
                    </span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Envío ({deliveryOption?.name})</span>
                    <span>
                      {deliveryCost === 0 ? "Gratis" : `$${deliveryCost}`}
                    </span>
                  </div>

                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Descuento promocional</span>
                      <span>-${promoDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Tiempo estimado: {deliveryOption?.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>Polanco, CDMX</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  size="lg"
                  className="w-full mt-6 btn-gradient shadow-glow"
                  disabled={cartProducts.some((item) => !item?.inStock)}
                  asChild
                >
                  <Link to="/checkout">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Proceder al pago
                  </Link>
                </Button>

                {cartProducts.some((item) => !item?.inStock) && (
                  <p className="text-sm text-red-600 text-center mt-2">
                    Algunos productos no están disponibles
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
