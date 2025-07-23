import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const clientSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  birthday: z.string().optional(),
  tier: z.enum(["bronze", "silver", "gold", "platinum"]),
  status: z.enum(["active", "inactive", "vip"]),
  preferences: z.array(z.string()).optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  initialData?: Partial<ClientFormData>;
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [selectedPreferences, setSelectedPreferences] = React.useState<
    string[]
  >(initialData?.preferences || []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      birthday: initialData?.birthday || "",
      tier: initialData?.tier || "bronze",
      status: initialData?.status || "active",
      preferences: selectedPreferences,
    },
  });

  const availablePreferences = [
    "lácteos",
    "panadería",
    "frutas",
    "verduras",
    "carnes",
    "bebidas",
    "limpieza",
    "cuidado personal",
    "productos orgánicos",
    "vinos",
    "gourmet",
    "congelados",
  ];

  const addPreference = (preference: string) => {
    if (!selectedPreferences.includes(preference)) {
      const newPreferences = [...selectedPreferences, preference];
      setSelectedPreferences(newPreferences);
      setValue("preferences", newPreferences);
    }
  };

  const removePreference = (preference: string) => {
    const newPreferences = selectedPreferences.filter((p) => p !== preference);
    setSelectedPreferences(newPreferences);
    setValue("preferences", newPreferences);
  };

  const onFormSubmit = (data: ClientFormData) => {
    onSubmit({ ...data, preferences: selectedPreferences });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Información Personal</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Nombre completo del cliente"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="cliente@email.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="+584241234567"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="birthday">Fecha de Nacimiento</Label>
                <Input id="birthday" type="date" {...register("birthday")} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Status */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Contacto y Estado</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  {...register("address")}
                  placeholder="Dirección completa del cliente"
                  rows={3}
                />
                {errors.address && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(value) => setValue("status", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tier">Nivel de Fidelidad</Label>
                <Select
                  value={watch("tier")}
                  onValueChange={(value) => setValue("tier", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bronze">Bronce</SelectItem>
                    <SelectItem value="silver">Plata</SelectItem>
                    <SelectItem value="gold">Oro</SelectItem>
                    <SelectItem value="platinum">Platino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preferences */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Preferencias de Compra</h3>

          <div className="mb-4">
            <Label>Categorías Preferidas</Label>
            <Select onValueChange={addPreference}>
              <SelectTrigger>
                <SelectValue placeholder="Agregar preferencia" />
              </SelectTrigger>
              <SelectContent>
                {availablePreferences
                  .filter((pref) => !selectedPreferences.includes(pref))
                  .map((preference) => (
                    <SelectItem key={preference} value={preference}>
                      {preference.charAt(0).toUpperCase() + preference.slice(1)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedPreferences.map((preference) => (
              <Badge
                key={preference}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {preference.charAt(0).toUpperCase() + preference.slice(1)}
                <button
                  type="button"
                  onClick={() => removePreference(preference)}
                  className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando..."
            : initialData
              ? "Actualizar"
              : "Crear Cliente"}
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;
