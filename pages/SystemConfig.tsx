import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Store,
  CreditCard,
  Printer,
  Save,
  RefreshCw,
  Shield,
  Bell,
  Database,
  Wifi,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import StoreSettings from "@/components/config/StoreSettings";
import PaymentSettings from "@/components/config/PaymentSettings";
import HardwareConfig from "@/components/config/HardwareConfig";
import GeneralSettings from "@/components/config/GeneralSettings";

const SystemConfig = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("store");
  const { toast } = useToast();

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Configuración guardada",
        description: "Los cambios han sido aplicados exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreDefaults = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Configuración restaurada",
        description: "Se han restaurado los valores predeterminados",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo restaurar la configuración",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const configSections = [
    {
      id: "store",
      name: "Tienda",
      icon: Store,
      description: "Información básica del establecimiento",
    },
    {
      id: "payments",
      name: "Pagos",
      icon: CreditCard,
      description: "Métodos de pago y configuración fiscal",
    },
    {
      id: "hardware",
      name: "Hardware",
      icon: Printer,
      description: "Impresoras, escáneres y dispositivos",
    },
    {
      id: "general",
      name: "General",
      icon: Settings,
      description: "Configuraciones del sistema y preferencias",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Configuración del Sistema
              </h1>
              <p className="text-gray-600">
                Administra la configuración global de tu punto de venta
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleRestoreDefaults}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Restaurar Defaults
              </Button>
              <Button onClick={handleSaveSettings} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        </div>

        {/* Configuration Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {configSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card
                key={section.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  activeTab === section.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setActiveTab(section.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {section.name}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Database className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Base de Datos
                  </p>
                  <p className="text-lg font-semibold text-green-600">
                    Conectada
                  </p>
                  <p className="text-xs text-gray-500">
                    Última sincronización: Hace 2 min
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Wifi className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conexión</p>
                  <p className="text-lg font-semibold text-green-600">
                    Estable
                  </p>
                  <p className="text-xs text-gray-500">Velocidad: 45 Mbps</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Shield className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Seguridad</p>
                  <p className="text-lg font-semibold text-yellow-600">
                    Advertencia
                  </p>
                  <p className="text-xs text-gray-500">
                    Actualización pendiente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="store" className="flex items-center">
              <Store className="h-4 w-4 mr-2" />
              Tienda
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Pagos
            </TabsTrigger>
            <TabsTrigger value="hardware" className="flex items-center">
              <Printer className="h-4 w-4 mr-2" />
              Hardware
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="store" className="space-y-6">
            <StoreSettings />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentSettings />
          </TabsContent>

          <TabsContent value="hardware" className="space-y-6">
            <HardwareConfig />
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <GeneralSettings />
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <Database className="h-4 w-4 mr-2" />
                Respaldar Base de Datos
              </Button>

              <Button variant="outline" className="justify-start">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar Inventario
              </Button>

              <Button variant="outline" className="justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Verificar Seguridad
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Versión del Sistema
                </p>
                <p className="text-lg font-semibold">La Económica POS v2.1.0</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">
                  Última Actualización
                </p>
                <p className="text-lg font-semibold">28 Nov 2024</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Licencia</p>
                <p className="text-lg font-semibold">Comercial - Activa</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">
                  Soporte Técnico
                </p>
                <p className="text-lg font-semibold">24/7 Disponible</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemConfig;
