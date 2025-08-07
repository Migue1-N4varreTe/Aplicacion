import React from "react";
import Navbar from "@/components/Navbar";
import { allProducts } from "@/lib/data";

const ShopMinimal = () => {
  console.log("ShopMinimal: Renderizando", allProducts.length, "productos");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Tienda - Diagnóstico
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Estado de la aplicación:</h2>
          <ul className="space-y-2">
            <li>✅ Componente se renderiza</li>
            <li>✅ Navbar funciona</li>
            <li>✅ Estilos de Tailwind aplicados</li>
            <li>✅ Productos cargados: {allProducts.length}</li>
          </ul>
        </div>

        <div className="bg-blue-50 p-4 rounded border mb-6">
          <h3 className="font-medium text-blue-900 mb-2">Primeros 3 productos:</h3>
          {allProducts.slice(0, 3).map((product, index) => (
            <div key={product.id} className="text-sm text-blue-700 mb-1">
              {index + 1}. {product.name} - ${product.price}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allProducts.slice(0, 6).map((product) => (
            <div key={product.id} className="bg-white p-4 rounded border shadow-sm">
              <h3 className="font-medium text-gray-900">{product.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{product.description}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-lg font-bold text-green-600">
                  ${product.price}
                </span>
                <span className="text-sm text-gray-500">
                  Stock: {product.stock}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopMinimal;
