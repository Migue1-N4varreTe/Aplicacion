import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Award,
  TrendingUp,
  Target,
  Star,
  Clock,
  DollarSign,
} from "lucide-react";

const PerformanceDashboard = () => {
  const employeePerformance = [
    {
      id: "1",
      name: "Ana García",
      role: "Gerente",
      rating: 4.8,
      goals: 95,
      sales: 156000,
      attendance: 98,
      customerRating: 4.9,
      improvement: "+12%",
    },
    {
      id: "2",
      name: "Carlos López",
      role: "Cajero",
      rating: 4.5,
      goals: 87,
      sales: 89000,
      attendance: 95,
      customerRating: 4.6,
      improvement: "+8%",
    },
    {
      id: "3",
      name: "María Rodríguez",
      role: "Supervisor",
      rating: 4.7,
      goals: 92,
      sales: 0,
      attendance: 92,
      customerRating: 4.8,
      improvement: "+5%",
    },
    {
      id: "4",
      name: "Luis Hernández",
      role: "Cajero",
      rating: 4.3,
      goals: 78,
      sales: 67000,
      attendance: 88,
      customerRating: 4.4,
      improvement: "+15%",
    },
  ];

  const monthlyData = [
    { month: "Ene", ventas: 45000, objetivos: 50000 },
    { month: "Feb", ventas: 52000, objetivos: 55000 },
    { month: "Mar", ventas: 48000, objetivos: 50000 },
    { month: "Abr", ventas: 61000, objetivos: 60000 },
    { month: "May", ventas: 58000, objetivos: 65000 },
    { month: "Jun", ventas: 67000, objetivos: 65000 },
  ];

  const kpiData = [
    {
      title: "Productividad Promedio",
      value: "89%",
      icon: Target,
      trend: "+5%",
      color: "text-green-600",
    },
    {
      title: "Satisfacción Cliente",
      value: "4.7/5",
      icon: Star,
      trend: "+0.2",
      color: "text-yellow-600",
    },
    {
      title: "Cumplimiento Objetivos",
      value: "88%",
      icon: Award,
      trend: "+12%",
      color: "text-blue-600",
    },
    {
      title: "Eficiencia Operativa",
      value: "92%",
      icon: Clock,
      trend: "+7%",
      color: "text-purple-600",
    },
  ];

  const topPerformers = employeePerformance
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-yellow-600";
    if (rating >= 3.5) return "text-orange-600";
    return "text-red-600";
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return "success";
    if (rating >= 4.0) return "warning";
    if (rating >= 3.5) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className={`text-xs ${kpi.color} flex items-center`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {kpi.trend} vs mes anterior
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico de Rendimiento */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas vs Objetivos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    `$${value.toLocaleString()}`,
                    name === "ventas" ? "Ventas" : "Objetivos",
                  ]}
                />
                <Bar dataKey="ventas" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="objetivos" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Mejores Empleados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((employee, index) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-yellow-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {employee.role}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-lg font-bold ${getRatingColor(employee.rating)}`}
                    >
                      {employee.rating}/5
                    </div>
                    <Badge
                      variant={getRatingBadge(employee.rating) as any}
                      className="text-xs"
                    >
                      {employee.improvement}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Rendimiento Detallado */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento Detallado por Empleado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employeePerformance.map((employee) => (
              <div key={employee.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{employee.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {employee.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRatingBadge(employee.rating) as any}>
                      Rating: {employee.rating}/5
                    </Badge>
                    <Badge variant="outline" className="text-green-600">
                      {employee.improvement}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Objetivos:</span>
                      <span>{employee.goals}%</span>
                    </div>
                    <Progress value={employee.goals} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Asistencia:</span>
                      <span>{employee.attendance}%</span>
                    </div>
                    <Progress value={employee.attendance} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Satisfacción Cliente:</span>
                      <span>{employee.customerRating}/5</span>
                    </div>
                    <Progress
                      value={(employee.customerRating / 5) * 100}
                      className="h-2"
                    />
                  </div>

                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Ventas</div>
                    <div className="font-bold text-lg flex items-center justify-center">
                      {employee.sales > 0 ? (
                        <>
                          <DollarSign className="w-4 h-4 mr-1" />
                          {employee.sales.toLocaleString()}
                        </>
                      ) : (
                        "N/A"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Objetivos y Metas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Objetivos del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ventas Totales:</span>
                  <span>$520K / $600K</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Satisfacción Cliente:</span>
                  <span>4.7 / 5.0</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Asistencia General:</span>
                  <span>93% / 95%</span>
                </div>
                <Progress value={93} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Capacitaciones:</span>
                  <span>15 / 20</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reconocimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <div>
                    <div className="font-medium">Empleado del Mes</div>
                    <div className="text-sm text-muted-foreground">
                      Ana García
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">Junio 2024</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Mejor Atención</div>
                    <div className="text-sm text-muted-foreground">
                      Carlos López
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">Mayo 2024</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Meta Superada</div>
                    <div className="text-sm text-muted-foreground">
                      Luis Hernández
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">Abril 2024</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
