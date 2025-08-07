import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Settings, 
  Database, 
  Cloud, 
  FileText, 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  Users,
  Package,
  DollarSign
} from 'lucide-react';
import { EleventaConfig, EleventaIntegrationService, SyncResult } from '@/services/eleventa-integration';
import { toast } from 'sonner';

interface EleventaConfigComponentProps {
  onConfigSaved?: () => void;
}

const EleventaConfigComponent: React.FC<EleventaConfigComponentProps> = ({ onConfigSaved }) => {
  const [config, setConfig] = useState<EleventaConfig>({
    syncMode: 'hybrid',
    syncInterval: 5,
    enableRealTime: true,
    enableWebhooks: false
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);

  // Estados para diferentes tipos de sincronización
  const [productSyncResult, setProductSyncResult] = useState<SyncResult | null>(null);
  const [inventorySyncResult, setInventorySyncResult] = useState<SyncResult | null>(null);
  const [customerSyncResult, setCustomerSyncResult] = useState<SyncResult | null>(null);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      // Cargar configuración guardada del localStorage o API
      const savedConfig = localStorage.getItem('eleventa_config');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const saveConfiguration = async () => {
    try {
      // Guardar configuración
      localStorage.setItem('eleventa_config', JSON.stringify(config));
      
      // Crear nueva instancia del servicio con la configuración actualizada
      const service = new EleventaIntegrationService(config);
      
      toast.success('Configuración guardada exitosamente');
      onConfigSaved?.();
    } catch (error) {
      console.error('Error guardando configuración:', error);
      toast.error('Error al guardar la configuración');
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const service = new EleventaIntegrationService(config);
      const connected = await service.initialize();
      
      setIsConnected(connected);
      
      if (connected) {
        toast.success('Conexión establecida correctamente');
      } else {
        toast.error('No se pudo establecer la conexión');
      }
    } catch (error) {
      console.error('Error probando conexión:', error);
      toast.error('Error al probar la conexión');
      setIsConnected(false);
    } finally {
      setIsTesting(false);
    }
  };

  const syncProducts = async (direction: 'to_eleventa' | 'from_eleventa' | 'bidirectional') => {
    setSyncing(true);
    setSyncProgress(0);
    
    try {
      const service = new EleventaIntegrationService(config);
      
      // Simular progreso
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await service.syncProducts(direction);
      
      clearInterval(progressInterval);
      setSyncProgress(100);
      
      setProductSyncResult(result);
      setLastSyncResult(result);
      
      if (result.success) {
        toast.success(`Productos sincronizados: ${result.records_success}/${result.records_processed}`);
      } else {
        toast.error(`Error en sincronización: ${result.message}`);
      }
    } catch (error) {
      console.error('Error sincronizando productos:', error);
      toast.error('Error en la sincronización de productos');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncProgress(0), 2000);
    }
  };

  const syncInventory = async () => {
    setSyncing(true);
    try {
      const service = new EleventaIntegrationService(config);
      const result = await service.syncInventory();
      
      setInventorySyncResult(result);
      
      if (result.success) {
        toast.success('Inventario sincronizado correctamente');
      } else {
        toast.error(`Error sincronizando inventario: ${result.message}`);
      }
    } catch (error) {
      console.error('Error sincronizando inventario:', error);
      toast.error('Error en la sincronización de inventario');
    } finally {
      setSyncing(false);
    }
  };

  const syncCustomers = async (direction: 'to_eleventa' | 'from_eleventa' | 'bidirectional') => {
    setSyncing(true);
    try {
      const service = new EleventaIntegrationService(config);
      const result = await service.syncCustomers(direction);
      
      setCustomerSyncResult(result);
      
      if (result.success) {
        toast.success('Clientes sincronizados correctamente');
      } else {
        toast.error(`Error sincronizando clientes: ${result.message}`);
      }
    } catch (error) {
      console.error('Error sincronizando clientes:', error);
      toast.error('Error en la sincronización de clientes');
    } finally {
      setSyncing(false);
    }
  };

  const ConnectionStatus = () => (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <Badge variant="default" className="bg-green-500">Conectado</Badge>
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4 text-red-500" />
          <Badge variant="destructive">Desconectado</Badge>
        </>
      )}
    </div>
  );

  const SyncResultCard = ({ title, result, icon: Icon }: { 
    title: string; 
    result: SyncResult | null; 
    icon: React.ElementType 
  }) => (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {result ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estado</span>
              {result.success ? (
                <Badge variant="default" className="bg-green-500">Exitoso</Badge>
              ) : (
                <Badge variant="destructive">Error</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Registros</span>
              <span className="text-sm font-medium">
                {result.records_success}/{result.records_processed}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Última sync</span>
              <span className="text-xs text-muted-foreground">
                {result.sync_time.toLocaleString()}
              </span>
            </div>
            {result.errors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {result.errors[0]}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay datos de sincronización</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integración Eleventa/BambúCode</h1>
          <p className="text-muted-foreground">
            Configuración y sincronización con el sistema POS Eleventa
          </p>
        </div>
        <ConnectionStatus />
      </div>

      <Tabs defaultValue="connection" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connection">Conexión</TabsTrigger>
          <TabsTrigger value="sync">Sincronización</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoreo</TabsTrigger>
          <TabsTrigger value="logs">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración de Conexión
              </CardTitle>
              <CardDescription>
                Configure los parámetros de conexión con Eleventa/BambúCode
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="syncMode">Modo de Sincronización</Label>
                  <Select
                    value={config.syncMode}
                    onValueChange={(value: any) => setConfig({ ...config, syncMode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api">
                        <div className="flex items-center gap-2">
                          <Cloud className="h-4 w-4" />
                          API REST
                        </div>
                      </SelectItem>
                      <SelectItem value="database">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Base de Datos
                        </div>
                      </SelectItem>
                      <SelectItem value="files">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Archivos CSV/XML
                        </div>
                      </SelectItem>
                      <SelectItem value="hybrid">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Híbrido (Recomendado)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="syncInterval">Intervalo de Sync (minutos)</Label>
                  <Input
                    id="syncInterval"
                    type="number"
                    value={config.syncInterval}
                    onChange={(e) => setConfig({ ...config, syncInterval: parseInt(e.target.value) })}
                    min="1"
                    max="1440"
                  />
                </div>
              </div>

              {config.syncMode === 'api' && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium">Configuración API</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiUrl">URL de la API</Label>
                      <Input
                        id="apiUrl"
                        placeholder="https://api.eleventa.com"
                        value={config.apiUrl || ''}
                        onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="Tu API Key"
                        value={config.apiKey || ''}
                        onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {config.syncMode === 'database' && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium">Configuración Base de Datos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dbHost">Host</Label>
                      <Input
                        id="dbHost"
                        placeholder="localhost"
                        value={config.dbHost || ''}
                        onChange={(e) => setConfig({ ...config, dbHost: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dbPort">Puerto</Label>
                      <Input
                        id="dbPort"
                        type="number"
                        placeholder="3306"
                        value={config.dbPort || ''}
                        onChange={(e) => setConfig({ ...config, dbPort: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dbName">Base de Datos</Label>
                      <Input
                        id="dbName"
                        placeholder="eleventa_db"
                        value={config.dbName || ''}
                        onChange={(e) => setConfig({ ...config, dbName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dbUser">Usuario</Label>
                      <Input
                        id="dbUser"
                        placeholder="usuario"
                        value={config.dbUser || ''}
                        onChange={(e) => setConfig({ ...config, dbUser: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {(config.syncMode === 'files' || config.syncMode === 'hybrid') && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium">Configuración de Archivos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exportPath">Carpeta de Exportación</Label>
                      <Input
                        id="exportPath"
                        placeholder="/sync/export"
                        value={config.exportPath || ''}
                        onChange={(e) => setConfig({ ...config, exportPath: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="importPath">Carpeta de Importación</Label>
                      <Input
                        id="importPath"
                        placeholder="/sync/import"
                        value={config.importPath || ''}
                        onChange={(e) => setConfig({ ...config, importPath: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="enableRealTime">Sincronización en Tiempo Real</Label>
                  <p className="text-xs text-muted-foreground">
                    Sincronizar cambios automáticamente
                  </p>
                </div>
                <Switch
                  id="enableRealTime"
                  checked={config.enableRealTime}
                  onCheckedChange={(checked) => setConfig({ ...config, enableRealTime: checked })}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={saveConfiguration} className="flex-1">
                  Guardar Configuración
                </Button>
                <Button 
                  variant="outline" 
                  onClick={testConnection}
                  disabled={isTesting}
                  className="flex items-center gap-2"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Probando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Probar Conexión
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          {syncProgress > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sincronizando...</span>
                    <span className="text-sm text-muted-foreground">{syncProgress}%</span>
                  </div>
                  <Progress value={syncProgress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Productos
                </CardTitle>
                <CardDescription>
                  Sincronizar catálogo de productos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => syncProducts('from_eleventa')}
                  disabled={isSyncing}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Importar de Eleventa
                </Button>
                <Button 
                  onClick={() => syncProducts('to_eleventa')}
                  disabled={isSyncing}
                  className="w-full"
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Exportar a Eleventa
                </Button>
                <Button 
                  onClick={() => syncProducts('bidirectional')}
                  disabled={isSyncing}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronización Completa
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Inventario
                </CardTitle>
                <CardDescription>
                  Actualizar stock en tiempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={syncInventory}
                  disabled={isSyncing}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar Inventario
                </Button>
                <div className="text-xs text-muted-foreground">
                  Último: {inventorySyncResult?.sync_time?.toLocaleString() || 'Nunca'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Clientes
                </CardTitle>
                <CardDescription>
                  Sincronizar base de clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => syncCustomers('from_eleventa')}
                  disabled={isSyncing}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Importar Clientes
                </Button>
                <Button 
                  onClick={() => syncCustomers('bidirectional')}
                  disabled={isSyncing}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar Todo
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SyncResultCard
              title="Productos"
              result={productSyncResult}
              icon={Package}
            />
            <SyncResultCard
              title="Inventario"
              result={inventorySyncResult}
              icon={Database}
            />
            <SyncResultCard
              title="Clientes"
              result={customerSyncResult}
              icon={Users}
            />
          </div>

          {lastSyncResult && (
            <Card>
              <CardHeader>
                <CardTitle>Última Sincronización</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <Badge variant={lastSyncResult.success ? "default" : "destructive"}>
                      {lastSyncResult.success ? "Exitoso" : "Error"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Registros procesados:</span>
                    <span>{lastSyncResult.records_processed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exitosos:</span>
                    <span className="text-green-600">{lastSyncResult.records_success}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fallidos:</span>
                    <span className="text-red-600">{lastSyncResult.records_failed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fecha:</span>
                    <span>{lastSyncResult.sync_time.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Sincronización</CardTitle>
              <CardDescription>
                Registro de todas las operaciones de sincronización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>El historial de sincronización aparecerá aquí</p>
                <p className="text-sm">Próximamente: logs detallados y exportación</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EleventaConfigComponent;
