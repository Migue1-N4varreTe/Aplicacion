import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Upload, 
  Check, 
  AlertCircle,
  RefreshCw,
  ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { categoriesService, CategoryFromDB } from '@/services/categoriesService';
import { categories as localCategories } from '@/lib/data';
import Navbar from '@/components/Navbar';

interface FormData {
  name: string;
  description: string;
  image_url: string;
  color: string;
  icon: string;
}

interface MigrationStats {
  local_categories: number;
  db_categories: number;
  pending_migration: number;
  migration_complete: boolean;
}

const CategoriesAdmin = () => {
  const [categories, setCategories] = useState<CategoryFromDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryFromDB | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    success: number;
    errors: string[];
  } | null>(null);
  const [stats, setStats] = useState<MigrationStats>({
    local_categories: 0,
    db_categories: 0,
    pending_migration: 0,
    migration_complete: false,
  });
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    image_url: "",
    color: "#22c55e",
    icon: "package",
  });
  
  const { toast } = useToast();

  const predefinedColors = [
    "#22c55e", // green
    "#3b82f6", // blue
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#06b6d4", // cyan
    "#f97316", // orange
    "#84cc16", // lime
    "#ec4899", // pink
    "#6b7280", // gray
  ];

  const iconOptions = [
    "package",
    "apple",
    "beef",
    "bread",
    "candy",
    "coffee",
    "milk",
    "fish",
    "leaf",
    "heart",
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadCategories(), loadStats()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const dbCategories = await categoriesService.getCategories(true);
      setCategories(dbCategories);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      });
    }
  };

  const loadStats = async () => {
    try {
      const dbCategories = await categoriesService.getCategories();
      const localCount = localCategories.length;
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast({
        title: "Error",
        description: "El nombre de la categoría es requerido",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingCategory) {
        await categoriesService.updateCategory(editingCategory.id, formData);
        toast({
          title: "Éxito",
          description: "Categoría actualizada exitosamente",
        });
      } else {
        await categoriesService.createCategory(formData);
        toast({
          title: "Éxito",
          description: "Categoría creada exitosamente",
        });
      }

      setShowForm(false);
      setEditingCategory(null);
      resetForm();
      await loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar categoría",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: CategoryFromDB) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      image_url: category.image_url || "",
      color: category.color || "#22c55e",
      icon: category.icon || "package",
    });
    setShowForm(true);
  };

  const handleDelete = async (category: CategoryFromDB) => {
    if (category.product_count && category.product_count > 0) {
      toast({
        title: "No se puede eliminar",
        description: "Esta categoría tiene productos asociados",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?`))
      return;

    try {
      await categoriesService.deleteCategory(category.id);
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada exitosamente",
      });
      await loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar categoría",
        variant: "destructive",
      });
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

      await loadData();
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

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image_url: "",
      color: "#22c55e",
      icon: "package",
    });
  };

  const getMigrationProgress = () => {
    if (stats.local_categories === 0) return 0;
    return ((stats.db_categories / stats.local_categories) * 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Administración de Categorías
            </h1>
            <p className="text-gray-600">
              Gestiona las categorías de productos y migra datos a Supabase
            </p>
          </div>

          <Tabs defaultValue="manage" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manage">Gestionar Categorías</TabsTrigger>
              <TabsTrigger value="migrate">Migración</TabsTrigger>
            </TabsList>

            {/* Tab: Gestionar Categorías */}
            <TabsContent value="manage" className="space-y-6">
              {/* Header de gestión */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Categorías en Supabase</h3>
                  <p className="text-sm text-muted-foreground">
                    {categories.length} categorías registradas
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setEditingCategory(null);
                    resetForm();
                    setShowForm(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Categoría
                </Button>
              </div>

              {/* Lista de categorías */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : categories.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                      No hay categorías
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Comienza creando una nueva categoría o migra las existentes.
                    </p>
                  </div>
                ) : (
                  categories.map((category) => (
                    <Card
                      key={category.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: category.color }}
                            >
                              <Package className="w-5 h-5 text-white" />
                            </div>

                            <div>
                              <CardTitle className="text-lg">{category.name}</CardTitle>
                              {category.description && (
                                <p className="text-sm text-muted-foreground">
                                  {category.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(category)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(category)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Productos:</span>
                            <div className="font-semibold">
                              {category.product_count || 0}
                            </div>
                          </div>

                          <div>
                            <span className="text-muted-foreground">Stock:</span>
                            <div className="font-semibold">
                              {category.total_stock || 0}
                            </div>
                          </div>

                          <div>
                            <span className="text-muted-foreground">Valor:</span>
                            <div className="font-semibold text-xs">
                              {category.total_value
                                ? formatCurrency(category.total_value)
                                : "$0.00"}
                            </div>
                          </div>
                        </div>

                        <Badge
                          variant={category.is_active ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {category.is_active ? "Activa" : "Inactiva"}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Tab: Migración */}
            <TabsContent value="migrate" className="space-y-6">
              {/* Estadísticas de migración */}
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

              {/* Progreso y controles */}
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
                        onClick={loadData}
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
            </TabsContent>
          </Tabs>

          {/* Dialog del formulario */}
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Nombre de la categoría"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Descripción de la categoría"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">URL de Imagen</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        image_url: e.target.value,
                      }))
                    }
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-md border-2 ${
                          formData.color === color
                            ? "border-gray-900"
                            : "border-gray-200"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData((prev) => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, color: e.target.value }))
                    }
                    className="w-full h-10"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingCategory ? "Actualizar" : "Crear"} Categoría
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default CategoriesAdmin;
