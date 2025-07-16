import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Calendar,
  DollarSign,
  Users,
  Package,
  Star,
  Gift,
  Download,
  Filter,
  Clock,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  totalPurchases: number;
  averageTicket: number;
  loyaltyPoints: number;
  tier: string;
  preferences: string[];
  registrationDate: string;
  lastPurchase: string;
}

interface PurchaseHistoryProps {
  clients: Client[];
}

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ clients }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("last30days");
  const [selectedMetric, setSelectedMetric] = useState("sales");

  // Generate mock purchase data for analytics
  const generatePurchaseData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split("T")[0],
        day: date.toLocaleDateString("es-ES", { weekday: "short" }),
        sales: Math.floor(Math.random() * 5000) + 2000,
        transactions: Math.floor(Math.random() * 50) + 20,
        customers: Math.floor(Math.random() * 30) + 15,
      };
    });
    return last30Days;
  };

  const generateCategoryData = () => {
    return [
      { name: "Lácteos", value: 25, color: "#8884d8" },
      { name: "Panadería", value: 20, color: "#82ca9d" },
      { name: "Frutas", value: 15, color: "#ffc658" },
      { name: "Carnes", value: 18, color: "#ff7300" },
      { name: "Bebidas", value: 12, color: "#00ff00" },
      { name: "Limpieza", value: 10, color: "#ff0000" },
    ];
  };

  const purchaseData = generatePurchaseData();
  const categoryData = generateCategoryData();

  // Calculate analytics
  const analytics = {
    totalRevenue: clients.reduce((sum, client) => sum + client.totalSpent, 0),
    totalTransactions: clients.reduce(
      (sum, client) => sum + client.totalPurchases,
      0,
    ),
    averageTicket:
      clients.reduce((sum, client) => sum + client.averageTicket, 0) /
        clients.length || 0,
    repeatCustomers: clients.filter((client) => client.totalPurchases > 1)
      .length,
    revenueGrowth: 12.5, // Mock growth percentage
    transactionGrowth: 8.3,
    customerGrowth: 15.2,
  };

  const topCustomers = clients
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  const recentPurchases = [
    {
      id: "1",
      customer: "María González",
      amount: 85.5,
      items: 12,
      date: "2024-11-29",
      time: "14:30",
      category: "Supermercado",
    },
    {
      id: "2",
      customer: "Carlos Rodríguez",
      amount: 42.25,
      items: 7,
      date: "2024-11-29",
      time: "12:15",
      category: "Panadería",
    },
    {
      id: "3",
      customer: "Ana Martínez",
      amount: 126.75,
      items: 18,
      date: "2024-11-29",
      time: "10:45",
      category: "Supermercado",
    },
  ];

  const customerSegments = [
    {
      segment: "Nuevos Clientes",
      count: clients.filter((c) => {
        const regDate = new Date(c.registrationDate);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return regDate > thirtyDaysAgo;
      }).length,
      percentage: 15,
      color: "bg-blue-100 text-blue-800",
    },
    {
      segment: "Clientes Regulares",
      count: clients.filter(
        (c) => c.totalPurchases >= 5 && c.totalPurchases <= 20,
      ).length,
      percentage: 45,
      color: "bg-green-100 text-green-800",
    },
    {
      segment: "Clientes VIP",
      count: clients.filter((c) => c.totalPurchases > 20).length,
      percentage: 25,
      color: "bg-purple-100 text-purple-800",
    },
    {
      segment: "Clientes Inactivos",
      count: clients.filter((c) => {
        if (!c.lastPurchase) return true;
        const lastPurchase = new Date(c.lastPurchase);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        return lastPurchase < sixtyDaysAgo;
      }).length,
      percentage: 15,
      color: "bg-gray-100 text-gray-800",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Ingresos Totales
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  Bs. {analytics.totalRevenue.toFixed(2)}
                </p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />+
                  {analytics.revenueGrowth}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Transacciones
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalTransactions}
                </p>
                <p className="text-sm text-blue-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />+
                  {analytics.transactionGrowth}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Ticket Promedio
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  Bs. {analytics.averageTicket.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Por transacción</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Clientes Recurrentes
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.repeatCustomers}
                </p>
                <p className="text-sm text-orange-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />+
                  {analytics.customerGrowth}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tendencia de Ventas</span>
              <div className="flex items-center space-x-2">
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last7days">7 días</SelectItem>
                    <SelectItem value="last30days">30 días</SelectItem>
                    <SelectItem value="last90days">90 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={purchaseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === "sales" ? `Bs. ${value}` : value,
                    name === "sales" ? "Ventas" : "Transacciones",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Customer Segments */}
      <Card>
        <CardHeader>
          <CardTitle>Segmentación de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {customerSegments.map((segment, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={segment.color}>{segment.segment}</Badge>
                  <span className="text-lg font-bold">{segment.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${segment.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {segment.percentage}% del total
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Customers and Recent Purchases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Top 10 Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Compras</TableHead>
                  <TableHead>Total Gastado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.map((customer, index) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold mr-3">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-500">
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{customer.totalPurchases}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      Bs. {customer.totalSpent.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Compras Recientes
              </span>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">{purchase.customer}</div>
                      <div className="text-sm text-gray-500">
                        {purchase.items} artículos • {purchase.category}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">Bs. {purchase.amount}</div>
                    <div className="text-sm text-gray-500">
                      {purchase.date} {purchase.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Volumen de Transacciones por Día</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={purchaseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="transactions" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseHistory;
