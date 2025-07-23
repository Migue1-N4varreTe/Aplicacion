import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  FileText,
  Image,
  Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const storeSettingsSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  legalName: z
    .string()
    .min(2, "La razón social debe tener al menos 2 caracteres"),
  rif: z.string().min(10, "El RIF debe tener al menos 10 caracteres"),
  address: z.string().min(10, "La dirección debe tener al menos 10 caracteres"),
  city: z.string().min(2, "La ciudad es requerida"),
  state: z.string().min(2, "El estado es requerido"),
  zipCode: z
    .string()
    .min(4, "El código postal debe tener al menos 4 caracteres"),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  email: z.string().email("Email inválido"),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  description: z.string().optional(),
  currency: z.string(),
  timezone: z.string(),
  language: z.string(),
});

type StoreSettingsFormData = z.infer<typeof storeSettingsSchema>;

const StoreSettings = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const [isOpen24Hours, setIsOpen24Hours] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StoreSettingsFormData>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      name: "La Económica",
      legalName: "Supermercado La Económica C.A.",
      rif: "J-12345678-9",
      address: "Av. Principal #123, Centro Comercial Plaza Mayor",
      city: "Valencia",
      state: "Carabobo",
      zipCode: "2001",
      phone: "+58424-1234567",
      email: "info@laeconomica.com.ve",
      website: "https://laeconomica.com.ve",
      description:
        "Supermercado familiar con más de 20 años sirviendo a la comunidad valenciana",
      currency: "VES",
      timezone: "America/Caracas",
      language: "es",
    },
  });

  const businessHours = [
    { day: "Lunes", open: "07:00", close: "22:00", closed: false },
    { day: "Martes", open: "07:00", close: "22:00", closed: false },
    { day: "Miércoles", open: "07:00", close: "22:00", closed: false },
    { day: "Jueves", open: "07:00", close: "22:00", closed: false },
    { day: "Viernes", open: "07:00", close: "22:00", closed: false },
    { day: "Sábado", open: "08:00", close: "21:00", closed: false },
    { day: "Domingo", open: "09:00", close: "20:00", closed: false },
  ];

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: StoreSettingsFormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Configuración guardada",
        description: "La información de la tienda ha sido actualizada",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="h-5 w-5 mr-2" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                {logo ? (
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <Image className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-xs text-gray-500 mt-1">Logo</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="logo-upload">Logo de la Tienda</Label>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Recomendado: 200x200px, formato PNG o JPG
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Nombre Comercial</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Nombre de la tienda"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="legalName">Razón Social</Label>
              <Input
                id="legalName"
                {...register("legalName")}
                placeholder="Razón social legal"
              />
              {errors.legalName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.legalName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="rif">RIF</Label>
              <Input id="rif" {...register("rif")} placeholder="J-12345678-9" />
              {errors.rif && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.rif.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Teléfono Principal</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+58424-1234567"
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="info@tienda.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                {...register("website")}
                placeholder="https://mitienda.com"
              />
              {errors.website && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.website.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Breve descripción de tu negocio"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Dirección
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Dirección Completa</Label>
            <Textarea
              id="address"
              {...register("address")}
              placeholder="Av. Principal #123, Centro Comercial..."
              rows={2}
            />
            {errors.address && (
              <p className="text-sm text-red-600 mt-1">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" {...register("city")} placeholder="Valencia" />
              {errors.city && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="state">Estado</Label>
              <Select onValueChange={(value) => setValue("state", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Amazonas">Amazonas</SelectItem>
                  <SelectItem value="Anzoátegui">Anzoátegui</SelectItem>
                  <SelectItem value="Apure">Apure</SelectItem>
                  <SelectItem value="Aragua">Aragua</SelectItem>
                  <SelectItem value="Barinas">Barinas</SelectItem>
                  <SelectItem value="Bolívar">Bolívar</SelectItem>
                  <SelectItem value="Carabobo">Carabobo</SelectItem>
                  <SelectItem value="Cojedes">Cojedes</SelectItem>
                  <SelectItem value="Delta Amacuro">Delta Amacuro</SelectItem>
                  <SelectItem value="Distrito Capital">
                    Distrito Capital
                  </SelectItem>
                  <SelectItem value="Falcón">Falcón</SelectItem>
                  <SelectItem value="Guárico">Guárico</SelectItem>
                  <SelectItem value="Lara">Lara</SelectItem>
                  <SelectItem value="Mérida">Mérida</SelectItem>
                  <SelectItem value="Miranda">Miranda</SelectItem>
                  <SelectItem value="Monagas">Monagas</SelectItem>
                  <SelectItem value="Nueva Esparta">Nueva Esparta</SelectItem>
                  <SelectItem value="Portuguesa">Portuguesa</SelectItem>
                  <SelectItem value="Sucre">Sucre</SelectItem>
                  <SelectItem value="Táchira">Táchira</SelectItem>
                  <SelectItem value="Trujillo">Trujillo</SelectItem>
                  <SelectItem value="Vargas">Vargas</SelectItem>
                  <SelectItem value="Yaracuy">Yaracuy</SelectItem>
                  <SelectItem value="Zulia">Zulia</SelectItem>
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.state.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="zipCode">Código Postal</Label>
              <Input id="zipCode" {...register("zipCode")} placeholder="2001" />
              {errors.zipCode && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.zipCode.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Horarios de Atención
            </span>
            <div className="flex items-center space-x-2">
              <Label htmlFor="24hours">Abierto 24 horas</Label>
              <Switch
                id="24hours"
                checked={isOpen24Hours}
                onCheckedChange={setIsOpen24Hours}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isOpen24Hours && (
            <div className="space-y-4">
              {businessHours.map((day, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-20">
                    <Label>{day.day}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="time"
                      defaultValue={day.open}
                      className="w-24"
                      disabled={day.closed}
                    />
                    <span>a</span>
                    <Input
                      type="time"
                      defaultValue={day.close}
                      className="w-24"
                      disabled={day.closed}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={!day.closed}
                      onCheckedChange={() => {
                        day.closed = !day.closed;
                      }}
                    />
                    <Label className="text-sm text-gray-600">
                      {day.closed ? "Cerrado" : "Abierto"}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isOpen24Hours && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-green-600">
                Abierto 24 horas, todos los días
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Configuración Regional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="currency">Moneda</Label>
              <Select onValueChange={(value) => setValue("currency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VES">Bolívar Soberano (VES)</SelectItem>
                  <SelectItem value="USD">
                    Dólar Estadounidense (USD)
                  </SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timezone">Zona Horaria</Label>
              <Select onValueChange={(value) => setValue("timezone", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar zona horaria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Caracas">
                    Venezuela (UTC-4)
                  </SelectItem>
                  <SelectItem value="America/Bogota">
                    Colombia (UTC-5)
                  </SelectItem>
                  <SelectItem value="America/New_York">
                    Estados Unidos Este (UTC-5)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">Idioma</Label>
              <Select onValueChange={(value) => setValue("language", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Vista Previa
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar Configuración"}
        </Button>
      </div>
    </form>
  );
};

export default StoreSettings;
