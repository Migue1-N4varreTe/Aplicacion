import { useState } from "react";
import Navbar from "@/components/Navbar";
import GuestShoppingBanner from "@/components/GuestShoppingBanner";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { categories, getTotalProducts } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useDebugProducts } from "@/hooks/use-debug";
import { useProductFilters } from "@/hooks/use-search";
import ProductDiagnostic from "@/components/ProductDiagnostic";

const Shop = () => {
  // Debug products on development
  if (process.env.NODE_ENV === "development") {
    useDebugProducts();
  }

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Use the custom hook for product filtering
  const {
    searchQuery,
    selectedCategory,
    sortBy,
    priceFilter,
    filteredProducts,
    activeFiltersCount,
    updateSearchQuery,
    updateCategory,
    setSortBy,
    setPriceFilter,
    clearFilters,
    hasActiveFilters,
    resultCount,
  } = useProductFilters();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container px-4 py-8">
        {/* Guest Shopping Banner */}
        <div className="mb-6">
          <GuestShoppingBanner />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-sans font-bold text-3xl text-gray-900 mb-2">
            Tienda
          </h1>
          <p className="text-gray-600">
            Encuentra todos los productos que necesitas
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => updateSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-12 text-base"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <Select
              value={selectedCategory || "all"}
              onValueChange={(value) =>
                updateCategory(value === "all" ? "" : value)
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

            {/* Price Filter */}
            <Select
              value={priceFilter || "all"}
              onValueChange={(value) =>
                setPriceFilter(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Precio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los precios</SelectItem>
                <SelectItem value="0-20">$0 - $20</SelectItem>
                <SelectItem value="20-50">$20 - $50</SelectItem>
                <SelectItem value="50-100">$50 - $100</SelectItem>
                <SelectItem value="100">$100+</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Más populares</SelectItem>
                <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                <SelectItem value="price-high">
                  Precio: mayor a menor
                </SelectItem>
                <SelectItem value="rating">Mejor calificados</SelectItem>
                <SelectItem value="name">Nombre A-Z</SelectItem>
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

              {priceFilter && (
                <Badge variant="secondary" className="gap-1">
                  $
                  {priceFilter.includes("-")
                    ? priceFilter.replace("-", " - $")
                    : priceFilter + "+"}
                  <button
                    onClick={() => setPriceFilter("")}
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
            <span className="font-medium text-gray-900">
              {resultCount.toLocaleString()}
            </span>{" "}
            productos encontrados
            {selectedCategory ? (
              <span className="ml-2">
                en{" "}
                <span className="font-medium text-gray-900">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </span>
              </span>
            ) : (
              <span className="ml-2">
                de{" "}
                <span className="font-medium text-brand-600">
                  {getTotalProducts().toLocaleString()} productos totales
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length > 0 ? (
          <div
            className={cn(
              "gap-6",
              viewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                : "space-y-4",
            )}
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className={viewMode === "list" ? "flex" : ""}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              No encontramos productos
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Intenta ajustar tus filtros de búsqueda o explora nuestras
              categorías
            </p>
            <Button onClick={clearFilters} variant="outline">
              Limpiar filtros
            </Button>
          </div>
        )}

        {/* Load More (if needed) */}
        {filteredProducts.length > 20 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Cargar más productos
            </Button>
          </div>
        )}
      </div>

      {/* Diagnostic component for development */}
      <ProductDiagnostic />
    </div>
  );
};

export default Shop;
