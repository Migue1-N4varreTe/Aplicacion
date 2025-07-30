import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Settings, 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart,
  Heart,
  List,
  MapPin,
  Star,
  Zap,
  Bell,
  Download,
  Search,
  Filter,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import IntegratedDashboard from '@/components/IntegratedDashboard';
import { useAppState, useAppPerformance } from '@/hooks/use-app-state';
import { usePWAIntegration } from '@/hooks/use-pwa-integration';
import { useSearch } from '@/hooks/use-search';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { logger } from '@/lib/logger';
import { Link } from 'react-router-dom';

const ControlCenter = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Hooks
  const { appStats, notifications, quickActions, refreshAppState } = useAppState();
  const metrics = useAppPerformance();
  const { pwa, notifications: pwaNotifications, getAppCapabilities } = usePWAIntegration();
  // Search functionality
  let searchSuggestions: string[] = [];
  let recentSearches: string[] = [];
  let clearRecentSearches = () => {};

  try {
    const searchHook = useSearch();
    searchSuggestions = searchHook.searchSuggestions || [];
  } catch (error) {
    logger.warn('Search hook not available', { error });
  }

  const { handleError } = useErrorHandler();

  // Get app capabilities
  const capabilities = getAppCapabilities();

  // Handle refresh
  const handleRefresh = () => {
    try {
      refreshAppState();
      logger.userAction('control_center_refresh');
    } catch (error) {
      handleError(error, 'Error al actualizar el centro de control');
    }
  };

  // Quick stats for overview
  const quickStats = [
    {
      label: 'Productos en carrito',
      value: appStats.cartItemsCount,
      change: '+0',
      trend: 'neutral' as const,
      link: '/cart'
    },
    {
      label: 'Favoritos guardados',
      value: appStats.favoritesCount,
      change: '+0',
      trend: 'neutral' as const,
      link: '/favorites'
    },
    {
      label: 'Listas activas',
      value: appStats.shoppingListsCount,
      change: '+0',
      trend: 'neutral' as const,
      link: '/shopping-list'
    },
    {
      label: 'Notificaciones',
      value: notifications.total,
      change: '+0',
      trend: notifications.total > 0 ? 'up' : 'neutral' as const,
      link: '#notifications'
    },
  ];

  // Feature status
  const featureStatus = [
    {
      name: 'Lista de Compras',
      status: appStats.shoppingListsCount > 0 ? 'active' : 'available',
      description: 'Organiza tus compras con listas personalizadas',
      link: '/shopping-list',
      icon: List,
    },
    {
      name: 'Direcciones',
      status: appStats.addressesCount > 0 ? 'active' : 'available',
      description: 'Gestiona las direcciones de entrega',
      link: '/addresses',
      icon: MapPin,
    },
    {
      name: 'Reseñas',
      status: appStats.reviewsCount > 0 ? 'active' : 'available',
      description: 'Comparte tu experiencia con productos',
      link: '/reviews',
      icon: Star,
    },
    {
      name: 'Pickup en Tienda',
      status: appStats.activePickupOrders > 0 ? 'active' : 'available',
      description: 'Recoge tus pedidos en la tienda',
      link: '/pickup',
      icon: Package,
    },
    {
      name: 'Flash Sales',
      status: appStats.activeFlashSales > 0 ? 'active' : 'available',
      description: 'Ofertas especiales por tiempo limitado',
      link: '/flash-sales',
      icon: Zap,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-3xl text-gray-900 mb-2">
                Centro de Control
              </h1>
              <p className="text-gray-600">
                Gestiona todas las funciones de La Económica desde un solo lugar
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Badge variant={pwa.isOffline ? "destructive" : "default"}>
                {pwa.isOffline ? 'Offline' : 'Online'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat) => (
            <Link key={stat.label} to={stat.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      stat.trend === 'up' ? 'bg-red-100 text-red-600' :
                      stat.trend === 'down' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {stat.change}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="features">Funciones</TabsTrigger>
            <TabsTrigger value="search">Búsqueda</TabsTrigger>
            <TabsTrigger value="performance">Rendimiento</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <IntegratedDashboard variant="full" />
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Estado de Funciones
                </CardTitle>
                <CardDescription>
                  Administra y monitorea todas las funciones disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {featureStatus.map((feature) => (
                    <div key={feature.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <feature.icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{feature.name}</h3>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={feature.status === 'active' ? 'default' : 'secondary'}>
                          {feature.status === 'active' ? 'Activo' : 'Disponible'}
                        </Badge>
                        <Link to={feature.link}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>
                  Tareas pendientes y acciones recomendadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {quickActions.length > 0 ? (
                  <div className="space-y-3">
                    {quickActions.map((action) => (
                      <Link key={action.id} to={action.path}>
                        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div>
                            <h4 className="font-medium">{action.label}</h4>
                            <p className="text-sm text-gray-600">
                              Prioridad: {action.priority}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {action.count > 0 && (
                              <Badge variant="secondary">{action.count}</Badge>
                            )}
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">
                      No hay acciones pendientes
                    </h3>
                    <p className="text-gray-500">
                      ¡Perfecto! Todo está al día.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Herramientas de Búsqueda
                </CardTitle>
                <CardDescription>
                  Accede a funciones avanzadas de búsqueda y filtrado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar productos, funciones o configuraciones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {searchSuggestions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Sugerencias</h4>
                    <div className="flex flex-wrap gap-2">
                      {searchSuggestions.slice(0, 6).map((suggestion) => (
                        <Badge key={suggestion} variant="outline" className="cursor-pointer">
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Búsquedas Recientes</h4>
                      <Button onClick={clearRecentSearches} variant="ghost" size="sm">
                        Limpiar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.slice(0, 8).map((search) => (
                        <Badge key={search} variant="secondary" className="cursor-pointer">
                          {search}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Link to="/shop">
                    <Button variant="outline" className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Búsqueda Avanzada
                    </Button>
                  </Link>
                  <Link to="/categories">
                    <Button variant="outline" className="w-full">
                      <Filter className="h-4 w-4 mr-2" />
                      Explorar Categorías
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Métricas de Rendimiento
                </CardTitle>
                <CardDescription>
                  Información sobre el rendimiento de la aplicación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Carga de Página</h4>
                    <p className="text-2xl font-bold">{metrics.pageLoadTime}ms</p>
                    <p className="text-sm text-gray-600">Tiempo de carga inicial</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Uso de Memoria</h4>
                    <p className="text-2xl font-bold">{metrics.memoryUsage.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Memoria utilizada</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Capacidades del Dispositivo</CardTitle>
                <CardDescription>
                  Funciones disponibles en tu dispositivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(capabilities).map(([capability, available]) => (
                    <div key={capability} className="flex items-center justify-between">
                      <span className="text-sm capitalize">
                        {capability.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <Badge variant={available ? 'default' : 'secondary'}>
                        {available ? 'Disponible' : 'No disponible'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <IntegratedDashboard variant="compact" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ControlCenter;
