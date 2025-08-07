import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  MapPin,
  CreditCard,
  Bell,
  Shield,
  Heart,
  Clock,
  Gift,
  Star,
  Edit3,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  references: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: "card" | "bank" | "digital";
  name: string;
  lastFour?: string;
  isDefault: boolean;
}

const GestionarPerfil = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estado del formulario personal
  const [personalData, setPersonalData] = useState({
    name: user?.name || "Miguel Navarrete",
    email: user?.email || "miguel@example.com",
    phone: "+58 412-555-0123",
    birthday: "1990-03-15",
    gender: "masculino",
    preferences: ["frutas-verduras", "lacteos", "carnes"],
  });

  // Direcciones guardadas
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      name: "Casa",
      street:
        "Av. Francisco de Miranda, Torre Parque Boyacá, Piso 12, Apt 12-A",
      city: "Caracas",
      state: "Miranda",
      postalCode: "1060",
      references: "Torre azul frente al Metro Los Dos Caminos",
      isDefault: true,
    },
    {
      id: "2",
      name: "Oficina",
      street:
        "Calle Madrid con Calle New York, Edificio Seguros Caracas, Piso 8",
      city: "Caracas",
      state: "Miranda",
      postalCode: "1050",
      references: "Zona Las Mercedes, cerca del C.C. San Ignacio",
      isDefault: false,
    },
  ]);

  // Métodos de pago
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "card",
      name: "Visa ****4532",
      lastFour: "4532",
      isDefault: true,
    },
    {
      id: "2",
      type: "digital",
      name: "Pago Móvil 0412",
      isDefault: false,
    },
    {
      id: "3",
      type: "bank",
      name: "Banco Venezuela",
      isDefault: false,
    },
  ]);

  // Configuración de notificaciones
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    sms: true,
    whatsapp: true,
    email: true,
  });

  const handlePersonalDataChange = (field: string, value: string) => {
    setPersonalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePersonalData = () => {
    // Aquí se guardarían los datos
    setIsEditing(false);
    // Simular guardado
    console.log("Datos guardados:", personalData);
  };

  const toggleNotification = (key: string) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-brand-500 to-fresh-500 text-white py-12">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-lg">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="font-display font-bold text-3xl lg:text-4xl">
                  Gestionar Perfil
                </h1>
                <p className="text-white/90 text-lg">
                  Administra tu información personal y preferencias
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Personal</span>
              </TabsTrigger>
              <TabsTrigger
                value="addresses"
                className="flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Direcciones</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Pagos</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notificaciones</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Seguridad</span>
              </TabsTrigger>
            </TabsList>

            {/* Información Personal */}
            <TabsContent value="personal" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Información Personal</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Guardar
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Editar
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        value={personalData.name}
                        onChange={(e) =>
                          handlePersonalDataChange("name", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={personalData.email}
                        onChange={(e) =>
                          handlePersonalDataChange("email", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={personalData.phone}
                        onChange={(e) =>
                          handlePersonalDataChange("phone", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthday">Fecha de nacimiento</Label>
                      <Input
                        id="birthday"
                        type="date"
                        value={personalData.birthday}
                        onChange={(e) =>
                          handlePersonalDataChange("birthday", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Género</Label>
                    <Select
                      value={personalData.gender}
                      onValueChange={(value) =>
                        handlePersonalDataChange("gender", value)
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                        <SelectItem value="prefiero-no-decir">
                          Prefiero no decir
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Estadísticas del usuario */}
                  <Separator />
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-brand-50 rounded-lg">
                      <div className="text-2xl font-bold text-brand-600">
                        47
                      </div>
                      <div className="text-sm text-gray-600">
                        Pedidos realizados
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        1,245
                      </div>
                      <div className="text-sm text-gray-600">
                        Puntos acumulados
                      </div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        $2,890
                      </div>
                      <div className="text-sm text-gray-600">Total gastado</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Direcciones */}
            <TabsContent value="addresses" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Direcciones Guardadas</CardTitle>
                      <p className="text-gray-600">
                        Administra tus direcciones de entrega
                      </p>
                    </div>
                    <Button size="sm" className="btn-gradient">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar dirección
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{address.name}</h3>
                          {address.isDefault && (
                            <Badge variant="secondary">Por defecto</Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>{address.street}</div>
                        <div>
                          {address.city}, {address.state} {address.postalCode}
                        </div>
                        <div className="mt-1 italic">
                          Referencias: {address.references}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Métodos de Pago */}
            <TabsContent value="payments" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Métodos de Pago</CardTitle>
                      <p className="text-gray-600">
                        Gestiona tus métodos de pago preferidos
                      </p>
                    </div>
                    <Button size="sm" className="btn-gradient">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar método
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-2 rounded">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium">{method.name}</div>
                            {method.isDefault && (
                              <Badge variant="secondary" className="mt-1">
                                Por defecto
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notificaciones */}
            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferencias de Notificaciones</CardTitle>
                  <p className="text-gray-600">
                    Configura cómo quieres recibir actualizaciones
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          Actualizaciones de pedidos
                        </div>
                        <div className="text-sm text-gray-600">
                          Recibe notificaciones sobre el estado de tus pedidos
                        </div>
                      </div>
                      <Switch
                        checked={notifications.orderUpdates}
                        onCheckedChange={() =>
                          toggleNotification("orderUpdates")
                        }
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Promociones y ofertas</div>
                        <div className="text-sm text-gray-600">
                          Recibe información sobre descuentos y ofertas
                          especiales
                        </div>
                      </div>
                      <Switch
                        checked={notifications.promotions}
                        onCheckedChange={() => toggleNotification("promotions")}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Newsletter semanal</div>
                        <div className="text-sm text-gray-600">
                          Recibe nuestro boletín con productos nuevos y consejos
                        </div>
                      </div>
                      <Switch
                        checked={notifications.newsletter}
                        onCheckedChange={() => toggleNotification("newsletter")}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Canales de notificación</h4>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">WhatsApp</div>
                        <Badge variant="outline" className="text-green-600">
                          Recomendado
                        </Badge>
                      </div>
                      <Switch
                        checked={notifications.whatsapp}
                        onCheckedChange={() => toggleNotification("whatsapp")}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="font-medium">SMS</div>
                      <Switch
                        checked={notifications.sms}
                        onCheckedChange={() => toggleNotification("sms")}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="font-medium">Email</div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={() => toggleNotification("email")}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Seguridad */}
            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Seguridad de la Cuenta</CardTitle>
                  <p className="text-gray-600">Mantén tu cuenta segura</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">
                        Contraseña actual
                      </Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Ingresa tu contraseña actual"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nueva contraseña</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Confirmar nueva contraseña
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Repite la nueva contraseña"
                      />
                    </div>

                    <Button className="btn-gradient">Cambiar contraseña</Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">
                      Autenticación de dos factores
                    </h4>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">SMS de verificación</div>
                        <div className="text-sm text-gray-600">
                          Recibe un código por SMS para verificar tu identidad
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Configurar
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Sesiones activas</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Dispositivo actual</div>
                          <div className="text-sm text-gray-600">
                            Chrome en Windows • Caracas, Venezuela
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-600">
                          Activa
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">iPhone</div>
                          <div className="text-sm text-gray-600">
                            Safari en iOS • Hace 2 días
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                        >
                          Cerrar sesión
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default GestionarPerfil;
