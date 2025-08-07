import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Users,
  Edit,
  Trash2,
  Eye,
  Star,
  Gift,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import ClientForm from "@/components/clients/ClientForm";
import LoyaltyProgram from "@/components/clients/LoyaltyProgram";
import PurchaseHistory from "@/components/clients/PurchaseHistory";
import ClientsList from "@/components/clients/ClientsList";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  registrationDate: string;
  lastPurchase: string;
  totalPurchases: number;
  loyaltyPoints: number;
  status: "active" | "inactive" | "vip";
  tier: "bronze" | "silver" | "gold" | "platinum";
  avatar?: string;
  birthday?: string;
  preferences: string[];
  totalSpent: number;
  averageTicket: number;
  purchaseFrequency: number;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    vipClients: 0,
    newThisMonth: 0,
    avgLoyaltyPoints: 0,
    avgPurchaseValue: 0,
  });

  useEffect(() => {
    loadClients();
    loadStats();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      // Simulated API call - replace with actual backend call
      const mockClients: Client[] = [
        {
          id: "1",
          name: "María González",
          email: "maria@email.com",
          phone: "+584241234567",
          address: "Av. Principal 123, Valencia",
          registrationDate: "2024-01-15",
          lastPurchase: "2024-11-28",
          totalPurchases: 45,
          loyaltyPoints: 1250,
          status: "active",
          tier: "gold",
          birthday: "1985-06-15",
          preferences: ["lácteos", "panadería", "frutas"],
          totalSpent: 2340.5,
          averageTicket: 52.01,
          purchaseFrequency: 15,
        },
        {
          id: "2",
          name: "Carlos Rodríguez",
          email: "carlos@email.com",
          phone: "+584129876543",
          address: "Calle 5 #45-67, Maracay",
          registrationDate: "2024-03-20",
          lastPurchase: "2024-11-25",
          totalPurchases: 23,
          loyaltyPoints: 680,
          status: "active",
          tier: "silver",
          birthday: "1978-11-03",
          preferences: ["carnes", "bebidas", "limpieza"],
          totalSpent: 1120.75,
          averageTicket: 48.73,
          purchaseFrequency: 8,
        },
        {
          id: "3",
          name: "Ana Martínez",
          email: "ana@email.com",
          phone: "+584167890123",
          address: "Urbanización Los Alamos, Casa 12",
          registrationDate: "2023-11-10",
          lastPurchase: "2024-11-29",
          totalPurchases: 78,
          loyaltyPoints: 2150,
          status: "vip",
          tier: "platinum",
          birthday: "1990-03-22",
          preferences: ["productos orgánicos", "vinos", "gourmet"],
          totalSpent: 4567.3,
          averageTicket: 58.55,
          purchaseFrequency: 25,
        },
      ];
      setClients(mockClients);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Simulated API call
      setStats({
        totalClients: 1247,
        activeClients: 1150,
        vipClients: 67,
        newThisMonth: 45,
        avgLoyaltyPoints: 890,
        avgPurchaseValue: 52.4,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleCreateClient = async (clientData: Partial<Client>) => {
    try {
      // Simulated API call
      const newClient: Client = {
        id: Date.now().toString(),
        name: clientData.name || "",
        email: clientData.email || "",
        phone: clientData.phone || "",
        address: clientData.address || "",
        registrationDate: new Date().toISOString().split("T")[0],
        lastPurchase: "",
        totalPurchases: 0,
        loyaltyPoints: 0,
        status: "active",
        tier: "bronze",
        preferences: [],
        totalSpent: 0,
        averageTicket: 0,
        purchaseFrequency: 0,
        ...clientData,
      };

      setClients([...clients, newClient]);
      setIsFormOpen(false);
      toast({
        title: "Cliente creado",
        description: "El cliente ha sido registrado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el cliente",
        variant: "destructive",
      });
    }
  };

  const handleUpdateClient = async (
    id: string,
    clientData: Partial<Client>,
  ) => {
    try {
      const updatedClients = clients.map((client) =>
        client.id === id ? { ...client, ...clientData } : client,
      );
      setClients(updatedClients);
      setSelectedClient(null);
      toast({
        title: "Cliente actualizado",
        description: "Los datos del cliente han sido actualizados",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el cliente",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      setClients(clients.filter((client) => client.id !== id));
      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado del sistema",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente",
        variant: "destructive",
      });
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || client.status === statusFilter;
    const matchesTier = tierFilter === "all" || client.tier === tierFilter;

    return matchesSearch && matchesStatus && matchesTier;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "platinum":
        return "bg-purple-100 text-purple-800";
      case "gold":
        return "bg-yellow-100 text-yellow-800";
      case "silver":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-orange-100 text-orange-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "vip":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Clientes
          </h1>
          <p className="text-gray-600">
            Administra tu base de clientes y programa de fidelidad
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Clientes
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalClients}
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
                    Clientes Activos
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activeClients}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Clientes VIP
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.vipClients}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Nuevos (Mes)
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.newThisMonth}
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
                    Puntos Promedio
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.avgLoyaltyPoints}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Gift className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Ticket Promedio
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    Bs. {stats.avgPurchaseValue}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="clients">Lista de Clientes</TabsTrigger>
            <TabsTrigger value="loyalty">Programa de Fidelidad</TabsTrigger>
            <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Clientes Recientes</span>
                  <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Cliente
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
                      </DialogHeader>
                      <ClientForm
                        onSubmit={handleCreateClient}
                        onCancel={() => setIsFormOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar clientes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={tierFilter} onValueChange={setTierFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los niveles</SelectItem>
                      <SelectItem value="bronze">Bronce</SelectItem>
                      <SelectItem value="silver">Plata</SelectItem>
                      <SelectItem value="gold">Oro</SelectItem>
                      <SelectItem value="platinum">Platino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Nivel</TableHead>
                        <TableHead>Puntos</TableHead>
                        <TableHead>Total Gastado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            Cargando clientes...
                          </TableCell>
                        </TableRow>
                      ) : filteredClients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No se encontraron clientes
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredClients.slice(0, 10).map((client) => (
                          <TableRow key={client.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{client.name}</div>
                                <div className="text-sm text-gray-500">
                                  Registrado:{" "}
                                  {new Date(
                                    client.registrationDate,
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="flex items-center text-sm">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {client.email}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {client.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(client.status)}>
                                {client.status === "active" && "Activo"}
                                {client.status === "inactive" && "Inactivo"}
                                {client.status === "vip" && "VIP"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getTierColor(client.tier)}>
                                {client.tier.charAt(0).toUpperCase() +
                                  client.tier.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Award className="h-4 w-4 text-yellow-500 mr-1" />
                                {client.loyaltyPoints}
                              </div>
                            </TableCell>
                            <TableCell>
                              Bs. {client.totalSpent.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedClient(client)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedClient(client);
                                    setIsFormOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClient(client.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <ClientsList
              clients={filteredClients}
              onUpdate={handleUpdateClient}
              onDelete={handleDeleteClient}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="loyalty">
            <LoyaltyProgram
              clients={clients}
              onUpdateClient={handleUpdateClient}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <PurchaseHistory clients={clients} />
          </TabsContent>
        </Tabs>

        {/* Client Details Modal */}
        {selectedClient && !isFormOpen && (
          <Dialog
            open={!!selectedClient}
            onOpenChange={() => setSelectedClient(null)}
          >
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Detalles del Cliente
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedClient.name}
                    </h3>
                    <Badge className={getStatusColor(selectedClient.status)}>
                      {selectedClient.status}
                    </Badge>
                    <Badge
                      className={getTierColor(selectedClient.tier)}
                      style={{ marginLeft: "8px" }}
                    >
                      {selectedClient.tier}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {selectedClient.email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      {selectedClient.phone}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      {selectedClient.address}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedClient.totalPurchases}
                      </div>
                      <div className="text-sm text-gray-600">Compras</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedClient.loyaltyPoints}
                      </div>
                      <div className="text-sm text-gray-600">Puntos</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        Bs. {selectedClient.totalSpent.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Total Gastado</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        Bs. {selectedClient.averageTicket.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Ticket Promedio
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Clients;
