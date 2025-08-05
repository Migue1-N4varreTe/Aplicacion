import React, { useState, useEffect } from 'react';
import { Database, Upload, Check, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { categoriesService } from '@/services/categoriesService';
import { categories as localCategories } from '@/lib/data';
import Navbar from '@/components/Navbar';

interface MigrationStats {
  local_categories: number;
  db_categories: number;
  pending_migration: number;
  migration_complete: boolean;
}

const CategoriesMigration = () => {
  const [stats, setStats] = useState<MigrationStats>({
    local_categories: 0,
    db_categories: 0,
    pending_migration: 0,
    migration_complete: false,
  });
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    success: number;
    errors: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Obtener categorías de la base de datos
      const dbCategories = await categoriesService.getCategories();
      
      // Contar categorías locales
      const localCount = localCategories.length;
      
      // Verificar cuales ya existen en la DB
      const existingNames = dbCategories.map(cat => cat.name.toLowerCase());
      const pendingCategories = localCategories.filter(
        cat => !existingNames.includes(cat.name.toLowerCase())
      );

      setStats({
        local_categories: localCount,
        db_categories: dbCategories.length,
        pending_migration: pendingCategories.length,
        migration_complete: pendingCategories.length === 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMigration = async () => {
    if (migrating) return;

    try {
      setMigrating(true);
      setMigrationResult(null);

      toast({
        title: "Iniciando migración",
        description: "Migrando categorías a Supabase...",
      });

      const result = await categoriesService.migrateLocalCategories();
      setMigrationResult(result);

      if (result.errors.length === 0) {
        toast({
          title: "Migración exitosa",
          description: `Se migraron ${result.success} categorías exitosamente`,
        });
      } else {
        toast({
          title: "Migración completada con errores",
          description: `${result.success} exitosas, ${result.errors.length} errores`,
          variant: "destructive",
        });
      }

      // Recargar estadísticas
      await loadStats();
    } catch (error) {
      console.error('Error during migration:', error);
      toast({
        title: "Error en la migración",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setMigrating(false);
    }
  };

  const getMigrationProgress = () => {
    if (stats.local_categories === 0) return 0;
    return ((stats.db_categories / stats.local_categories) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Migración de Categorías a Supabase
            </h1>
            <p className="text-gray-600">
              Transfiere las categorías locales a tu base de datos Supabase
            </p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Categorías Locales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.local_categories}
                </div>
                <p className="text-sm text-gray-600">
                  Definidas en el código
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  En Base de Datos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.db_categories}
                </div>
                <p className="text-sm text-gray-600">
                  Ya migradas a Supabase
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.pending_migration}
                </div>
                <p className="text-sm text-gray-600">
                  Falta por migrar
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Progreso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Progreso de Migración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso</span>
                  <span>{Math.round(getMigrationProgress())}%</span>
                </div>
                <Progress value={getMigrationProgress()} className="h-2" />
              </div>

              <div className="flex items-center justify-between">
                <Badge 
                  variant={stats.migration_complete ? "default" : "secondary"}
                  className="flex items-center gap-1"
                >
                  {stats.migration_complete ? (
                    <>
                      <Check className="w-3 h-3" />
                      Migración Completa
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      Migración Pendiente
                    </>
                  )}
                </Badge>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadStats}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Actualizar
                  </Button>

                  <Button
                    onClick={handleMigration}
                    disabled={migrating || stats.pending_migration === 0}
                    size="sm"
                  >
                    {migrating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Migrando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Migrar Categorías
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resultado de migración */}
          {migrationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {migrationResult.errors.length === 0 ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  )}
                  Resultado de la Migración
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {migrationResult.success}
                    </div>
                    <div className="text-sm text-gray-600">Exitosas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {migrationResult.errors.length}
                    </div>
                    <div className="text-sm text-gray-600">Errores</div>
                  </div>
                </div>

                {migrationResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-700">Errores:</h4>
                    <div className="space-y-1">
                      {migrationResult.errors.map((error, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {error}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Instrucciones */}
          <Card>
            <CardHeader>
              <CardTitle>¿Qué hace esta migración?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Transfiere categorías locales</p>
                    <p className="text-sm text-gray-600">
                      Mueve las {localCategories.length} categorías definidas en el código a tu base de datos Supabase
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Evita duplicados</p>
                    <p className="text-sm text-gray-600">
                      Verifica que no existan categorías con el mismo nombre antes de crear nuevas
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Preserva información</p>
                    <p className="text-sm text-gray-600">
                      Mantiene nombres, descripciones, colores e iconos de las categorías originales
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Prepara para productos</p>
                    <p className="text-sm text-gray-600">
                      Una vez migradas, podrás asociar productos a estas categorías en Supabase
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Nota:</strong> Esta migración es segura y no afectará datos existentes. 
                  Las categorías se crearán solo si no existen previamente.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CategoriesMigration;
