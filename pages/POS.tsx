import React, { useState, useEffect, useRef } from "react";
import {
  Scan,
  User,
  CreditCard,
  Receipt,
  Trash2,
  Plus,
  Minus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import Cart from "@/components/pos/Cart";
import BarcodeScanner from "@/components/pos/BarcodeScanner";
import PaymentModal from "@/components/pos/PaymentModal";
import ClientSearch from "@/components/pos/ClientSearch";

interface Product {
  id: string;
  name: string;
  price: number;
  sku?: string;
  barcode?: string;
  stock_quantity: number;
  unit: string;
  categories: {
    name: string;
  };
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  products: {
    id: string;
    name: string;
    sku?: string;
    unit: string;
    stock_quantity: number;
  };
}

interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  total_points: number;
  client_code: string;
}

const POSPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [cartSummary, setCartSummary] = useState({
    total_items: 0,
    subtotal: 0,
    tax: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCart();

    // Focus en el input de búsqueda al cargar
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (searchTerm) {
      searchProducts();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const loadCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/sales/cart/current", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cart.items);
        setCartSummary(data.cart.summary);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };

  const searchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        search: searchTerm,
        limit: "10",
        in_stock: "true",
      });

      const response = await fetch(`/api/products?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.products);
      }
    } catch (error) {
      console.error("Error searching products:", error);
    }
  };

  const handleScanProduct = async (code: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/sales/cart/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ barcode: code }),
      });

      if (response.ok) {
        const data = await response.json();
        await addToCart(data.product.id, 1);
        setShowScanner(false);
      } else {
        const error = await response.json();
        toast({
          title: "Producto no encontrado",
          description:
            error.error || "No se encontró un producto con ese código",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error scanning product:", error);
      toast({
        title: "Error",
        description: "Error al escanear producto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/sales/cart/add-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          quantity,
        }),
      });

      if (response.ok) {
        await loadCart();
        setSearchTerm("");
        setSearchResults([]);

        // Refocus en el input de búsqueda
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }

        toast({
          title: "Producto agregado",
          description: "El producto se agregó al carrito",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Error al agregar producto",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Error al agregar producto al carrito",
        variant: "destructive",
      });
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/sales/cart/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        await loadCart();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Error al actualizar cantidad",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating cart item:", error);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/sales/cart/items/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadCart();
        toast({
          title: "Producto eliminado",
          description: "El producto se eliminó del carrito",
        });
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const clearCart = async () => {
    if (!confirm("¿Estás seguro de limpiar todo el carrito?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/sales/cart/clear", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadCart();
        toast({
          title: "Carrito limpiado",
          description: "Todos los productos fueron eliminados",
        });
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos antes de proceder al pago",
        variant: "destructive",
      });
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentComplete = (saleData: any) => {
    setShowPayment(false);
    setSelectedClient(null);
    loadCart(); // Esto limpiará el carrito

    toast({
      title: "¡Venta completada!",
      description: `Venta #${saleData.sale.sale_number} procesada exitosamente`,
    });

    // Opción de imprimir ticket
    if (confirm("¿Deseas imprimir el ticket?")) {
      window.open(
        `/api/sales/receipt/${saleData.sale.id}?format=html`,
        "_blank",
      );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // F1 - Scanner
    if (e.key === "F1") {
      e.preventDefault();
      setShowScanner(true);
    }
    // F2 - Cliente
    if (e.key === "F2") {
      e.preventDefault();
      setShowClientSearch(true);
    }
    // F3 - Pago
    if (e.key === "F3") {
      e.preventDefault();
      handleCheckout();
    }
    // Esc - Limpiar búsqueda
    if (e.key === "Escape") {
      setSearchTerm("");
      setSearchResults([]);
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  };

  return (
    <div
      className="container mx-auto py-4 h-screen flex flex-col"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Punto de Venta</h1>
          <p className="text-sm text-muted-foreground">
            Presiona F1 para scanner, F2 para cliente, F3 para pagar
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedClient && (
            <Badge variant="secondary" className="px-3 py-1">
              <User className="w-3 h-3 mr-1" />
              {selectedClient.name} ({selectedClient.total_points} pts)
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowClientSearch(true)}
          >
            <User className="w-4 h-4 mr-1" />
            Cliente (F2)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowScanner(true)}
          >
            <Scan className="w-4 h-4 mr-1" />
            Scanner (F1)
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Panel izquierdo - Búsqueda y productos */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          {/* Búsqueda */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  ref={searchInputRef}
                  placeholder="Buscar productos por nombre, SKU o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-lg h-12"
                  autoComplete="off"
                />
              </div>
            </CardContent>
          </Card>

          {/* Resultados de búsqueda */}
          <div className="flex-1 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="grid gap-2 md:grid-cols-2">
                {searchResults.map((product) => (
                  <Card
                    key={product.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => addToCart(product.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold truncate">
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {product.categories.name}
                          </p>
                        </div>
                        <div className="text-right ml-2">
                          <div className="font-bold text-lg">
                            {formatCurrency(product.price)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Stock: {product.stock_quantity} {product.unit}
                          </div>
                        </div>
                      </div>

                      {product.sku && (
                        <div className="text-xs text-muted-foreground">
                          SKU: {product.sku}
                        </div>
                      )}

                      <Badge
                        variant={
                          product.stock_quantity > 0 ? "default" : "destructive"
                        }
                        className="text-xs mt-2"
                      >
                        {product.stock_quantity > 0
                          ? "Disponible"
                          : "Sin stock"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  No se encontraron productos
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Intenta con otro término de búsqueda
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Scan className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  Busca o escanea productos
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Escribe el nombre del producto o usa el scanner
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho - Carrito */}
        <div className="flex flex-col min-h-0">
          <Cart
            items={cartItems}
            summary={cartSummary}
            onUpdateQuantity={updateCartItem}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            onCheckout={handleCheckout}
          />
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Escáner de Código de Barras</DialogTitle>
          </DialogHeader>
          <BarcodeScanner
            onScan={handleScanProduct}
            onClose={() => setShowScanner(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showClientSearch} onOpenChange={setShowClientSearch}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seleccionar Cliente</DialogTitle>
          </DialogHeader>
          <ClientSearch
            selectedClient={selectedClient}
            onSelectClient={(client) => {
              setSelectedClient(client);
              setShowClientSearch(false);
            }}
            onClose={() => setShowClientSearch(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Procesar Pago</DialogTitle>
          </DialogHeader>
          <PaymentModal
            cartItems={cartItems}
            cartSummary={cartSummary}
            selectedClient={selectedClient}
            onPaymentComplete={handlePaymentComplete}
            onCancel={() => setShowPayment(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POSPage;
