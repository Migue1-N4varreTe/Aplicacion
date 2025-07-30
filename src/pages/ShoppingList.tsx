import React, { useState } from "react";
import { useShoppingList } from "@/contexts/ShoppingListContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { allProducts } from "@/lib/data";
import {
  Plus,
  Search,
  Share2,
  Copy,
  Trash2,
  ShoppingCart,
  Calendar,
  Users,
  CheckCircle,
  Circle,
  MoreVertical,
  Edit,
  Star,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const ShoppingListPage = () => {
  const {
    lists,
    createList,
    deleteList,
    updateList,
    addItemToList,
    removeItemFromList,
    toggleItemCompleted,
    shareList,
    duplicateList,
    importFromCart,
    exportToCart,
    getListsStats,
  } = useShoppingList();

  const { toast } = useToast();
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [newListCategory, setNewListCategory] = useState<"personal" | "family" | "work" | "recurring">("personal");
  const [searchProducts, setSearchProducts] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const stats = getListsStats();
  const filteredLists = lists.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentList = selectedList ? lists.find(l => l.id === selectedList) : null;

  const handleCreateList = () => {
    if (!newListName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la lista es requerido",
        variant: "destructive",
      });
      return;
    }

    const newList = createList(newListName, newListDescription, newListCategory);
    setSelectedList(newList.id);
    setNewListName("");
    setNewListDescription("");
    setNewListCategory("personal");
    setShowCreateDialog(false);

    toast({
      title: "Lista creada",
      description: `Se creó la lista "${newListName}" exitosamente`,
    });
  };

  const handleDeleteList = (listId: string) => {
    const list = lists.find(l => l.id === listId);
    deleteList(listId);
    if (selectedList === listId) {
      setSelectedList(null);
    }
    toast({
      title: "Lista eliminada",
      description: `Se eliminó la lista "${list?.name}" exitosamente`,
    });
  };

  const handleShareList = (listId: string) => {
    // Simplified sharing - in a real app, you'd have a proper sharing dialog
    const emails = prompt("Ingresa los emails separados por comas:");
    if (emails) {
      const emailList = emails.split(",").map(e => e.trim());
      shareList(listId, emailList);
      toast({
        title: "Lista compartida",
        description: `Lista compartida con ${emailList.length} personas`,
      });
    }
  };

  const handleDuplicateList = (listId: string) => {
    const original = lists.find(l => l.id === listId);
    if (original) {
      const newName = `${original.name} (Copia)`;
      const duplicate = duplicateList(listId, newName);
      setSelectedList(duplicate.id);
      toast({
        title: "Lista duplicada",
        description: `Se creó una copia de "${original.name}"`,
      });
    }
  };

  const handleImportFromCart = () => {
    const newList = importFromCart();
    setSelectedList(newList.id);
    toast({
      title: "Lista importada",
      description: "Se creó una lista con los productos del carrito",
    });
  };

  const handleExportToCart = (listId: string) => {
    exportToCart(listId);
    toast({
      title: "Exportado al carrito",
      description: "Los productos se agregaron al carrito",
    });
  };

  const handleAddProducts = () => {
    if (!selectedList || selectedProducts.length === 0) return;

    selectedProducts.forEach(productId => {
      addItemToList(selectedList, productId, 1);
    });

    setSelectedProducts([]);
    setSearchProducts("");
    setShowAddItemDialog(false);

    toast({
      title: "Productos agregados",
      description: `Se agregaron ${selectedProducts.length} productos a la lista`,
    });
  };

  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchProducts.toLowerCase()) &&
    !currentList?.items.some(item => item.productId === product.id)
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "personal": return "bg-blue-100 text-blue-800";
      case "family": return "bg-green-100 text-green-800";
      case "work": return "bg-purple-100 text-purple-800";
      case "recurring": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "medium": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "low": return <Circle className="h-4 w-4 text-gray-400" />;
      default: return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Listas de Compras</h1>
          <p className="text-gray-600 mt-1">Organiza tus compras de manera inteligente</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleImportFromCart} variant="outline">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Importar Carrito
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Lista
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Lista</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="listName">Nombre de la lista</Label>
                  <Input
                    id="listName"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Mi lista de compras"
                  />
                </div>
                <div>
                  <Label htmlFor="listDescription">Descripción (opcional)</Label>
                  <Textarea
                    id="listDescription"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="Describe el propósito de esta lista"
                  />
                </div>
                <div>
                  <Label htmlFor="listCategory">Categoría</Label>
                  <Select value={newListCategory} onValueChange={setNewListCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="family">Familia</SelectItem>
                      <SelectItem value="work">Trabajo</SelectItem>
                      <SelectItem value="recurring">Recurrente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateList}>Crear Lista</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Listas Totales</p>
                <p className="text-2xl font-bold">{stats.totalLists}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Star className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedItems}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingItems}</p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Estimado</p>
                <p className="text-2xl font-bold text-purple-600">${stats.totalEstimatedValue.toFixed(2)}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lists Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Mis Listas</CardTitle>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar listas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredLists.map((list) => (
                  <div
                    key={list.id}
                    className={cn(
                      "p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors",
                      selectedList === list.id && "bg-blue-50 border-l-4 border-l-blue-500"
                    )}
                    onClick={() => setSelectedList(list.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{list.name}</h3>
                        {list.description && (
                          <p className="text-sm text-gray-600 mt-1">{list.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getCategoryColor(list.category)}>
                            {list.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {list.items.length} productos
                          </span>
                          {list.isShared && (
                            <Badge variant="outline">
                              <Users className="h-3 w-3 mr-1" />
                              Compartida
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium text-green-600 mt-1">
                          ${list.estimatedTotal.toFixed(2)}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleShareList(list.id)}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Compartir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateList(list.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportToCart(list.id)}>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Enviar al Carrito
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteList(list.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* List Details */}
        <div className="lg:col-span-2">
          {currentList ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {currentList.name}
                      <Badge className={getCategoryColor(currentList.category)}>
                        {currentList.category}
                      </Badge>
                    </CardTitle>
                    {currentList.description && (
                      <CardDescription>{currentList.description}</CardDescription>
                    )}
                  </div>
                  <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Productos
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Agregar Productos a la Lista</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Search className="h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Buscar productos..."
                            value={searchProducts}
                            onChange={(e) => setSearchProducts(e.target.value)}
                          />
                        </div>
                        <div className="max-h-96 overflow-y-auto space-y-2">
                          {filteredProducts.map((product) => (
                            <div
                              key={product.id}
                              className={cn(
                                "p-3 border rounded-lg cursor-pointer transition-colors",
                                selectedProducts.includes(product.id)
                                  ? "bg-blue-50 border-blue-300"
                                  : "hover:bg-gray-50"
                              )}
                              onClick={() => {
                                setSelectedProducts(prev =>
                                  prev.includes(product.id)
                                    ? prev.filter(id => id !== product.id)
                                    : [...prev, product.id]
                                );
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{product.name}</h4>
                                  <p className="text-sm text-gray-600">${product.price}</p>
                                </div>
                                {selectedProducts.includes(product.id) && (
                                  <CheckCircle className="h-5 w-5 text-blue-600" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleAddProducts} disabled={selectedProducts.length === 0}>
                            Agregar {selectedProducts.length} productos
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentList.items.map((item) => {
                    const product = allProducts.find(p => p.id === item.productId);
                    if (!product) return null;

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center justify-between p-3 border rounded-lg",
                          item.completed && "bg-gray-50 opacity-60"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleItemCompleted(currentList.id, item.id)}
                            className="flex-shrink-0"
                          >
                            {item.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                          <div>
                            <h4 className={cn(
                              "font-medium",
                              item.completed && "line-through"
                            )}>
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>Cantidad: {item.quantity}</span>
                              <span>•</span>
                              <span>${(product.price * item.quantity).toFixed(2)}</span>
                              {getPriorityIcon(item.priority)}
                            </div>
                            {item.notes && (
                              <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItemFromList(currentList.id, item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                  
                  {currentList.items.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Esta lista está vacía</p>
                      <p className="text-sm">Agrega productos para comenzar</p>
                    </div>
                  )}
                </div>

                {currentList.items.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total estimado:</span>
                      <span className="text-xl font-bold text-green-600">
                        ${currentList.estimatedTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona una lista
                </h3>
                <p className="text-gray-600 mb-4">
                  Elige una lista de la izquierda o crea una nueva para comenzar
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Lista
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingListPage;
