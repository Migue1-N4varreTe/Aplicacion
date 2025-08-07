import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Globe,
  User,
  Lock,
  Eye,
  EyeOff,
  Save,
  Moon,
  Sun,
  Volume2,
  VolumeX,
} from "lucide-react";

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    orderUpdates: true,
    promotions: true,
    newProducts: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "private",
    showOnlineStatus: false,
    allowDataCollection: true,
    shareAnalytics: false,
    allowMarketing: false,
  });

  const [appearance, setAppearance] = useState({
    theme: "light",
    language: "es",
    currency: "VES",
    timezone: "America/Caracas",
    soundEffects: true,
    animations: true,
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Configuración guardada",
        description: "Los cambios han sido aplicados exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.new.length < 6) {
      toast({
        title: "Error",
        description: "La nueva contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Simulate password change
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setPasswordData({ current: "", new: "", confirm: "" });
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar la contraseña",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.",
      )
    ) {
      try {
        await logout();
        navigate("/");
        toast({
          title: "Cuenta eliminada",
          description: "Tu cuenta ha sido eliminada exitosamente",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la cuenta",
          variant: "destructive",
        });
      }
    }
  };

  // Handle navigation when user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuración
          </h1>
          <p className="text-gray-600">
            Gestiona tu cuenta y preferencias de la aplicación
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Privacidad
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center">
              <Palette className="h-4 w-4 mr-2" />
              Apariencia
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      defaultValue={user.first_name}
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      defaultValue={user.last_name}
                      placeholder="Tu apellido"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user.email}
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Rol</Label>
                    <Input
                      id="role"
                      defaultValue={user.role}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Contraseña Actual</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.current}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          current: e.target.value,
                        })
                      }
                      placeholder="Contraseña actual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.new}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          new: e.target.value,
                        })
                      }
                      placeholder="Nueva contrase��a"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">
                    Confirmar Nueva Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirm}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirm: e.target.value,
                        })
                      }
                      placeholder="Confirmar nueva contraseña"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button onClick={handleChangePassword} disabled={isSaving}>
                  {isSaving ? "Cambiando..." : "Cambiar Contraseña"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de Notificaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificaciones por Email</h4>
                    <p className="text-sm text-gray-600">
                      Recibir notificaciones en tu email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, email: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificaciones Push</h4>
                    <p className="text-sm text-gray-600">
                      Recibir notificaciones en el navegador
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, push: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Actualizaciones de Pedidos</h4>
                    <p className="text-sm text-gray-600">
                      Notificaciones sobre el estado de tus pedidos
                    </p>
                  </div>
                  <Switch
                    checked={notifications.orderUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        orderUpdates: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Promociones</h4>
                    <p className="text-sm text-gray-600">
                      Recibir ofertas y promociones especiales
                    </p>
                  </div>
                  <Switch
                    checked={notifications.promotions}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        promotions: checked,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Privacidad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="visibility">Visibilidad del Perfil</Label>
                  <Select
                    value={privacy.profileVisibility}
                    onValueChange={(value) =>
                      setPrivacy({
                        ...privacy,
                        profileVisibility: value as any,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Público</SelectItem>
                      <SelectItem value="friends">Solo Amigos</SelectItem>
                      <SelectItem value="private">Privado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      Permitir Recolección de Datos
                    </h4>
                    <p className="text-sm text-gray-600">
                      Ayudar a mejorar el servicio compartiendo datos anónimos
                    </p>
                  </div>
                  <Switch
                    checked={privacy.allowDataCollection}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, allowDataCollection: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Marketing</h4>
                    <p className="text-sm text-gray-600">
                      Recibir comunicaciones de marketing personalizadas
                    </p>
                  </div>
                  <Switch
                    checked={privacy.allowMarketing}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, allowMarketing: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personalización de la Interfaz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="theme">Tema</Label>
                  <Select
                    value={appearance.theme}
                    onValueChange={(value) =>
                      setAppearance({ ...appearance, theme: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center">
                          <Sun className="h-4 w-4 mr-2" />
                          Claro
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center">
                          <Moon className="h-4 w-4 mr-2" />
                          Oscuro
                        </div>
                      </SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    value={appearance.language}
                    onValueChange={(value) =>
                      setAppearance({ ...appearance, language: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currency">Moneda</Label>
                  <Select
                    value={appearance.currency}
                    onValueChange={(value) =>
                      setAppearance({ ...appearance, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VES">Bolívar Soberano (Bs)</SelectItem>
                      <SelectItem value="USD">
                        Dólar Estadounidense ($)
                      </SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Efectos de Sonido</h4>
                    <p className="text-sm text-gray-600">
                      Reproducir sonidos en la interfaz
                    </p>
                  </div>
                  <Switch
                    checked={appearance.soundEffects}
                    onCheckedChange={(checked) =>
                      setAppearance({ ...appearance, soundEffects: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Animaciones</h4>
                    <p className="text-sm text-gray-600">
                      Mostrar animaciones y transiciones
                    </p>
                  </div>
                  <Switch
                    checked={appearance.animations}
                    onCheckedChange={(checked) =>
                      setAppearance({ ...appearance, animations: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Guardar Cambios</h4>
                <p className="text-sm text-gray-600">
                  Los cambios se aplicarán inmediatamente
                </p>
              </div>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Guardando..." : "Guardar Configuración"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Zona de Peligro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-600">Eliminar Cuenta</h4>
                <p className="text-sm text-gray-600">
                  Esta acción eliminará permanentemente tu cuenta y todos tus
                  datos
                </p>
              </div>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Eliminar Cuenta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
