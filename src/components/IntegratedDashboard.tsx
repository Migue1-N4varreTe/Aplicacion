import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Heart, 
  List, 
  MapPin, 
  Star, 
  Package, 
  Zap, 
  TrendingUp,
  Clock,
  Users,
  Bell,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAppState } from '@/hooks/use-app-state-simple';
import { usePWAIntegration } from '@/hooks/use-pwa-integration-simple';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useShoppingList } from '@/contexts/ShoppingListContext';
import { useAddresses } from '@/contexts/AddressContext';
import { useReviews } from '@/contexts/ReviewsContext';
import { usePickup } from '@/contexts/PickupContext';
import { useFlashSales } from '@/contexts/FlashSalesContext';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface DashboardProps {
  variant?: 'full' | 'compact' | 'minimal';
  showNotifications?: boolean;
  showQuickActions?: boolean;
  showStats?: boolean;
}

export const IntegratedDashboard = ({ 
  variant = 'full',
  showNotifications = true,
  showQuickActions = true,
  showStats = true 
}: DashboardProps) => {
  const { appStats, notifications, quickActions, appHealth, featureUsage } = useAppState();
  const { pwa, notifications: pwaNotifications, installApp, requestNotificationPermission } = usePWAIntegration();
  
  // Mock context data for now
  const cartTotal = 0;
  const favorites: any[] = [];
  const lists: any[] = [];
  const addresses: any[] = [];
  const reviews: any[] = [];
  const pickupOrders: any[] = [];
  const flashSales: any[] = [];

  const [activeTab, setActiveTab] = useState('overview');

  // Stats cards data
  const statsCards = [
    {
      title: 'Carrito',
      value: appStats.cartItemsCount,
      total: cartTotal,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/cart',
      enabled: appStats.cartItemsCount > 0,
    },
    {
      title: 'Favoritos',
      value: appStats.favoritesCount,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      link: '/favorites',
      enabled: appStats.favoritesCount > 0,
    },
    {
      title: 'Listas',
      value: appStats.shoppingListsCount,
      icon: List,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/shopping-list',
      enabled: appStats.shoppingListsCount > 0,
    },
    {
      title: 'Direcciones',
      value: appStats.addressesCount,
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/addresses',
      enabled: appStats.addressesCount > 0,
    },
    {
      title: 'Reseñas',
      value: appStats.reviewsCount,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      link: '/reviews',
      enabled: appStats.reviewsCount > 0,
    },
    {
      title: 'Pickup',
      value: appStats.activePickupOrders,
      icon: Package,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      link: '/pickup',
      enabled: appStats.activePickupOrders > 0,
    },
    {
      title: 'Flash Sales',
      value: appStats.activeFlashSales,
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      link: '/flash-sales',
      enabled: appStats.activeFlashSales > 0,
    },
  ];

  if (variant === 'minimal') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.slice(0, 4).map((stat) => (
          <Card key={stat.title} className={cn("hover:shadow-md transition-shadow", !stat.enabled && "opacity-50")}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
                <div>
                  <p className="text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsCards.filter(stat => stat.enabled).slice(0, 4).map((stat) => (
            <Link key={stat.title} to={stat.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                      <stat.icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{stat.title}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                      {stat.total && <p className="text-xs text-gray-500">${stat.total.toFixed(2)}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        {showQuickActions && quickActions.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {quickActions.slice(0, 3).map((action) => (
                  <Link key={action.id} to={action.path}>
                    <Button variant="outline" size="sm" className="gap-2">
                      {action.label}
                      {action.count > 0 && (
                        <Badge variant="secondary" className="ml-1">{action.count}</Badge>
                      )}
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Full dashboard
  return (
    <div className="space-y-6">
      {/* App Health & PWA Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Estado de la App
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Funciones Activas</span>
                <Badge variant={appStats.totalActiveFeatures > 0 ? "default" : "secondary"}>
                  {appStats.totalActiveFeatures}/7
                </Badge>
              </div>
              <Progress value={(appStats.totalActiveFeatures / 7) * 100} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Engagement Score</span>
                <span className="text-sm font-bold">{featureUsage.engagementScore}%</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <div className={cn("w-2 h-2 rounded-full", appHealth.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500')} />
                {appHealth.status === 'healthy' ? 'Funcionando bien' : 'Necesita atención'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Estado PWA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">App Instalada</span>
                <Badge variant={pwa.isInstalled ? "default" : "secondary"}>
                  {pwa.isInstalled ? 'Sí' : 'No'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conexión</span>
                <div className="flex items-center gap-1">
                  {pwa.isOffline ? <WifiOff className="h-4 w-4 text-red-500" /> : <Wifi className="h-4 w-4 text-green-500" />}
                  <span className="text-sm">{pwa.isOffline ? 'Offline' : 'Online'}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Notificaciones</span>
                <Badge variant={pwaNotifications.permission === 'granted' ? "default" : "secondary"}>
                  {pwaNotifications.permission}
                </Badge>
              </div>
              
              {!pwa.isInstalled && pwa.canInstall && (
                <Button onClick={installApp} size="sm" className="w-full">
                  Instalar App
                </Button>
              )}
              
              {pwaNotifications.permission !== 'granted' && (
                <Button onClick={requestNotificationPermission} variant="outline" size="sm" className="w-full">
                  Activar Notificaciones
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      {showNotifications && notifications.total > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
              <Badge variant="destructive">{notifications.total}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.pickupReady > 0 && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Órdenes listas para pickup</span>
                  </div>
                  <Badge variant="default">{notifications.pickupReady}</Badge>
                </div>
              )}
              
              {notifications.flashSaleEnding > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Flash sales terminando pronto</span>
                  </div>
                  <Badge variant="default">{notifications.flashSaleEnding}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for detailed view */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">General</TabsTrigger>
          <TabsTrigger value="features">Funciones</TabsTrigger>
          <TabsTrigger value="actions">Acciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statsCards.map((stat) => (
              <Link key={stat.title} to={stat.link}>
                <Card className={cn("hover:shadow-md transition-shadow cursor-pointer", !stat.enabled && "opacity-50")}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                        <stat.icon className={cn("h-5 w-5", stat.color)} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        {stat.total && <p className="text-xs text-gray-500">${stat.total.toFixed(2)}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="features" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(featureUsage.usage).map(([feature, isActive]) => (
              <Card key={feature}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full", isActive ? 'bg-green-500' : 'bg-gray-300')} />
                      <span className="font-medium capitalize">{feature.replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                    <Badge variant={isActive ? "default" : "secondary"}>
                      {isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="actions" className="space-y-4">
          {quickActions.length > 0 ? (
            <div className="grid gap-3">
              {quickActions.map((action) => (
                <Link key={action.id} to={action.path}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{action.label}</span>
                        <div className="flex items-center gap-2">
                          {action.count > 0 && (
                            <Badge variant="secondary">{action.count}</Badge>
                          )}
                          <Badge variant={action.priority === 'high' ? 'destructive' : action.priority === 'medium' ? 'default' : 'secondary'}>
                            {action.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No hay acciones pendientes</h3>
                <p className="text-gray-500">¡Perfecto! No tienes tareas urgentes por completar.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegratedDashboard;
