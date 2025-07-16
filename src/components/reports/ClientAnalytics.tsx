import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Star, TrendingUp, Award, Heart, Clock } from "lucide-react";

const ClientAnalytics = () => {
  const topClients = [
    { name: "María González", purchases: 45, spent: 12450, points: 1245 },
    { name: "Carlos López", purchases: 38, spent: 9800, points: 980 },
    { name: "Ana Martínez", purchases: 32, spent: 8650, points: 865 },
    { name: "Luis Hernández", purchases: 28, spent: 7200, points: 720 },
  ];

  const loyaltyStats = [
    { tier: "Oro", clients: 15, percentage: 85, color: "bg-yellow-500" },
    { tier: "Plata", clients: 45, percentage: 65, color: "bg-gray-400" },
    { tier: "Bronce", clients: 128, percentage: 45, color: "bg-orange-600" },
    { tier: "Nuevo", clients: 234, percentage: 25, color: "bg-blue-500" },
  ];

  const clientBehavior = [
    {
      metric: "Visita Promedio",
      value: "2.3x",
      description: "veces por semana",
    },
    { metric: "Ticket Promedio", value: "$485", description: "por compra" },
    { metric: "Tiempo en Tienda", value: "18 min", description: "promedio" },
    { metric: "Satisfacción", value: "4.7/5", description: "calificación" },
  ];

  const recentActivity = [
    {
      client: "María González",
      action: "Canjeó 500 puntos",
      time: "2 min",
      type: "redeem",
    },
    {
      client: "Carlos López",
      action: "Compra por $650",
      time: "15 min",
      type: "purchase",
    },
    {
      client: "Ana Martínez",
      action: "Ganó 65 puntos",
      time: "1 hora",
      type: "earn",
    },
    {
      client: "Luis Hernández",
      action: "Nuevo registro",
      time: "2 horas",
      type: "register",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Métricas de Clientes */}
      <div className="grid gap-4 md:grid-cols-4">
        {clientBehavior.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{metric.metric}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-xs text-muted-foreground">
                {metric.description}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Mejores Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topClients.map((client, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-brand-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {client.purchases} compras
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      ${client.spent.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Star className="w-3 h-3 mr-1 text-yellow-500" />
                      {client.points} pts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Programa de Lealtad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Programa de Lealtad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loyaltyStats.map((tier, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                      <span className="font-medium">{tier.tier}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {tier.clients} clientes
                    </span>
                  </div>
                  <Progress value={tier.percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {tier.percentage}% de engagement
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actividad Reciente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "purchase"
                        ? "bg-green-500"
                        : activity.type === "redeem"
                          ? "bg-blue-500"
                          : activity.type === "earn"
                            ? "bg-yellow-500"
                            : "bg-purple-500"
                    }`}
                  />
                  <div>
                    <div className="font-medium">{activity.client}</div>
                    <div className="text-sm text-muted-foreground">
                      {activity.action}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  hace {activity.time}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Adicionales */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <div className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +23 este mes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Puntos Canjeados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,840</div>
            <div className="text-xs text-blue-600">Equivalente a $1,584</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Retención</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84%</div>
            <div className="text-xs text-green-600">Clientes activos mes</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientAnalytics;
