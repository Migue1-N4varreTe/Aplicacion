import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Gift,
  Star,
  Crown,
  Zap,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  Users,
  Target,
  Award,
  Sparkles,
  ArrowRight,
  Copy,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  discount?: number;
  type: "discount" | "free_delivery" | "product" | "special";
  available: boolean;
  validUntil?: string;
}

interface Transaction {
  id: string;
  date: string;
  type: "earned" | "redeemed";
  points: number;
  description: string;
  orderNumber?: string;
}

const ProgramaLealtad = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Datos del usuario
  const userPoints = 1245;
  const currentTier = "Oro";
  const nextTier = "Platino";
  const pointsToNextTier = 755;
  const totalPointsNeeded = 2000;
  const tierProgress = ((userPoints - 500) / (totalPointsNeeded - 500)) * 100;

  // Zona de entrega (limitada a 2km)
  const deliveryZones = [
    "Las Mercedes (1.2km)",
    "Los Dos Caminos (0.8km)",
    "La Castellana (1.5km)",
    "Altamira (1.8km)",
    "Campo Alegre (1.6km)",
    "El Rosal (1.4km)",
    "Chacao (1.9km)",
    "Sabana Grande (2.0km)",
  ];

  const rewards: Reward[] = [
    {
      id: "1",
      title: "15% de descuento",
      description: "En tu próxima compra de $50 o más",
      points: 500,
      discount: 15,
      type: "discount",
      available: true,
      validUntil: "2024-02-28",
    },
    {
      id: "2",
      title: "Delivery gratis",
      description: "Envío gratuito por 30 días",
      points: 300,
      type: "free_delivery",
      available: true,
      validUntil: "2024-02-15",
    },
    {
      id: "3",
      title: "Producto gratis",
      description: "Escoge cualquier producto hasta $25",
      points: 800,
      type: "product",
      available: true,
    },
    {
      id: "4",
      title: "Acceso VIP",
      description: "Ofertas exclusivas por 3 meses",
      points: 1200,
      type: "special",
      available: false,
    },
    {
      id: "5",
      title: "20% de descuento",
      description: "En toda la sección de productos orgánicos",
      points: 750,
      discount: 20,
      type: "discount",
      available: true,
      validUntil: "2024-03-15",
    },
    {
      id: "6",
      title: "Compra prioritaria",
      description: "Acceso temprano a ofertas especiales",
      points: 600,
      type: "special",
      available: true,
    },
  ];

  const transactions: Transaction[] = [
    {
      id: "1",
      date: "2024-01-15",
      type: "earned",
      points: 89,
      description: "Compra #ORD-2024-001",
      orderNumber: "ORD-2024-001",
    },
    {
      id: "2",
      date: "2024-01-14",
      type: "earned",
      points: 157,
      description: "Compra #ORD-2024-002",
      orderNumber: "ORD-2024-002",
    },
    {
      id: "3",
      date: "2024-01-12",
      type: "redeemed",
      points: -300,
      description: "Delivery gratis canjeado",
    },
    {
      id: "4",
      date: "2024-01-10",
      type: "earned",
      points: 67,
      description: "Compra #ORD-2024-003",
      orderNumber: "ORD-2024-003",
    },
    {
      id: "5",
      date: "2024-01-08",
      type: "earned",
      points: 125,
      description: "Bonus por referir amigo",
    },
  ];

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "Bronce":
        return <Award className="w-5 h-5 text-orange-600" />;
      case "Plata":
        return <Star className="w-5 h-5 text-gray-500" />;
      case "Oro":
        return <Crown className="w-5 h-5 text-yellow-600" />;
      case "Platino":
        return <Sparkles className="w-5 h-5 text-purple-600" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Bronce":
        return "from-orange-500 to-orange-600";
      case "Plata":
        return "from-gray-400 to-gray-500";
      case "Oro":
        return "from-yellow-500 to-yellow-600";
      case "Platino":
        return "from-purple-500 to-purple-600";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const redeemReward = (rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (reward && userPoints >= reward.points) {
      // Lógica para canjear recompensa
      console.log(`Canjeando recompensa: ${reward.title}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-12">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-white/20 p-4 rounded-lg">
                <Gift className="w-8 h-8" />
              </div>
              <div>
                <h1 className="font-display font-bold text-3xl lg:text-4xl">
                  Programa de Lealtad
                </h1>
                <p className="text-white/90 text-lg">
                  Gana puntos y obtén recompensas increíbles
                </p>
              </div>
            </div>

            {/* Estado del Usuario */}
            <div className="bg-white/10 rounded-lg p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">
                    {userPoints.toLocaleString()}
                  </div>
                  <div className="text-white/80">Puntos disponibles</div>
                </div>
                <div className="text-center">
                  <div
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r text-white font-medium",
                      getTierColor(currentTier),
                    )}
                  >
                    {getTierIcon(currentTier)}
                    Nivel {currentTier}
                  </div>
                  <div className="text-white/80 mt-1">Tier actual</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">
                    {pointsToNextTier}
                  </div>
                  <div className="text-white/80">Puntos para {nextTier}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="rewards">Recompensas</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
              <TabsTrigger value="zones">Zonas</TabsTrigger>
            </TabsList>

            {/* Resumen */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              {/* Progreso al siguiente nivel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Progreso al siguiente nivel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Nivel {currentTier}</span>
                      <span className="font-medium">Nivel {nextTier}</span>
                    </div>
                    <Progress value={tierProgress} className="h-3" />
                    <div className="text-sm text-gray-600 text-center">
                      Te faltan {pointsToNextTier} puntos para alcanzar el nivel{" "}
                      {nextTier}
                    </div>
                  </div>

                  {/* Beneficios del siguiente nivel */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-3">
                      Beneficios del nivel {nextTier}:
                    </h4>
                    <ul className="space-y-2 text-sm text-purple-800">
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Descuentos exclusivos hasta 25%
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Delivery prioritario (10-15 min)
                      </li>
                      <li className="flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        Regalos especiales en tu cumpleaños
                      </li>
                      <li className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Puntos dobles los fines de semana
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Cómo ganar puntos */}
              <Card>
                <CardHeader>
                  <CardTitle>Cómo ganar puntos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="bg-green-500 text-white p-2 rounded-lg">
                          <Gift className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">Por cada compra</div>
                          <div className="text-sm text-gray-600">
                            1 punto por cada $1 gastado
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="bg-blue-500 text-white p-2 rounded-lg">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">Referir amigos</div>
                          <div className="text-sm text-gray-600">
                            100 puntos por referido
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                        <div className="bg-yellow-500 text-white p-2 rounded-lg">
                          <Star className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">
                            Reseñas y calificaciones
                          </div>
                          <div className="text-sm text-gray-600">
                            25 puntos por reseña
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <div className="bg-purple-500 text-white p-2 rounded-lg">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">Bonus cumpleaños</div>
                          <div className="text-sm text-gray-600">
                            200 puntos especiales
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recompensas destacadas */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Recompensas populares</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("rewards")}
                    >
                      Ver todas
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {rewards.slice(0, 4).map((reward) => (
                      <div key={reward.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{reward.title}</h4>
                          <Badge variant="outline" className="text-brand-600">
                            {reward.points} pts
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {reward.description}
                        </p>
                        <Button
                          size="sm"
                          disabled={
                            !reward.available || userPoints < reward.points
                          }
                          className="w-full"
                          onClick={() => redeemReward(reward.id)}
                        >
                          {userPoints >= reward.points
                            ? "Canjear"
                            : "Puntos insuficientes"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recompensas */}
            <TabsContent value="rewards" className="mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                  <Card
                    key={reward.id}
                    className={cn(
                      "transition-all hover:shadow-lg",
                      !reward.available && "opacity-75",
                    )}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {reward.title}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            {reward.description}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "ml-2",
                            userPoints >= reward.points
                              ? "text-green-600 border-green-300"
                              : "text-gray-500",
                          )}
                        >
                          {reward.points} pts
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {reward.validUntil && (
                        <div className="text-xs text-gray-500 mb-3">
                          Válido hasta:{" "}
                          {new Date(reward.validUntil).toLocaleDateString(
                            "es-ES",
                          )}
                        </div>
                      )}
                      <Button
                        className="w-full"
                        disabled={
                          !reward.available || userPoints < reward.points
                        }
                        onClick={() => redeemReward(reward.id)}
                      >
                        {!reward.available
                          ? "No disponible"
                          : userPoints >= reward.points
                            ? "Canjear recompensa"
                            : `Faltan ${reward.points - userPoints} pts`}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Historial */}
            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de puntos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
                      >
                        <div>
                          <div className="font-medium">
                            {transaction.description}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(transaction.date).toLocaleDateString(
                              "es-ES",
                            )}
                          </div>
                        </div>
                        <div
                          className={cn(
                            "font-medium",
                            transaction.type === "earned"
                              ? "text-green-600"
                              : "text-red-600",
                          )}
                        >
                          {transaction.type === "earned" ? "+" : ""}
                          {transaction.points} pts
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Zonas de entrega */}
            <TabsContent value="zones" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Zonas de Entrega (Radio 2km)
                  </CardTitle>
                  <p className="text-gray-600">
                    Nuestro servicio de delivery está disponible en las
                    siguientes zonas
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {deliveryZones.map((zone, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                      >
                        <div className="bg-green-500 text-white p-2 rounded-full">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{zone}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      ¿Tu zona no aparece?
                    </h4>
                    <p className="text-sm text-blue-800 mb-3">
                      Estamos expandiendo constantemente nuestras zonas de
                      entrega. Déjanos tu dirección y te notificaremos cuando
                      llegue el servicio.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-300"
                    >
                      Solicitar cobertura
                    </Button>
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

export default ProgramaLealtad;
