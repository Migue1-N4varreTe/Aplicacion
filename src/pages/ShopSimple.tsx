import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { allProducts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/contexts/AuthContext";

const ShopSimple = () => {
  const [products, setProducts] = useState(allProducts.slice(0, 20));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    try {
      console.log("Shop: Cargando productos...", allProducts.length);
      setProducts(allProducts.slice(0, 20));
      setLoading(false);
    } catch (err) {
      console.error("Error cargando productos:", err);
      setError("Error cargando productos");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tienda - Versión Simple
          </h1>
          <p className="text-gray-600">
            Encuentra todos los productos que necesitas ({allProducts.length} productos disponibles)
          </p>
        </div>

        {/* Debug Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-medium text-blue-900">Información de Debug:</h3>
          <ul className="text-sm text-blue-700 mt-2">
            <li>Total productos cargados: {allProducts.length}</li>
            <li>Productos mostrados: {products.length}</li>
            <li>Usuario logueado: {user ? 'Sí' : 'No'}</li>
            <li>Estado de carga: {loading ? 'Cargando' : 'Completo'}</li>
          </ul>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron productos</p>
          </div>
        )}

        {/* Load More Button */}
        {products.length < allProducts.length && (
          <div className="text-center mt-8">
            <button
              onClick={() => {
                const nextBatch = allProducts.slice(products.length, products.length + 20);
                setProducts([...products, ...nextBatch]);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
            >
              Cargar más productos ({allProducts.length - products.length} restantes)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopSimple;
