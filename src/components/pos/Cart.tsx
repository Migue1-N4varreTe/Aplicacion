import React from "react";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
    stock_quantity: number;
  };
}

interface CartSummary {
  total_items: number;
  subtotal: number;
  tax: number;
  total: number;
}

interface CartProps {
  items: CartItem[];
  summary: CartSummary;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({
  items,
  summary,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Carrito ({summary.total_items})
          </CardTitle>

          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearCart}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Lista de items */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                Carrito vacío
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Agrega productos para comenzar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm leading-tight">
                        {item.products.name}
                      </h4>
                      {item.products.sku && (
                        <p className="text-xs text-muted-foreground">
                          SKU: {item.products.sku}
                        </p>
                      )}
                      <div className="text-sm font-semibold mt-1">
                        {formatCurrency(item.unit_price)} / {item.products.unit}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700 ml-2"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="h-7 w-7 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>

                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.products.stock_quantity}
                        className="h-7 w-7 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(item.subtotal)}
                      </div>
                      {item.quantity >= item.products.stock_quantity && (
                        <Badge variant="destructive" className="text-xs mt-1">
                          Stock máximo
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen y botón de pago */}
        {items.length > 0 && (
          <div className="border-t bg-gray-50 p-6 space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(summary.subtotal)}</span>
              </div>

              {summary.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span>IVA:</span>
                  <span>{formatCurrency(summary.tax)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(summary.total)}</span>
              </div>
            </div>

            <Button
              onClick={onCheckout}
              className="w-full h-12 text-lg"
              size="lg"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Procesar Pago (F3)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Cart;
