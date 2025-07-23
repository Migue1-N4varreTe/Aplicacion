import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
} from "lucide-react";

const AttendanceTracker = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");

  const attendanceData = [
    {
      id: "1",
      name: "Ana García",
      role: "Gerente",
      status: "present",
      checkIn: "08:00",
      checkOut: "17:30",
      totalHours: "9.5",
      breakTime: "1.0",
    },
    {
      id: "2",
      name: "Carlos López",
      role: "Cajero",
      status: "present",
      checkIn: "09:00",
      checkOut: "18:00",
      totalHours: "8.0",
      breakTime: "1.0",
    },
    {
      id: "3",
      name: "María Rodríguez",
      role: "Supervisor",
      status: "vacation",
      checkIn: "--",
      checkOut: "--",
      totalHours: "--",
      breakTime: "--",
    },
    {
      id: "4",
      name: "Luis Hernández",
      role: "Cajero",
      status: "late",
      checkIn: "09:30",
      checkOut: "18:30",
      totalHours: "8.0",
      breakTime: "1.0",
    },
    {
      id: "5",
      name: "Sandra Morales",
      role: "Almacenista",
      status: "absent",
      checkIn: "--",
      checkOut: "--",
      totalHours: "--",
      breakTime: "--",
    },
  ];

  const weeklyStats = [
    { day: "Lun", present: 18, total: 20, percentage: 90 },
    { day: "Mar", present: 19, total: 20, percentage: 95 },
    { day: "Mié", present: 17, total: 20, percentage: 85 },
    { day: "Jue", present: 18, total: 20, percentage: 90 },
    { day: "Vie", present: 20, total: 20, percentage: 100 },
    { day: "Sáb", present: 15, total: 18, percentage: 83 },
    { day: "Dom", present: 12, total: 15, percentage: 80 },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "late":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "absent":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "vacation":
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "present":
        return "Presente";
      case "late":
        return "Tardanza";
      case "absent":
        return "Ausente";
      case "vacation":
        return "Vacaciones";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "success";
      case "late":
        return "warning";
      case "absent":
        return "destructive";
      case "vacation":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="text-sm font-medium">Empleado:</label>
            <Select
              value={selectedEmployee}
              onValueChange={setSelectedEmployee}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los empleados</SelectItem>
                <SelectItem value="1">Ana García</SelectItem>
                <SelectItem value="2">Carlos López</SelectItem>
                <SelectItem value="3">María Rodríguez</SelectItem>
                <SelectItem value="4">Luis Hernández</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendario */}
        <Card>
          <CardHeader>
            <CardTitle>Calendario</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setSelectedDate(date || new Date())}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Estadísticas Semanales */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Asistencia Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-sm font-medium">{stat.day}</div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>
                      {stat.present}/{stat.total}
                    </span>
                    <Badge
                      variant={
                        stat.percentage >= 90
                          ? "default"
                          : stat.percentage >= 80
                            ? "warning"
                            : "destructive"
                      }
                    >
                      {stat.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registro de Asistencia */}
      <Card>
        <CardHeader>
          <CardTitle>
            Registro de Asistencia -{" "}
            {selectedDate.toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceData.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(record.status)}
                  <div>
                    <div className="font-medium">{record.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {record.role}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex flex-col items-center">
                    <div className="text-xs text-muted-foreground">Entrada</div>
                    <div className="font-medium">{record.checkIn}</div>
                  </div>

                  <div className="hidden sm:flex flex-col items-center">
                    <div className="text-xs text-muted-foreground">Salida</div>
                    <div className="font-medium">{record.checkOut}</div>
                  </div>

                  <div className="hidden md:flex flex-col items-center">
                    <div className="text-xs text-muted-foreground">Total</div>
                    <div className="font-medium">{record.totalHours}h</div>
                  </div>

                  <Badge variant={getStatusColor(record.status) as any}>
                    {getStatusLabel(record.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumen del Día */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Presentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {
                attendanceData.filter(
                  (r) => r.status === "present" || r.status === "late",
                ).length
              }
            </div>
            <div className="text-xs text-muted-foreground">
              de {attendanceData.length} empleados
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tardanzas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {attendanceData.filter((r) => r.status === "late").length}
            </div>
            <div className="text-xs text-muted-foreground">empleados tarde</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ausentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {attendanceData.filter((r) => r.status === "absent").length}
            </div>
            <div className="text-xs text-muted-foreground">
              sin justificación
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Asistencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (attendanceData.filter(
                  (r) => r.status === "present" || r.status === "late",
                ).length /
                  attendanceData.length) *
                  100,
              )}
              %
            </div>
            <div className="text-xs text-muted-foreground">del total</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceTracker;
