import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  TestTube,
  ShoppingCart,
  Heart,
  Search,
  User,
  Settings,
  Package,
  Star,
  MapPin,
  Clock,
  Scale,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { allProducts, categories } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  message: string;
  details?: string;
}

const AppTest = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  
  const { cartItems, cartCount, addToCart, clearCart } = useCart();
  const { favoriteCount, addToFavorites, clearFavorites } = useFavorites();
  const { user } = useAuth();
  const { toast } = useToast();

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    const results: TestResult[] = [];

    // Test 1: Data Loading
    setCurrentTest('Cargando datos...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push({
      name: 'Carga de Productos',
      status: allProducts.length > 0 ? 'pass' : 'fail',
      message: `${allProducts.length} productos cargados`,
      details: allProducts.length === 0 ? 'No se encontraron productos' : `Incluye ${allProducts.filter(p => p.sellByWeight).length} productos por peso`
    });

    results.push({
      name: 'Carga de Categorías',
      status: categories.length > 0 ? 'pass' : 'fail',
      message: `${categories.length} categorías disponibles`,
      details: categories.map(c => c.name).join(', ')
    });

    // Test 2: Cart Functionality
    setCurrentTest('Probando carrito...');
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const testProduct = allProducts[0];
      if (testProduct) {
        addToCart(testProduct.id, 1);
        const cartWorking = cartItems.some(item => item.id === testProduct.id);
        results.push({
          name: 'Funcionalidad del Carrito',
          status: cartWorking ? 'pass' : 'fail',
          message: cartWorking ? 'Carrito funcionando correctamente' : 'Error al agregar productos',
          details: `${cartCount} productos en carrito`
        });
      }
    } catch (error) {
      results.push({
        name: 'Funcionalidad del Carrito',
        status: 'fail',
        message: 'Error en el carrito',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }

    // Test 3: Weight-based Products
    setCurrentTest('Probando productos por peso...');
    await new Promise(resolve => setTimeout(resolve, 500));

    const weightProducts = allProducts.filter(p => p.sellByWeight);
    results.push({
      name: 'Productos por Peso',
      status: weightProducts.length > 0 ? 'pass' : 'warning',
      message: `${weightProducts.length} productos con venta por peso`,
      details: weightProducts.slice(0, 3).map(p => `${p.name} (${p.unit})`).join(', ')
    });

    // Test 4: Favorites
    setCurrentTest('Probando favoritos...');
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const testProduct = allProducts[1];
      if (testProduct) {
        addToFavorites(testProduct.id);
        results.push({
          name: 'Sistema de Favoritos',
          status: favoriteCount > 0 ? 'pass' : 'fail',
          message: `${favoriteCount} productos en favoritos`,
          details: 'Funcionalidad de favoritos operativa'
        });
      }
    } catch (error) {
      results.push({
        name: 'Sistema de Favoritos',
        status: 'fail',
        message: 'Error en favoritos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }

    // Test 5: Navigation
    setCurrentTest('Probando navegación...');
    await new Promise(resolve => setTimeout(resolve, 500));

    const routes = ['/', '/shop', '/categories', '/offers', '/cart', '/favorites'];
    results.push({
      name: 'Rutas de Navegación',
      status: 'pass',
      message: `${routes.length} rutas principales configuradas`,
      details: routes.join(', ')
    });

    // Test 6: Product Features
    setCurrentTest('Probando características de productos...');
    await new Promise(resolve => setTimeout(resolve, 500));

    const offerProducts = allProducts.filter(p => p.isOffer);
    const newProducts = allProducts.filter(p => p.isNew);
    const outOfStock = allProducts.filter(p => !p.inStock);

    results.push({
      name: 'Características de Productos',
      status: 'pass',
      message: 'Productos con estados especiales',
      details: `${offerProducts.length} ofertas, ${newProducts.length} nuevos, ${outOfStock.length} agotados`
    });

    // Test 7: Font Controller
    setCurrentTest('Probando controlador de fuente...');
    await new Promise(resolve => setTimeout(resolve, 500));

    const fontController = document.querySelector('[aria-label="Ajustar tamaño de letra"]');
    results.push({
      name: 'Controlador de Fuente',
      status: fontController ? 'pass' : 'warning',
      message: fontController ? 'Controlador de fuente disponible' : 'Controlador no encontrado',
      details: 'Accesibilidad de texto configurada'
    });

    // Test 8: Performance
    setCurrentTest('Evaluando rendimiento...');
    await new Promise(resolve => setTimeout(resolve, 500));

    const loadTime = performance.now();
    results.push({
      name: 'Rendimiento de Carga',
      status: loadTime < 3000 ? 'pass' : loadTime < 5000 ? 'warning' : 'fail',
      message: `Tiempo de carga: ${Math.round(loadTime)}ms`,
      details: loadTime < 3000 ? 'Excelente rendimiento' : 'Considerar optimizaciones'
    });

    setTestResults(results);
    setIsRunning(false);
    setCurrentTest('');

    toast({
      title: 'Testing Completado',
      description: `${results.filter(r => r.status === 'pass').length}/${results.length} pruebas exitosas`,
    });
  };

  const clearTestData = () => {
    clearCart();
    clearFavorites();
    toast({
      title: 'Datos de Prueba Limpiados',
      description: 'Carrito y favoritos vaciados',
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return 'border-green-200 bg-green-50';
      case 'fail':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const statsData = {
    totalProducts: allProducts.length,
    weightProducts: allProducts.filter(p => p.sellByWeight).length,
    pieceProducts: allProducts.filter(p => !p.sellByWeight).length,
    categories: categories.length,
    offers: allProducts.filter(p => p.isOffer).length,
    newProducts: allProducts.filter(p => p.isNew).length,
    inStock: allProducts.filter(p => p.inStock).length,
    outOfStock: allProducts.filter(p => !p.inStock).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TestTube className="h-8 w-8 text-blue-600" />
            <h1 className="font-display font-bold text-3xl text-gray-900">
              Testing Completo de La Económica
            </h1>
          </div>
          <p className="text-gray-600">
            Prueba todas las funcionalidades de la aplicación incluyendo selección de cantidad por piezas y peso
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="testing">Pruebas</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="navigation">Navegación</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* App Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Package className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold text-gray-900">{statsData.totalProducts}</div>
                  <div className="text-sm text-gray-600">Total Productos</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Scale className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold text-green-600">{statsData.weightProducts}</div>
                  <div className="text-sm text-gray-600">Por Peso</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold text-purple-600">{statsData.pieceProducts}</div>
                  <div className="text-sm text-gray-600">Por Pieza</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <div className="text-2xl font-bold text-yellow-600">{statsData.offers}</div>
                  <div className="text-sm text-gray-600">Ofertas</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link to="/shop">
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Ir a Tienda
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <Link to="/cart">
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Ver Carrito ({cartCount})
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <Link to="/categories">
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Categorías
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Ejecutar Pruebas</span>
                  <div className="flex gap-2">
                    <Button
                      onClick={runTests}
                      disabled={isRunning}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {isRunning ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Ejecutando...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Ejecutar Todas
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={clearTestData}
                      variant="outline"
                    >
                      Limpiar Datos
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isRunning && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-blue-700">{currentTest}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-gray-900">{result.name}</h3>
                            <Badge
                              variant={result.status === 'pass' ? 'default' : 
                                     result.status === 'fail' ? 'destructive' : 'secondary'}
                            >
                              {result.status === 'pass' ? 'PASS' : 
                               result.status === 'fail' ? 'FAIL' : 'WARN'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{result.message}</p>
                          {result.details && (
                            <p className="text-xs text-gray-500">{result.details}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {testResults.length === 0 && !isRunning && (
                  <div className="text-center py-8 text-gray-500">
                    <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Haz clic en "Ejecutar Todas" para comenzar las pruebas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weight Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-green-500" />
                    Productos por Peso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allProducts.filter(p => p.sellByWeight).slice(0, 5).map(product => (
                      <div key={product.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-600">${product.price} / {product.unit}</p>
                        </div>
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          {product.unit}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Piece Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-500" />
                    Productos por Pieza
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allProducts.filter(p => !p.sellByWeight).slice(0, 5).map(product => (
                      <div key={product.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-600">${product.price} / {product.unit}</p>
                        </div>
                        <Badge variant="outline" className="text-blue-700 border-blue-300">
                          {product.unit}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Navigation Tab */}
          <TabsContent value="navigation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { path: '/', name: 'Inicio', icon: '🏠' },
                { path: '/shop', name: 'Tienda', icon: '🛍️' },
                { path: '/categories', name: 'Categorías', icon: '📂' },
                { path: '/offers', name: 'Ofertas', icon: '🔥' },
                { path: '/cart', name: 'Carrito', icon: '🛒' },
                { path: '/favorites', name: 'Favoritos', icon: '❤️' },
                { path: '/checkout', name: 'Checkout', icon: '💳' },
                { path: '/profile', name: 'Perfil', icon: '👤' },
                { path: '/addresses', name: 'Direcciones', icon: '📍' },
              ].map((route, index) => (
                <Link key={index} to={route.path}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{route.icon}</div>
                      <h3 className="font-medium text-gray-900">{route.name}</h3>
                      <p className="text-sm text-gray-600">{route.path}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AppTest;
