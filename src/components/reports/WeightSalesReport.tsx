import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Scale, 
  TrendingUp, 
  Package, 
  DollarSign,
  Calendar,
  Download,
  Weight,
  BarChart3
} from 'lucide-react';
import { formatWeightDisplay } from '@/hooks/use-weight-products';

interface WeightSalesData {
  summary: {
    total_weight_sold: number;
    total_weight_revenue: number;
    weight_products_count: number;
    average_weight_per_sale: number;
  };
  top_products_by_weight: Array<{
    name: string;
    total_weight: number;
    total_revenue: number;
    sales_count: number;
    unit: string;
  }>;
  sales_count: number;
}

interface WeightSalesReportProps {
  dateRange?: {
    start: string;
    end: string;
  };
}

const WeightSalesReport: React.FC<WeightSalesReportProps> = ({ dateRange }) => {
  const [data, setData] = useState<WeightSalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(
    dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    dateRange?.end || new Date().toISOString().split('T')[0]
  );

  // Simular datos para demostración
  const mockData: WeightSalesData = {
    summary: {
      total_weight_sold: 156.750,
      total_weight_revenue: 4890.25,
      weight_products_count: 89,
      average_weight_per_sale: 1.762
    },
    top_products_by_weight: [
      {
        name: 'Manzanas Rojas',
        total_weight: 45.250,
        total_revenue: 2058.75,
        sales_count: 23,
        unit: 'kg'
      },
      {
        name: 'Plátanos',
        total_weight: 38.100,
        total_revenue: 1066.80,
        sales_count: 19,
        unit: 'kg'
      },
      {
        name: 'Carne Molida',
        total_weight: 24.500,
        total_revenue: 4410.00,
        sales_count: 12,
        unit: 'kg'
      },
      {
        name: 'Queso Manchego',
        total_weight: 12.250,
        total_revenue: 3062.50,
        sales_count: 15,
        unit: 'kg'
      },
      {
        name: 'Tomates',
        total_weight: 21.800,
        total_revenue: 654.00,
        sales_count: 18,
        unit: 'kg'
      }
    ],
    sales_count: 87
  };

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      setTimeout(() => {
        setData(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading weight sales data:', error);
      setLoading(false);
    }
  };

  const exportReport = () => {
    const csvContent = [
      'Producto,Peso Total (kg),Ingresos,Ventas,Peso Promedio',
      ...data!.top_products_by_weight.map(product => 
        `${product.name},${product.total_weight},${product.total_revenue},${product.sales_count},${(product.total_weight / product.sales_count).toFixed(3)}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-ventas-peso-${startDate}-${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Scale className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-gray-600">Cargando reporte de ventas por peso...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay datos disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxWeight = Math.max(...data.top_products_by_weight.map(p => p.total_weight));

  return (
    <div className="space-y-6">
      {/* Header y controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-blue-600" />
            Reporte de Ventas por Peso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-auto"
              />
              <span className="text-gray-500">a</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <Button onClick={loadData} variant="outline">
              Actualizar
            </Button>
            <Button onClick={exportReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Peso Total Vendido</p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.summary.total_weight_sold.toFixed(3)} kg
                </p>
              </div>
              <Weight className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos por Peso</p>
                <p className="text-2xl font-bold text-green-600">
                  ${data.summary.total_weight_revenue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productos Pesados</p>
                <p className="text-2xl font-bold text-purple-600">
                  {data.summary.weight_products_count}
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Peso Promedio</p>
                <p className="text-2xl font-bold text-orange-600">
                  {data.summary.average_weight_per_sale.toFixed(3)} kg
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top productos por peso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Productos Más Vendidos por Peso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.top_products_by_weight.map((product, index) => (
              <div key={product.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <h4 className="font-medium">{product.name}</h4>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ${product.total_revenue.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.sales_count} ventas
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Peso total:</span>
                    <span className="font-medium">
                      {product.total_weight.toFixed(3)} {product.unit}
                    </span>
                  </div>

                  <Progress 
                    value={(product.total_weight / maxWeight) * 100} 
                    className="h-2"
                  />

                  <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
                    <div>
                      <span className="block font-medium">Peso promedio</span>
                      <span>{(product.total_weight / product.sales_count).toFixed(3)} {product.unit}</span>
                    </div>
                    <div>
                      <span className="block font-medium">Precio promedio</span>
                      <span>${(product.total_revenue / product.sales_count).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="block font-medium">Precio por {product.unit}</span>
                      <span>${(product.total_revenue / product.total_weight).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas adicionales */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas del Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Scale className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-600">Ventas con pesaje</p>
              <p className="text-xl font-bold text-blue-600">{data.sales_count}</p>
              <p className="text-xs text-gray-500">
                {((data.sales_count / (data.sales_count + 50)) * 100).toFixed(1)}% del total
              </p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm text-gray-600">Ingreso promedio por kg</p>
              <p className="text-xl font-bold text-green-600">
                ${(data.summary.total_weight_revenue / data.summary.total_weight_sold).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">Por kilogramo vendido</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Package className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <p className="text-sm text-gray-600">Productos únicos pesados</p>
              <p className="text-xl font-bold text-purple-600">
                {data.top_products_by_weight.length}
              </p>
              <p className="text-xs text-gray-500">Diferentes productos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeightSalesReport;
