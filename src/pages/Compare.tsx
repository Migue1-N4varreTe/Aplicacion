import React, { useState } from "react";
import { allProducts } from "@/lib/data";
import { useCartActions } from "@/hooks/use-cart-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StarRating } from "@/components/ui/star-rating";
import {
  Search,
  Plus,
  X,
  ShoppingCart,
  Scale,
  Check,
  Minus,
  Star,
  Package,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ComparePage = () => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { addToCartWithNotification } = useCartActions();

  const maxCompareProducts = 3;

  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedProducts.includes(product.id)
  );

  const compareProducts = selectedProducts.map(id => 
    allProducts.find(p => p.id === id)
  ).filter(Boolean);

  const addToCompare = (productId: string) => {
    if (selectedProducts.length < maxCompareProducts) {
      setSelectedProducts(prev => [...prev, productId]);
      setShowAddDialog(false);
      setSearchTerm("");
    }
  };

  const removeFromCompare = (productId: string) => {
    setSelectedProducts(prev => prev.filter(id => id !== productId));
  };

  const clearComparison = () => {
    setSelectedProducts([]);
  };

  const getComparisonFeatures = () => {
    if (compareProducts.length === 0) return [];

    return [
      { key: "price", label: "Precio", type: "currency" },
      { key: "category", label: "Categoría", type: "text" },
      { key: "brand", label: "Marca", type: "text" },
      { key: "unit", label: "Unidad de venta", type: "text" },
      { key: "rating", label: "Calificación", type: "rating" },
      { key: "reviewCount", label: "Reseñas", type: "number" },
      { key: "inStock", label: "Disponibilidad", type: "boolean" },
      { key: "stock", label: "Stock", type: "number" },
      { key: "tags", label: "Etiquetas", type: "array" },
    ];
  };

  const renderFeatureValue = (product: any, feature: any) => {
    const value = product[feature.key];

    switch (feature.type) {
      case "currency":
        return `$${value?.toFixed(2) || "0.00"}`;
      case "rating":
        return <StarRating rating={value || 0} size="sm" showValue />;
      case "boolean":
        return value ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <X className="h-4 w-4 text-red-500" />
        );
      case "array":
        return (
          <div className="flex flex-wrap gap-1">
            {value?.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            )) || "N/A"}
          </div>
        );
      case "number":
        return value?.toLocaleString() || "0";
      default:
        return value || "N/A";
    }
  };

  const getBestValue = (feature: any) => {
    if (compareProducts.length === 0) return null;

    switch (feature.key) {
      case "price":
        return Math.min(...compareProducts.map(p => p[feature.key] || Infinity));
      case "rating":
      case "reviewCount":
      case "stock":
        return Math.max(...compareProducts.map(p => p[feature.key] || 0));
      default:
        return null;
    }
  };

  const isValueBest = (product: any, feature: any) => {
    const bestValue = getBestValue(feature);
    if (bestValue === null) return false;
    return product[feature.key] === bestValue;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comparar Productos</h1>
          <p className="text-gray-600 mt-1">Compara hasta {maxCompareProducts} productos lado a lado</p>
        </div>
        <div className="flex gap-2">
          {selectedProducts.length > 0 && (
            <Button variant="outline" onClick={clearComparison}>
              <X className="h-4 w-4 mr-2" />
              Limpiar Todo
            </Button>
          )}
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button disabled={selectedProducts.length >= maxCompareProducts}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto ({selectedProducts.length}/{maxCompareProducts})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Seleccionar Producto para Comparar</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredProducts.slice(0, 20).map((product) => (
                    <div
                      key={product.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => addToCompare(product.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg font-bold text-green-600">
                              ${product.price.toFixed(2)}
                            </span>
                            <Badge variant="outline">{product.category}</Badge>
                          </div>
                        </div>
                        <Plus className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No se encontraron productos</p>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {selectedProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Scale className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Comienza comparando productos
            </h3>
            <p className="text-gray-600 mb-4">
              Selecciona hasta {maxCompareProducts} productos para compararlos lado a lado
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primer Producto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Product Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {compareProducts.map((product) => (
              <Card key={product.id} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => removeFromCompare(product.id)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <CardHeader className="pb-3">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">
                      ${product.price.toFixed(2)}
                    </span>
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <StarRating rating={product.rating || 0} size="sm" />
                    <span className="text-sm text-gray-600">
                      ({product.reviewCount || 0} reseñas)
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Marca:</span>
                      <span className="font-medium">{product.brand || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock:</span>
                      <span className={cn(
                        "font-medium",
                        product.inStock ? "text-green-600" : "text-red-600"
                      )}>
                        {product.inStock ? `${product.stock} disponibles` : "Agotado"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unidad:</span>
                      <span className="font-medium">{product.unit}</span>
                    </div>
                  </div>

                  {product.tags && product.tags.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Características:</p>
                      <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => addToCartWithNotification(product.id, 1, product.name)}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.inStock ? "Agregar al Carrito" : "Agotado"}
                  </Button>
                </CardContent>
              </Card>
            ))}

            {/* Add Product Card */}
            {selectedProducts.length < maxCompareProducts && (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="flex flex-col items-center justify-center h-full py-12">
                  <Plus className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4 text-center">
                    Agregar otro producto
                  </p>
                  <Button variant="outline" onClick={() => setShowAddDialog(true)}>
                    Seleccionar Producto
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Detailed Comparison Table */}
          {compareProducts.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Comparación Detallada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium text-gray-600">Característica</th>
                        {compareProducts.map((product) => (
                          <th key={product.id} className="text-center p-3 font-medium">
                            {product.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getComparisonFeatures().map((feature) => (
                        <tr key={feature.key} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-700">
                            {feature.label}
                          </td>
                          {compareProducts.map((product) => {
                            const isBest = isValueBest(product, feature);
                            return (
                              <td key={product.id} className={cn(
                                "p-3 text-center",
                                isBest && "bg-green-50 font-medium text-green-800"
                              )}>
                                <div className="flex items-center justify-center">
                                  {renderFeatureValue(product, feature)}
                                  {isBest && feature.type !== "array" && (
                                    <Star className="h-4 w-4 text-green-500 ml-1" />
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ComparePage;
