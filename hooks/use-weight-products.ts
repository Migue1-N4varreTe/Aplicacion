import { useState, useCallback } from 'react';

export interface WeightProduct {
  id: string;
  name: string;
  price: number; // Precio por unidad (kg, g, etc.)
  unit: 'kg' | 'g' | 'pieza' | 'litro' | 'ml';
  sellByWeight: boolean;
  stock_quantity?: number;
  description?: string;
  image_url?: string;
  category?: string;
}

export interface WeightedItem {
  productId: string;
  product: WeightProduct;
  weight: number; // Peso real pesado
  quantity: number; // Para productos normales, o 1 para productos por peso
  unitPrice: number; // Precio por unidad
  totalPrice: number; // Precio total calculado
  weightUnit: string; // Unidad del peso (kg, g)
}

export interface WeightCalculation {
  weight: number;
  unitPrice: number;
  totalPrice: number;
  pricePerDisplayUnit: number; // Para mostrar precio por kg/g
}

export const useWeightProducts = () => {
  const [activeScale, setActiveScale] = useState<string | null>(null);

  // Calcular precio basado en peso
  const calculateWeightPrice = useCallback((
    product: WeightProduct, 
    weight: number
  ): WeightCalculation => {
    if (!product.sellByWeight) {
      // Para productos normales, el precio es fijo
      return {
        weight,
        unitPrice: product.price,
        totalPrice: product.price,
        pricePerDisplayUnit: product.price
      };
    }

    let calculatedPrice = 0;
    let pricePerDisplayUnit = product.price;

    switch (product.unit) {
      case 'kg':
        // Precio está por kg, peso en kg
        calculatedPrice = weight * product.price;
        pricePerDisplayUnit = product.price;
        break;
      
      case 'g':
        // Precio está por gramo, peso en kg (convertir)
        calculatedPrice = (weight * 1000) * product.price;
        pricePerDisplayUnit = product.price * 1000; // Mostrar precio por kg
        break;
      
      default:
        // Para otros casos, usar el precio tal como está
        calculatedPrice = weight * product.price;
        pricePerDisplayUnit = product.price;
    }

    return {
      weight,
      unitPrice: product.price,
      totalPrice: Number(calculatedPrice.toFixed(2)),
      pricePerDisplayUnit: Number(pricePerDisplayUnit.toFixed(2))
    };
  }, []);

  // Crear item con peso para el carrito
  const createWeightedItem = useCallback((
    product: WeightProduct,
    weight: number
  ): WeightedItem => {
    const calculation = calculateWeightPrice(product, weight);
    
    return {
      productId: product.id,
      product,
      weight: Number(weight.toFixed(3)),
      quantity: product.sellByWeight ? 1 : Math.round(weight), // 1 para peso, cantidad para piezas
      unitPrice: calculation.unitPrice,
      totalPrice: calculation.totalPrice,
      weightUnit: product.unit === 'g' ? 'g' : 'kg'
    };
  }, [calculateWeightPrice]);

  // Formatear precio para mostrar
  const formatPriceDisplay = useCallback((
    product: WeightProduct,
    calculation?: WeightCalculation
  ): string => {
    if (!product.sellByWeight) {
      return `$${product.price.toFixed(2)} c/u`;
    }

    const displayPrice = calculation?.pricePerDisplayUnit || product.price;
    const displayUnit = product.unit === 'g' ? 'kg' : product.unit;
    
    return `$${displayPrice.toFixed(2)}/${displayUnit}`;
  }, []);

  // Formatear peso para mostrar
  const formatWeightDisplay = useCallback((
    weight: number,
    unit: string
  ): string => {
    if (unit === 'g' && weight < 1) {
      return `${(weight * 1000).toFixed(0)}g`;
    }
    return `${weight.toFixed(3)}kg`;
  }, []);

  // Validar si un producto necesita pesaje
  const needsWeighing = useCallback((product: WeightProduct): boolean => {
    return product.sellByWeight || false;
  }, []);

  // Abrir báscula para un producto
  const openScale = useCallback((productId: string) => {
    setActiveScale(productId);
  }, []);

  // Cerrar báscula
  const closeScale = useCallback(() => {
    setActiveScale(null);
  }, []);

  // Calcular totales del carrito con productos por peso
  const calculateCartTotals = useCallback((items: WeightedItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.16; // 16% IVA
    const total = subtotal + tax;

    const totalWeight = items
      .filter(item => item.product.sellByWeight)
      .reduce((sum, item) => sum + item.weight, 0);

    const totalItems = items.reduce((sum, item) => {
      return sum + (item.product.sellByWeight ? 1 : item.quantity);
    }, 0);

    return {
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
      totalWeight: Number(totalWeight.toFixed(3)),
      totalItems,
      itemsCount: items.length
    };
  }, []);

  // Convertir unidades de peso
  const convertWeight = useCallback((
    weight: number,
    fromUnit: string,
    toUnit: string
  ): number => {
    // Convertir todo a kg primero
    let weightInKg = weight;
    if (fromUnit === 'g') {
      weightInKg = weight / 1000;
    }

    // Convertir de kg a la unidad objetivo
    if (toUnit === 'g') {
      return weightInKg * 1000;
    }
    return weightInKg;
  }, []);

  // Validar peso mínimo y máximo
  const validateWeight = useCallback((
    product: WeightProduct,
    weight: number
  ): { isValid: boolean; message?: string } => {
    if (weight <= 0) {
      return { isValid: false, message: 'El peso debe ser mayor a 0' };
    }

    if (weight > 50) {
      return { isValid: false, message: 'Peso excesivo (máx. 50kg)' };
    }

    if (product.unit === 'g' && weight > 5) {
      return { isValid: false, message: 'Peso excesivo para productos en gramos' };
    }

    return { isValid: true };
  }, []);

  return {
    // Estado
    activeScale,
    
    // Funciones de cálculo
    calculateWeightPrice,
    createWeightedItem,
    calculateCartTotals,
    
    // Funciones de formato
    formatPriceDisplay,
    formatWeightDisplay,
    
    // Funciones de utilidad
    needsWeighing,
    openScale,
    closeScale,
    convertWeight,
    validateWeight
  };
};

export default useWeightProducts;
