import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu,
  ShoppingCart, 
  Heart, 
  List, 
  MapPin, 
  Star, 
  Package, 
  Zap,
  Settings,
  Bell,
  Search,
  Plus,
  ChevronRight
} from 'lucide-react';
import { useAppState } from '@/hooks/use-app-state-simple';
import { usePWAIntegration } from '@/hooks/use-pwa-integration-simple';
import IntegratedDashboard from './IntegratedDashboard';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QuickAccessWidgetProps {
  variant?: 'floating' | 'inline' | 'sidebar';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showNotificationDot?: boolean;
}

export const QuickAccessWidget = ({ 
  variant = 'floating',
  position = 'bottom-right',
  showNotificationDot = true 
}: QuickAccessWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { appStats, notifications, quickActions } = useAppState();
  const { pwa } = usePWAIntegration();

  // Quick action items
  const quickItems = [
    {
      icon: ShoppingCart,
      label: 'Carrito',
      path: '/cart',
      count: appStats.cartItemsCount,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Heart,
      label: 'Favoritos',
      path: '/favorites',
      count: appStats.favoritesCount,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      icon: List,
      label: 'Listas',
      path: '/shopping-list',
      count: appStats.shoppingListsCount,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Package,
      label: 'Pickup',
      path: '/pickup',
      count: appStats.activePickupOrders,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      icon: Zap,
      label: 'Flash Sales',
      path: '/flash-sales',
      count: appStats.activeFlashSales,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Search,
      label: 'Buscar',
      path: '/shop',
      count: 0,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  ];

  // Calculate total notifications
  const totalNotifications = notifications.total;
  const hasActiveItems = quickItems.some(item => item.count > 0);

  if (variant === 'floating') {
    return (
      <>
        {/* Floating Action Button */}
        <div className={cn(
          'fixed z-50',
          position === 'bottom-right' && 'bottom-6 right-6',
          position === 'bottom-left' && 'bottom-6 left-6',
          position === 'top-right' && 'top-6 right-6',
          position === 'top-left' && 'top-6 left-6'
        )}>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                size="lg" 
                className="rounded-full h-14 w-14 shadow-lg relative"
                title="Centro de Control"
              >
                <Menu className="h-6 w-6" />
                {showNotificationDot && (hasActiveItems || totalNotifications > 0) && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {totalNotifications > 0 ? totalNotifications : '!'}
                    </span>
                  </div>
                )}
              </Button>
            </SheetTrigger>
            
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Centro de Control
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Quick Actions */}
                <div>
                  <h3 className="font-medium mb-3">Acceso Rápido</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {quickItems.map((item) => (
                      <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-3">
                            <div className="flex flex-col items-center text-center gap-2">
                              <div className={cn('p-2 rounded-lg', item.bgColor)}>
                                <item.icon className={cn('h-4 w-4', item.color)} />
                              </div>
                              <div>
                                <p className="text-xs font-medium">{item.label}</p>
                                {item.count > 0 && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    {item.count}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Priority Actions */}
                {quickActions.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Acciones Prioritarias</h3>
                    <div className="space-y-2">
                      {quickActions.slice(0, 3).map((action) => (
                        <Link key={action.id} to={action.path} onClick={() => setIsOpen(false)}>
                          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div>
                              <p className="text-sm font-medium">{action.label}</p>
                              <p className="text-xs text-gray-600">
                                Prioridad: {action.priority}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {action.count > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {action.count}
                                </Badge>
                              )}
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mini Dashboard */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Estado General</h3>
                    <Link to="/control-center" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm">
                        Ver todo
                      </Button>
                    </Link>
                  </div>
                  <IntegratedDashboard variant="minimal" />
                </div>

                {/* App Status */}
                <div>
                  <h3 className="font-medium mb-3">Estado de la App</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Conexión</span>
                      <Badge variant={pwa.isOffline ? "destructive" : "default"}>
                        {pwa.isOffline ? 'Offline' : 'Online'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Funciones activas</span>
                      <Badge variant="secondary">
                        {appStats.totalActiveFeatures}/7
                      </Badge>
                    </div>
                    {pwa.isUpdateAvailable && (
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700">
                          Nueva actualización disponible
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </>
    );
  }

  if (variant === 'inline') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Menu className="h-5 w-5" />
            Acceso Rápido
            {totalNotifications > 0 && (
              <Badge variant="destructive" className="text-xs">
                {totalNotifications}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {quickItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <div className="flex flex-col items-center text-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className={cn('p-2 rounded-lg', item.bgColor)}>
                    <item.icon className={cn('h-4 w-4', item.color)} />
                  </div>
                  <div>
                    <p className="text-xs font-medium">{item.label}</p>
                    {item.count > 0 && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {item.count}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-3">Funciones</h3>
          <div className="space-y-2">
            {quickItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className={cn('p-1.5 rounded', item.bgColor)}>
                    <item.icon className={cn('h-4 w-4', item.color)} />
                  </div>
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {item.count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {item.count}
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {quickActions.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">Pendientes</h3>
            <div className="space-y-2">
              {quickActions.slice(0, 2).map((action) => (
                <Link key={action.id} to={action.path}>
                  <div className="p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm font-medium">{action.label}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={action.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {action.priority}
                      </Badge>
                      {action.count > 0 && (
                        <span className="text-xs text-gray-600">{action.count} items</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default QuickAccessWidget;
