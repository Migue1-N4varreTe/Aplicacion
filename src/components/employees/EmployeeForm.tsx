import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "inactive" | "vacation";
  startDate: string;
  phone: string;
  salary: number;
}

interface EmployeeFormProps {
  employee?: Employee | null;
  onSave: () => void;
  onCancel: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    salary: "",
    startDate: "",
    status: "active" as "active" | "inactive" | "vacation",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        role: employee.role || "",
        department: employee.department || "",
        salary: employee.salary?.toString() || "",
        startDate: employee.startDate ? employee.startDate.split("T")[0] : "",
        status: employee.status || "active",
        address: "",
        emergencyContact: "",
        emergencyPhone: "",
        isActive: employee.status === "active",
      });
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.role) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Simular guardado
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Éxito",
        description: employee
          ? "Empleado actualizado exitosamente"
          : "Empleado creado exitosamente",
      });
      onSave();
    } catch (error) {
      console.error("Error saving employee:", error);
      toast({
        title: "Error",
        description: "Error al guardar empleado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const roles = [
    "Gerente",
    "Supervisor",
    "Cajero",
    "Almacenista",
    "Vendedor",
    "Seguridad",
    "Limpieza",
  ];

  const departments = [
    "Administración",
    "Ventas",
    "Inventario",
    "Caja",
    "Seguridad",
    "Mantenimiento",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nombre completo del empleado"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="correo@empresa.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+52 555 123 4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de Ingreso</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Dirección completa"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información Laboral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">
                Puesto <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar puesto" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">
                Departamento <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  handleInputChange("department", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">Salario Mensual</Label>
              <Input
                id="salary"
                type="number"
                step="0.01"
                min="0"
                value={formData.salary}
                onChange={(e) => handleInputChange("salary", e.target.value)}
                placeholder="15000.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive" | "vacation") =>
                  handleInputChange("status", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="vacation">Vacaciones</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contacto de Emergencia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Nombre del Contacto</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) =>
                  handleInputChange("emergencyContact", e.target.value)
                }
                placeholder="Nombre del familiar o contacto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
              <Input
                id="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={(e) =>
                  handleInputChange("emergencyPhone", e.target.value)
                }
                placeholder="+52 555 987 6543"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                handleInputChange("isActive", checked)
              }
            />
            <Label htmlFor="isActive">Empleado activo</Label>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : employee ? "Actualizar" : "Crear"}{" "}
          Empleado
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;
