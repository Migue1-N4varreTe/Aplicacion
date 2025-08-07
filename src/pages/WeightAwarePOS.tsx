import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Scale, 
  Package, 
  Scan,
  Grid3X3,
  List,
  Filter,
  Weight
} from 'lucide-react';
import WeightAwareCart from '@/components/pos/WeightAwareCart';
import DigitalScale from '@/components/pos/DigitalScale';
import { useWeightProducts, type WeightedItem, type WeightProduct } from '@/hooks/use-weight-products';

// Productos de ejemplo con soporte para peso
const sampleProducts: WeightProduct[] = [
  {
    id: '1',
    name: 'Manzanas Rojas',
    price: 45.50,
    unit: 'kg',
    sellByWeight: true,
    stock_quantity: 100,
    category: 'Frutas y Verduras',
    description: 'Manzanas rojas frescas'
  },
  {
    id: '2',
    name: 'Plátanos',
    price: 28.00,
    unit: 'kg',
    sellByWeight: true,
    stock_quantity: 80,
    category: 'Frutas y Verduras'
  },
  {
    id: '3',
    name: 'Queso Manchego',
    price: 0.25,
    unit: 'g',
    sellByWeight: true,
    stock_quantity: 50,
    category: 'Lácteos',
    description: 'Queso manchego curado, precio por gramo'
  },
  {
    id: '4',
    name: 'Coca Cola 600ml',
    price: 25.00,
    unit: 'pieza',
    sellByWeight: false,
    stock_quantity: 150,
    category: 'Bebidas'
  },
  {
    id: '5',
    name: 'Pan Blanco',
    price: 35.00,
    unit: 'pieza',
    sellByWeight: false,
    stock_quantity: 25,
    category: 'Panadería'
  },
  {
    id: '6',
    name: 'Carne Molida',
    price: 180.00,
    unit: 'kg',
    sellByWeight: true,
    stock_quantity: 20,
    category: 'Carnes'
  }
];

const WeightAwarePOS: React.FC = () => {
  const [products, setProducts] = useState<WeightProduct[]>(sampleProducts);
  const [cartItems, setCartItems] = useState<WeightedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [scaleProduct, setScaleProduct] = useState<WeightProduct | null>(null);
  const [isScaleOpen, setIsScaleOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [barcodeInput, setBarcodeInput] = useState('');

  const {
    needsWeighing,
    createWeightedItem,
    formatPriceDisplay,
    formatWeightDisplay,
    calculateWeightPrice
  } = useWeightProducts();

  // Categorías disponibles
  const categories = [
    'all',
    ...new Set(products.map(p => p.category).filter(Boolean))
  ];

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Agregar producto al carrito
  const addToCart = (product: WeightProduct, weight?: number) => {
    if (needsWeighing(product) && !weight) {
      // Abrir báscula para productos por peso
      openScale(product);
      return;
    }

    const finalWeight = weight || 1; // 1 para productos normales
    const item = createWeightedItem(product, finalWeight);
    
    // Verificar si el producto ya está en el carrito
    const existingIndex = cartItems.findIndex(item => 
      item.productId === product.id && 
      (!product.sellByWeight || item.weight === finalWeight)
    );

    if (existingIndex >= 0 && !product.sellByWeight) {
      // Actualizar cantidad para productos normales
      const updatedItems = [...cartItems];
      updatedItems[existingIndex].quantity += 1;
      updatedItems[existingIndex].totalPrice = 
        updatedItems[existingIndex].quantity * updatedItems[existingIndex].unitPrice;
      setCartItems(updatedItems);
    } else {
      // Agregar nuevo item
      setCartItems([...cartItems, item]);
    }
  };

  // Actualizar cantidad en carrito
  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedItems = cartItems.map(item => {
      if (item.productId === productId && !item.product.sellByWeight) {
        const newTotalPrice = quantity * item.unitPrice;
        return { ...item, quantity, totalPrice: newTotalPrice };
      }
      return item;
    });
    setCartItems(updatedItems);
  };

  // Remover del carrito
  const removeFromCart = (productId: string) => {
    setCartItems(cartItems.filter(item => item.productId !== productId));
  };

  // Limpiar carrito
  const clearCart = () => {
    setCartItems([]);
  };

  // Abrir báscula
  const openScale = (product: WeightProduct) => {
    setScaleProduct(product);
    setIsScaleOpen(true);
  };

  // Confirmar peso de báscula
  const handleWeightConfirmed = (weight: number, totalPrice: number) => {
    if (scaleProduct) {
      addToCart(scaleProduct, weight);
    }
    closeScale();
  };

  // Cerrar báscula
  const closeScale = () => {
    setIsScaleOpen(false);
    setScaleProduct(null);
  };

  // Procesar venta
  const handleCheckout = () => {
    console.log('Procesando venta:', cartItems);
    // Aquí iría la lógica de checkout
    alert(`Venta procesada: ${cartItems.length} productos`);
    clearCart();
  };

  // Buscar por código de barras
  const handleBarcodeSearch = (barcode: string) => {
    const product = products.find(p => p.id === barcode || p.name.includes(barcode));
    if (product) {
      addToCart(product);
      setBarcodeInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen max-h-screen">
          
          {/* Panel de Productos */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Header */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-6 w-6 text-blue-600" />
                  POS con Sistema de Pesaje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Búsqueda y código de barras */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="relative">
                    <Scan className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Código de barras..."
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleBarcodeSearch(barcodeInput);
                        }
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filtros y vista */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="border rounded px-3 py-1 text-sm"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'Todas las categorías' : category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grid de productos */}
            <Card className="flex-1">
              <CardContent className="p-4 h-full">
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 h-full overflow-auto"
                    : "space-y-3 h-full overflow-auto"
                }>
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className={`
                        border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer
                        ${viewMode === 'list' ? 'flex items-center gap-4' : ''}
                      `}
                      onClick={() => addToCart(product)}
                    >
                      <div className={`
                        ${viewMode === 'grid' ? 'space-y-2' : 'flex-1 space-y-1'}
                      `}>
                        <div className="flex items-center gap-2">
                          {needsWeighing(product) ? (
                            <Scale className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Package className="h-4 w-4 text-gray-500" />
                          )}
                          <h3 className="font-medium text-sm">{product.name}</h3>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-green-600">
                            {formatPriceDisplay(product)}
                          </p>
                          
                          {product.category && (
                            <Badge variant="secondary" className="text-xs">
                              {product.category}
                            </Badge>
                          )}
                          
                          {needsWeighing(product) && (
                            <div className="flex items-center gap-1 text-blue-600 text-xs">
                              <Weight className="h-3 w-3" />
                              <span>Requiere pesaje</span>
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-500">
                            Stock: {product.stock_quantity} {product.unit}
                          </p>
                        </div>
                      </div>

                      {viewMode === 'list' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                        >
                          {needsWeighing(product) ? 'Pesar' : 'Agregar'}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel del Carrito */}
          <div className="lg:col-span-1">
            <WeightAwareCart
              items={cartItems}
              onAddItem={(item) => setCartItems([...cartItems, item])}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              onClear={clearCart}
              onCheckout={handleCheckout}
            />
          </div>
        </div>

        {/* Báscula Modal */}
        {scaleProduct && (
          <DigitalScale
            product={scaleProduct}
            onWeightConfirmed={handleWeightConfirmed}
            onCancel={closeScale}
            isOpen={isScaleOpen}
          />
        )}
      </div>
    </div>
  );
};

export default WeightAwarePOS;
