import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Scale, Plus, Minus, RotateCcw, Check } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number; // Precio por unidad de medida (ej: por kg)
  unit: string;
  sellByWeight: boolean;
}

interface DigitalScaleProps {
  product: Product;
  onWeightConfirmed: (weight: number, totalPrice: number) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const DigitalScale: React.FC<DigitalScaleProps> = ({
  product,
  onWeightConfirmed,
  onCancel,
  isOpen
}) => {
  const [weight, setWeight] = useState<number>(0);
  const [isStable, setIsStable] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [manualInput, setManualInput] = useState('');

  // Simular lectura de báscula
  const simulateWeighing = () => {
    setIsSimulating(true);
    setIsStable(false);
    
    // Simular peso variable durante pesaje
    const interval = setInterval(() => {
      const randomWeight = Math.random() * 2 + 0.1; // Entre 0.1 y 2.1 kg
      setWeight(Number(randomWeight.toFixed(3)));
    }, 100);

    // Estabilizar después de 2 segundos
    setTimeout(() => {
      clearInterval(interval);
      const finalWeight = Math.random() * 1.5 + 0.2; // Peso final estable
      setWeight(Number(finalWeight.toFixed(3)));
      setIsStable(true);
      setIsSimulating(false);
    }, 2000);
  };

  // Calcular precio total basado en peso
  const calculateTotalPrice = (currentWeight: number): number => {
    if (!product.sellByWeight) return product.price;
    
    let pricePerUnit = product.price;
    
    // Convertir precio según unidad
    if (product.unit === 'g' || product.unit === 'gramo') {
      // Si el precio está en gramos, convertir peso a gramos
      return (currentWeight * 1000) * pricePerUnit;
    } else if (product.unit === 'kg') {
      // Si el precio está por kg, usar peso directamente
      return currentWeight * pricePerUnit;
    }
    
    return currentWeight * pricePerUnit;
  };

  const totalPrice = calculateTotalPrice(weight);

  // Funciones para ajuste manual
  const adjustWeight = (amount: number) => {
    const newWeight = Math.max(0, weight + amount);
    setWeight(Number(newWeight.toFixed(3)));
    setIsStable(true);
  };

  const resetScale = () => {
    setWeight(0);
    setIsStable(false);
    setManualInput('');
  };

  const handleManualInput = (value: string) => {
    setManualInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setWeight(Number(numValue.toFixed(3)));
      setIsStable(true);
    }
  };

  const confirmWeight = () => {
    if (weight > 0) {
      onWeightConfirmed(weight, totalPrice);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Scale className="h-6 w-6" />
            Báscula Digital
          </CardTitle>
          <p className="text-sm text-gray-600">
            Pesando: <span className="font-medium">{product.name}</span>
          </p>
          <p className="text-xs text-gray-500">
            Precio: ${product.price.toFixed(2)} por {product.unit}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Display del peso */}
          <div className="text-center">
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-3xl">
              {weight.toFixed(3)} {product.unit === 'g' ? 'g' : 'kg'}
            </div>
            
            <div className="mt-2 flex justify-center">
              {isSimulating && (
                <Badge variant="outline" className="text-yellow-600">
                  Pesando...
                </Badge>
              )}
              {isStable && weight > 0 && (
                <Badge variant="default" className="text-green-600">
                  Peso estable
                </Badge>
              )}
              {weight === 0 && !isSimulating && (
                <Badge variant="secondary">
                  Esperando producto
                </Badge>
              )}
            </div>
          </div>

          {/* Precio calculado */}
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Precio total</p>
            <p className="text-2xl font-bold text-green-600">
              ${totalPrice.toFixed(2)}
            </p>
            {weight > 0 && (
              <p className="text-xs text-gray-500">
                {weight.toFixed(3)} {product.unit === 'g' ? 'g' : 'kg'} × ${product.price.toFixed(2)}/{product.unit}
              </p>
            )}
          </div>

          {/* Controles de la báscula */}
          <div className="space-y-4">
            {/* Botón de pesar automático */}
            <Button 
              onClick={simulateWeighing}
              disabled={isSimulating}
              className="w-full"
              variant="outline"
            >
              {isSimulating ? 'Pesando...' : 'Simular Pesaje Automático'}
            </Button>

            {/* Input manual */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Peso manual</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.000"
                  value={manualInput}
                  onChange={(e) => handleManualInput(e.target.value)}
                  step="0.001"
                  min="0"
                />
                <span className="flex items-center text-sm text-gray-500">
                  {product.unit === 'g' ? 'g' : 'kg'}
                </span>
              </div>
            </div>

            {/* Ajustes finos */}
            <div className="flex justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustWeight(-0.001)}
                disabled={weight <= 0}
              >
                <Minus className="h-4 w-4" />
                0.001
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustWeight(-0.01)}
                disabled={weight <= 0}
              >
                <Minus className="h-4 w-4" />
                0.01
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={resetScale}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustWeight(0.01)}
              >
                <Plus className="h-4 w-4" />
                0.01
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustWeight(0.001)}
              >
                <Plus className="h-4 w-4" />
                0.001
              </Button>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmWeight}
              disabled={weight <= 0}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              Confirmar Peso
            </Button>
          </div>

          {/* Información adicional */}
          <div className="text-xs text-gray-500 text-center">
            <p>💡 Tip: Coloque el producto en la báscula y presione "Simular Pesaje"</p>
            <p>o ingrese el peso manualmente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DigitalScale;
