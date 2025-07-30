import React, { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Download,
  X,
  Smartphone,
  Monitor,
  Wifi,
  WifiOff,
  Bell,
  Share,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const PWAInstallBanner: React.FC = () => {
  const {
    canInstall,
    isInstalled,
    isOnline,
    isInstalling,
    updateAvailable,
    notificationPermission,
    install,
    updateApp,
    requestNotificationPermission,
    shareContent,
    getCapabilities,
  } = usePWA();

  const { toast } = useToast();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show banner if app can be installed and user hasn't dismissed it
    const wasDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
    if (canInstall && !wasDismissed && !isInstalled) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  }, [canInstall, isInstalled]);

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      toast({
        title: "¡App instalada!",
        description: "La Económica se ha instalado correctamente",
      });
      setShowBanner(false);
    } else {
      toast({
        title: "Error de instalación",
        description: "No se pudo instalar la aplicación",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleUpdate = async () => {
    await updateApp();
    toast({
      title: "Actualizando...",
      description: "La aplicación se actualizará en breve",
    });
  };

  const handleNotificationRequest = async () => {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      toast({
        title: "Notificaciones habilitadas",
        description: "Recibirás actualizaciones importantes",
      });
    }
  };

  const handleShare = async () => {
    const success = await shareContent({
      title: 'La Económica - Supermercado Online',
      text: 'Descubre La Económica, tu supermercado online de confianza',
      url: window.location.origin,
    });

    if (success) {
      toast({
        title: "Compartido",
        description: "¡Gracias por compartir La Económica!",
      });
    }
  };

  const capabilities = getCapabilities();

  // Install Banner
  if (showBanner && canInstall && !dismissed) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md border-primary shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Instalar La Económica</h3>
              <p className="text-xs text-gray-600 mt-1">
                Acceso rápido, modo offline y notificaciones
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleInstall} disabled={isInstalling}>
                  <Download className="h-3 w-3 mr-1" />
                  {isInstalling ? 'Instalando...' : 'Instalar'}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss}>
                  Más tarde
                </Button>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export const PWAStatusIndicator: React.FC = () => {
  const { isOnline, isInstalled, updateAvailable, notificationPermission } = usePWA();

  return (
    <div className="flex items-center gap-2">
      {/* Connection Status */}
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
        isOnline 
          ? "bg-green-100 text-green-700" 
          : "bg-red-100 text-red-700"
      )}>
        {isOnline ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        <span>{isOnline ? 'En línea' : 'Sin conexión'}</span>
      </div>

      {/* Installation Status */}
      {isInstalled && (
        <Badge variant="outline" className="text-xs">
          <Monitor className="h-3 w-3 mr-1" />
          App Instalada
        </Badge>
      )}

      {/* Update Available */}
      {updateAvailable && (
        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
          <RefreshCw className="h-3 w-3 mr-1" />
          Actualización
        </Badge>
      )}

      {/* Notifications Status */}
      {notificationPermission === 'granted' && (
        <Badge variant="outline" className="text-xs">
          <Bell className="h-3 w-3 mr-1" />
          Notificaciones
        </Badge>
      )}
    </div>
  );
};

export const PWAFeatures: React.FC = () => {
  const {
    isInstalled,
    updateAvailable,
    notificationPermission,
    updateApp,
    requestNotificationPermission,
    shareContent,
    getCapabilities,
  } = usePWA();

  const { toast } = useToast();
  const capabilities = getCapabilities();

  const features = [
    {
      icon: Download,
      title: 'Instalación',
      description: 'Instala la app para acceso rápido',
      status: isInstalled ? 'enabled' : capabilities.canInstall ? 'available' : 'disabled',
      action: null,
    },
    {
      icon: WifiOff,
      title: 'Modo Offline',
      description: 'Funciona sin conexión a internet',
      status: capabilities.hasServiceWorker ? 'enabled' : 'disabled',
      action: null,
    },
    {
      icon: Bell,
      title: 'Notificaciones',
      description: 'Recibe actualizaciones importantes',
      status: notificationPermission === 'granted' ? 'enabled' : 
              notificationPermission === 'denied' ? 'disabled' : 'available',
      action: notificationPermission === 'default' ? requestNotificationPermission : null,
    },
    {
      icon: Share,
      title: 'Compartir',
      description: 'Comparte productos y ofertas',
      status: capabilities.hasShare ? 'enabled' : 'disabled',
      action: capabilities.hasShare ? () => shareContent({
        title: 'La Económica',
        text: 'Descubre increíbles ofertas',
        url: window.location.href,
      }) : null,
    },
    {
      icon: RefreshCw,
      title: 'Actualizaciones',
      description: 'Siempre la última versión',
      status: updateAvailable ? 'available' : 'enabled',
      action: updateAvailable ? updateApp : null,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled': return 'text-green-600 bg-green-50';
      case 'available': return 'text-blue-600 bg-blue-50';
      case 'disabled': return 'text-gray-400 bg-gray-50';
      default: return 'text-gray-400 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enabled': return CheckCircle;
      case 'available': return Download;
      default: return X;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {features.map((feature) => {
        const StatusIcon = getStatusIcon(feature.status);
        
        return (
          <Card key={feature.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "rounded-lg p-2",
                  getStatusColor(feature.status)
                )}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{feature.title}</h3>
                    <StatusIcon className={cn(
                      "h-4 w-4",
                      feature.status === 'enabled' ? 'text-green-500' :
                      feature.status === 'available' ? 'text-blue-500' : 'text-gray-400'
                    )} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {feature.description}
                  </p>
                  {feature.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 h-7 text-xs"
                      onClick={feature.action}
                    >
                      {feature.status === 'available' ? 'Habilitar' : 'Actualizar'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PWAInstallBanner;
