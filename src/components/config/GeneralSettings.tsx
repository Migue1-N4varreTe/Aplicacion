import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  Shield,
  Bell,
  Database,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Key,
  Lock,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Smartphone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GeneralSettings = () => {
  const [autoBackup, setAutoBackup] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoUpdates, setAutoUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [autoLogout, setAutoLogout] = useState(true);
  const { toast } = useToast();

  const handleBackupNow = async () => {
    toast({
      title: "Iniciando respaldo",
      description: "Creando respaldo de la base de datos...",
    });

    // Simulate backup process
    setTimeout(() => {
      toast({
        title: "Respaldo completado",
        description: "Base de datos respaldada exitosamente",
      });
    }, 3000);
  };

  const handleRestoreDatabase = async () => {
    toast({
      title: "Preparando restauración",
      description: "Selecciona el archivo de respaldo...",
    });
  };

  const handleClearCache = async () => {
    toast({
      title: "Limpiando caché",
      description: "Eliminando archivos temporales...",
    });

    setTimeout(() => {
      toast({
        title: "Caché limpiado",
        description: "El sistema ha sido optimizado",
      });
    }, 2000);
  };

  const handleTestNotifications = () => {
    toast({
      title: "Prueba de notificación",
      description: "¡Las notificaciones están funcionando correctamente!",
    });
  };

  return (
    <div className="space-y-6">
      {/* System Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Preferencias del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="app-name">Nombre de la Aplicación</Label>
                <Input
                  id="app-name"
                  defaultValue="La Económica POS"
                  placeholder="Nombre de la aplicación"
                />
              </div>

              <div>
                <Label htmlFor="session-timeout">
                  Tiempo de Sesión (minutos)
                </Label>
                <Input
                  id="session-timeout"
                  type="number"
                  min="5"
                  max="480"
                  value={sessionTimeout}
                  onChange={(e) =>
                    setSessionTimeout(parseInt(e.target.value) || 30)
                  }
                />
              </div>

              <div>
                <Label htmlFor="default-page">Página de Inicio</Label>
                <Select defaultValue="dashboard">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="pos">Punto de Venta</SelectItem>
                    <SelectItem value="inventory">Inventario</SelectItem>
                    <SelectItem value="reports">Reportes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="items-per-page">Elementos por Página</Label>
                <Select defaultValue="25">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
                <Label htmlFor="dark-mode">Modo oscuro</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-logout"
                  checked={autoLogout}
                  onCheckedChange={setAutoLogout}
                />
                <Label htmlFor="auto-logout">
                  Cerrar sesión automáticamente
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="sound-effects" defaultChecked />
                <Label htmlFor="sound-effects">Efectos de sonido</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="tooltips" defaultChecked />
                <Label htmlFor="tooltips">Mostrar tooltips</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="animations" defaultChecked />
                <Label htmlFor="animations">Animaciones</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Configuración de Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="password-policy">Política de Contraseñas</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Básica (6 caracteres)</SelectItem>
                    <SelectItem value="medium">
                      Media (8 caracteres + números)
                    </SelectItem>
                    <SelectItem value="high">
                      Alta (12 caracteres + símbolos)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="login-attempts">Intentos de Login</Label>
                <Select defaultValue="5">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 intentos</SelectItem>
                    <SelectItem value="5">5 intentos</SelectItem>
                    <SelectItem value="10">10 intentos</SelectItem>
                    <SelectItem value="unlimited">Ilimitados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="lockout-duration">Duración de Bloqueo</Label>
                <Select defaultValue="15">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutos</SelectItem>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="two-factor" />
                <Label htmlFor="two-factor">
                  Autenticación de dos factores
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="audit-log" defaultChecked />
                <Label htmlFor="audit-log">Registro de auditoría</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="require-password-change" />
                <Label htmlFor="require-password-change">
                  Cambio periódico de contraseña
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="ip-whitelist" />
                <Label htmlFor="ip-whitelist">Lista blanca de IPs</Label>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">
                  Recomendaciones de Seguridad
                </h4>
                <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                  <li>• Cambia las contraseñas predeterminadas</li>
                  <li>• Habilita la autenticación de dos factores</li>
                  <li>• Mantén el sistema actualizado</li>
                  <li>• Realiza respaldos periódicos</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notificaciones
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestNotifications}
            >
              Probar Notificaciones
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
                <Label htmlFor="notifications">Habilitar notificaciones</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="email-notifications" defaultChecked />
                <Label htmlFor="email-notifications">
                  Notificaciones por email
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="sms-notifications" />
                <Label htmlFor="sms-notifications">
                  Notificaciones por SMS
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="push-notifications" defaultChecked />
                <Label htmlFor="push-notifications">Notificaciones push</Label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="stock-alerts" defaultChecked />
                <Label htmlFor="stock-alerts">Alertas de inventario</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="sales-reports" defaultChecked />
                <Label htmlFor="sales-reports">Reportes de ventas</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="system-alerts" defaultChecked />
                <Label htmlFor="system-alerts">Alertas del sistema</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="security-alerts" defaultChecked />
                <Label htmlFor="security-alerts">Alertas de seguridad</Label>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Label htmlFor="notification-email">
              Email para Notificaciones
            </Label>
            <Input
              id="notification-email"
              type="email"
              placeholder="admin@laeconomica.com"
              defaultValue="admin@laeconomica.com"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Backup & Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Respaldo y Mantenimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-backup"
                  checked={autoBackup}
                  onCheckedChange={setAutoBackup}
                />
                <Label htmlFor="auto-backup">Respaldo automático</Label>
              </div>

              <div>
                <Label htmlFor="backup-frequency">Frecuencia de Respaldo</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Cada hora</SelectItem>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="backup-retention">Retención de Respaldos</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 días</SelectItem>
                    <SelectItem value="30">30 días</SelectItem>
                    <SelectItem value="90">90 días</SelectItem>
                    <SelectItem value="365">1 año</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Button onClick={handleBackupNow} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Crear Respaldo Ahora
              </Button>

              <Button
                variant="outline"
                onClick={handleRestoreDatabase}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Restaurar Base de Datos
              </Button>

              <Button
                variant="outline"
                onClick={handleClearCache}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Caché
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Último Respaldo</p>
                  <p className="text-sm text-green-700">Ayer a las 02:00 AM</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Tamaño de BD</p>
                  <p className="text-sm text-blue-700">2.4 GB</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900">
                    Próximo Respaldo
                  </p>
                  <p className="text-sm text-purple-700">Hoy a las 02:00 AM</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2" />
            Actualizaciones del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-medium">Versión Actual: v2.1.0</p>
              <p className="text-sm text-gray-600">
                Última verificación: Hace 2 horas
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800">Actualizado</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-updates"
                  checked={autoUpdates}
                  onCheckedChange={setAutoUpdates}
                />
                <Label htmlFor="auto-updates">
                  Actualizaciones automáticas
                </Label>
              </div>

              <div>
                <Label htmlFor="update-channel">Canal de Actualizaciones</Label>
                <Select defaultValue="stable">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stable">Estable</SelectItem>
                    <SelectItem value="beta">Beta</SelectItem>
                    <SelectItem value="alpha">
                      Alpha (Desarrolladores)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Button className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar Actualizaciones
              </Button>

              <div className="text-sm text-gray-600">
                <p>• Última actualización: v2.1.0 (28 Nov 2024)</p>
                <p>• Próxima verificación: En 6 horas</p>
                <p>• Canal: Estable</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API & Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            API e Integraciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="api-rate-limit">Límite de Peticiones API</Label>
                <Select defaultValue="1000">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100/hora</SelectItem>
                    <SelectItem value="1000">1,000/hora</SelectItem>
                    <SelectItem value="10000">10,000/hora</SelectItem>
                    <SelectItem value="unlimited">Ilimitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="webhook-url">URL de Webhook</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://tu-servidor.com/webhook"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="api-logging" defaultChecked />
                <Label htmlFor="api-logging">Registro de API</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="cors-enabled" defaultChecked />
                <Label htmlFor="cors-enabled">CORS habilitado</Label>
              </div>

              <Button variant="outline" className="w-full">
                <Key className="h-4 w-4 mr-2" />
                Generar Nueva API Key
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettings;
