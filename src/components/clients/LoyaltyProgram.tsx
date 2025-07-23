import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Award,
  Gift,
  Star,
  Trophy,
  Target,
  TrendingUp,
  Users,
  Percent,
  Plus,
  Settings,
  History,
  Crown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  email: string;
  loyaltyPoints: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  totalSpent: number;
  status: string;
}

interface LoyaltyTier {
  name: string;
  minPoints: number;
  color: string;
  benefits: string[];
  discount: number;
  icon: React.ComponentType<any>;
}

interface Reward {
  id: string;
  name: string;
  pointsCost: number;
  description: string;
  category: "discount" | "product" | "experience";
  available: boolean;
  validUntil?: string;
}

interface PointsTransaction {
  id: string;
  clientId: string;
  clientName: string;
  type: "earned" | "redeemed" | "expired" | "adjusted";
  points: number;
  description: string;
  date: string;
}

interface LoyaltyProgramProps {
  clients: Client[];
  onUpdateClient: (id: string, data: Partial<Client>) => void;
}

const LoyaltyProgram: React.FC<LoyaltyProgramProps> = ({
  clients,
  onUpdateClient,
}) => {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [pointsToAdjust, setPointsToAdjust] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const { toast } = useToast();

  const loyaltyTiers: LoyaltyTier[] = [
    {
      name: "Bronce",
      minPoints: 0,
      color: "bg-orange-100 text-orange-800",
      benefits: ["Puntos básicos por compra", "Ofertas mensuales"],
      discount: 2,
      icon: Award,
    },
    {
      name: "Plata",
      minPoints: 500,
      color: "bg-gray-100 text-gray-800",
      benefits: [
        "5% de descuento",
        "Acceso a ventas exclusivas",
        "Puntos dobles en fechas especiales",
      ],
      discount: 5,
      icon: Star,
    },
    {
      name: "Oro",
      minPoints: 1500,
      color: "bg-yellow-100 text-yellow-800",
      benefits: [
        "8% de descuento",
        "Envío gratis",
        "Atención prioritaria",
        "Regalos de cumpleaños",
      ],
      discount: 8,
      icon: Trophy,
    },
    {
      name: "Platino",
      minPoints: 3000,
      color: "bg-purple-100 text-purple-800",
      benefits: [
        "12% de descuento",
        "Concierge personal",
        "Eventos exclusivos",
        "Early access",
      ],
      discount: 12,
      icon: Crown,
    },
  ];

  const rewards: Reward[] = [
    {
      id: "1",
      name: "Descuento 10%",
      pointsCost: 100,
      description: "10% de descuento en tu próxima compra",
      category: "discount",
      available: true,
    },
    {
      id: "2",
      name: "Producto Gratis",
      pointsCost: 200,
      description: "Producto gratis hasta Bs. 15",
      category: "product",
      available: true,
    },
    {
      id: "3",
      name: "Descuento 20%",
      pointsCost: 300,
      description: "20% de descuento en compras superiores a Bs. 100",
      category: "discount",
      available: true,
    },
    {
      id: "4",
      name: "Experiencia VIP",
      pointsCost: 500,
      description: "Compra personal asistida y café gratis",
      category: "experience",
      available: true,
      validUntil: "2024-12-31",
    },
  ];

  const [pointsHistory] = useState<PointsTransaction[]>([
    {
      id: "1",
      clientId: "1",
      clientName: "María González",
      type: "earned",
      points: 25,
      description: "Compra - Ticket #12345",
      date: "2024-11-28",
    },
    {
      id: "2",
      clientId: "1",
      clientName: "María González",
      type: "redeemed",
      points: -100,
      description: "Canje - Descuento 10%",
      date: "2024-11-25",
    },
    {
      id: "3",
      clientId: "2",
      clientName: "Carlos Rodríguez",
      type: "earned",
      points: 15,
      description: "Compra - Ticket #12344",
      date: "2024-11-25",
    },
  ]);

  const getTierForPoints = (points: number): LoyaltyTier => {
    return (
      loyaltyTiers
        .slice()
        .reverse()
        .find((tier) => points >= tier.minPoints) || loyaltyTiers[0]
    );
  };

  const getNextTier = (points: number): LoyaltyTier | null => {
    return loyaltyTiers.find((tier) => points < tier.minPoints) || null;
  };

  const handleAdjustPoints = () => {
    if (!selectedClient || !pointsToAdjust || !adjustmentReason) {
      toast({
        title: "Error",
        description: "Completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    const client = clients.find((c) => c.id === selectedClient);
    if (!client) return;

    const pointsChange = parseInt(pointsToAdjust);
    const newPoints = Math.max(0, client.loyaltyPoints + pointsChange);
    const newTier = getTierForPoints(newPoints);

    onUpdateClient(selectedClient, {
      loyaltyPoints: newPoints,
      tier: newTier.name.toLowerCase() as any,
    });

    toast({
      title: "Puntos ajustados",
      description: `Se ${pointsChange > 0 ? "agregaron" : "restaron"} ${Math.abs(pointsChange)} puntos`,
    });

    setSelectedClient("");
    setPointsToAdjust("");
    setAdjustmentReason("");
  };

  const programStats = {
    totalMembers: clients.length,
    activeMembers: clients.filter((c) => c.status === "active").length,
    totalPointsAwarded: clients.reduce((sum, c) => sum + c.loyaltyPoints, 0),
    averagePoints: Math.round(
      clients.reduce((sum, c) => sum + c.loyaltyPoints, 0) / clients.length ||
        0,
    ),
  };

  const tierDistribution = loyaltyTiers.map((tier) => ({
    ...tier,
    count: clients.filter(
      (c) => getTierForPoints(c.loyaltyPoints).name === tier.name,
    ).length,
  }));

  return (
    <div className="space-y-6">
      {/* Program Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Miembros Totales
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {programStats.totalMembers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Miembros Activos
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {programStats.activeMembers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Puntos Totales
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {programStats.totalPointsAwarded.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Promedio Puntos
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {programStats.averagePoints}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tiers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tiers">Niveles de Fidelidad</TabsTrigger>
          <TabsTrigger value="rewards">Recompensas</TabsTrigger>
          <TabsTrigger value="management">Gestión</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers" className="space-y-6">
          {/* Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tierDistribution.map((tier) => {
              const IconComponent = tier.icon;
              return (
                <Card key={tier.name} className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={tier.color}>{tier.name}</Badge>
                      <IconComponent className="h-6 w-6 text-gray-600" />
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        Mínimo: {tier.minPoints} puntos
                      </p>
                      <p className="text-sm text-gray-600">
                        Descuento: {tier.discount}%
                      </p>
                      <p className="text-lg font-bold">{tier.count} miembros</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">
                        Beneficios:
                      </p>
                      {tier.benefits.map((benefit, index) => (
                        <p key={index} className="text-xs text-gray-600">
                          • {benefit}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Top Clients by Tier */}
          <Card>
            <CardHeader>
              <CardTitle>Clientes por Nivel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loyaltyTiers.map((tier) => {
                  const tierClients = clients
                    .filter(
                      (c) =>
                        getTierForPoints(c.loyaltyPoints).name === tier.name,
                    )
                    .sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)
                    .slice(0, 5);

                  if (tierClients.length === 0) return null;

                  return (
                    <div key={tier.name} className="space-y-2">
                      <h4 className="font-medium flex items-center">
                        <Badge className={tier.color}>{tier.name}</Badge>
                        <span className="ml-2 text-sm text-gray-600">
                          ({tierClients.length} clientes)
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {tierClients.map((client) => {
                          const nextTier = getNextTier(client.loyaltyPoints);
                          const pointsToNext = nextTier
                            ? nextTier.minPoints - client.loyaltyPoints
                            : 0;

                          return (
                            <div
                              key={client.id}
                              className="p-3 border rounded-lg"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">
                                    {client.name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {client.loyaltyPoints} puntos
                                  </p>
                                  {nextTier && (
                                    <p className="text-xs text-blue-600">
                                      {pointsToNext} para {nextTier.name}
                                    </p>
                                  )}
                                </div>
                                <Award className="h-4 w-4 text-yellow-500" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Catálogo de Recompensas
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Recompensa
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Nueva Recompensa</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="reward-name">Nombre</Label>
                        <Input
                          id="reward-name"
                          placeholder="Nombre de la recompensa"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reward-points">Costo en Puntos</Label>
                        <Input
                          id="reward-points"
                          type="number"
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reward-category">Categoría</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="discount">Descuento</SelectItem>
                            <SelectItem value="product">Producto</SelectItem>
                            <SelectItem value="experience">
                              Experiencia
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button>Crear Recompensa</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map((reward) => (
                  <Card key={reward.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          {reward.category === "discount" && (
                            <Percent className="h-5 w-5 text-green-600 mr-2" />
                          )}
                          {reward.category === "product" && (
                            <Gift className="h-5 w-5 text-blue-600 mr-2" />
                          )}
                          {reward.category === "experience" && (
                            <Star className="h-5 w-5 text-purple-600 mr-2" />
                          )}
                          <h3 className="font-medium">{reward.name}</h3>
                        </div>
                        <Badge
                          variant={reward.available ? "default" : "secondary"}
                        >
                          {reward.available ? "Disponible" : "Agotado"}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {reward.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Award className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="font-medium">
                            {reward.pointsCost} puntos
                          </span>
                        </div>
                        {reward.validUntil && (
                          <span className="text-xs text-gray-500">
                            Válido hasta{" "}
                            {new Date(reward.validUntil).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ajustar Puntos de Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="client-select">Cliente</Label>
                    <Select
                      value={selectedClient}
                      onValueChange={setSelectedClient}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} ({client.loyaltyPoints} puntos)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="points-adjustment">Ajuste de Puntos</Label>
                    <Input
                      id="points-adjustment"
                      type="number"
                      placeholder="100 (positivo para agregar, negativo para restar)"
                      value={pointsToAdjust}
                      onChange={(e) => setPointsToAdjust(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="adjustment-reason">Motivo del Ajuste</Label>
                    <Input
                      id="adjustment-reason"
                      placeholder="Describe el motivo del ajuste"
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleAdjustPoints}
                    disabled={
                      !selectedClient || !pointsToAdjust || !adjustmentReason
                    }
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Aplicar Ajuste
                  </Button>
                </div>

                {selectedClient && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    {(() => {
                      const client = clients.find(
                        (c) => c.id === selectedClient,
                      );
                      if (!client) return null;

                      const currentTier = getTierForPoints(
                        client.loyaltyPoints,
                      );
                      const adjustment = parseInt(pointsToAdjust) || 0;
                      const newPoints = Math.max(
                        0,
                        client.loyaltyPoints + adjustment,
                      );
                      const newTier = getTierForPoints(newPoints);

                      return (
                        <div className="space-y-3">
                          <h4 className="font-medium">
                            Vista Previa del Cambio
                          </h4>

                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Puntos actuales:</span>
                              <span className="font-medium">
                                {client.loyaltyPoints}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Ajuste:</span>
                              <span
                                className={`font-medium ${adjustment >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {adjustment >= 0 ? "+" : ""}
                                {adjustment}
                              </span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span>Nuevos puntos:</span>
                              <span className="font-bold">{newPoints}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Nivel actual:</span>
                              <Badge className={currentTier.color}>
                                {currentTier.name}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Nuevo nivel:</span>
                              <Badge className={newTier.color}>
                                {newTier.name}
                                {newTier.name !== currentTier.name && (
                                  <span className="ml-1">🎉</span>
                                )}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                Historial de Puntos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Puntos</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pointsHistory.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {transaction.clientName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.type === "earned"
                              ? "default"
                              : transaction.type === "redeemed"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {transaction.type === "earned" && "Ganados"}
                          {transaction.type === "redeemed" && "Canjeados"}
                          {transaction.type === "expired" && "Expirados"}
                          {transaction.type === "adjusted" && "Ajustados"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            transaction.points >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {transaction.points >= 0 ? "+" : ""}
                          {transaction.points}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoyaltyProgram;
