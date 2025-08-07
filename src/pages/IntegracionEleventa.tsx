import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  Database, 
  Cloud, 
  FileText, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import EleventaConfigComponent from '@/components/admin/EleventaConfig';
import { useAuth } from '@/contexts/AuthContext';
import AccessDenied from '@/components/AccessDenied';

const IntegracionEleventa: React.FC = () => {
  const { user } = useAuth();

  // Verificar permisos de administrador
  if (!user || !['admin', 'owner'].includes(user.role)) {
    return <AccessDenied />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Zap className="h-6 w-6 text-orange-600" />
          </div>
          Integración Eleventa/BambúCode
        </h1>
        <p className="text-muted-foreground">
          Conecta La Económica con tu sistema POS Eleventa para sincronización automática
        </p>
      </div>

      {/* Información importante */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Nuevo:</strong> Integración con Eleventa/BambúCode ahora disponible. 
          Sincroniza productos, inventario y ventas automáticamente entre sistemas.
        </AlertDescription>
      </Alert>

      {/* Información de la integración */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cloud className="h-4 w-4 text-blue-500" />
              API REST
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Integración directa vía API si Eleventa lo soporta
            </p>
            <Badge variant="secondary" className="mt-2">Recomendado</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-green-500" />
              Base de Datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Conexión directa a la base de datos de Eleventa
            </p>
            <Badge variant="outline" className="mt-2">Avanzado</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-500" />
              Archivos CSV/XML
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Intercambio de datos mediante archivos
            </p>
            <Badge variant="outline" className="mt-2">Compatible</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              Híbrido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Combina múltiples métodos de sincronización
            </p>
            <Badge variant="default" className="mt-2">Óptimo</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Funcionalidades incluidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Funcionalidades Incluidas
          </CardTitle>
          <CardDescription>
            Todo lo que puedes sincronizar entre La Económica y Eleventa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Sincronización bidireccional de productos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Actualización de inventario en tiempo real</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Envío automático de ventas a Eleventa</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Sincronización de catálogo de productos</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Gestión de clientes bidireccional</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Reportes de sincronización detallados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Sistema de webhooks (si disponible)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Monitoreo y alertas automáticas</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requisitos y consideraciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Requisitos y Consideraciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Para usar la integración con base de datos directa, 
                necesitarás acceso a la base de datos de Eleventa y conocer las credenciales.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Para conexión API:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• URL de la API de Eleventa</li>
                  <li>• API Key válida</li>
                  <li>• Permisos de lectura/escritura</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Para conexión por base de datos:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Host y puerto de la base de datos</li>
                  <li>• Credenciales de acceso</li>
                  <li>• Permisos de SELECT/INSERT/UPDATE</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Para intercambio de archivos:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Carpetas compartidas configuradas</li>
                  <li>• Permisos de lectura/escritura</li>
                  <li>• Formato CSV/XML compatible</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Consideraciones generales:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Copia de seguridad recomendada</li>
                  <li>• Pruebas en ambiente controlado</li>
                  <li>• Monitoreo continuo post-integración</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Componente principal de configuración */}
      <EleventaConfigComponent />
    </div>
  );
};

export default IntegracionEleventa;
