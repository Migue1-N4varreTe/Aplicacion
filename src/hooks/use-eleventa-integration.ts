import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  EleventaIntegrationService, 
  EleventaConfig, 
  SyncResult, 
  EleventaProduct, 
  EleventaSale,
  EleventaCustomer 
} from '@/services/eleventa-integration';
import { toast } from 'sonner';

interface UseEleventaIntegrationProps {
  config?: Partial<EleventaConfig>;
  autoConnect?: boolean;
  autoSync?: boolean;
}

export interface EleventaStats {
  lastSync: Date | null;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  isConnected: boolean;
  isAutoSyncEnabled: boolean;
}

export const useEleventaIntegration = (props: UseEleventaIntegrationProps = {}) => {
  const { config = {}, autoConnect = true, autoSync = false } = props;
  
  // Estados principales
  const [service, setService] = useState<EleventaIntegrationService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  
  // Estados de sincronización
  const [lastSyncResults, setLastSyncResults] = useState<{
    products: SyncResult | null;
    inventory: SyncResult | null;
    customers: SyncResult | null;
    sales: SyncResult | null;
  }>({
    products: null,
    inventory: null,
    customers: null,
    sales: null
  });

  // Estadísticas
  const [stats, setStats] = useState<EleventaStats>({
    lastSync: null,
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    isConnected: false,
    isAutoSyncEnabled: autoSync
  });

  // Referencias para timers
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const connectionCheckRef = useRef<NodeJS.Timeout | null>(null);

  // Configuración por defecto
  const defaultConfig: EleventaConfig = {
    syncMode: 'hybrid',
    syncInterval: 5,
    enableRealTime: true,
    enableWebhooks: false,
    ...config
  };

  // Inicializar el servicio
  useEffect(() => {
    const newService = new EleventaIntegrationService(defaultConfig);
    setService(newService);

    if (autoConnect) {
      connectToEleventa(newService);
    }

    return () => {
      // Limpiar timers al desmontar
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (connectionCheckRef.current) {
        clearInterval(connectionCheckRef.current);
      }
    };
  }, []);

  // Configurar auto-sync cuando está habilitado
  useEffect(() => {
    if (autoSync && isConnected && defaultConfig.syncInterval) {
      startAutoSync();
    } else {
      stopAutoSync();
    }

    return () => stopAutoSync();
  }, [autoSync, isConnected, defaultConfig.syncInterval]);

  // Conectar a Eleventa
  const connectToEleventa = useCallback(async (serviceInstance?: EleventaIntegrationService) => {
    const targetService = serviceInstance || service;
    if (!targetService) return false;

    setIsConnecting(true);
    setLastError(null);

    try {
      const connected = await targetService.initialize();
      setIsConnected(connected);
      
      if (connected) {
        setStats(prev => ({ ...prev, isConnected: true }));
        toast.success('Conectado a Eleventa exitosamente');
        
        // Iniciar verificación periódica de conexión
        startConnectionCheck();
      } else {
        setLastError('No se pudo establecer conexión con Eleventa');
        toast.error('Error al conectar con Eleventa');
      }

      return connected;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setLastError(errorMessage);
      setIsConnected(false);
      setStats(prev => ({ ...prev, isConnected: false }));
      toast.error(`Error de conexión: ${errorMessage}`);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [service]);

  // Desconectar
  const disconnect = useCallback(() => {
    setIsConnected(false);
    setStats(prev => ({ ...prev, isConnected: false }));
    stopAutoSync();
    stopConnectionCheck();
    toast.info('Desconectado de Eleventa');
  }, []);

  // Verificar conexión periódicamente
  const startConnectionCheck = useCallback(() => {
    if (connectionCheckRef.current) {
      clearInterval(connectionCheckRef.current);
    }

    connectionCheckRef.current = setInterval(async () => {
      if (service) {
        try {
          const connected = await service.checkConnection();
          if (!connected && isConnected) {
            setIsConnected(false);
            setStats(prev => ({ ...prev, isConnected: false }));
            toast.warning('Conexión con Eleventa perdida');
          }
        } catch (error) {
          console.warn('Error verificando conexión:', error);
        }
      }
    }, 30000); // Verificar cada 30 segundos
  }, [service, isConnected]);

  const stopConnectionCheck = useCallback(() => {
    if (connectionCheckRef.current) {
      clearInterval(connectionCheckRef.current);
      connectionCheckRef.current = null;
    }
  }, []);

  // Auto-sync
  const startAutoSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    const intervalMs = (defaultConfig.syncInterval || 5) * 60 * 1000; // Convertir a ms
    
    syncIntervalRef.current = setInterval(async () => {
      if (isConnected && !isSyncing) {
        await syncAll();
      }
    }, intervalMs);

    console.log(`Auto-sync iniciado cada ${defaultConfig.syncInterval} minutos`);
  }, [isConnected, isSyncing, defaultConfig.syncInterval]);

  const stopAutoSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);

  // Función de sync completa
  const syncAll = useCallback(async (): Promise<boolean> => {
    if (!service || !isConnected || isSyncing) {
      return false;
    }

    setIsSyncing(true);
    let allSuccessful = true;

    try {
      // Sincronizar productos
      const productResult = await service.syncProducts('bidirectional');
      setLastSyncResults(prev => ({ ...prev, products: productResult }));
      
      if (!productResult.success) {
        allSuccessful = false;
      }

      // Sincronizar inventario
      const inventoryResult = await service.syncInventory();
      setLastSyncResults(prev => ({ ...prev, inventory: inventoryResult }));
      
      if (!inventoryResult.success) {
        allSuccessful = false;
      }

      // Sincronizar clientes
      const customerResult = await service.syncCustomers('bidirectional');
      setLastSyncResults(prev => ({ ...prev, customers: customerResult }));
      
      if (!customerResult.success) {
        allSuccessful = false;
      }

      // Actualizar estadísticas
      setStats(prev => ({
        ...prev,
        lastSync: new Date(),
        totalSyncs: prev.totalSyncs + 1,
        successfulSyncs: allSuccessful ? prev.successfulSyncs + 1 : prev.successfulSyncs,
        failedSyncs: allSuccessful ? prev.failedSyncs : prev.failedSyncs + 1
      }));

      if (allSuccessful) {
        toast.success('Sincronización completa exitosa');
      } else {
        toast.warning('Sincronización completada con algunos errores');
      }

      return allSuccessful;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setLastError(errorMessage);
      setStats(prev => ({
        ...prev,
        totalSyncs: prev.totalSyncs + 1,
        failedSyncs: prev.failedSyncs + 1
      }));
      toast.error(`Error en sincronización: ${errorMessage}`);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [service, isConnected, isSyncing]);

  // Sincronización individual de productos
  const syncProducts = useCallback(async (direction: 'to_eleventa' | 'from_eleventa' | 'bidirectional' = 'bidirectional'): Promise<SyncResult | null> => {
    if (!service || !isConnected) {
      toast.error('No hay conexión con Eleventa');
      return null;
    }

    setIsSyncing(true);
    try {
      const result = await service.syncProducts(direction);
      setLastSyncResults(prev => ({ ...prev, products: result }));
      
      if (result.success) {
        toast.success(`Productos sincronizados: ${result.records_success}/${result.records_processed}`);
      } else {
        toast.error(`Error sincronizando productos: ${result.message}`);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error: ${errorMessage}`);
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [service, isConnected]);

  // Sincronización de inventario
  const syncInventory = useCallback(async (productId?: string): Promise<SyncResult | null> => {
    if (!service || !isConnected) {
      toast.error('No hay conexión con Eleventa');
      return null;
    }

    setIsSyncing(true);
    try {
      const result = await service.syncInventory(productId);
      setLastSyncResults(prev => ({ ...prev, inventory: result }));
      
      if (result.success) {
        toast.success('Inventario sincronizado correctamente');
      } else {
        toast.error(`Error sincronizando inventario: ${result.message}`);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error: ${errorMessage}`);
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [service, isConnected]);

  // Sincronización de clientes
  const syncCustomers = useCallback(async (direction: 'to_eleventa' | 'from_eleventa' | 'bidirectional' = 'bidirectional'): Promise<SyncResult | null> => {
    if (!service || !isConnected) {
      toast.error('No hay conexión con Eleventa');
      return null;
    }

    setIsSyncing(true);
    try {
      const result = await service.syncCustomers(direction);
      setLastSyncResults(prev => ({ ...prev, customers: result }));
      
      if (result.success) {
        toast.success('Clientes sincronizados correctamente');
      } else {
        toast.error(`Error sincronizando clientes: ${result.message}`);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error: ${errorMessage}`);
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [service, isConnected]);

  // Enviar venta a Eleventa
  const sendSaleToEleventa = useCallback(async (sale: EleventaSale): Promise<SyncResult | null> => {
    if (!service || !isConnected) {
      toast.error('No hay conexión con Eleventa');
      return null;
    }

    try {
      const result = await service.sendSaleToEleventa(sale);
      setLastSyncResults(prev => ({ ...prev, sales: result }));
      
      if (result.success) {
        toast.success(`Venta ${sale.ticket_number} enviada a Eleventa`);
      } else {
        toast.error(`Error enviando venta: ${result.message}`);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error: ${errorMessage}`);
      return null;
    }
  }, [service, isConnected]);

  // Funciones de utilidad
  const enableAutoSync = useCallback(() => {
    setStats(prev => ({ ...prev, isAutoSyncEnabled: true }));
    if (isConnected) {
      startAutoSync();
    }
  }, [isConnected, startAutoSync]);

  const disableAutoSync = useCallback(() => {
    setStats(prev => ({ ...prev, isAutoSyncEnabled: false }));
    stopAutoSync();
  }, [stopAutoSync]);

  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  const resetStats = useCallback(() => {
    setStats(prev => ({
      ...prev,
      lastSync: null,
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0
    }));
  }, []);

  return {
    // Estados
    isConnected,
    isConnecting,
    isSyncing,
    lastError,
    stats,
    lastSyncResults,
    service,

    // Funciones de conexión
    connect: connectToEleventa,
    disconnect,

    // Funciones de sincronización
    syncAll,
    syncProducts,
    syncInventory,
    syncCustomers,
    sendSaleToEleventa,

    // Control de auto-sync
    enableAutoSync,
    disableAutoSync,

    // Utilidades
    clearError,
    resetStats
  };
};

export default useEleventaIntegration;
