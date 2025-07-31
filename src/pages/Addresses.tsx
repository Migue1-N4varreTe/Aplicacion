import React, { useState } from "react";
import { useAddresses, Address } from "@/contexts/AddressContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Plus,
  MapPin,
  Home,
  Building,
  Search,
  Edit,
  Trash2,
  Star,
  Phone,
  Mail,
  Navigation,
  Truck,
  DollarSign,
  CheckCircle,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const AddressesPage = () => {
  const {
    addresses,
    defaultAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getAddressesByType,
    validateAddress,
    searchAddresses,
    getDeliveryFee,
    isInDeliveryZone,
  } = useAddresses();

  const { toast } = useToast();
  const { showConfirm, ConfirmDialog } = useConfirmDialog();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [selectedTab, setSelectedTab] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "México",
    phone: "",
    email: "",
    type: "home" as Address["type"],
    isDefault: false,
    deliveryInstructions: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      fullName: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "México",
      phone: "",
      email: "",
      type: "home",
      isDefault: false,
      deliveryInstructions: "",
    });
    setEditingAddress(null);
  };

  const openAddDialog = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const openEditDialog = (address: Address) => {
    setFormData({
      title: address.title,
      fullName: address.fullName,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone || "",
      email: address.email || "",
      type: address.type,
      isDefault: address.isDefault,
      deliveryInstructions: address.deliveryInstructions || "",
    });
    setEditingAddress(address);
    setShowAddDialog(true);
  };

  const handleSubmit = () => {
    const validation = validateAddress(formData);
    
    if (!validation.isValid) {
      toast({
        title: "Error de validación",
        description: validation.errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingAddress) {
        updateAddress(editingAddress.id, formData);
        toast({
          title: "Dirección actualizada",
          description: "La dirección se actualizó correctamente",
        });
      } else {
        addAddress(formData);
        toast({
          title: "Dirección agregada",
          description: "La nueva dirección se agregó correctamente",
        });
      }
      
      setShowAddDialog(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la dirección",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (address: Address) => {
    showConfirm({
      title: "Eliminar dirección",
      description: "¿Estás seguro de que deseas eliminar esta dirección? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      variant: "destructive",
      onConfirm: () => {
        deleteAddress(address.id);
        toast({
          title: "Dirección eliminada",
          description: "La dirección se eliminó correctamente",
        });
      },
    });
  };

  const handleSetDefault = (address: Address) => {
    setDefaultAddress(address.id);
    toast({
      title: "Dirección predeterminada",
      description: `"${address.title}" es ahora tu dirección predeterminada`,
    });
  };

  const getFilteredAddresses = () => {
    let filtered = addresses;

    if (searchTerm) {
      filtered = searchAddresses(searchTerm);
    }

    if (selectedTab !== "all") {
      filtered = filtered.filter(addr => addr.type === selectedTab);
    }

    return filtered;
  };

  const getTypeIcon = (type: Address["type"]) => {
    switch (type) {
      case "home": return <Home className="h-4 w-4" />;
      case "work": return <Building className="h-4 w-4" />;
      case "other": return <MapPin className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Address["type"]) => {
    switch (type) {
      case "home": return "bg-blue-100 text-blue-800";
      case "work": return "bg-purple-100 text-purple-800";
      case "other": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDeliveryStatus = (address: Address) => {
    const inZone = isInDeliveryZone(address.id);
    const fee = getDeliveryFee(address.id);

    if (!inZone) {
      return {
        status: "No disponible",
        color: "text-red-600",
        icon: <AlertCircle className="h-4 w-4" />,
        fee: null,
      };
    }

    return {
      status: fee === 0 ? "Envío gratis" : `$${fee}`,
      color: fee === 0 ? "text-green-600" : "text-orange-600",
      icon: fee === 0 ? <CheckCircle className="h-4 w-4" /> : <Truck className="h-4 w-4" />,
      fee,
    };
  };

  const filteredAddresses = getFilteredAddresses();
  const homeAddresses = getAddressesByType("home");
  const workAddresses = getAddressesByType("work");
  const otherAddresses = getAddressesByType("other");

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Direcciones</h1>
          <p className="text-gray-600 mt-1">Gestiona tus direcciones de entrega</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Dirección
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{addresses.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Casa</p>
                <p className="text-2xl font-bold text-blue-600">{homeAddresses.length}</p>
              </div>
              <Home className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trabajo</p>
                <p className="text-2xl font-bold text-purple-600">{workAddresses.length}</p>
              </div>
              <Building className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Otras</p>
                <p className="text-2xl font-bold text-gray-600">{otherAddresses.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Tabs */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar direcciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="home">Casa</TabsTrigger>
                <TabsTrigger value="work">Trabajo</TabsTrigger>
                <TabsTrigger value="other">Otras</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Addresses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAddresses.map((address) => {
          const delivery = getDeliveryStatus(address);
          
          return (
            <Card key={address.id} className={cn(
              "relative transition-all hover:shadow-lg",
              address.isDefault && "ring-2 ring-blue-500 ring-opacity-50"
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(address.type)}
                    <CardTitle className="text-lg">{address.title}</CardTitle>
                    {address.isDefault && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => openEditDialog(address)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      {!address.isDefault && (
                        <DropdownMenuItem onClick={() => handleSetDefault(address)}>
                          <Star className="h-4 w-4 mr-2" />
                          Predeterminada
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDelete(address)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(address.type)}>
                    {address.type === "home" ? "Casa" : 
                     address.type === "work" ? "Trabajo" : "Otra"}
                  </Badge>
                  {address.isDefault && (
                    <Badge variant="outline">Predeterminada</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{address.fullName}</p>
                  <p className="text-sm text-gray-600">{address.street}</p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p className="text-sm text-gray-600">{address.country}</p>
                </div>

                {(address.phone || address.email) && (
                  <div className="space-y-1">
                    {address.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        {address.phone}
                      </div>
                    )}
                    {address.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        {address.email}
                      </div>
                    )}
                  </div>
                )}

                {address.deliveryInstructions && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Instrucciones:</p>
                    <p>{address.deliveryInstructions}</p>
                  </div>
                )}

                <div className={cn("flex items-center gap-2 text-sm", delivery.color)}>
                  {delivery.icon}
                  <span>{delivery.status}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAddresses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No se encontraron direcciones" : "No tienes direcciones"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? "Intenta con otros términos de búsqueda"
                : "Agrega tu primera dirección para comenzar"
              }
            </p>
            {!searchTerm && (
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Dirección
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Editar Dirección" : "Nueva Dirección"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título de la dirección *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Casa, Trabajo, etc."
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo *</Label>
                <Select value={formData.type} onValueChange={(value: Address["type"]) => 
                  setFormData(prev => ({ ...prev, type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Casa</SelectItem>
                    <SelectItem value="work">Trabajo</SelectItem>
                    <SelectItem value="other">Otra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="fullName">Nombre completo *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <Label htmlFor="street">Dirección *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                placeholder="Calle 123, Colonia Centro"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Ciudad de México"
                />
              </div>
              <div>
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="CDMX"
                />
              </div>
              <div>
                <Label htmlFor="zipCode">Código Postal *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="12345"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country">País *</Label>
              <Select value={formData.country} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, country: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="México">México</SelectItem>
                  <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                  <SelectItem value="Canada">Canadá</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+52 55 1234 5678"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="deliveryInstructions">Instrucciones de entrega</Label>
              <Textarea
                id="deliveryInstructions"
                value={formData.deliveryInstructions}
                onChange={(e) => setFormData(prev => ({ ...prev, deliveryInstructions: e.target.value }))}
                placeholder="Dejar en recepción, Tocar timbre, etc."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isDefault: checked as boolean }))
                }
              />
              <Label htmlFor="isDefault">Establecer como dirección predeterminada</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingAddress ? "Actualizar" : "Agregar"} Dirección
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog />
    </div>
  );
};

export default AddressesPage;
