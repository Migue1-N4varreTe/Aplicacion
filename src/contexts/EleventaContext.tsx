import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  useEleventaIntegration,
  EleventaStats 
} from '@/hooks/use-eleventa-integration';
import { 
  EleventaSale, 
  EleventaProduct, 
  EleventaCustomer, 
  SyncResult 
} from '@/services/eleventa-integration';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface EleventaContextType {
  // Estado de conexión
  isConnected: boolean;
  isConnecting: boolean;
  isSyncing: boolean;
  lastError: string | null;
  stats: EleventaStats;

  // Funciones de conexión
  connect: () => Promise<boolean>;
  disconnect: () => void;

  // Funciones de sincronización
  syncAll: () => Promise<boolean>;
  syncProducts: (direction?: 'to_eleventa' | 'from_eleventa' | 'bidirectional') => Promise<SyncResult | null>;
  syncInventory: (productId?: string) => Promise<SyncResult | null>;
  syncCustomers: (direction?: 'to_eleventa' | 'from_eleventa' | 'bidirectional') => Promise<SyncResult | null>;
  sendSaleToEleventa: (sale: EleventaSale) => Promise<SyncResult | null>;

  // Control de auto-sync
  enableAutoSync: () => void;
  disableAutoSync: () => void;

  // Utilidades
  clearError: () => void;
  resetStats: () => void;

  // Configuración
  isAutoSyncEnabled: boolean;
  setAutoSyncEnabled: (enabled: boolean) => void;
}

const EleventaContext = createContext<EleventaContextType | undefined>(undefined);

interface EleventaProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
  autoSync?: boolean;
}

export const EleventaProvider: React.FC<EleventaProviderProps> = ({ 
  children, 
  autoConnect = false,
  autoSync = false 
}) => {
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(autoSync);

  const integration = useEleventaIntegration({
    autoConnect,
    autoSync: isAutoSyncEnabled
  });

  // Cargar configuración guardada al inicializar
  useEffect(() => {
    const loadSavedSettings = () => {
      try {
        const savedAutoSync = localStorage.getItem('eleventa_auto_sync');
        if (savedAutoSync !== null) {
          const enabled = JSON.parse(savedAutoSync);
          setIsAutoSyncEnabled(enabled);
        }
      } catch (error) {
        console.warn('Error cargando configuración de auto-sync:', error);
      }
    };

    loadSavedSettings();
  }, []);

  // Guardar configuración cuando cambia
  useEffect(() => {
    try {
      localStorage.setItem('eleventa_auto_sync', JSON.stringify(isAutoSyncEnabled));
    } catch (error) {
      console.warn('Error guardando configuración de auto-sync:', error);
    }
  }, [isAutoSyncEnabled]);

  // Funciones envueltas para logging y manejo de errores
  const wrappedConnect = async (): Promise<boolean> => {
    try {
      logger.info('🔗 Iniciando conexión con Eleventa...');
      const result = await integration.connect();
      
      if (result) {
        logger.info('✅ Conectado a Eleventa exitosamente');
        toast.success('Conectado a Eleventa');
      } else {
        logger.error('❌ Error conectando a Eleventa');
        toast.error('Error conectando a Eleventa');
      }
      
      return result;
    } catch (error) {
      logger.error('❌ Error en conexión Eleventa:', error);
      toast.error('Error de conexión con Eleventa');
      return false;
    }
  };

  const wrappedDisconnect = (): void => {
    try {
      logger.info('📡 Desconectando de Eleventa...');
      integration.disconnect();
      toast.info('Desconectado de Eleventa');
    } catch (error) {
      logger.error('Error desconectando de Eleventa:', error);
      toast.error('Error al desconectar');
    }
  };

  const wrappedSyncAll = async (): Promise<boolean> => {
    try {
      logger.info('🔄 Iniciando sincronización completa...');
      const result = await integration.syncAll();
      
      if (result) {
        logger.info('✅ Sincronización completa exitosa');
      } else {
        logger.error('❌ Error en sincronización completa');
      }
      
      return result;
    } catch (error) {
      logger.error('❌ Error en sincronización:', error);
      return false;
    }
  };

  const wrappedSendSale = async (sale: EleventaSale): Promise<SyncResult | null> => {
    try {
      logger.info(`💰 Enviando venta ${sale.ticket_number} a Eleventa...`);
      const result = await integration.sendSaleToEleventa(sale);
      
      if (result?.success) {
        logger.info(`✅ Venta ${sale.ticket_number} enviada exitosamente`);
      } else {
        logger.error(`❌ Error enviando venta ${sale.ticket_number}:`, result?.message);
      }
      
      return result;
    } catch (error) {
      logger.error('❌ Error enviando venta:', error);
      return null;
    }
  };

  const handleAutoSyncToggle = (enabled: boolean) => {
    setIsAutoSyncEnabled(enabled);
    
    if (enabled) {
      integration.enableAutoSync();
      logger.info('🔄 Auto-sync habilitado');
      toast.success('Sincronización automática habilitada');
    } else {
      integration.disableAutoSync();
      logger.info('⏸️ Auto-sync deshabilitado');
      toast.info('Sincronización automática deshabilitada');
    }
  };

  // Monitorear errores y mostrar notificaciones
  useEffect(() => {
    if (integration.lastError) {
      logger.error('❌ Error en integración Eleventa:', integration.lastError);
    }
  }, [integration.lastError]);

  // Monitorear cambios de conexión
  useEffect(() => {
    if (integration.isConnected) {
      logger.info('✅ Estado de conexión: Conectado');
    } else {
      logger.info('📡 Estado de conexión: Desconectado');
    }
  }, [integration.isConnected]);

  const contextValue: EleventaContextType = {
    // Estado
    isConnected: integration.isConnected,
    isConnecting: integration.isConnecting,
    isSyncing: integration.isSyncing,
    lastError: integration.lastError,
    stats: integration.stats,

    // Funciones de conexión
    connect: wrappedConnect,
    disconnect: wrappedDisconnect,

    // Funciones de sincronización
    syncAll: wrappedSyncAll,
    syncProducts: integration.syncProducts,
    syncInventory: integration.syncInventory,
    syncCustomers: integration.syncCustomers,
    sendSaleToEleventa: wrappedSendSale,

    // Control de auto-sync
    enableAutoSync: integration.enableAutoSync,
    disableAutoSync: integration.disableAutoSync,

    // Utilidades
    clearError: integration.clearError,
    resetStats: integration.resetStats,

    // Configuración
    isAutoSyncEnabled,
    setAutoSyncEnabled: handleAutoSyncToggle
  };

  return (
    <EleventaContext.Provider value={contextValue}>
      {children}
    </EleventaContext.Provider>
  );
};

