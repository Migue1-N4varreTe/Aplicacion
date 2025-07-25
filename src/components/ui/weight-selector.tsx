import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Scale, Package } from "lucide-react";
import { Product } from "@/lib/data";
import { useWeightCalculator } from "@/hooks/use-weight-calculator";
import { cn } from "@/lib/utils";

interface WeightSelectorProps {
  product: Product;
  onQuantityChange: (quantity: number) => void;
  initialQuantity?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const WeightSelector: React.FC<WeightSelectorProps> = ({
  product,
  onQuantityChange,
  initialQuantity,
  className,
  size = "md",
}) => {
  const {
    calculation,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    setExactQuantity,
    getQuantitySteps,
    isWeightBased,
  } = useWeightCalculator(product);

  const [inputValue, setInputValue] = useState(
    initialQuantity?.toString() || calculation.quantity.toString()
  );

  React.useEffect(() => {
    if (initialQuantity && initialQuantity !== calculation.quantity) {
      updateQuantity(initialQuantity);
      setInputValue(initialQuantity.toString());
    }
  }, [initialQuantity, updateQuantity]);

  React.useEffect(() => {
    onQuantityChange(calculation.quantity);
  }, [calculation.quantity, onQuantityChange]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue > 0) {
      updateQuantity(numericValue);
    }
  };

  const handleStepClick = (step: number) => {
    setExactQuantity(step);
    setInputValue(step.toString());
  };

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const buttonSizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  return (
    <Card className={cn("border-none shadow-none bg-gray-50", className)}>
      <CardContent className="p-3">
        {/* Header with icon and unit */}
        <div className="flex items-center gap-2 mb-3">
          {isWeightBased ? (
            <Scale className="h-4 w-4 text-green-600" />
          ) : (
            <Package className="h-4 w-4 text-blue-600" />
          )}
          <Label className={cn("font-medium", sizeClasses[size])}>
            {isWeightBased ? "Cantidad por peso" : "Cantidad"}
          </Label>
          <Badge 
            variant="outline" 
            className={cn("text-xs", isWeightBased ? "border-green-200 text-green-700" : "border-blue-200 text-blue-700")}
          >
            {product.unit}
          </Badge>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            className={cn(buttonSizeClasses[size], "flex-shrink-0")}
            onClick={decrementQuantity}
            disabled={calculation.quantity <= calculation.minQuantity}
          >
            <Minus className="h-3 w-3" />
          </Button>

          <div className="flex-1 relative">
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              className={cn("text-center font-medium", sizeClasses[size])}
              step={isWeightBased ? "0.1" : "1"}
              min={calculation.minQuantity}
              max={calculation.maxQuantity}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className={cn(buttonSizeClasses[size], "flex-shrink-0")}
            onClick={incrementQuantity}
            disabled={calculation.quantity >= calculation.maxQuantity}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Quick Selection Steps */}
        {getQuantitySteps().length > 0 && (
          <div className="mb-3">
            <Label className={cn("text-xs text-gray-600 mb-2 block")}>
              Cantidades comunes:
            </Label>
            <div className="flex flex-wrap gap-1">
              {getQuantitySteps().map((step) => (
                <Button
                  key={step}
                  variant={calculation.quantity === step ? "default" : "outline"}
                  size="sm"
                  className={cn("text-xs h-6 px-2", 
                    calculation.quantity === step && (isWeightBased ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700")
                  )}
                  onClick={() => handleStepClick(step)}
                  disabled={step > calculation.maxQuantity}
                >
                  {step} {product.unit}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Price Display */}
        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <div>
              <p className={cn("font-medium", sizeClasses[size])}>
                {calculation.formattedUnit}
              </p>
              <p className="text-xs text-gray-600">
                ${product.price.toFixed(2)} por {product.unit}
              </p>
            </div>
            <div className="text-right">
              <p className={cn("font-bold text-green-600", sizeClasses[size])}>
                ${calculation.price.toFixed(2)}
              </p>
              {!calculation.isValid && (
                <p className="text-xs text-red-500">Cantidad no válida</p>
              )}
            </div>
          </div>
        </div>

        {/* Stock Warning */}
        {calculation.quantity > calculation.maxQuantity * 0.8 && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-700">
              ⚠️ Quedan solo {calculation.maxQuantity} {product.unit} disponibles
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeightSelector;
