import express from 'express';
import eleventaService from './eleventaService.js';
import { authenticateToken, requirePermission } from '../auth/middleware.js';
import { validationResult, body, param, query } from 'express-validator';

const router = express.Router();

// Middleware para validar errores
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  next();
};

/**
 * @route GET /api/eleventa/status
 * @desc Verificar estado de conexión con Eleventa
 * @access Private (Admin)
 */
router.get('/status', 
  authenticateToken,
  requirePermission('admin'),
  async (req, res) => {
    try {
      const status = await eleventaService.getConnectionStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Error obteniendo estado de Eleventa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
);

/**
 * @route POST /api/eleventa/connect
 * @desc Establecer conexión con Eleventa
 * @access Private (Admin)
 */
router.post('/connect',
  authenticateToken,
  requirePermission('admin'),
  [
    body('config').isObject().withMessage('La configuración debe ser un objeto'),
    body('config.syncMode').isIn(['api', 'database', 'files', 'hybrid'])
      .withMessage('Modo de sincronización inválido')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { config } = req.body;
      const result = await eleventaService.connect(config);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Conexión establecida exitosamente',
          data: result
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error al conectar con Eleventa'
        });
      }
    } catch (error) {
      console.error('Error conectando a Eleventa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
);

/**
 * @route POST /api/eleventa/disconnect
 * @desc Desconectar de Eleventa
 * @access Private (Admin)
 */
router.post('/disconnect',
  authenticateToken,
  requirePermission('admin'),
  async (req, res) => {
    try {
      await eleventaService.disconnect();
      res.json({
        success: true,
        message: 'Desconectado de Eleventa exitosamente'
      });
    } catch (error) {
      console.error('Error desconectando de Eleventa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
);

/**
 * @route POST /api/eleventa/sync/products
 * @desc Sincronizar productos con Eleventa
 * @access Private (Admin/Manager)
 */
router.post('/sync/products',
  authenticateToken,
  requirePermission('manager'),
  [
    body('direction').optional().isIn(['to_eleventa', 'from_eleventa', 'bidirectional'])
      .withMessage('Dirección de sincronización inválida'),
    body('productIds').optional().isArray()
      .withMessage('Los IDs de productos deben ser un array')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { direction = 'bidirectional', productIds } = req.body;
      const result = await eleventaService.syncProducts(direction, productIds);
      
      res.json({
        success: true,
        message: 'Sincronización de productos iniciada',
        data: result
      });
    } catch (error) {
      console.error('Error sincronizando productos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
);

/**
 * @route POST /api/eleventa/sync/inventory
 * @desc Sincronizar inventario con Eleventa
 * @access Private (Admin/Manager)
 */
router.post('/sync/inventory',
  authenticateToken,
  requirePermission('manager'),
  [
    body('productId').optional().isString()
      .withMessage('El ID del producto debe ser una cadena'),
    body('force').optional().isBoolean()
      .withMessage('Force debe ser un booleano')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { productId, force = false } = req.body;
      const result = await eleventaService.syncInventory(productId, force);
      
      res.json({
        success: true,
        message: 'Sincronización de inventario iniciada',
        data: result
      });
    } catch (error) {
      console.error('Error sincronizando inventario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
);

/**
 * @route POST /api/eleventa/sync/customers
 * @desc Sincronizar clientes con Eleventa
 * @access Private (Admin/Manager)
 */
router.post('/sync/customers',
  authenticateToken,
  requirePermission('manager'),
  [
    body('direction').optional().isIn(['to_eleventa', 'from_eleventa', 'bidirectional'])
      .withMessage('Dirección de sincronización inválida')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { direction = 'bidirectional' } = req.body;
      const result = await eleventaService.syncCustomers(direction);
      
      res.json({
        success: true,
        message: 'Sincronización de clientes iniciada',
        data: result
      });
    } catch (error) {
      console.error('Error sincronizando clientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
);

/**
 * @route POST /api/eleventa/sales/send
 * @desc Enviar venta a Eleventa
 * @access Private (Cashier+)
 */
router.post('/sales/send',
  authenticateToken,
  requirePermission('cashier'),
  [
    body('sale').isObject().withMessage('La venta debe ser un objeto'),
    body('sale.ticket_number').notEmpty().withMessage('Número de ticket requerido'),
    body('sale.total_amount').isNumeric().withMessage('Monto total debe ser numérico'),
    body('sale.items').isArray().withMessage('Los items deben ser un array')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { sale } = req.body;
      
      // Agregar información del usuario
      sale.cashier_id = req.user.id;
      sale.date = new Date();
      
      const result = await eleventaService.sendSale(sale);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Venta enviada a Eleventa exitosamente',
          data: result
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error enviando venta a Eleventa'
        });
      }
    } catch (error) {
      console.error('Error enviando venta a Eleventa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
);

/**
 * @route GET /api/eleventa/sync/history
 * @desc Obtener historial de sincronizaciones
 * @access Private (Manager+)
 */
router.get('/sync/history',
  authenticateToken,
  requirePermission('manager'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un entero positivo'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
    query('type').optional().isIn(['products', 'inventory', 'customers', 'sales'])
      .withMessage('Tipo de sincronización inválido')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { page = 1, limit = 20, type } = req.query;
      const history = await eleventaService.getSyncHistory({
        page: parseInt(page),
        limit: parseInt(limit),
        type
      });
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
);

/**
 * @route GET /api/eleventa/sync/stats
 * @desc Obtener estadísticas de sincronización
 * @access Private (Manager+)
 */
router.get('/sync/stats',
  authenticateToken,
  requirePermission('manager'),
  async (req, res) => {
    try {
      const stats = await eleventaService.getSyncStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
);

/**
 * @route POST /api/eleventa/config
 * @desc Guardar configuración de Eleventa
 * @access Private (Admin)
 */
router.post('/config',
  authenticateToken,
  requirePermission('admin'),
  [
    body('config').isObject().withMessage('La configuración debe ser un objeto'),
    body('config.syncMode').isIn(['api', 'database', 'files', 'hybrid'])
      .withMessage('Modo de sincronización inválido'),
    body('config.syncInterval').optional().isInt({ min: 1 })
      .withMessage('Intervalo de sincronización debe ser mayor a 0')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { config } = req.body;
      await eleventaService.saveConfig(config);
      
      res.json({
        success: true,
        message: 'Configuración guardada exitosamente'
      });
    } catch (error) {
      console.error('Error guardando configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
);

/**
 * @route GET /api/eleventa/config
 * @desc Obtener configuración actual
 * @access Private (Admin)
 */
router.get('/config',
  authenticateToken,
  requirePermission('admin'),
  async (req, res) => {
    try {
      const config = await eleventaService.getConfig();
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
);

/**
 * @route POST /api/eleventa/webhook
 * @desc Endpoint para recibir webhooks de Eleventa
 * @access Public (con validación de token)
 */
router.post('/webhook',
  [
    body('event').notEmpty().withMessage('Evento requerido'),
    body('data').isObject().withMessage('Datos requeridos')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { event, data, signature } = req.body;
      
      // Validar firma del webhook (implementar según documentación de Eleventa)
      if (!eleventaService.validateWebhookSignature(signature, req.body)) {
        return res.status(401).json({
          success: false,
          message: 'Firma de webhook inválida'
        });
      }
      
      const result = await eleventaService.processWebhook(event, data);
      
      res.json({
        success: true,
        message: 'Webhook procesado exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error procesando webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
);

/**
 * @route POST /api/eleventa/test
 * @desc Probar conexión y configuración
 * @access Private (Admin)
 */
router.post('/test',
  authenticateToken,
  requirePermission('admin'),
  [
    body('config').optional().isObject().withMessage('La configuración debe ser un objeto')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { config } = req.body;
      const result = await eleventaService.testConnection(config);
      
      res.json({
        success: true,
        message: 'Prueba de conexión completada',
        data: result
      });
    } catch (error) {
      console.error('Error probando conexión:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
);

// Manejo de errores específicos de Eleventa
router.use((error, req, res, next) => {
  console.error('Error en rutas de Eleventa:', error);
  
  if (error.name === 'EleventaConnectionError') {
    return res.status(503).json({
      success: false,
      message: 'Error de conexión con Eleventa',
      error: error.message
    });
  }
  
  if (error.name === 'EleventaSyncError') {
    return res.status(400).json({
      success: false,
      message: 'Error de sincronización',
      error: error.message
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: error.message
  });
});

module.exports = router;
