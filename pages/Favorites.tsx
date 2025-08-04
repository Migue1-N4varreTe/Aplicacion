import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Grid3X3,
  List,
  Heart,
  ShoppingCart,
  ArrowRight,
  X,
} from "lucide-react";
import { allProducts as products, categories } from "@/lib/data";
import { useFavorites } from "@/contexts/FavoritesContext";
import { cn } from "@/lib/utils";

const Favorites = () => {
  const { favorites, favoriteCount } = useFavorites();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Get favorite products
  const favoriteProducts = useMemo(() => {
    let filtered = products.filter((product) => favorites.includes(product.id));

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          product.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory,
      );
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "brand":
        filtered.sort((a, b) => (a.brand || "").localeCompare(b.brand || ""));
        break;
      default:
        break;
    }

    return filtered;
  }, [favorites, searchQuery, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchQuery("");
  };

  const activeFiltersCount = [selectedCategory, searchQuery].filter(
    Boolean,
  ).length;

  if (favoriteCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        {/* Empty Favorites State */}
        <div className="container px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900 mb-4">
              No tienes favoritos aún
            </h1>
            <p className="text-gray-600 mb-8">
              Agrega productos a tus favoritos para encontrarlos fácilmente más
              tarde. ¡Descubre algo que te guste!
            </p>
            <div className="space-y-4">
              <Button size="lg" className="w-full btn-gradient" asChild>
                <Link to="/shop">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Explorar productos
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link to="/categories">Ver categorías</Link>
              </Button>
            </div>
          </div>
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
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900">
              Mis Favoritos
            </h1>
            <Badge className="bg-red-100 text-red-700">
              {favoriteCount} productos
            </Badge>
          </div>
          <p className="text-gray-600">
            Aquí tienes todos los productos que has marcado como favoritos
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Buscar en favoritos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-12 text-base"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <Select
              value={selectedCategory || "all"}
              onValueChange={(value) =>
                setSelectedCategory(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nombre A-Z</SelectItem>
                <SelectItem value="brand">Marca</SelectItem>
                <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                <SelectItem value="price-high">
                  Precio: mayor a menor
                </SelectItem>
                <SelectItem value="rating">Mejor calificados</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg p-1 ml-auto">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-3"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Filtros activos:</span>

              {selectedCategory && (
                <Badge variant="secondary" className="gap-1">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="ml-1 hover:bg-gray-300 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:bg-gray-300 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                Limpiar todos
              </Button>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-600">
            {favoriteProducts.length} productos encontrados
            {selectedCategory && (
              <span className="ml-2">
                en{" "}
                <span className="font-medium text-gray-900">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Products Grid/List */}
        {favoriteProducts.length > 0 ? (
          <div
            className={cn(
              "gap-6",
              viewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                : "space-y-4",
            )}
          >
            {favoriteProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                className={cn(
                  viewMode === "list" ? "flex" : "",
                  `animate-scale-in delay-${index * 50}`,
                )}
              />
            ))}
          </div>
        ) : (
          /* No Results State */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              No encontramos productos
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              No hay productos favoritos que coincidan con tus filtros de
              búsqueda
            </p>
            <Button onClick={clearFilters} variant="outline">
              Mostrar todos los favoritos
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-brand-500 to-fresh-500 rounded-2xl p-6 md:p-8 text-white">
            <h2 className="font-display font-bold text-xl md:text-2xl mb-4">
              ¿Listo para comprar?
            </h2>
            <p className="text-white/90 mb-6">
              Agrega tus productos favoritos al carrito y completa tu pedido
            </p>
            <Button
              size="lg"
              className="bg-white text-brand-600 hover:bg-gray-100"
              asChild
            >
              <Link to="/cart">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Ver carrito
              </Link>
            </Button>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 md:p-8 text-white">
            <h2 className="font-display font-bold text-xl md:text-2xl mb-4">
              Descubre más productos
            </h2>
            <p className="text-white/90 mb-6">
              Explora nuestras categorías y encuentra nuevos favoritos
            </p>
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100"
              asChild
            >
              <Link to="/shop">
                Explorar tienda
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
