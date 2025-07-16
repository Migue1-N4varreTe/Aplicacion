import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Package, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  product_count?: number;
  total_stock?: number;
  total_value?: number;
  is_active: boolean;
  created_at: string;
}

interface CategoriesManagerProps {
  onUpdate: () => void;
  onClose: () => void;
}

const CategoriesManager: React.FC<CategoriesManagerProps> = ({
  onUpdate,
  onClose,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
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
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        "/api/products/categories?include_products=true",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      } else {
        throw new Error("Error al cargar categorías");
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
      const token = localStorage.getItem("token");
      const url = editingCategory
        ? `/api/products/categories/${editingCategory.id}`
        : "/api/products/categories";

      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: editingCategory
            ? "Categoría actualizada exitosamente"
            : "Categoría creada exitosamente",
        });

        setShowForm(false);
        setEditingCategory(null);
        setFormData({
          name: "",
          description: "",
          color: "#22c55e",
          icon: "package",
        });
        loadCategories();
        onUpdate();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Error al guardar categoría");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al guardar categoría",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color,
      icon: category.icon,
    });
    setShowForm(true);
  };

  const handleDelete = async (category: Category) => {
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
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/products/categories/${category.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Categoría eliminada",
          description: "La categoría ha sido eliminada exitosamente",
        });
        loadCategories();
        onUpdate();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar categoría");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al eliminar categoría",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Categorías de Productos</h3>
          <p className="text-sm text-muted-foreground">
            Gestiona las categorías para organizar tu inventario
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingCategory(null);
            setFormData({
              name: "",
              description: "",
              color: "#22c55e",
              icon: "package",
            });
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      {/* Lista de categorías */}
      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
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
              Comienza creando una nueva categoría.
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
  );
};

export default CategoriesManager;
