import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Wallet,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  Truck,
  Store,
} from "lucide-react";
import { deliveryOptions } from "@/lib/data";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

// Cart items now come from CartContext

interface PaymentMethod {
  id: string;
  name: string;
  type: "card" | "digital_wallet" | "cash";
  icon: React.ReactNode;
  description: string;
  fees?: number;
  available: boolean;
}

interface AddressData {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  references: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "card",
    name: "Tarjeta de crédito/débito",
    type: "card",
    icon: <CreditCard className="w-5 h-5" />,
    description: "Visa, Mastercard, American Express",
    available: true,
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    type: "digital_wallet",
    icon: <Wallet className="w-5 h-5" />,
    description: "Paga con tu cuenta de Mercado Pago",
    available: true,
  },
  {
    id: "paypal",
    name: "PayPal",
    type: "digital_wallet",
    icon: <Smartphone className="w-5 h-5" />,
    description: "Paga con tu cuenta de PayPal",
    available: true,
  },
  {
    id: "oxxo",
    name: "OXXO",
    type: "cash",
    icon: <Store className="w-5 h-5" />,
    description: "Paga en efectivo en tiendas OXXO",
    fees: 10,
    available: true,
  },
];

const Checkout = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selectedDelivery, setSelectedDelivery] = useState("express");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isGuestCheckout, setIsGuestCheckout] = useState(!isAuthenticated);
  const [guestInfo, setGuestInfo] = useState({
    email: "",
    name: "",
    phone: "",
  });

  // Form data
  const [addressData, setAddressData] = useState<AddressData>({
    street: user?.address?.street || "",
    city: user?.address?.city || "México",
    state: user?.address?.state || "CDMX",
    postalCode: user?.address?.postalCode || "",
    references: "",
  });

  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: user?.name || "",
  });

  // Initialize guest checkout for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      setIsGuestCheckout(true);
    }
  }, [isAuthenticated]);

  // Get cart data
  const { cartProducts, cartCount, cartSubtotal } = useCart();

  // Calculate totals
  const subtotal = cartSubtotal;

  const deliveryOption = deliveryOptions.find(
    (option) => option.id === selectedDelivery,
  );
  const deliveryCost = deliveryOption?.price || 0;

  const paymentMethod = paymentMethods.find((p) => p.id === selectedPayment);
  const paymentFees = paymentMethod?.fees || 0;

  const total = subtotal + deliveryCost + paymentFees;

  const handleAddressChange = (field: keyof AddressData, value: string) => {
    setAddressData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCardChange = (field: keyof typeof cardData, value: string) => {
    let formattedValue = value;

    // Format card number with spaces
    if (field === "number") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
      if (formattedValue.length > 19) return; // Max 16 digits + 3 spaces
    }

    // Format expiry date
    if (field === "expiry") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(.{2})(.{2})/, "$1/$2");
      if (formattedValue.length > 5) return;
    }

    // Format CVV
    if (field === "cvv" && value.length > 3) return;

    setCardData((prev) => ({ ...prev, [field]: formattedValue }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Address validation + guest info if needed
        const addressValid = !!(
          addressData.street &&
          addressData.city &&
          addressData.state &&
          addressData.postalCode
        );

        // If guest checkout, also validate guest info
        if (isGuestCheckout && !isAuthenticated) {
          const guestValid = !!(
            guestInfo.name &&
            guestInfo.email &&
            guestInfo.phone
          );
          return addressValid && guestValid;
        }

        return addressValid;
      case 2: // Payment validation
        if (selectedPayment === "card") {
          return !!(
            cardData.number.replace(/\s/g, "").length === 16 &&
            cardData.expiry.length === 5 &&
            cardData.cvv.length === 3 &&
            cardData.name
          );
        }
        return !!selectedPayment;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateStep(2)) return;

    setIsProcessing(true);

    try {
      // Prepare order data
      const orderData = {
        customer: isAuthenticated ? { id: user?.id } : guestInfo,
        items: cartProducts,
        address: addressData,
        delivery: deliveryOption,
        payment: {
          method: selectedPayment,
          ...(selectedPayment === "card" && { cardDetails: cardData }),
        },
        totals: {
          subtotal,
          delivery: deliveryCost,
          fees: paymentFees,
          total,
        },
        isGuest: !isAuthenticated,
      };

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear cart after successful order
      // clearCart(); // Uncomment when cart clear function is available

      // Show success message
      alert(
        `¡Pedido realizado con éxito! 🎉\n\n${isAuthenticated ? 'Puedes ver el estado de tu pedido en "Mis Pedidos"' : "Recibirás un email de confirmación en " + guestInfo.email}`,
      );

      navigate("/");
    } catch (error) {
      alert("Error procesando el pago. Inténtalo de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { number: 1, title: "Dirección", description: "Confirma tu dirección" },
    { number: 2, title: "Pago", description: "Selecciona método de pago" },
    { number: 3, title: "Confirmación", description: "Revisa tu pedido" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/cart")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al carrito
          </Button>
          <div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900">
              Finalizar pedido
            </h1>
            <p className="text-gray-600">
              Completa tu compra de {cartCount}{" "}
              {cartCount === 1 ? "producto" : "productos"}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex-1">
                <div className="flex items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                      currentStep >= step.number
                        ? "bg-brand-500 text-white"
                        : "bg-gray-200 text-gray-600",
                    )}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-4",
                        currentStep > step.number
                          ? "bg-brand-500"
                          : "bg-gray-200",
                      )}
                    />
                  )}
                </div>
                <div className="mt-2 hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Checkout Option */}
            {currentStep === 1 && (
              <Card className="animate-slide-in bg-gradient-to-r from-blue-50 to-brand-50 border-brand-200">
                <CardContent className="pt-6">
                  {!isAuthenticated && (
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="guest-checkout"
                        checked={isGuestCheckout}
                        onCheckedChange={setIsGuestCheckout}
                      />
                      <Label htmlFor="guest-checkout" className="font-medium">
                        Continuar como invitado (sin crear cuenta)
                      </Label>
                    </div>
                  )}

                  {isAuthenticated && (
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600">
                        ¡Bienvenido de vuelta! Tu información guardada se usará
                        automáticamente.
                      </p>
                    </div>
                  )}

                  {isGuestCheckout && !isAuthenticated && (
                    <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-brand-200">
                      <div className="space-y-2">
                        <Label htmlFor="guest-name">Nombre completo *</Label>
                        <Input
                          id="guest-name"
                          value={guestInfo.name}
                          onChange={(e) =>
                            setGuestInfo((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Tu nombre completo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guest-email">Email *</Label>
                        <Input
                          id="guest-email"
                          type="email"
                          value={guestInfo.email}
                          onChange={(e) =>
                            setGuestInfo((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          placeholder="tu@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guest-phone">Teléfono *</Label>
                        <Input
                          id="guest-phone"
                          value={guestInfo.phone}
                          onChange={(e) =>
                            setGuestInfo((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="(000) 000-0000"
                        />
                      </div>
                    </div>
                  )}

                  {!isGuestCheckout && !isAuthenticated && (
                    <div className="text-center pt-4 border-t border-brand-200">
                      <p className="text-sm text-gray-600 mb-4">
                        ¿Ya tienes cuenta?{" "}
                        <a
                          href="/login"
                          className="text-brand-600 hover:underline"
                        >
                          Inicia sesión aquí
                        </a>
                      </p>
                      <p className="text-xs text-gray-500">
                        O{" "}
                        <a
                          href="/register"
                          className="text-brand-600 hover:underline"
                        >
                          crea una cuenta nueva
                        </a>{" "}
                        para acceder a ofertas exclusivas
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 1: Address */}
            {currentStep === 1 && (
              <Card className="animate-slide-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-500" />
                    Dirección de entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="street">Calle y número</Label>
                      <Input
                        id="street"
                        value={addressData.street}
                        onChange={(e) =>
                          handleAddressChange("street", e.target.value)
                        }
                        placeholder="Av. Polanco 123"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={addressData.city}
                        onChange={(e) =>
                          handleAddressChange("city", e.target.value)
                        }
                        placeholder="México"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Select
                        value={addressData.state}
                        onValueChange={(value) =>
                          handleAddressChange("state", value)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CDMX">Ciudad de México</SelectItem>
                          <SelectItem value="MEX">Estado de México</SelectItem>
                          <SelectItem value="JAL">Jalisco</SelectItem>
                          <SelectItem value="NL">Nuevo León</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Código postal</Label>
                      <Input
                        id="postalCode"
                        value={addressData.postalCode}
                        onChange={(e) =>
                          handleAddressChange("postalCode", e.target.value)
                        }
                        placeholder="11550"
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="references">Referencias de entrega</Label>
                      <Textarea
                        id="references"
                        value={addressData.references}
                        onChange={(e) =>
                          handleAddressChange("references", e.target.value)
                        }
                        placeholder="Edificio azul, departamento 4B, tocar timbre"
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Delivery Options */}
                  <div className="space-y-3">
                    <Label>Método de entrega</Label>
                    {deliveryOptions.map((option) => (
                      <label
                        key={option.id}
                        className={cn(
                          "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors",
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
                              {option.description}
                            </div>
                            <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
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

                  <Button
                    onClick={handleNext}
                    className="w-full btn-gradient"
                    disabled={!validateStep(1)}
                  >
                    Continuar al pago
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <Card className="animate-slide-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-brand-500" />
                    Método de pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Methods */}
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={cn(
                          "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors",
                          selectedPayment === method.id
                            ? "border-brand-500 bg-brand-50"
                            : "border-gray-200 hover:border-gray-300",
                          !method.available && "opacity-50 cursor-not-allowed",
                        )}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={selectedPayment === method.id}
                          onChange={(e) => setSelectedPayment(e.target.value)}
                          disabled={!method.available}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-3">
                          <div className="text-brand-600">{method.icon}</div>
                          <div>
                            <div className="font-medium text-sm flex items-center gap-2">
                              {method.name}
                              {method.fees && (
                                <Badge variant="outline" className="text-xs">
                                  +${method.fees}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              {method.description}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-green-500" />
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Card Details */}
                  {selectedPayment === "card" && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <Label className="text-sm font-medium">
                        Detalles de la tarjeta
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="cardNumber" className="text-xs">
                            Número de tarjeta
                          </Label>
                          <Input
                            id="cardNumber"
                            value={cardData.number}
                            onChange={(e) =>
                              handleCardChange("number", e.target.value)
                            }
                            placeholder="1234 5678 9012 3456"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="expiry" className="text-xs">
                            Fecha de vencimiento
                          </Label>
                          <Input
                            id="expiry"
                            value={cardData.expiry}
                            onChange={(e) =>
                              handleCardChange("expiry", e.target.value)
                            }
                            placeholder="MM/AA"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv" className="text-xs">
                            CVV
                          </Label>
                          <Input
                            id="cvv"
                            value={cardData.cvv}
                            onChange={(e) =>
                              handleCardChange("cvv", e.target.value)
                            }
                            placeholder="123"
                            className="mt-1"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="cardName" className="text-xs">
                            Nombre del titular
                          </Label>
                          <Input
                            id="cardName"
                            value={cardData.name}
                            onChange={(e) =>
                              handleCardChange("name", e.target.value)
                            }
                            placeholder="Juan Pérez"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1"
                    >
                      Volver
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="flex-1 btn-gradient"
                      disabled={!validateStep(2)}
                    >
                      Revisar pedido
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <Card className="animate-slide-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Confirmar pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Summary */}
                  <div className="space-y-4">
                    {/* Guest Info */}
                    {isGuestCheckout && !isAuthenticated && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            Información del cliente:
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                          <p>
                            <strong>Nombre:</strong> {guestInfo.name}
                          </p>
                          <p>
                            <strong>Email:</strong> {guestInfo.email}
                          </p>
                          <p>
                            <strong>Teléfono:</strong> {guestInfo.phone}
                          </p>
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Dirección de entrega:</span>
                    </div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <p>{addressData.street}</p>
                      <p>
                        {addressData.city}, {addressData.state}{" "}
                        {addressData.postalCode}
                      </p>
                      {addressData.references && (
                        <p className="mt-1 text-xs">
                          Referencias: {addressData.references}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Método de entrega:</span>
                      <span className="text-sm">
                        {deliveryOption?.name} - {deliveryOption?.time}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Método de pago:</span>
                      <span className="text-sm">
                        {
                          paymentMethods.find((p) => p.id === selectedPayment)
                            ?.name
                        }
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1"
                    >
                      Volver
                    </Button>
                    <Button
                      onClick={handlePlaceOrder}
                      className="flex-1 btn-gradient shadow-glow"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          Procesando...
                        </div>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pagar ${total.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen del pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Products */}
                <div className="space-y-3">
                  {cartProducts.map((item) => {
                    if (!item) return null;
                    return (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {item.quantity}x ${item.price}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Envío</span>
                    <span>
                      {deliveryCost === 0 ? "Gratis" : `$${deliveryCost}`}
                    </span>
                  </div>
                  {paymentFees > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Comisión de pago</span>
                      <span>${paymentFees}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="p-3 bg-fresh-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-fresh-700">
                    <Truck className="w-4 h-4" />
                    <span>
                      Entrega estimada: {deliveryOption?.time || "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
