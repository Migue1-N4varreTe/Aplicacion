import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CategoryCard from "@/components/CategoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Grid3X3,
  List,
  ArrowRight,
  MapPin,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  categories,
  storeHours,
  isStoreOpen,
  getNextOpenTime,
  getTotalProducts,
  getProductStats,
} from "@/lib/data";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Categories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter categories based on search
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">
                Categorías por Pasillos
              </h1>
              <p className="text-gray-600">
                Explora nuestros 15 pasillos organizados para tu comodidad
              </p>
            </div>

            {/* Store Status */}
            <Card
              className={`w-full md:w-auto ${isStoreOpen() ? "border-green-200" : "border-red-200"}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {isStoreOpen() ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <div>
                        <p className="font-medium text-sm text-green-700">
                          Tienda Abierta
                        </p>
                        <p className="text-xs text-gray-600">
                          Hasta las {storeHours.close}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <div>
                        <p className="font-medium text-sm text-red-700">
                          Tienda Cerrada
                        </p>
                        <p className="text-xs text-gray-600">
                          {getNextOpenTime()}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Horario: {storeHours.open} - {storeHours.close}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Statistics */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-900">
                Estadísticas del Inventario
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-brand-500 mb-1">
                    {getTotalProducts().toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Productos Totales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-yellow-500 mb-1">
                    {getProductStats().inStockProducts.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">En Stock</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-fresh-500 mb-1">
                    {categories.length}
                  </div>
                  <div className="text-sm text-gray-600">Categorías</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-red-500 mb-1">
                    $
                    {Math.round(
                      getProductStats().averagePrice,
                    ).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Precio Promedio</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and View Controls */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Buscar categorías..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-12 text-base"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg p-1">
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

          {/* Results count */}
          <div className="text-gray-600">
            {filteredCategories.length} categorías disponibles
          </div>
        </div>

        {/* Categories Grid/List */}
        {filteredCategories.length > 0 ? (
          <div
            className={cn(
              "gap-6",
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "space-y-4",
            )}
          >
            {filteredCategories.map((category, index) => (
              <div
                key={category.id}
                className={cn(
                  "animate-scale-in",
                  viewMode === "list" ? "flex" : "",
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {viewMode === "list" ? (
                  /* List View */
                  <Link
                    to={`/shop?category=${category.id}`}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 w-full"
                  >
                    <div
                      className={cn(
                        "h-16 w-16 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg relative",
                        category.color,
                      )}
                    >
                      {category.icon}
                      <div className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs px-1 py-0.5 rounded">
                        {category.aisle}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {category.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          Pasillo {category.aisle}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">
                        {category.description}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {category.subcategories.length} subcategorías •{" "}
                        {category.productCount} productos
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {category.productCount}
                      </Badge>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                ) : (
                  /* Grid View */
                  <CategoryCard category={category} />
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              No encontramos categorías
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              No hay categorías que coincidan con tu búsqueda "{searchQuery}"
            </p>
            <Button onClick={() => setSearchQuery("")} variant="outline">
              Mostrar todas las categorías
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="text-2xl font-bold text-brand-600 mb-1">
              {categories.length}
            </div>
            <div className="text-sm text-gray-600">Categorías totales</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="text-2xl font-bold text-fresh-600 mb-1">
              {categories.reduce((sum, cat) => sum + cat.productCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Productos totales</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="text-2xl font-bold text-delivery-600 mb-1">
              15-20
            </div>
            <div className="text-sm text-gray-600">Minutos de entrega</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="text-2xl font-bold text-warning-600 mb-1">9-21</div>
            <div className="text-sm text-gray-600">Horario</div>
          </div>
        </div>

        {/* Popular Categories CTA */}
        <div className="mt-16 bg-gradient-to-r from-brand-500 to-fresh-500 rounded-2xl p-8 text-center text-white">
          <h2 className="font-display font-bold text-2xl lg:text-3xl mb-4">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Explora nuestra tienda completa con miles de productos organizados
            por categorías
          </p>
          <Button
            size="lg"
            className="bg-white text-brand-600 hover:bg-gray-100 shadow-lg"
            asChild
          >
            <Link to="/shop">
              Ver todos los productos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Categories;
