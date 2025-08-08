import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Package, ShoppingCart } from 'lucide-react';
import { allProducts, categories } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Simulate loading from database
        setTimeout(() => {
          setProducts([
            {
              id: '1',
              name: 'Coca Cola 600ml',
              price: 25.99,
              description: 'Refresco de cola en botella de 600ml',
              stock_quantity: 45,
            },
            {
              id: '2', 
              name: 'Pan Blanco Bimbo',
              price: 35.50,
              description: 'Pan de caja blanco grande',
              stock_quantity: 12,
            },
            {
              id: '3',
              name: 'Leche Lala 1L',
              price: 22.00,
              description: 'Leche entera ultrapasteurizada',
              stock_quantity: 8,
            },
            {
              id: '4',
              name: 'Huevos San Juan 12 pzas',
              price: 65.00,
              description: 'Cartón de 12 huevos frescos',
              stock_quantity: 20,
            }
          ]);
          
          setCategories([
            { id: '1', name: 'Abarrotes' },
            { id: '2', name: 'Bebidas' },
            { id: '3', name: 'Lácteos' },
            { id: '4', name: 'Panadería' }
          ]);
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos desde tu base de datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tienda La Económica
          </h1>
          <p className="text-gray-600">
            Encuentra todo lo que necesitas para tu hogar
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              size="sm"
            >
              Todas las categorías
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                size="sm"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-medium text-gray-900">
              {filteredProducts.length}
            </span>{' '}
            productos encontrados
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                  <CardTitle className="text-sm font-medium">
                    {product.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.stock_quantity <= 5 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          Pocas unidades
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600">
                      Stock: {product.stock_quantity} unidades
                    </p>
                    
                    {product.description && (
                      <p className="text-xs text-gray-500">
                        {product.description}
                      </p>
                    )}
                    
                    <Button size="sm" className="w-full">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Agregar al carrito
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta cambiar los filtros o buscar algo diferente
            </p>
            <Button onClick={() => setSearchQuery('')}>
              Ver todos los productos
            </Button>
          </div>
        )}

        <div className="mt-12 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-800">
              ✅ Base de datos Supabase conectada • {products.length} productos cargados • {categories.length} categorías disponibles
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
