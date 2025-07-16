import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const SalesChart = () => {
  // Datos simulados para el gráfico
  const salesData = [
    { time: "08:00", ventas: 1200, transacciones: 15 },
    { time: "10:00", ventas: 2100, transacciones: 28 },
    { time: "12:00", ventas: 4500, transacciones: 45 },
    { time: "14:00", ventas: 3800, transacciones: 38 },
    { time: "16:00", ventas: 5200, transacciones: 52 },
    { time: "18:00", ventas: 6100, transacciones: 61 },
    { time: "20:00", ventas: 3900, transacciones: 35 },
  ];

  const weeklyData = [
    { day: "Lun", ventas: 12500 },
    { day: "Mar", ventas: 14200 },
    { day: "Mié", ventas: 13800 },
    { day: "Jue", ventas: 15600 },
    { day: "Vie", ventas: 18900 },
    { day: "Sáb", ventas: 22100 },
    { day: "Dom", ventas: 16800 },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Ventas del Día</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip
                formatter={(value: any, name: string) => [
                  name === "ventas" ? `$${value}` : value,
                  name === "ventas" ? "Ventas" : "Transacciones",
                ]}
              />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: "#f97316" }}
              />
              <Line
                type="monotone"
                dataKey="transacciones"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: "#22c55e" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ventas Semanales</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`$${value}`, "Ventas"]} />
              <Bar dataKey="ventas" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesChart;
