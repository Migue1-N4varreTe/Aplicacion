import React, { useState, useEffect } from "react";
import {
  CreditCard,
  DollarSign,
  Smartphone,
  Receipt,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  products: {
    id: string;
    name: string;
    sku?: string;
    unit: string;
  };
}

interface CartSummary {
  total_items: number;
  subtotal: number;
  tax: number;
  total: number;
}

interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  total_points: number;
  client_code: string;
}

interface PaymentModalProps {
  cartItems: CartItem[];
  cartSummary: CartSummary;
  selectedClient: Client | null;
  onPaymentComplete: (saleData: any) => void;
  onCancel: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  cartItems,
  cartSummary,
  selectedClient,
  onPaymentComplete,
  onCancel,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [couponCode, setCouponCode] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [change, setChange] = useState(0);
  const [finalTotal, setFinalTotal] = useState(cartSummary.total);
  const { toast } = useToast();

  useEffect(() => {
    // Calcular total final con descuentos
    const discount = parseFloat(discountAmount) || 0;
    const newTotal = Math.max(0, cartSummary.total - discount);
    setFinalTotal(newTotal);

    // Calcular cambio
    const payment = parseFloat(paymentAmount) || 0;
    setChange(Math.max(0, payment - newTotal));
  }, [discountAmount, paymentAmount, cartSummary.total]);

  // Auto-completar monto para efectivo
  useEffect(() => {
    if (paymentMethod === "efectivo" && !paymentAmount) {
      setPaymentAmount(finalTotal.toString());
    }
  }, [paymentMethod, finalTotal]);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        client_id: selectedClient?.id || "",
        purchase_amount: cartSummary.total.toString(),
      });

      const response = await fetch(
        `/api/clients/coupons/validate/${couponCode}?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.is_valid) {
          setDiscountAmount(data.discount_amount.toString());
          toast({
            title: "Cupón válido",
            description: `Descuento aplicado: $${data.discount_amount.toFixed(2)}`,
          });
        } else {
          toast({
            title: "Cupón no válido",
            description: data.issues.join(", "),
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      toast({
        title: "Error",
        description: "Error al validar cupón",
        variant: "destructive",
      });
    }
  };

  const processPayment = async () => {
    // Validaciones
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Error",
        description: "Ingresa un monto de pago válido",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(paymentAmount) < finalTotal) {
      toast({
        title: "Error",
        description: "El monto pagado es insuficiente",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/sales/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          client_id: selectedClient?.id || null,
          payment_method: paymentMethod,
          payment_amount: parseFloat(paymentAmount),
          discount_amount: parseFloat(discountAmount) || 0,
          coupon_code: couponCode.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onPaymentComplete(data);
      } else {
        const error = await response.json();
        toast({
          title: "Error en el pago",
          description: error.error || "Error al procesar el pago",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Error",
        description: "Error al procesar el pago",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const paymentMethods = [
    { value: "efectivo", label: "Efectivo", icon: DollarSign },
    { value: "tarjeta", label: "Tarjeta", icon: CreditCard },
    { value: "transferencia", label: "Transferencia", icon: Smartphone },
  ];

  const quickAmounts = [
    finalTotal,
    Math.ceil(finalTotal / 10) * 10, // Redondear a la decena más cercana
    Math.ceil(finalTotal / 50) * 50, // Redondear a 50 más cercano
    Math.ceil(finalTotal / 100) * 100, // Redondear a 100 más cercano
  ].filter((amount, index, arr) => arr.indexOf(amount) === index); // Eliminar duplicados

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Resumen de la venta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Resumen de Venta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cliente */}
          {selectedClient && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <User className="w-4 h-4 text-blue-600" />
              <div>
                <div className="font-medium">{selectedClient.name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedClient.total_points} puntos disponibles
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="max-h-32 overflow-y-auto space-y-2">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.products.name}
                </span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totales */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(cartSummary.subtotal)}</span>
            </div>

            {parseFloat(discountAmount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento:</span>
                <span>-{formatCurrency(parseFloat(discountAmount))}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between font-bold text-lg">
              <span>Total a Pagar:</span>
              <span>{formatCurrency(finalTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Descuentos y cupones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Descuentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Descuento Manual</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                min="0"
                max={cartSummary.total}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coupon">Código de Cupón</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Código de cupón"
                />
                <Button
                  variant="outline"
                  onClick={validateCoupon}
                  disabled={!couponCode.trim()}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Método de pago */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Método de Pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <Button
                  key={method.value}
                  variant={
                    paymentMethod === method.value ? "default" : "outline"
                  }
                  onClick={() => setPaymentMethod(method.value)}
                  className="h-16 flex flex-col gap-1"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{method.label}</span>
                </Button>
              );
            })}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-amount">Monto Recibido</Label>
            <Input
              id="payment-amount"
              type="number"
              step="0.01"
              min="0"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="0.00"
              className="text-lg h-12"
            />
          </div>

          {/* Montos rápidos para efectivo */}
          {paymentMethod === "efectivo" && (
            <div className="space-y-2">
              <Label>Montos Rápidos</Label>
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentAmount(amount.toString())}
                    className="text-xs"
                  >
                    {formatCurrency(amount)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Cambio */}
          {change > 0 && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Cambio:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(change)}
                </span>
              </div>
            </div>
          )}

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas sobre la venta..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>

        <Button
          onClick={processPayment}
          disabled={loading || parseFloat(paymentAmount) < finalTotal}
          className="flex-1"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          ) : (
            <CreditCard className="w-4 h-4 mr-2" />
          )}
          Procesar Pago
        </Button>
      </div>
    </div>
  );
};

export default PaymentModal;
