import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Clock,
  Award,
  Users,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import EmployeeForm from "@/components/employees/EmployeeForm";
import AttendanceTracker from "@/components/employees/AttendanceTracker";
import PerformanceDashboard from "@/components/employees/PerformanceDashboard";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "inactive" | "vacation";
  avatar?: string;
  startDate: string;
  phone: string;
  salary: number;
  performance: {
    rating: number;
    sales: number;
    attendance: number;
  };
}

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);

      // Datos simulados para demo
      const mockEmployees: Employee[] = [
        {
          id: "1",
          name: "Ana García",
          email: "ana.garcia@laeconomica.com",
          role: "Gerente",
          department: "Administración",
          status: "active",
          startDate: "2023-01-15",
          phone: "+52 555 123 4567",
          salary: 25000,
          performance: { rating: 4.8, sales: 156000, attendance: 98 },
        },
        {
          id: "2",
          name: "Carlos López",
          email: "carlos.lopez@laeconomica.com",
          role: "Cajero",
          department: "Ventas",
          status: "active",
          startDate: "2023-03-20",
          phone: "+52 555 234 5678",
          salary: 15000,
          performance: { rating: 4.5, sales: 89000, attendance: 95 },
        },
        {
          id: "3",
          name: "María Rodríguez",
          email: "maria.rodriguez@laeconomica.com",
          role: "Supervisor",
          department: "Inventario",
          status: "vacation",
          startDate: "2022-08-10",
          phone: "+52 555 345 6789",
          salary: 20000,
          performance: { rating: 4.7, sales: 0, attendance: 92 },
        },
        {
          id: "4",
          name: "Luis Hernández",
          email: "luis.hernandez@laeconomica.com",
          role: "Cajero",
          department: "Ventas",
          status: "active",
          startDate: "2023-06-01",
          phone: "+52 555 456 7890",
          salary: 15000,
          performance: { rating: 4.3, sales: 67000, attendance: 88 },
        },
      ];

      setEmployees(mockEmployees);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los empleados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (!confirm(`¿Estás seguro de eliminar a ${employee.name}?`)) return;

    try {
      // Simular eliminación
      setEmployees((prev) => prev.filter((emp) => emp.id !== employee.id));
      toast({
        title: "Empleado eliminado",
        description: "El empleado ha sido eliminado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el empleado",
        variant: "destructive",
      });
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || employee.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || employee.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "destructive";
      case "vacation":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "inactive":
        return "Inactivo";
      case "vacation":
        return "Vacaciones";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Empleados</h1>
            <p className="text-muted-foreground">
              Administra tu equipo de trabajo
            </p>
          </div>

          <Dialog open={showEmployeeForm} onOpenChange={setShowEmployeeForm}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingEmployee(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Empleado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEmployee ? "Editar Empleado" : "Nuevo Empleado"}
                </DialogTitle>
              </DialogHeader>
              <EmployeeForm
                employee={editingEmployee}
                onSave={() => {
                  setShowEmployeeForm(false);
                  setEditingEmployee(null);
                  loadEmployees();
                }}
                onCancel={() => {
                  setShowEmployeeForm(false);
                  setEditingEmployee(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Empleados
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
              <p className="text-xs text-muted-foreground">+2 este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <Badge variant="success">
                {employees.filter((e) => e.status === "active").length}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  (employees.filter((e) => e.status === "active").length /
                    employees.length) *
                    100,
                )}
                %
              </div>
              <p className="text-xs text-muted-foreground">del total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Asistencia Promedio
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  employees.reduce(
                    (acc, emp) => acc + emp.performance.attendance,
                    0,
                  ) / employees.length,
                )}
                %
              </div>
              <p className="text-xs text-muted-foreground">este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rating Promedio
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(
                  employees.reduce(
                    (acc, emp) => acc + emp.performance.rating,
                    0,
                  ) / employees.length
                ).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">de 5.0 estrellas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees">
              <Users className="w-4 h-4 mr-2" />
              Empleados
            </TabsTrigger>
            <TabsTrigger value="attendance">
              <Clock className="w-4 h-4 mr-2" />
              Asistencia
            </TabsTrigger>
            <TabsTrigger value="performance">
              <Award className="w-4 h-4 mr-2" />
              Rendimiento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-4">
            {/* Filtros */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar empleados..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      <SelectItem value="Gerente">Gerente</SelectItem>
                      <SelectItem value="Supervisor">Supervisor</SelectItem>
                      <SelectItem value="Cajero">Cajero</SelectItem>
                      <SelectItem value="Almacenista">Almacenista</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="vacation">Vacaciones</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Más filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lista de empleados */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredEmployees.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    No hay empleados
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comienza agregando un nuevo empleado.
                  </p>
                </div>
              ) : (
                filteredEmployees.map((employee) => (
                  <Card
                    key={employee.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {employee.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {employee.role}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {employee.department}
                          </p>
                        </div>

                        <Badge variant={getStatusColor(employee.status) as any}>
                          {getStatusLabel(employee.status)}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Rating:</span>
                          <div className="font-semibold flex items-center">
                            <Award className="w-3 h-3 mr-1 text-yellow-500" />
                            {employee.performance.rating}/5
                          </div>
                        </div>

                        <div>
                          <span className="text-muted-foreground">
                            Asistencia:
                          </span>
                          <div className="font-semibold">
                            {employee.performance.attendance}%
                          </div>
                        </div>
                      </div>

                      {employee.performance.sales > 0 && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Ventas:</span>
                          <div className="font-semibold">
                            ${employee.performance.sales.toLocaleString()}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingEmployee(employee);
                            setShowEmployeeForm(true);
                          }}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEmployee(employee)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceTracker />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Employees;
