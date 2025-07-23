import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  stock_quantity: number;
  min_stock: number;
  unit: string;
  brand?: string;
  supplier?: string;
  expiry_date?: string;
  categories: {
    id: string;
    name: string;
  };
  is_active: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onSave: () => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    cost: "",
    sku: "",
    barcode: "",
    category_id: "",
    stock_quantity: "",
    min_stock: "10",
    unit: "unidad",
    brand: "",
    supplier: "",
    expiry_date: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        cost: product.cost?.toString() || "",
        sku: product.sku || "",
        barcode: product.barcode || "",
        category_id: product.categories?.id || "",
        stock_quantity: product.stock_quantity?.toString() || "",
        min_stock: product.min_stock?.toString() || "10",
        unit: product.unit || "unidad",
        brand: product.brand || "",
        supplier: product.supplier || "",
        expiry_date: product.expiry_date
          ? product.expiry_date.split("T")[0]
          : "",
        is_active: product.is_active ?? true,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.price ||
      !formData.category_id ||
      !formData.stock_quantity
    ) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const url = product ? `/api/products/${product.id}` : "/api/products";

      const method = product ? "PUT" : "POST";

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : null,
        stock_quantity: parseInt(formData.stock_quantity),
        min_stock: parseInt(formData.min_stock),
        expiry_date: formData.expiry_date || null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: product
            ? "Producto actualizado exitosamente"
            : "Producto creado exitosamente",
        });
        onSave();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Error al guardar producto");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al guardar producto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const units = [
    "unidad",
    "kg",
    "g",
    "litro",
    "ml",
    "paquete",
    "caja",
    "botella",
    "lata",
    "pieza",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre del Producto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nombre del producto"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">
                Categoría <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  handleInputChange("category_id", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descripción del producto"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange("brand", e.target.value)}
                placeholder="Marca del producto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Proveedor</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleInputChange("supplier", e.target.value)}
                placeholder="Proveedor"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Precios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                Precio de Venta <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Costo</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => handleInputChange("cost", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inventario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">
                Stock Actual <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stock_quantity"
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) =>
                  handleInputChange("stock_quantity", e.target.value)
                }
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_stock">Stock Mínimo</Label>
              <Input
                id="min_stock"
                type="number"
                min="0"
                value={formData.min_stock}
                onChange={(e) => handleInputChange("min_stock", e.target.value)}
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unidad</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => handleInputChange("unit", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Códigos y Fechas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange("sku", e.target.value)}
                placeholder="Código SKU"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Código de Barras</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => handleInputChange("barcode", e.target.value)}
                placeholder="Código de barras"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry_date">Fecha de Vencimiento</Label>
            <Input
              id="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={(e) => handleInputChange("expiry_date", e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                handleInputChange("is_active", checked)
              }
            />
            <Label htmlFor="is_active">Producto activo</Label>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : product ? "Actualizar" : "Crear"} Producto
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
