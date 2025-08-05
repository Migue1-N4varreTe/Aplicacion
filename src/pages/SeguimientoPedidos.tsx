import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Star,
  RefreshCw,
  AlertCircle,
  Calendar,
  User,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderStatus {
  step: number;
  title: string;
  description: string;
  timestamp?: string;
  completed: boolean;
  current: boolean;
}

interface Order {
  id: string;
  number: string;
  date: string;
  status: string;
  total: number;
  items: number;
  deliveryTime: string;
  address: string;
  driver?: {
    name: string;
    phone: string;
    rating: number;
  };
  statusHistory: OrderStatus[];
}

const SeguimientoPedidos = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(
    "ORD-2024-001",
  );

  const orders: Order[] = [
    {
      id: "1",
      number: "ORD-2024-001",
      date: "2024-01-15",
      status: "en-camino",
      total: 89.5,
      items: 7,
      deliveryTime: "15-20 min",
      address: "Av. Francisco de Miranda, Torre Parque Boyacá",
      driver: {
        name: "Carlos Rodríguez",
        phone: "+58 424-555-0167",
        rating: 4.8,
      },
      statusHistory: [
        {
          step: 1,
          title: "Pedido confirmado",
          description: "Tu pedido ha sido recibido y confirmado",
          timestamp: "14:30",
          completed: true,
          current: false,
        },
        {
          step: 2,
          title: "Preparando pedido",
          description: "Seleccionando y empacando tus productos",
          timestamp: "14:35",
          completed: true,
          current: false,
        },
        {
          step: 3,
          title: "En camino",
          description: "Carlos está en camino hacia tu dirección",
          timestamp: "14:45",
          completed: true,
          current: true,
        },
        {
          step: 4,
          title: "Entregado",
          description: "Tu pedido ha sido entregado",
          completed: false,
          current: false,
        },
      ],
    },
    {
      id: "2",
      number: "ORD-2024-002",
      date: "2024-01-14",
      status: "entregado",
      total: 156.75,
      items: 12,
      deliveryTime: "Entregado",
      address: "Calle Madrid con Calle New York, Las Mercedes",
      statusHistory: [
        {
          step: 1,
          title: "Pedido confirmado",
          description: "Tu pedido ha sido recibido y confirmado",
          timestamp: "11:15",
          completed: true,
          current: false,
        },
        {
          step: 2,
          title: "Preparando pedido",
          description: "Seleccionando y empacando tus productos",
          timestamp: "11:20",
          completed: true,
          current: false,
        },
        {
          step: 3,
          title: "En camino",
          description: "En ruta hacia tu dirección",
          timestamp: "11:35",
          completed: true,
          current: false,
        },
        {
          step: 4,
          title: "Entregado",
          description: "Tu pedido ha sido entregado exitosamente",
          timestamp: "11:58",
          completed: true,
          current: false,
        },
      ],
    },
    {
      id: "3",
      number: "ORD-2024-003",
      date: "2024-01-13",
      status: "cancelado",
      total: 67.25,
      items: 5,
      deliveryTime: "Cancelado",
      address: "Av. Francisco de Miranda, Torre Parque Boyacá",
      statusHistory: [
        {
          step: 1,
          title: "Pedido confirmado",
          description: "Tu pedido ha sido recibido y confirmado",
          timestamp: "16:45",
          completed: true,
          current: false,
        },
        {
          step: 2,
          title: "Cancelado",
          description: "Pedido cancelado por el cliente",
          timestamp: "16:52",
          completed: true,
          current: false,
        },
      ],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmado":
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case "preparando":
        return <Package className="w-5 h-5 text-yellow-600" />;
      case "en-camino":
        return <Truck className="w-5 h-5 text-orange-600" />;
      case "entregado":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "cancelado":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado":
        return "bg-blue-100 text-blue-800";
      case "preparando":
        return "bg-yellow-100 text-yellow-800";
      case "en-camino":
        return "bg-orange-100 text-orange-800";
      case "entregado":
        return "bg-green-100 text-green-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const selectedOrderData = orders.find(
    (order) => order.number === selectedOrder,
  );
  const currentStep =
    selectedOrderData?.statusHistory.findIndex((step) => step.current) || 0;
  const progress = selectedOrderData
    ? ((currentStep + 1) / selectedOrderData.statusHistory.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-brand-500 to-fresh-500 text-white py-12">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-lg">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h1 className="font-display font-bold text-3xl lg:text-4xl">
                  Seguimiento de Pedidos
                </h1>
                <p className="text-white/90 text-lg">
                  Monitorea el estado de tus pedidos en tiempo real
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Lista de Pedidos */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Mis Pedidos</CardTitle>
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Búsqueda */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por número de pedido..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Lista de pedidos */}
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order.number)}
                        className={cn(
                          "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                          selectedOrder === order.number &&
                            "border-brand-300 bg-brand-50",
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-sm">
                            {order.number}
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {new Date(order.date).toLocaleDateString("es-ES")}
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="w-3 h-3" />
                            {order.items} productos • ${order.total}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {order.deliveryTime}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detalles del Pedido */}
            <div className="lg:col-span-2 space-y-6">
              {selectedOrderData && (
                <>
                  {/* Estado Actual */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {getStatusIcon(selectedOrderData.status)}
                            Pedido {selectedOrderData.number}
                          </CardTitle>
                          <p className="text-gray-600">
                            {selectedOrderData.items} productos • $
                            {selectedOrderData.total}
                          </p>
                        </div>
                        <Badge
                          className={getStatusColor(selectedOrderData.status)}
                          variant="outline"
                        >
                          {selectedOrderData.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {selectedOrderData.status === "en-camino" &&
                        selectedOrderData.driver && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-orange-900">
                                  Tu repartidor está en camino
                                </h4>
                                <div className="flex items-center gap-4 mt-2">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-orange-600" />
                                    <span className="text-sm text-orange-800">
                                      {selectedOrderData.driver.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-sm text-orange-800">
                                      {selectedOrderData.driver.rating}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-orange-300"
                                >
                                  <Phone className="w-4 h-4 mr-2" />
                                  Llamar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-orange-300"
                                >
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Chat
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Progreso */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">
                            Progreso del pedido
                          </span>
                          <span className="text-sm text-gray-600">
                            Paso {currentStep + 1} de{" "}
                            {selectedOrderData.statusHistory.length}
                          </span>
                        </div>
                        <Progress value={progress} className="mb-4" />
                      </div>

                      {/* Timeline */}
                      <div className="space-y-4">
                        {selectedOrderData.statusHistory.map(
                          (status, index) => (
                            <div key={index} className="flex gap-4">
                              <div
                                className={cn(
                                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                                  status.completed
                                    ? "bg-brand-500 text-white"
                                    : status.current
                                      ? "bg-orange-500 text-white"
                                      : "bg-gray-200 text-gray-500",
                                )}
                              >
                                {status.completed ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <Clock className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                  <h4
                                    className={cn(
                                      "font-medium",
                                      status.current && "text-orange-600",
                                      status.completed && "text-brand-600",
                                    )}
                                  >
                                    {status.title}
                                  </h4>
                                  {status.timestamp && (
                                    <span className="text-sm text-gray-500">
                                      {status.timestamp}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {status.description}
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Información de Entrega */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Información de Entrega</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-brand-500 mt-0.5" />
                        <div>
                          <div className="font-medium">
                            Dirección de entrega
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedOrderData.address}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-brand-500 mt-0.5" />
                        <div>
                          <div className="font-medium">Tiempo estimado</div>
                          <div className="text-sm text-gray-600">
                            {selectedOrderData.deliveryTime}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CreditCard className="w-5 h-5 text-brand-500 mt-0.5" />
                        <div>
                          <div className="font-medium">Método de pago</div>
                          <div className="text-sm text-gray-600">
                            Pago Móvil - Total: ${selectedOrderData.total}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Acciones */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-wrap gap-3">
                        {selectedOrderData.status === "en-camino" && (
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-300"
                          >
                            Cancelar pedido
                          </Button>
                        )}
                        {selectedOrderData.status === "entregado" && (
                          <>
                            <Button variant="outline">Volver a pedir</Button>
                            <Button variant="outline">
                              Calificar experiencia
                            </Button>
                          </>
                        )}
                        <Button variant="outline">Contactar soporte</Button>
                        <Button variant="outline">Compartir seguimiento</Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {!selectedOrderData && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">
                      Selecciona un pedido
                    </h3>
                    <p className="text-gray-600">
                      Haz clic en un pedido de la lista para ver sus detalles
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeguimientoPedidos;
