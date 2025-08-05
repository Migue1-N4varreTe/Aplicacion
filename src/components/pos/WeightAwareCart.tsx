import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ShoppingCart, 
  Scale, 
  Trash2, 
  Plus, 
  Minus,
  Weight,
  Package
} from 'lucide-react';
import DigitalScale from './DigitalScale';
import { useWeightProducts, type WeightedItem, type WeightProduct } from '@/hooks/use-weight-products';

interface WeightAwareCartProps {
  items: WeightedItem[];
  onAddItem: (item: WeightedItem) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClear: () => void;
  onCheckout: () => void;
}

const WeightAwareCart: React.FC<WeightAwareCartProps> = ({
  items,
  onAddItem,
  onUpdateQuantity,
  onRemoveItem,
  onClear,
  onCheckout
}) => {
  const [scaleProduct, setScaleProduct] = useState<WeightProduct | null>(null);
  const [isScaleOpen, setIsScaleOpen] = useState(false);
  
  const {
    calculateCartTotals,
    formatPriceDisplay,
    formatWeightDisplay,
    needsWeighing
  } = useWeightProducts();

  const totals = calculateCartTotals(items);

  // Abrir báscula para pesar producto
  const openScale = (product: WeightProduct) => {
    setScaleProduct(product);
    setIsScaleOpen(true);
  };

  // Confirmar peso y agregar al carrito
  const handleWeightConfirmed = (weight: number, totalPrice: number) => {
    if (scaleProduct) {
      const item: WeightedItem = {
        productId: scaleProduct.id,
        product: scaleProduct,
        weight: Number(weight.toFixed(3)),
        quantity: 1, // Siempre 1 para productos por peso
        unitPrice: scaleProduct.price,
        totalPrice: Number(totalPrice.toFixed(2)),
        weightUnit: scaleProduct.unit === 'g' ? 'g' : 'kg'
      };
      onAddItem(item);
    }
    setIsScaleOpen(false);
    setScaleProduct(null);
  };

  // Cerrar báscula
  const closeScale = () => {
    setIsScaleOpen(false);
    setScaleProduct(null);
  };

  // Renderizar item del carrito
  const renderCartItem = (item: WeightedItem, index: number) => {
    const isWeightProduct = item.product.sellByWeight;
    
    return (
      <div key={`${item.productId}-${index}`} className="p-3 border rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isWeightProduct ? (
                <Scale className="h-4 w-4 text-blue-500" />
              ) : (
                <Package className="h-4 w-4 text-gray-500" />
              )}
              <h4 className="font-medium text-sm">{item.product.name}</h4>
            </div>
            
            <div className="space-y-1">
              {isWeightProduct ? (
                <>
                  <p className="text-xs text-gray-600">
                    Peso: <span className="font-medium">
                      {formatWeightDisplay(item.weight, item.weightUnit)}
                    </span>
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatPriceDisplay(item.product)}
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium px-2">
                    {item.quantity}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right ml-3">
            <p className="font-bold text-green-600">
              ${item.totalPrice.toFixed(2)}
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemoveItem(item.productId)}
              className="text-red-500 hover:text-red-700 p-1 h-auto"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isWeightProduct && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
            <div className="flex items-center gap-1 text-blue-700">
              <Weight className="h-3 w-3" />
              <span>Producto pesado en báscula</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito de Ventas
            {items.length > 0 && (
              <Badge variant="secondary">
                {totals.totalItems} item{totals.totalItems !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Carrito vacío</p>
                <p className="text-xs mt-1">
                  Escanea productos o usa la báscula
                </p>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-3 py-2">
                  {items.map((item, index) => renderCartItem(item, index))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t bg-gray-50">
                {/* Resumen de pesos */}
                {totals.totalWeight > 0 && (
                  <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-blue-700">
                        <Scale className="h-4 w-4" />
                        Peso total:
                      </span>
                      <span className="font-medium text-blue-700">
                        {formatWeightDisplay(totals.totalWeight, 'kg')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Totales */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA (16%):</span>
                    <span>${totals.tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-green-600">
                      ${totals.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClear}
                    className="flex-1"
                  >
                    Limpiar
                  </Button>
                  <Button
                    onClick={onCheckout}
                    size="sm"
                    className="flex-2"
                    disabled={items.length === 0}
                  >
                    Procesar Venta
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Báscula Digital Modal */}
      {scaleProduct && (
        <DigitalScale
          product={scaleProduct}
          onWeightConfirmed={handleWeightConfirmed}
          onCancel={closeScale}
          isOpen={isScaleOpen}
        />
      )}
    </>
  );
};

export default WeightAwareCart;
