import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import PermissionGuard from "@/components/PermissionGuard";
import Navbar from "@/components/Navbar";
import apiService from "@/services/api";
import {
  Users,
  UserPlus,
  Shield,
  Clock,
  Activity,
  BarChart3,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  level: number;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

const ROLES = {
  LEVEL_5_DEVELOPER: "Desarrollador",
  LEVEL_4_OWNER: "Propietario",
  LEVEL_3_MANAGER: "Gerente",
  LEVEL_2_SUPERVISOR: "Supervisor",
  LEVEL_1_CASHIER: "Cajero",
};

const ROLE_COLORS = {
  LEVEL_5_DEVELOPER: "bg-purple-100 text-purple-800",
  LEVEL_4_OWNER: "bg-red-100 text-red-800",
  LEVEL_3_MANAGER: "bg-blue-100 text-blue-800",
  LEVEL_2_SUPERVISOR: "bg-green-100 text-green-800",
  LEVEL_1_CASHIER: "bg-gray-100 text-gray-800",
};

const Admin: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUserDialog, setNewUserDialog] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "LEVEL_1_CASHIER",
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      setUsers(response);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await apiService.register(newUserData);
      toast({
        title: "Éxito",
        description: "Usuario creado exitosamente",
      });
      setNewUserDialog(false);
      setNewUserData({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "LEVEL_1_CASHIER",
      });
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el usuario",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await apiService.updateUserRole(userId, newRole);
      toast({
        title: "Éxito",
        description: "Rol actualizado exitosamente",
      });
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el rol",
        variant: "destructive",
      });
    }
  };

  const handleGrantTempPermission = async (
    userId: string,
    permission: string,
  ) => {
    try {
      await apiService.grantTemporaryPermission(userId, permission, 120);
      toast({
        title: "Éxito",
        description: "Permiso temporal otorgado por 2 horas",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo otorgar el permiso temporal",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">
              Debes iniciar sesión para acceder a esta página
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <PermissionGuard
          permission="staff:view"
          fallback={
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Acceso Restringido
              </h2>
              <p className="text-gray-600">
                No tienes permisos para acceder al panel de administración
              </p>
            </div>
          }
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Panel de Administración
            </h1>
            <p className="text-gray-600">
              Gestiona usuarios, roles y permisos del sistema
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Usuarios
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Usuarios Activos
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((u) => u.is_active).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gerentes</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((u) => u.level >= 3).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cajeros</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((u) => u.level === 1).length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
              <TabsTrigger value="permissions">Permisos</TabsTrigger>
              <TabsTrigger value="audit">Auditoría</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Usuarios del Sistema</CardTitle>
                      <CardDescription>
                        Gestiona usuarios, roles y permisos de acceso
                      </CardDescription>
                    </div>
                    <PermissionGuard permission="staff:create">
                      <Dialog
                        open={newUserDialog}
                        onOpenChange={setNewUserDialog}
                      >
                        <DialogTrigger asChild>
                          <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Crear Usuario
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                            <DialogDescription>
                              Completa la información para crear un nuevo
                              usuario
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="first_name">Nombre</Label>
                                <Input
                                  id="first_name"
                                  value={newUserData.first_name}
                                  onChange={(e) =>
                                    setNewUserData({
                                      ...newUserData,
                                      first_name: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="last_name">Apellido</Label>
                                <Input
                                  id="last_name"
                                  value={newUserData.last_name}
                                  onChange={(e) =>
                                    setNewUserData({
                                      ...newUserData,
                                      last_name: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={newUserData.email}
                                onChange={(e) =>
                                  setNewUserData({
                                    ...newUserData,
                                    email: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="password">Contraseña</Label>
                              <Input
                                id="password"
                                type="password"
                                value={newUserData.password}
                                onChange={(e) =>
                                  setNewUserData({
                                    ...newUserData,
                                    password: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="role">Rol</Label>
                              <Select
                                value={newUserData.role}
                                onValueChange={(value) =>
                                  setNewUserData({
                                    ...newUserData,
                                    role: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(ROLES).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => setNewUserDialog(false)}
                              >
                                Cancelar
                              </Button>
                              <Button onClick={handleCreateUser}>
                                Crear Usuario
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </PermissionGuard>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Cargando usuarios...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuario</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Último Acceso</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {user.first_name} {user.last_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Nivel {user.level}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  ROLE_COLORS[
                                    user.role as keyof typeof ROLE_COLORS
                                  ]
                                }
                              >
                                {ROLES[user.role as keyof typeof ROLES]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  user.is_active ? "default" : "secondary"
                                }
                              >
                                {user.is_active ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.last_login_at
                                ? new Date(
                                    user.last_login_at,
                                  ).toLocaleDateString()
                                : "Nunca"}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <PermissionGuard permission="staff:manage_roles">
                                  <Select
                                    value={user.role}
                                    onValueChange={(newRole) =>
                                      handleUpdateRole(user.id, newRole)
                                    }
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.entries(ROLES).map(
                                        ([key, label]) => (
                                          <SelectItem key={key} value={key}>
                                            {label}
                                          </SelectItem>
                                        ),
                                      )}
                                    </SelectContent>
                                  </Select>
                                </PermissionGuard>

                                <PermissionGuard level={2}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleGrantTempPermission(
                                        user.id,
                                        "sales:apply_discount",
                                      )
                                    }
                                  >
                                    <Clock className="h-4 w-4 mr-1" />
                                    Permiso Temp
                                  </Button>
                                </PermissionGuard>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions">
              <Card>
                <CardHeader>
                  <CardTitle>Matriz de Permisos</CardTitle>
                  <CardDescription>
                    Visualiza los permisos por rol en el sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    Matriz de permisos en desarrollo...
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit">
              <Card>
                <CardHeader>
                  <CardTitle>Registro de Auditoría</CardTitle>
                  <CardDescription>
                    Historial de acciones importantes del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    Registro de auditoría en desarrollo...
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </PermissionGuard>
      </div>
    </div>
  );
};

export default Admin;
