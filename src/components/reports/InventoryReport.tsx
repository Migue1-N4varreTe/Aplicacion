import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Package, TrendingDown, Zap } from "lucide-react";

const InventoryReport = () => {
  const lowStockProducts = [
    { name: "Coca Cola 600ml", current: 12, minimum: 50, category: "Bebidas" },
    { name: "Detergente Ariel", current: 5, minimum: 20, category: "Limpieza" },
    { name: "Pan de Caja", current: 8, minimum: 30, category: "Panadería" },
    { name: "Leche Lala", current: 15, minimum: 40, category: "Lácteos" },
  ];

  const categoryStock = [
    { name: "Bebidas", total: 1250, value: 25600, percentage: 78 },
    { name: "Alimentos", total: 890, value: 18900, percentage: 65 },
    { name: "Limpieza", total: 340, value: 12300, percentage: 45 },
    { name: "Farmacia", total: 150, value: 8900, percentage: 82 },
  ];

  const topMovingProducts = [
    { name: "Coca Cola 600ml", sold: 145, revenue: 2175 },
    { name: "Pan Blanco", sold: 89, revenue: 445 },
    { name: "Leche Entera", sold: 67, revenue: 1005 },
    { name: "Arroz Premium", sold: 56, revenue: 840 },
  ];

  return (
    <div className="space-y-6">
      {/* Alertas de Stock */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            Productos con Stock Bajo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lowStockProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-lg border"
              >
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {product.category}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {product.current} / {product.minimum}
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    Stock Crítico
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Stock por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Stock por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStock.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {category.total} productos
                    </span>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{category.percentage}% disponible</span>
                    <span>${category.value.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Productos Más Vendidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Productos Más Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topMovingProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-brand-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.sold} unidades vendidas
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">${product.revenue}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Valor Total Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$65,700</div>
            <div className="text-xs text-green-600 flex items-center">
              <TrendingDown className="w-3 h-3 mr-1" />
              +5.2% vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Productos Únicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,630</div>
            <div className="text-xs text-green-600 flex items-center">
              <TrendingDown className="w-3 h-3 mr-1" />
              +12 nuevos esta semana
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Rotación Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15.3 días</div>
            <div className="text-xs text-blue-600 flex items-center">
              <TrendingDown className="w-3 h-3 mr-1" />
              Mejoró 2.1 días
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryReport;
