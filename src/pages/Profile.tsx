import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  Heart,
  Bell,
  Shield,
  CreditCard,
  Gift,
  Star,
  Edit,
  Save,
  Camera,
  Package,
  Truck,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    offers: boolean;
    orderUpdates: boolean;
  };
  privacy: {
    showProfile: boolean;
    shareData: boolean;
  };
}

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { cartCount } = useCart();
  const { favoriteCount } = useFavorites();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    birthday: user?.birthday || "",
    address: {
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      postalCode: user?.address?.postalCode || "",
    },
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: {
      email: true,
      push: true,
      sms: false,
      offers: true,
      orderUpdates: true,
    },
    privacy: {
      showProfile: false,
      shareData: false,
    },
  });

  // Mock user stats and recent orders
  const userStats = {
    totalOrders: 47,
    totalSpent: 3250,
    memberSince: "2023",
    loyaltyPoints: 1250,
    favoriteCategory: "Frutas y Verduras",
  };

  const recentOrders = [
    {
      id: "ORD-2024-001",
      date: "2024-01-15",
      status: "entregado",
      total: 89.5,
      items: 8,
    },
    {
      id: "ORD-2024-002",
      date: "2024-01-12",
      status: "entregado",
      total: 125.3,
      items: 12,
    },
    {
      id: "ORD-2024-003",
      date: "2024-01-08",
      status: "entregado",
      total: 67.8,
      items: 6,
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update user profile
    await updateProfile(formData);

    setIsEditing(false);
    setIsSaving(false);
  };

  const handlePreferenceChange = (
    category: keyof UserPreferences,
    key: string,
    value: boolean,
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "entregado":
        return "bg-green-100 text-green-700";
      case "en_camino":
        return "bg-blue-100 text-blue-700";
      case "preparando":
        return "bg-yellow-100 text-yellow-700";
      case "cancelado":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "entregado":
        return <CheckCircle className="w-4 h-4" />;
      case "en_camino":
        return <Truck className="w-4 h-4" />;
      case "preparando":
        return <Package className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container px-4 py-16 text-center">
          <p className="text-gray-600">Inicia sesión para ver tu perfil</p>
          <Button asChild className="mt-4">
            <Link to="/login">Iniciar sesión</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-brand-500 to-fresh-500 h-32"></div>
            <CardContent className="relative px-6 pb-6">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarFallback className="text-2xl bg-white text-brand-600">
                      {user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full p-0 bg-brand-500 hover:bg-brand-600"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h1 className="font-display font-bold text-2xl text-gray-900">
                        {user.name}
                      </h1>
                      <p className="text-gray-600 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge className="bg-brand-100 text-brand-700">
                          <Star className="w-3 h-3 mr-1" />
                          Cliente VIP
                        </Badge>
                        <Badge variant="outline">
                          Miembro desde {userStats.memberSince}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      variant={isEditing ? "outline" : "default"}
                      className="w-fit"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {isEditing ? "Cancelar" : "Editar perfil"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-brand-600 mb-1">
                {userStats.totalOrders}
              </div>
              <div className="text-sm text-gray-600">Pedidos realizados</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                ${userStats.totalSpent.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total gastado</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {userStats.loyaltyPoints}
              </div>
              <div className="text-sm text-gray-600">Puntos de lealtad</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {favoriteCount}
              </div>
              <div className="text-sm text-gray-600">Productos favoritos</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="preferences">Preferencias</TabsTrigger>
            <TabsTrigger value="loyalty">Puntos</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Información personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      disabled={!isEditing}
                      placeholder="+52 55 1234 5678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthday">Fecha de nacimiento</Label>
                    <Input
                      id="birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={(e) =>
                        handleInputChange("birthday", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>

                  {isEditing && (
                    <Button
                      onClick={handleSave}
                      className="w-full btn-gradient"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Guardar cambios
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Dirección
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Calle y número</Label>
                    <Input
                      id="street"
                      value={formData.address.street}
                      onChange={(e) =>
                        handleInputChange("address.street", e.target.value)
                      }
                      disabled={!isEditing}
                      placeholder="Av. Polanco 123"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={formData.address.city}
                        onChange={(e) =>
                          handleInputChange("address.city", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Select
                        value={formData.address.state}
                        onValueChange={(value) =>
                          handleInputChange("address.state", value)
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CDMX">Ciudad de México</SelectItem>
                          <SelectItem value="MEX">Estado de México</SelectItem>
                          <SelectItem value="JAL">Jalisco</SelectItem>
                          <SelectItem value="NL">Nuevo León</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Código postal</Label>
                    <Input
                      id="postalCode"
                      value={formData.address.postalCode}
                      onChange={(e) =>
                        handleInputChange("address.postalCode", e.target.value)
                      }
                      disabled={!isEditing}
                      placeholder="11550"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Pedidos recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-brand-600">
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.date).toLocaleDateString("es-MX", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.items} productos
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${order.total}</p>
                        <Badge
                          className={cn(
                            "text-xs",
                            getStatusColor(order.status),
                          )}
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button variant="outline" asChild>
                    <Link to="/orders">Ver todos los pedidos</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notificaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(preferences.notifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <Label htmlFor={key} className="text-sm">
                          {key === "email" && "Notificaciones por email"}
                          {key === "push" && "Notificaciones push"}
                          {key === "sms" && "Mensajes SMS"}
                          {key === "offers" && "Ofertas y promociones"}
                          {key === "orderUpdates" &&
                            "Actualizaciones de pedidos"}
                        </Label>
                        <Switch
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) =>
                            handlePreferenceChange(
                              "notifications",
                              key,
                              checked,
                            )
                          }
                        />
                      </div>
                    ),
                  )}
                </CardContent>
              </Card>

              {/* Privacy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacidad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(preferences.privacy).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <Label htmlFor={key} className="text-sm">
                        {key === "showProfile" && "Perfil público"}
                        {key === "shareData" &&
                          "Compartir datos para mejorar el servicio"}
                      </Label>
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange("privacy", key, checked)
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Loyalty Tab */}
          <TabsContent value="loyalty" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Programa de lealtad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {userStats.loyaltyPoints}
                  </div>
                  <p className="text-gray-600">Puntos disponibles</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Próximo nivel: 250 puntos más
                  </p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4">¿Cómo ganar puntos?</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>1 punto por cada $10 gastados</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>50 puntos por reseñas de productos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>100 puntos por referir amigos</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full btn-gradient">
                  <Gift className="w-4 h-4 mr-2" />
                  Canjear puntos
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
