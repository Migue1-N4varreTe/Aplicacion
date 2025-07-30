import React, { useState, useEffect } from "react";
import { usePickup, Store, PickupOrder } from "@/contexts/PickupContext";
import { useCart } from "@/contexts/CartContext";
import { allProducts } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Clock,
  Phone,
  Car,
  UserCheck,
  ShoppingBag,
  Calendar,
  Navigation,
  Store as StoreIcon,
  Package,
  CheckCircle,
  AlertCircle,
  Copy,
  QrCode,
  Timer,
  Users,
  Zap,
  Coffee,
  ShoppingCart,
  Search,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PickupPage = () => {
  const {
    stores,
    pickupOrders,
    getAvailableStores,
    getStoreById,
    getNearbyStores,
    getStoreDistance,
    isStoreOpen,
    getAvailableTimeSlots,
    createPickupOrder,
    getUserPickupOrders,
    checkPickupCode,
    calculateEstimatedTime,
  } = usePickup();

  const { cartProducts, clearCart } = useCart();
  const { toast } = useToast();

  const [selectedTab, setSelectedTab] = useState("stores");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [searchCode, setSearchCode] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Order form
  const [orderForm, setOrderForm] = useState({
    name: "",
    phone: "",
    email: "",
    idDocument: "",
    notes: "",
  });

  const currentUser = { id: "user_123", name: "Usuario Actual" }; // Mock user
  const availableStores = getAvailableStores();
  const userOrders = getUserPickupOrders(currentUser.id);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to Mexico City center
          setUserLocation({ lat: 19.4326, lng: -99.1332 });
        }
      );
    }
  }, []);

  const filteredStores = availableStores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const nearbyStores = userLocation 
    ? getNearbyStores(userLocation.lat, userLocation.lng, 20)
    : [];

  const handleSelectStore = (store: Store) => {
    setSelectedStore(store);
    
    // Set default date to today
    const today = new Date();
    setSelectedDate(today.toISOString().split('T')[0]);
    
    // Clear selected time when changing store
    setSelectedTime("");
  };

  const handleCreateOrder = () => {
    if (!selectedStore || cartProducts.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona una tienda y agrega productos al carrito",
        variant: "destructive",
      });
      return;
    }

    if (!orderForm.name || !orderForm.phone) {
      toast({
        title: "Error",
        description: "Por favor completa la información requerida",
        variant: "destructive",
      });
      return;
    }

    const orderItems = cartProducts.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const total = cartProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const scheduledTime = selectedDate && selectedTime 
      ? new Date(`${selectedDate}T${selectedTime}:00`) 
      : undefined;

    const newOrder = createPickupOrder({
      storeId: selectedStore.id,
      userId: currentUser.id,
      items: orderItems,
      customerInfo: {
        name: orderForm.name,
        phone: orderForm.phone,
        email: orderForm.email,
        idDocument: orderForm.idDocument,
      },
      scheduledTime,
      preparationTime: calculateEstimatedTime(selectedStore.id, orderItems.length),
      notes: orderForm.notes,
      total,
    });

    // Clear cart and form
    clearCart();
    setOrderForm({
      name: "",
      phone: "",
      email: "",
      idDocument: "",
      notes: "",
    });
    setShowOrderDialog(false);
    setSelectedTab("my-orders");

    toast({
      title: "Orden creada exitosamente",
      description: `Tu código de pickup es: ${newOrder.pickupCode}`,
    });
  };

  const handleCheckCode = () => {
    const order = checkPickupCode(searchCode);
    if (order) {
      toast({
        title: "Orden encontrada",
        description: `Orden lista para recoger en ${getStoreById(order.storeId)?.name}`,
      });
    } else {
      toast({
        title: "Código no válido",
        description: "El código no existe o la orden no está lista",
        variant: "destructive",
      });
    }
    setShowCodeDialog(false);
    setSearchCode("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Código copiado al portapapeles",
    });
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case "parking": return <Car className="h-4 w-4" />;
      case "wheelchair_accessible": return <Wheelchair className="h-4 w-4" />;
      case "pharmacy": return <Package className="h-4 w-4" />;
      case "bakery": return <Coffee className="h-4 w-4" />;
      case "drive_through": return <Car className="h-4 w-4" />;
      default: return <StoreIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: PickupOrder["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "preparing": return "bg-blue-100 text-blue-800";
      case "ready": return "bg-green-100 text-green-800";
      case "picked_up": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "expired": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: PickupOrder["status"]) => {
    switch (status) {
      case "pending": return "Pendiente";
      case "preparing": return "Preparando";
      case "ready": return "Listo";
      case "picked_up": return "Retirado";
      case "cancelled": return "Cancelado";
      case "expired": return "Expirado";
      default: return status;
    }
  };

  const timeSlots = selectedStore && selectedDate 
    ? getAvailableTimeSlots(selectedStore.id, new Date(selectedDate))
    : [];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pickup en Tienda</h1>
          <p className="text-gray-600 mt-1">Compra en línea y recoge en tu tienda favorita</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Verificar Código
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Verificar Código de Pickup</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="searchCode">Código de Pickup</Label>
                  <Input
                    id="searchCode"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                    placeholder="ABC12345"
                    className="uppercase"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCodeDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCheckCode}>
                    Verificar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {cartProducts.length > 0 && (
            <Button onClick={() => setShowOrderDialog(true)}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Crear Orden ({cartProducts.length})
            </Button>
          )}
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="stores">Tiendas Disponibles</TabsTrigger>
          <TabsTrigger value="my-orders">Mis Órdenes ({userOrders.length})</TabsTrigger>
          <TabsTrigger value="nearby">Cerca de Mí</TabsTrigger>
        </TabsList>

        <TabsContent value="stores" className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar tiendas por nombre, dirección o ciudad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => {
              const distance = userLocation 
                ? getStoreDistance(store.id, userLocation.lat, userLocation.lng)
                : null;
              const isOpen = isStoreOpen(store.id);
              
              return (
                <Card key={store.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{store.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {isOpen ? "Abierto" : "Cerrado"}
                          </Badge>
                          {distance && (
                            <Badge variant="outline">
                              <Navigation className="h-3 w-3 mr-1" />
                              {distance.toFixed(1)} km
                            </Badge>
                          )}
                        </div>
                      </div>
                      <StoreIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p>{store.address}</p>
                          <p>{store.city}, {store.state} {store.zipCode}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      {store.phone}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Timer className="h-4 w-4" />
                      Pickup en ~{store.estimatedPickupTime} min
                    </div>

                    {store.features.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Servicios:</p>
                        <div className="flex flex-wrap gap-2">
                          {store.features.map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {getFeatureIcon(feature)}
                              <span className="ml-1 capitalize">{feature.replace('_', ' ')}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      onClick={() => handleSelectStore(store)}
                      disabled={!isOpen}
                    >
                      {selectedStore?.id === store.id ? "Seleccionada" : "Seleccionar Tienda"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="my-orders" className="space-y-4">
          {userOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tienes órdenes de pickup
                </h3>
                <p className="text-gray-600 mb-4">
                  Crea tu primera orden para recoger en tienda
                </p>
                <Button onClick={() => setSelectedTab("stores")}>
                  <StoreIcon className="h-4 w-4 mr-2" />
                  Ver Tiendas
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {userOrders.map((order) => {
                const store = getStoreById(order.storeId);
                const products = order.items.map(item => {
                  const product = allProducts.find(p => p.id === item.productId);
                  return { ...item, product };
                });

                return (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">Orden #{order.pickupCode}</h3>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{store?.name}</p>
                          <p className="text-sm text-gray-500">
                            {order.createdAt.toLocaleDateString()} {order.createdAt.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.total.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">{order.items.length} productos</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {products.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.product?.name || "Producto no encontrado"}</span>
                            <span>{item.quantity}x ${item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {order.status === "ready" && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-800">¡Tu orden está lista!</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-green-700">Código: {order.pickupCode}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(order.pickupCode)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {order.scheduledTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          Programado para: {order.scheduledTime.toLocaleDateString()} {order.scheduledTime.toLocaleTimeString()}
                        </div>
                      )}

                      {order.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <strong>Notas:</strong> {order.notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="nearby" className="space-y-6">
          {userLocation ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyStores.map((store) => {
                const isOpen = isStoreOpen(store.id);
                
                return (
                  <Card key={store.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{store.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {isOpen ? "Abierto" : "Cerrado"}
                            </Badge>
                            <Badge variant="outline">
                              <Navigation className="h-3 w-3 mr-1" />
                              {store.distance.toFixed(1)} km
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <div>
                          <p>{store.address}</p>
                          <p>{store.city}, {store.state}</p>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        onClick={() => handleSelectStore(store)}
                        disabled={!isOpen}
                      >
                        Seleccionar Tienda
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Navigation className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ubicación no disponible
                </h3>
                <p className="text-gray-600">
                  Permite el acceso a tu ubicación para ver tiendas cercanas
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Order Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Orden de Pickup</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedStore && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900">{selectedStore.name}</h4>
                <p className="text-sm text-blue-700">{selectedStore.address}</p>
                <p className="text-sm text-blue-600">
                  Tiempo estimado: ~{calculateEstimatedTime(selectedStore.id, cartProducts.length)} min
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  value={orderForm.name}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  value={orderForm.phone}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+52 55 1234 5678"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={orderForm.email}
                onChange={(e) => setOrderForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickupDate">Fecha de pickup (opcional)</Label>
                <Input
                  id="pickupDate"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="pickupTime">Hora de pickup (opcional)</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem 
                        key={slot.time} 
                        value={slot.time}
                        disabled={!slot.available}
                      >
                        {slot.time} {!slot.available && "(No disponible)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notas adicionales</Label>
              <Input
                id="notes"
                value={orderForm.notes}
                onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Instrucciones especiales"
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Resumen del pedido:</h4>
              <div className="space-y-1 text-sm">
                {cartProducts.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-1 font-medium flex justify-between">
                  <span>Total:</span>
                  <span>${cartProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateOrder}>
                Crear Orden
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PickupPage;
