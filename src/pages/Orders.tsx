import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  RotateCcw,
  Star,
  MapPin,
  Calendar,
  Receipt,
  Download,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  brand?: string;
}

interface Order {
  id: string;
  date: string;
  status: "preparando" | "en_camino" | "entregado" | "cancelado";
  total: number;
  items: OrderItem[];
  deliveryAddress: string;
  estimatedTime?: string;
  deliveredTime?: string;
  trackingNumber?: string;
  paymentMethod: string;
  notes?: string;
}

// Mock orders data
const mockOrders: Order[] = [
  {
    id: "ORD-2024-001",
    date: "2024-01-15T14:30:00",
    status: "entregado",
    total: 89.5,
    deliveryAddress: "Av. Polanco 123, Polanco, CDMX",
    deliveredTime: "2024-01-15T15:15:00",
    paymentMethod: "Tarjeta terminada en 4532",
    items: [
      {
        id: "1",
        name: "Leche entera Lala 1L",
        image:
          "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=100&q=80",
        price: 28.5,
        quantity: 2,
        brand: "Lala",
      },
      {
        id: "2",
        name: "Pan blanco Bimbo",
        image:
          "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=100&q=80",
        price: 32.5,
        quantity: 1,
        brand: "Bimbo",
      },
    ],
  },
  {
    id: "ORD-2024-002",
    date: "2024-01-12T09:15:00",
    status: "entregado",
    total: 125.3,
    deliveryAddress: "Av. Polanco 123, Polanco, CDMX",
    deliveredTime: "2024-01-12T10:00:00",
    paymentMethod: "Mercado Pago",
    items: [
      {
        id: "3",
        name: "Manzanas Red Delicious 1kg",
        image:
          "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=100&q=80",
        price: 45.0,
        quantity: 1,
      },
      {
        id: "4",
        name: "Yogurt griego Danone 150g",
        image:
          "https://images.unsplash.com/photo-1571212515416-cd04ae201171?auto=format&fit=crop&w=100&q=80",
        price: 18.9,
        quantity: 4,
        brand: "Danone",
      },
    ],
  },
  {
    id: "ORD-2024-003",
    date: "2024-01-08T16:45:00",
    status: "en_camino",
    total: 67.8,
    deliveryAddress: "Av. Polanco 123, Polanco, CDMX",
    estimatedTime: "17:30",
    trackingNumber: "TRK-789012",
    paymentMethod: "Efectivo",
    items: [
      {
        id: "5",
        name: "Coca-Cola 600ml",
        image:
          "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=100&q=80",
        price: 15.0,
        quantity: 3,
        brand: "Coca-Cola",
      },
    ],
  },
  {
    id: "ORD-2024-004",
    date: "2024-01-05T11:20:00",
    status: "cancelado",
    total: 45.6,
    deliveryAddress: "Av. Polanco 123, Polanco, CDMX",
    paymentMethod: "Tarjeta terminada en 4532",
    notes: "Cancelado por el cliente",
    items: [
      {
        id: "6",
        name: "Cereal Zucaritas 500g",
        image:
          "https://images.unsplash.com/photo-1556909114-4c3b58f5e5e8?auto=format&fit=crop&w=100&q=80",
        price: 45.6,
        quantity: 1,
        brand: "Kellogg's",
      },
    ],
  },
];