export const useEleventa = (): EleventaContextType => {
  const context = useContext(EleventaContext);
  if (context === undefined) {
    throw new Error('useEleventa debe ser usado dentro de un EleventaProvider');
  }
  return context;
};

// Hook para envío automático de ventas
export const useEleventaSaleSync = () => {
  const { sendSaleToEleventa, isConnected, isAutoSyncEnabled } = useEleventa();

  const sendSale = async (saleData: any): Promise<boolean> => {
    // Solo enviar si está conectado y el auto-sync está habilitado
    if (!isConnected || !isAutoSyncEnabled) {
      logger.info('⏸️ Sync de venta omitido: no conectado o auto-sync deshabilitado');
      return false;
    }

    try {
      // Convertir datos de venta al formato de Eleventa
      const eleventaSale: EleventaSale = {
        id: saleData.id || `sale_${Date.now()}`,
        ticket_number: saleData.ticket_number || `TICKET_${Date.now()}`,
        date: new Date(saleData.date || Date.now()),
        total_amount: saleData.total || 0,
        tax_amount: saleData.tax || 0,
        discount_amount: saleData.discount || 0,
        payment_method: saleData.payment_method || 'efectivo',
        customer_id: saleData.customer_id,
        cashier_id: saleData.cashier_id,
        items: saleData.items?.map((item: any) => ({
          product_id: item.product_id || item.id,
          barcode: item.barcode,
          quantity: item.quantity || 1,
          unit_price: item.price || 0,
          total_price: (item.price || 0) * (item.quantity || 1),
          discount: item.discount || 0,
          tax: item.tax || 0
        })) || []
      };

      const result = await sendSaleToEleventa(eleventaSale);
      return result?.success || false;
    } catch (error) {
      logger.error('❌ Error en sync automático de venta:', error);
      return false;
    }
  };

  return { sendSale };
};

export default EleventaProvider;
