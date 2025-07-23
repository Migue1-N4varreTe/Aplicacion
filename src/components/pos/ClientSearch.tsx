import React, { useState, useEffect } from "react";
import { Search, User, Phone, Mail, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  total_points: number;
  client_code: string;
  total_spent?: number;
  visit_count?: number;
}

interface ClientSearchProps {
  selectedClient: Client | null;
  onSelectClient: (client: Client) => void;
  onClose: () => void;
}

const ClientSearch: React.FC<ClientSearchProps> = ({
  selectedClient,
  onSelectClient,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchClients();
    } else {
      setClients([]);
    }
  }, [searchTerm]);

  const searchClients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/clients?search=${encodeURIComponent(searchTerm)}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients);
      }
    } catch (error) {
      console.error("Error searching clients:", error);
      toast({
        title: "Error",
        description: "Error al buscar clientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createClient = async () => {
    if (!newClientData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del cliente es requerido",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newClientData),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Cliente creado",
          description: "El cliente se registró exitosamente",
        });

        onSelectClient(data.client);
        setShowNewClientForm(false);
        setNewClientData({ name: "", phone: "", email: "", address: "" });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Error al crear cliente",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating client:", error);
      toast({
        title: "Error",
        description: "Error al crear cliente",
        variant: "destructive",
      });
    }
  };

  const clearSelection = () => {
    onSelectClient(null);
  };

  return (
    <div className="space-y-4">
      {/* Cliente seleccionado */}
      {selectedClient && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedClient.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    Código: {selectedClient.client_code}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      {selectedClient.total_points} puntos
                    </Badge>
                    {selectedClient.phone && (
                      <span className="text-xs text-muted-foreground">
                        {selectedClient.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={clearSelection}>
                Quitar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Búsqueda */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nombre, teléfono o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            autoComplete="off"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowNewClientForm(true)}
            className="flex-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </Button>

          <Button variant="outline" onClick={onClose}>
            Continuar sin cliente
          </Button>
        </div>
      </div>

      {/* Resultados de búsqueda */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Buscando...</p>
          </div>
        )}

        {!loading && searchTerm.length >= 2 && clients.length === 0 && (
          <div className="text-center py-4">
            <User className="mx-auto h-8 w-8 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No se encontraron clientes
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Intenta con otro término o crea un nuevo cliente
            </p>
          </div>
        )}

        {clients.map((client) => (
          <Card
            key={client.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectClient(client)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium truncate">{client.name}</h4>

                    <div className="flex items-center gap-2 mt-1">
                      {client.phone && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Phone className="w-3 h-3 mr-1" />
                          {client.phone}
                        </div>
                      )}

                      {client.email && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Mail className="w-3 h-3 mr-1" />
                          {client.email}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {client.total_points} puntos
                      </Badge>

                      <span className="text-xs text-muted-foreground">
                        Código: {client.client_code}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para nuevo cliente */}
      <Dialog open={showNewClientForm} onOpenChange={setShowNewClientForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={newClientData.name}
                onChange={(e) =>
                  setNewClientData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Nombre completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={newClientData.phone}
                onChange={(e) =>
                  setNewClientData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                placeholder="Número de teléfono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newClientData.email}
                onChange={(e) =>
                  setNewClientData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder="Correo electrónico"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={newClientData.address}
                onChange={(e) =>
                  setNewClientData((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder="Dirección"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewClientForm(false)}
              >
                Cancelar
              </Button>

              <Button onClick={createClient}>Registrar Cliente</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientSearch;
