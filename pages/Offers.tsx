import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
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
  Grid3X3,
  List,
  ArrowRight,
  Clock,
  Tag,
  Percent,
  Star,
  TrendingUp,
} from "lucide-react";
import { allProducts as products, categories } from "@/lib/data";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

const Offers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("discount");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter products to show only offers and deals
  const offerProducts = useMemo(() => {
    let filtered = products.filter(
      (product) =>
        product.isOffer ||
        product.originalPrice ||
        product.isNew ||
        product.price < 20, // Budget-friendly items
    );

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
      case "discount":
        filtered.sort((a, b) => {
          const discountA = a.originalPrice
            ? ((a.originalPrice - a.price) / a.originalPrice) * 100
            : 0;
          const discountB = b.originalPrice
            ? ((b.originalPrice - b.price) / b.originalPrice) * 100
            : 0;
          return discountB - discountA;
        });
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOffers = offerProducts.length;
    const averageDiscount =
      offerProducts.reduce((sum, product) => {
        if (product.originalPrice) {
          return (
            sum +
            ((product.originalPrice - product.price) / product.originalPrice) *
              100
          );
        }
        return sum;
      }, 0) / offerProducts.filter((p) => p.originalPrice).length || 0;

    const totalSavings = offerProducts.reduce((sum, product) => {
      if (product.originalPrice) {
        return sum + (product.originalPrice - product.price);
      }
      return sum;
    }, 0);

    return {
      totalOffers,
      averageDiscount: Math.round(averageDiscount),
      totalSavings: Math.round(totalSavings),
    };
  }, [offerProducts]);

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-500 via-red-600 to-orange-500 text-white">
        <div className="container px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-white/20 text-white border-white/20 w-fit mx-auto mb-4">
              🏷️ ¡Ofertas especiales!
            </Badge>
            <h1 className="font-display font-bold text-4xl lg:text-5xl mb-4">
              Las mejores ofertas y descuentos
            </h1>
            <p className="text-lg text-white/90 mb-8">
              Ahorra en tus productos favoritos con nuestras promociones
              exclusivas
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.totalOffers}</div>
                <div className="text-sm text-white/80">Ofertas activas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {stats.averageDiscount}%
                </div>
                <div className="text-sm text-white/80">Descuento promedio</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">${stats.totalSavings}</div>
                <div className="text-sm text-white/80">Ahorro total</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Offer Categories */}
      <section className="py-8 bg-white">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                name: "Flash Sale",
                icon: "⚡",
                color: "bg-yellow-500",
                discount: "Hasta 50%",
              },
              {
                name: "2x1",
                icon: "🔥",
                color: "bg-red-500",
                discount: "Paga 1 lleva 2",
              },
              {
                name: "Descuentos",
                icon: "🏷️",
                color: "bg-green-500",
                discount: "Desde 20%",
              },
              {
                name: "Nuevos",
                icon: "✨",
                color: "bg-purple-500",
                discount: "Productos nuevos",
              },
            ].map((offer, index) => (
              <Card
                key={offer.name}
                className={`cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md border-0 animate-scale-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-4">
                  <div
                    className={`${offer.color} w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl mb-3 mx-auto`}
                  >
                    {offer.icon}
                  </div>
                  <h3 className="font-semibold text-center text-sm mb-1">
                    {offer.name}
                  </h3>
                  <p className="text-xs text-gray-600 text-center">
                    {offer.discount}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="container px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Buscar ofertas..."
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
                <SelectItem value="discount">Mayor descuento</SelectItem>
                <SelectItem value="popular">Más populares</SelectItem>
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
          {(selectedCategory || searchQuery) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Filtros activos:</span>

              {selectedCategory && (
                <Badge variant="secondary" className="gap-1">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="ml-1 hover:bg-gray-300 rounded-full"
                  >
                    ×
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
                    ×
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
            {offerProducts.length} ofertas encontradas
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Tag className="h-4 w-4" />
            <span>Ahorro total disponible: ${stats.totalSavings}</span>
          </div>
        </div>

        {/* Products Grid/List */}
        {offerProducts.length > 0 ? (
          <div
            className={cn(
              "gap-6",
              viewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                : "space-y-4",
            )}
          >
            {offerProducts.map((product, index) => (
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
          /* Empty State */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏷️</div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              No encontramos ofertas
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              No hay ofertas que coincidan con tus filtros de búsqueda
            </p>
            <Button onClick={clearFilters} variant="outline">
              Mostrar todas las ofertas
            </Button>
          </div>
        )}

        {/* More Offers CTA */}
        <div className="mt-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-8 text-center text-white">
          <h2 className="font-display font-bold text-2xl lg:text-3xl mb-4">
            ¿Quieres ver más productos?
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Explora nuestra tienda completa para encontrar todos los productos
            que necesitas
          </p>
          <Button
            size="lg"
            className="bg-white text-red-600 hover:bg-gray-100 shadow-lg"
            asChild
          >
            <Link to="/shop">
              Ver toda la tienda
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Newsletter Signup */}
      <section className="py-12 bg-white">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-4">
              No te pierdas nuestras ofertas
            </h2>
            <p className="text-gray-600 mb-6">
              Suscríbete y recibe notificaciones de nuestras mejores promociones
            </p>
            <div className="flex gap-4 max-w-md mx-auto">
              <Input placeholder="Tu email" className="flex-1" />
              <Button className="btn-gradient">Suscribirse</Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Cancela en cualquier momento. Sin spam.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Offers;