const Orders = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = mockOrders;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.items.some((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [searchQuery, statusFilter]);

  const getStatusInfo = (status: Order["status"]) => {
    switch (status) {
      case "preparando":
        return {
          label: "Preparando",
          color: "bg-yellow-100 text-yellow-700 border-yellow-200",
          icon: <Package className="w-4 h-4" />,
        };
      case "en_camino":
        return {
          label: "En camino",
          color: "bg-blue-100 text-blue-700 border-blue-200",
          icon: <Truck className="w-4 h-4" />,
        };
      case "entregado":
        return {
          label: "Entregado",
          color: "bg-green-100 text-green-700 border-green-200",
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case "cancelado":
        return {
          label: "Cancelado",
          color: "bg-red-100 text-red-700 border-red-200",
          icon: <XCircle className="w-4 h-4" />,
        };
      default:
        return {
          label: "Desconocido",
          color: "bg-gray-100 text-gray-700 border-gray-200",
          icon: <Package className="w-4 h-4" />,
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container px-4 py-16 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Inicia sesión para ver tus pedidos
          </h1>
          <p className="text-gray-600 mb-6">
            Accede a tu cuenta para revisar el historial de pedidos
          </p>
          <Button asChild>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900 mb-2">
            Mis pedidos
          </h1>
          <p className="text-gray-600">
            Revisa el estado y historial de todos tus pedidos
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {mockOrders.length}
              </div>
              <div className="text-sm text-gray-600">Total de pedidos</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {mockOrders.filter((o) => o.status === "entregado").length}
              </div>
              <div className="text-sm text-gray-600">Entregados</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {mockOrders.filter((o) => o.status === "en_camino").length}
              </div>
              <div className="text-sm text-gray-600">En camino</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-brand-600 mb-1">
                $
                {mockOrders
                  .reduce((sum, order) => sum + order.total, 0)
                  .toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total gastado</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por número de pedido o producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="preparando">Preparando</SelectItem>
                <SelectItem value="en_camino">En camino</SelectItem>
                <SelectItem value="entregado">Entregado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => {
              const statusInfo = getStatusInfo(order.status);

              return (
                <Card
                  key={order.id}
                  className={`animate-slide-in delay-${index * 100}`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                          <h3 className="font-semibold text-lg">{order.id}</h3>
                          <Badge className={cn("w-fit", statusInfo.color)}>
                            {statusInfo.icon}
                            <span className="ml-1">{statusInfo.label}</span>
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(order.date)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{order.deliveryAddress}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Receipt className="w-4 h-4" />
                            <span>
                              {order.items.length} productos • ${order.total}
                            </span>
                          </div>

                          {order.status === "en_camino" &&
                            order.estimatedTime && (
                              <div className="flex items-center gap-2 text-blue-600">
                                <Clock className="w-4 h-4" />
                                <span>
                                  Llega aproximadamente a las{" "}
                                  {order.estimatedTime}
                                </span>
                              </div>
                            )}

                          {order.status === "entregado" &&
                            order.deliveredTime && (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>
                                  Entregado el {formatDate(order.deliveredTime)}
                                </span>
                              </div>
                            )}
                        </div>

                        {/* Products Preview */}
                        <div className="flex items-center gap-2 mt-4">
                          {order.items.slice(0, 3).map((item) => (
                            <img
                              key={item.id}
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                            />
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Ver detalles
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                Detalles del pedido {order.id}
                              </DialogTitle>
                              <DialogDescription>
                                Información completa de tu pedido
                              </DialogDescription>
                            </DialogHeader>

                            {selectedOrder && (
                              <div className="space-y-6">
                                {/* Status */}
                                <div className="flex items-center gap-3">
                                  <Badge
                                    className={cn(
                                      "",
                                      getStatusInfo(selectedOrder.status).color,
                                    )}
                                  >
                                    {getStatusInfo(selectedOrder.status).icon}
                                    <span className="ml-1">
                                      {
                                        getStatusInfo(selectedOrder.status)
                                          .label
                                      }
                                    </span>
                                  </Badge>
                                  <span className="text-sm text-gray-600">
                                    {formatDate(selectedOrder.date)}
                                  </span>
                                </div>

                                {/* Delivery Info */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold">
                                    Información de entrega
                                  </h4>
                                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-4 h-4 text-gray-600" />
                                      <span>
                                        {selectedOrder.deliveryAddress}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Receipt className="w-4 h-4 text-gray-600" />
                                      <span>{selectedOrder.paymentMethod}</span>
                                    </div>
                                    {selectedOrder.trackingNumber && (
                                      <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-gray-600" />
                                        <span>
                                          Seguimiento:{" "}
                                          {selectedOrder.trackingNumber}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Products */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold">
                                    Productos ({selectedOrder.items.length})
                                  </h4>
                                  <div className="space-y-3">
                                    {selectedOrder.items.map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex items-center gap-3 p-3 border rounded-lg"
                                      >
                                        <img
                                          src={item.image}
                                          alt={item.name}
                                          className="w-12 h-12 rounded-lg object-cover"
                                        />
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">
                                            {item.name}
                                          </p>
                                          {item.brand && (
                                            <p className="text-xs text-gray-600">
                                              {item.brand}
                                            </p>
                                          )}
                                          <p className="text-sm text-gray-600">
                                            {item.quantity}x ${item.price}
                                          </p>
                                        </div>
                                        <p className="font-semibold">
                                          $
                                          {(item.price * item.quantity).toFixed(
                                            2,
                                          )}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Total */}
                                <div className="border-t pt-4">
                                  <div className="flex justify-between items-center font-semibold text-lg">
                                    <span>Total</span>
                                    <span>${selectedOrder.total}</span>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                  <Button variant="outline" className="flex-1">
                                    <Download className="w-4 h-4 mr-2" />
                                    Descargar factura
                                  </Button>
                                  {selectedOrder.status === "entregado" && (
                                    <Button className="flex-1 btn-gradient">
                                      <RotateCcw className="w-4 h-4 mr-2" />
                                      Volver a pedir
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {order.status === "entregado" && (
                          <Button variant="outline" size="sm">
                            <Star className="w-4 h-4 mr-2" />
                            Calificar
                          </Button>
                        )}

                        {order.status === "entregado" && (
                          <Button size="sm" className="btn-gradient">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Repetir
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              {searchQuery || statusFilter !== "all"
                ? "No encontramos pedidos"
                : "Aún no tienes pedidos"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "Intenta ajustar tus filtros de búsqueda"
                : "Cuando hagas tu primer pedido, aparecerá aquí"}
            </p>
            <div className="space-y-3">
              {searchQuery || statusFilter !== "all" ? (
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  variant="outline"
                >
                  Limpiar filtros
                </Button>
              ) : (
                <Button asChild className="btn-gradient">
                  <Link to="/shop">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Empezar a comprar
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
