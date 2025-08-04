import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Calendar,
  Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import SalesChart from "@/components/reports/SalesChart";
import InventoryReport from "@/components/reports/InventoryReport";
import ClientAnalytics from "@/components/reports/ClientAnalytics";

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ComponentType<any>;
}

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("today");
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Simular métricas para demo
      const mockMetrics: MetricCard[] = [
        {
          title: "Ventas del Día",
          value: "$45,230",
          change: "+12.5%",
          trend: "up",
          icon: DollarSign,
        },
        {
          title: "Productos Vendidos",
          value: "1,249",
          change: "+8.2%",
          trend: "up",
          icon: Package,
        },
        {
          title: "Clientes Atendidos",
          value: "89",
          change: "-2.1%",
          trend: "down",
          icon: Users,
        },
        {
          title: "Ticket Promedio",
          value: "$508",
          change: "+15.3%",
          trend: "up",
          icon: ShoppingCart,
        },
      ];

      setMetrics(mockMetrics);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (type: string) => {
    toast({
      title: "Exportando reporte",
      description: `Generando reporte en formato ${type.toUpperCase()}...`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard de Reportes</h1>
            <p className="text-muted-foreground">
              Analiza el rendimiento de tu negocio
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="yesterday">Ayer</SelectItem>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mes</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Año</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={loadDashboardData}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>

            <Button onClick={() => exportReport("excel")}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Métricas KPI */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center text-xs">
                    {metric.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                    ) : metric.trend === "down" ? (
                      <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
                    ) : null}
                    <span
                      className={
                        metric.trend === "up"
                          ? "text-green-600"
                          : metric.trend === "down"
                            ? "text-red-600"
                            : "text-gray-600"
                      }
                    >
                      {metric.change}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      vs período anterior
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs de Reportes */}
        <Tabs defaultValue="sales" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sales">
              <BarChart3 className="w-4 h-4 mr-2" />
              Ventas
            </TabsTrigger>
            <TabsTrigger value="inventory">
              <Package className="w-4 h-4 mr-2" />
              Inventario
            </TabsTrigger>
            <TabsTrigger value="clients">
              <Users className="w-4 h-4 mr-2" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <PieChart className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <SalesChart />
              <Card>
                <CardHeader>
                  <CardTitle>Top Productos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        name: "Coca Cola 600ml",
                        sales: 145,
                        revenue: "$2,175",
                      },
                      { name: "Pan Blanco", sales: 89, revenue: "$445" },
                      { name: "Leche Entera 1L", sales: 67, revenue: "$1,005" },
                      { name: "Arroz 1kg", sales: 56, revenue: "$840" },
                    ].map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.sales} unidades
                          </div>
                        </div>
                        <Badge variant="secondary">{product.revenue}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryReport />
          </TabsContent>

          <TabsContent value="clients">
            <ClientAnalytics />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ventas por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        category: "Bebidas",
                        percentage: 35,
                        amount: "$15,830",
                      },
                      {
                        category: "Alimentos",
                        percentage: 28,
                        amount: "$12,644",
                      },
                      {
                        category: "Limpieza",
                        percentage: 20,
                        amount: "$9,046",
                      },
                      { category: "Otros", percentage: 17, amount: "$7,710" },
                    ].map((cat, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{cat.category}</span>
                          <span>{cat.amount}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-brand-600 h-2 rounded-full"
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Métodos de Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { method: "Efectivo", count: 45, percentage: 51 },
                      { method: "Tarjeta", count: 32, percentage: 36 },
                      { method: "Transferencia", count: 12, percentage: 13 },
                    ].map((payment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="font-medium">{payment.method}</div>
                          <Badge variant="outline" className="ml-2">
                            {payment.count}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payment.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
