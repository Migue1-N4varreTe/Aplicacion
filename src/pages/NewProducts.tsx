import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter, Star, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/data";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useToast } from "@/hooks/use-toast";

const NewProducts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const { addToCart } = useCart();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const { toast } = useToast();

  // Inicializar productos nuevos una sola vez
  useEffect(() => {
    const simulatedNewProducts = products
      .map((product, index) => ({
        ...product,
        id: `new-${product.id}-${index}`, // Asegurar IDs únicos
        isNew: index % 3 === 0, // Cada tercer producto es "nuevo" para consistencia
        addedDate: new Date(Date.now() - index * 2 * 24 * 60 * 60 * 1000), // Fechas consistentes
      }))
      .filter((product) => product.isNew)
      .sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime());

    setNewProducts(simulatedNewProducts);
  }, []);

  useEffect(() => {
    const filtered = newProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredProducts(filtered);
  }, [searchQuery, newProducts]);

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    toast({
      title: "Producto agregado",
      description: `${product.name} se agregó al carrito`,
    });
  };

  const handleToggleFavorite = (product: any) => {
    const isFavorite = favorites.some((fav) => fav.id === product.id);
    if (isFavorite) {
      removeFromFavorites(product.id);
      toast({
        title: "Removido de favoritos",
        description: `${product.name} se removió de tus favoritos`,
      });
    } else {
      addToFavorites(product);
      toast({
        title: "Agregado a favoritos",
        description: `${product.name} se agregó a tus favoritos`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">
                Nuevos Productos
              </h1>
              <p className="text-gray-600">
                Descubre las últimas incorporaciones a nuestro catálogo
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Badge
                variant="secondary"
                className="bg-brand-100 text-brand-700"
              >
                {filteredProducts.length} productos nuevos
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar nuevos productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* New Products Badge */}
      <div className="container mx-auto px-4 py-6">
        <Card className="bg-gradient-to-r from-brand-500 to-yellow-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-xl mb-2">¡Recién llegados!</h2>
                <p className="text-white/90">
                  Productos añadidos en los últimos 30 días
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{newProducts.length}</div>
                <div className="text-sm text-white/80">productos nuevos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 pb-12">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <div key={`product-${product.id}-${index}`} className="relative">
                <ProductCard
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                  onToggleFavorite={() => handleToggleFavorite(product)}
                  isFavorite={favorites.some((fav) => fav.id === product.id)}
                  className="h-full"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="font-semibold text-xl text-gray-900 mb-2">
              No hay productos nuevos
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? "No encontramos productos nuevos que coincidan con tu búsqueda"
                : "No hay productos nuevos en este momento"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link to="/shop">Ver todos los productos</Link>
              </Button>
              <Button asChild>
                <Link to="/">Volver al inicio</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewProducts;
