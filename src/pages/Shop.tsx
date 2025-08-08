import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Grid3X3,
  List,
  ArrowRight,
  Clock,
  Package,
  ShoppingCart,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';
import { allProducts, categories } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';

const Shop = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<'all' | 'under-20' | 'under-50' | 'under-100'>('all');

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    // Price range filter
    switch (priceRange) {
      case 'under-20':
        filtered = filtered.filter((product) => product.price < 20);
        break;
      case 'under-50':
        filtered = filtered.filter((product) => product.price < 50);
        break;
      case 'under-100':
        filtered = filtered.filter((product) => product.price < 100);
        break;
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'offers':
        filtered.sort((a, b) => (b.isOffer ? 1 : 0) - (a.isOffer ? 1 : 0));
        break;
      case 'name':
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, priceRange]);

  const productStats = {
    total: allProducts.length,
    inStock: allProducts.filter(p => p.inStock).length,
    onOffer: allProducts.filter(p => p.isOffer || p.originalPrice).length,
    newProducts: allProducts.filter(p => p.isNew).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">
                Tienda La Económica
              </h1>
              <p className="text-gray-600">
                Encuentra todo lo que necesitas para tu hogar
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-white">
                <Package className="h-3 w-3 mr-1" />
                {productStats.total} productos
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Clock className="h-3 w-3 mr-1" />
                {productStats.inStock} disponibles
              </Badge>
              {productStats.onOffer > 0 && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {productStats.onOffer} en oferta
                </Badge>
              )}
              {productStats.newProducts > 0 && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {productStats.newProducts} nuevos
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
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

              {/* Price Range Filter */}
              <Select value={priceRange} onValueChange={setPriceRange as any}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Precio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los precios</SelectItem>
                  <SelectItem value="under-20">Menos de $20</SelectItem>
                  <SelectItem value="under-50">Menos de $50</SelectItem>
                  <SelectItem value="under-100">Menos de $100</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Options */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nombre A-Z</SelectItem>
                  <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                  <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                  <SelectItem value="rating">Mejor calificados</SelectItem>
                  <SelectItem value="offers">Ofertas primero</SelectItem>
                  <SelectItem value="newest">Más nuevos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || (selectedCategory && selectedCategory !== 'all') || priceRange !== 'all') && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Filtros activos:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Búsqueda: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedCategory && selectedCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {priceRange !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {priceRange === 'under-20' && 'Menos de $20'}
                  {priceRange === 'under-50' && 'Menos de $50'}
                  {priceRange === 'under-100' && 'Menos de $100'}
                  <button
                    onClick={() => setPriceRange('all')}
                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {filteredProducts.length} de {allProducts.length} productos
            {searchQuery && ` para "${searchQuery}"`}
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
                : 'space-y-4'
            )}
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className={viewMode === 'list' ? 'flex flex-row' : ''}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-2">
              No encontramos productos
            </h3>
            <p className="text-gray-600 mb-6">
              No hay productos que coincidan con tu búsqueda.
              <br />
              Intenta con otros términos o ajusta los filtros.
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPriceRange('all');
              }}
              variant="outline"
            >
              Limpiar filtros
            </Button>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>
              ✅ Base de datos conectada • {allProducts.length} productos cargados • {categories.length} categorías disponibles
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
