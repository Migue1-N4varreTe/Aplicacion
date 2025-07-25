import { useState, useCallback } from "react";
import { Product } from "@/lib/data";
import { calculatePrice, formatUnit } from "@/lib/product-audit";

export interface WeightCalculation {
  quantity: number;
  unit: string;
  price: number;
  formattedUnit: string;
  isValid: boolean;
  minQuantity: number;
  maxQuantity: number;
}

export const useWeightCalculator = (product: Product) => {
  const [calculation, setCalculation] = useState<WeightCalculation>(() => {
    const initialQuantity = product.sellByWeight ? 0.5 : 1; // 500g por defecto para peso, 1 pieza para piezas
    return {
      quantity: initialQuantity,
      unit: product.unit,
      price: calculatePrice(product, initialQuantity),
      formattedUnit: formatUnit(product, initialQuantity),
      isValid: true,
      minQuantity: product.sellByWeight ? 0.1 : 1,
      maxQuantity: product.stock,
    };
  });

  const updateQuantity = useCallback((newQuantity: number) => {
    if (!product) return;

    const minQty = product.sellByWeight ? 0.1 : 1;
    const maxQty = product.stock;
    
    // Validar límites
    const validQuantity = Math.max(minQty, Math.min(newQuantity, maxQty));
    const isValid = newQuantity >= minQty && newQuantity <= maxQty;

    setCalculation({
      quantity: validQuantity,
      unit: product.unit,
      price: calculatePrice(product, validQuantity),
      formattedUnit: formatUnit(product, validQuantity),
      isValid,
      minQuantity: minQty,
      maxQuantity: maxQty,
    });
  }, [product]);

  const incrementQuantity = useCallback(() => {
    const increment = product.sellByWeight ? 0.1 : 1;
    updateQuantity(calculation.quantity + increment);
  }, [calculation.quantity, product.sellByWeight, updateQuantity]);

  const decrementQuantity = useCallback(() => {
    const decrement = product.sellByWeight ? 0.1 : 1;
    updateQuantity(calculation.quantity - decrement);
  }, [calculation.quantity, product.sellByWeight, updateQuantity]);

  const setExactQuantity = useCallback((quantity: number) => {
    updateQuantity(quantity);
  }, [updateQuantity]);

  const getQuantitySteps = useCallback(() => {
    if (product.sellByWeight) {
      // Para productos por peso, ofrecer opciones comunes
      if (product.unit === "kg") {
        return [0.25, 0.5, 1, 1.5, 2, 3, 5];
      } else if (product.unit === "gramo") {
        return [100, 250, 500, 750, 1000, 1500, 2000];
      }
    } else {
      // Para productos por pieza, ofrecer cantidades comunes
      return [1, 2, 3, 4, 5, 6, 10, 12];
    }
    return [];
  }, [product.sellByWeight, product.unit]);

  const isWeightBased = product.sellByWeight;
  const isPieceBased = !product.sellByWeight;

  return {
    calculation,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    setExactQuantity,
    getQuantitySteps,
    isWeightBased,
    isPieceBased,
  };
};

// Función de utilidad para convertir unidades
export const convertUnit = (quantity: number, fromUnit: string, toUnit: string): number => {
  // Conversiones de peso
  if (fromUnit === "gramo" && toUnit === "kg") {
    return quantity / 1000;
  }
  if (fromUnit === "kg" && toUnit === "gramo") {
    return quantity * 1000;
  }
  
  // Conversiones de volumen
  if (fromUnit === "litro" && toUnit === "ml") {
    return quantity * 1000;
  }
  if (fromUnit === "ml" && toUnit === "litro") {
    return quantity / 1000;
  }
  
  return quantity; // Sin conversión necesaria
};

// Función para obtener el texto de ayuda para el usuario
export const getQuantityHelpText = (product: Product): string => {
  if (product.sellByWeight) {
    if (product.unit === "kg") {
      return "Ingresa la cantidad en kilogramos (ej: 0.5 para 500g)";
    } else if (product.unit === "gramo") {
      return "Ingresa la cantidad en gramos (ej: 250 para 250g)";
    }
    return `Precio por ${product.unit}`;
  }
  return `Precio por ${product.unit}`;
};

// Función para validar entrada de cantidad
export const validateQuantityInput = (input: string, product: Product): { isValid: boolean; value: number; error?: string } => {
  const numericValue = parseFloat(input);
  
  if (isNaN(numericValue)) {
    return { isValid: false, value: 0, error: "Ingresa un número válido" };
  }
  
  const minQuantity = product.sellByWeight ? 0.1 : 1;
  const maxQuantity = product.stock;
  
  if (numericValue < minQuantity) {
    return { 
      isValid: false, 
      value: numericValue, 
      error: `Cantidad mínima: ${minQuantity} ${product.unit}` 
    };
  }
  
  if (numericValue > maxQuantity) {
    return { 
      isValid: false, 
      value: numericValue, 
      error: `Stock disponible: ${maxQuantity} ${product.unit}` 
    };
  }
  
  return { isValid: true, value: numericValue };
};
