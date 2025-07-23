import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Award,
  Calendar,
  Gift,
  Star,
} from "lucide-react";

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
  preferences: string[];
  totalSpent: number;
  averageTicket: number;
  purchaseFrequency: number;
}

interface ClientsListProps {
  clients: Client[];
  onUpdate: (id: string, data: Partial<Client>) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

const ClientsList: React.FC<ClientsListProps> = ({
  clients,
  onUpdate,
  onDelete,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const filteredAndSortedClients = React.useMemo(() => {
    let filtered = clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm);
      const matchesStatus =
        statusFilter === "all" || client.status === statusFilter;
      const matchesTier = tierFilter === "all" || client.tier === tierFilter;

      return matchesSearch && matchesStatus && matchesTier;
    });

    // Sort clients
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "registrationDate":
          aValue = new Date(a.registrationDate).getTime();
          bValue = new Date(b.registrationDate).getTime();
          break;
        case "totalSpent":
          aValue = a.totalSpent;
          bValue = b.totalSpent;
          break;
        case "loyaltyPoints":
          aValue = a.loyaltyPoints;
          bValue = b.loyaltyPoints;
          break;
        case "lastPurchase":
          aValue = new Date(a.lastPurchase || 0).getTime();
          bValue = new Date(b.lastPurchase || 0).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [clients, searchTerm, statusFilter, tierFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedClients.length / itemsPerPage);
  const paginatedClients = filteredAndSortedClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Nombre",
      "Email",
      "Teléfono",
      "Estado",
      "Nivel",
      "Puntos",
      "Total Gastado",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredAndSortedClients.map((client) =>
        [
          `"${client.name}"`,
          `"${client.email}"`,
          `"${client.phone}"`,
          `"${client.status}"`,
          `"${client.tier}"`,
          client.loyaltyPoints,
          client.totalSpent.toFixed(2),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `clientes_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Lista Completa de Clientes</span>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-48">
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
            <SelectTrigger className="w-full lg:w-48">
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

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nombre</SelectItem>
              <SelectItem value="registrationDate">
                Fecha de Registro
              </SelectItem>
              <SelectItem value="lastPurchase">Última Compra</SelectItem>
              <SelectItem value="totalSpent">Total Gastado</SelectItem>
              <SelectItem value="loyaltyPoints">Puntos de Fidelidad</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Mostrando {paginatedClients.length} de{" "}
            {filteredAndSortedClients.length} clientes
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Página:</span>
            <Select
              value={currentPage.toString()}
              onValueChange={(value) => setCurrentPage(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <SelectItem key={page} value={page.toString()}>
                      {page}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">de {totalPages}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("name")}
                >
                  Cliente{" "}
                  {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Estado & Nivel</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("loyaltyPoints")}
                >
                  Puntos{" "}
                  {sortBy === "loyaltyPoints" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("totalSpent")}
                >
                  Gastos{" "}
                  {sortBy === "totalSpent" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("lastPurchase")}
                >
                  Última Compra{" "}
                  {sortBy === "lastPurchase" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      <span className="ml-2">Cargando clientes...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <Search className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-500">
                        No se encontraron clientes
                      </p>
                      <p className="text-sm text-gray-400">
                        Intenta ajustar los filtros de búsqueda
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {client.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {client.name}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            Desde{" "}
                            {new Date(
                              client.registrationDate,
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-2 text-gray-400" />
                          {client.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-3 w-3 mr-2 text-gray-400" />
                          {client.phone}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-2">
                        <Badge className={getStatusColor(client.status)}>
                          {client.status === "active" && "Activo"}
                          {client.status === "inactive" && "Inactivo"}
                          {client.status === "vip" && "VIP"}
                        </Badge>
                        <Badge className={getTierColor(client.tier)}>
                          {client.tier.charAt(0).toUpperCase() +
                            client.tier.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-yellow-500 mr-2" />
                        <span className="font-medium">
                          {client.loyaltyPoints}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <div className="font-medium">
                          Bs. {client.totalSpent.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {client.totalPurchases} compras
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        {client.lastPurchase ? (
                          <>
                            <div>
                              {new Date(
                                client.lastPurchase,
                              ).toLocaleDateString()}
                            </div>
                            <div className="text-gray-500">
                              {Math.floor(
                                (Date.now() -
                                  new Date(client.lastPurchase).getTime()) /
                                  (1000 * 60 * 60 * 24),
                              )}{" "}
                              días
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-400">Sin compras</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Gift className="h-4 w-4 mr-2" />
                            Otorgar Puntos
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Enviar Email
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDelete(client.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>

            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + Math.max(1, currentPage - 2);
                if (page > totalPages) return null;

                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientsList;
