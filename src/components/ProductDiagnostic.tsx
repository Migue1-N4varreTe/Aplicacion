import { useState } from "react";
import {
  allProducts,
  categories,
  getTotalProducts,
  getProductCountByCategory,
  getProductCountByAisle,
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, EyeOff, Search } from "lucide-react";

const ProductDiagnostic = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  // Análisis de categorías
  const categoryAnalysis = categories.map((category) => {
    const actual = getProductCountByCategory(category.id);
    const expected = category.productCount;
    const percentage = expected > 0 ? (actual / expected) * 100 : 0;
    const status =
      actual === expected ? "correct" : actual > expected ? "over" : "under";

    return {
      id: category.id,
      name: category.name,
      aisle: category.aisle,
      actual,
      expected,
      percentage,
      status,
      diff: actual - expected,
    };
  });

  // Análisis de pasillos
  const aisleAnalysis = [];
  for (let i = 1; i <= 15; i++) {
    const count = getProductCountByAisle(`Pasillo ${i}`);
    const category = categories.find((c) => c.aisle === i);
    aisleAnalysis.push({
      aisle: i,
      count,
      categoryName: category?.name || "Sin categoría",
      categoryId: category?.id,
    });
  }

  // Estadísticas generales
  const totalProducts = getTotalProducts();
  const inStockProducts = allProducts.filter((p) => p.inStock).length;
  const lowStockProducts = allProducts.filter(
    (p) => p.inStock && p.stock <= 5,
  ).length;
  const placeholderImages = allProducts.filter((p) =>
    p.image.includes("placeholder"),
  ).length;

  const discrepancies = categoryAnalysis.filter(
    (cat) => cat.status !== "correct",
  );
  const totalExpected = categories.reduce(
    (sum, cat) => sum + cat.productCount,
    0,
  );

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg border-2 border-orange-500 text-orange-700 hover:bg-orange-50"
        >
          <Search className="w-3 h-3 mr-1" />
          Validación completa
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-4 z-50 bg-white border-2 border-orange-500 rounded-lg shadow-2xl overflow-auto">
      <div className="sticky top-0 bg-orange-50 border-b border-orange-200 p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-orange-900 flex items-center gap-2">
          <BarChart className="w-5 h-5" />
          🧪 Diagnóstico de Productos
        </h2>
        <Button
          onClick={() => setIsVisible(false)}
          variant="ghost"
          size="sm"
          className="text-orange-700 hover:bg-orange-100"
        >
          <EyeOff className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-6 space-y-6">
        {/* Resumen General */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📊 Resumen General</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalProducts}
              </div>
              <div className="text-sm text-gray-600">Total Productos</div>
              <div className="text-xs text-gray-500">
                Esperado: {totalExpected}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {inStockProducts}
              </div>
              <div className="text-sm text-gray-600">En Stock</div>
              <div className="text-xs text-gray-500">
                {((inStockProducts / totalProducts) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {lowStockProducts}
              </div>
              <div className="text-sm text-gray-600">Stock Bajo</div>
              <div className="text-xs text-gray-500">≤ 5 unidades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {placeholderImages}
              </div>
              <div className="text-sm text-gray-600">Placeholders</div>
              <div className="text-xs text-gray-500">
                {((placeholderImages / totalProducts) * 100).toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Análisis por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              🏷️ Análisis por Categoría
              {discrepancies.length > 0 && (
                <Badge variant="destructive">
                  {discrepancies.length} discrepancias
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryAnalysis.map((cat) => (
                <div key={cat.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cat.name}</span>
                      <Badge variant="outline">Pasillo {cat.aisle}</Badge>
                      {cat.status === "correct" ? (
                        <Badge className="bg-green-100 text-green-800">
                          ✅ Correcto
                        </Badge>
                      ) : cat.status === "over" ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          ⬆️ Exceso (+{cat.diff})
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          ⬇️ Faltan ({Math.abs(cat.diff)})
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-mono">
                      {cat.actual}/{cat.expected}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(cat.percentage, 100)}
                    className={`h-2 ${
                      cat.status === "correct"
                        ? ""
                        : cat.status === "over"
                          ? "bg-yellow-100"
                          : "bg-red-100"
                    }`}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {cat.percentage.toFixed(1)}% completado
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Análisis por Pasillo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              🏪 Distribución por Pasillo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {aisleAnalysis.map((aisle) => (
                <div
                  key={aisle.aisle}
                  className="text-center p-3 border rounded-lg"
                >
                  <div className="font-bold text-lg">P{aisle.aisle}</div>
                  <div className="text-sm text-gray-600">
                    {aisle.count} productos
                  </div>
                  <div
                    className="text-xs text-gray-500 truncate"
                    title={aisle.categoryName}
                  >
                    {aisle.categoryName}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Acciones Recomendadas */}
        {discrepancies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                🎯 Acciones Recomendadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {discrepancies.map((cat) => (
                  <div key={cat.id} className="text-sm">
                    <span className="font-medium">{cat.name}:</span>
                    {cat.status === "under" ? (
                      <span className="text-red-600">
                        {" "}
                        Añadir {Math.abs(cat.diff)} productos
                      </span>
                    ) : (
                      <span className="text-yellow-600">
                        {" "}
                        Remover {cat.diff} productos o ajustar conteo esperado
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Funciones de Debug */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              🔧 Funciones de Debug Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1 font-mono bg-gray-50 p-3 rounded">
              <div>window.debugProducts.getTotalProducts()</div>
              <div>
                window.debugProducts.getProductsByCategory('category-id')
              </div>
              <div>
                window.debugProducts.getProductCountByCategory('category-id')
              </div>
              <div>
                window.debugProducts.getProductCountByAisle('Pasillo X')
              </div>
              <div>window.debugProducts.categoryAnalysis</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDiagnostic;
