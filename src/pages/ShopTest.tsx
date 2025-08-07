import React from "react";

const ShopTest = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Test de la Tienda
        </h1>
        <p className="text-gray-600 mb-4">
          Esta es una página de prueba para verificar que el enrutamiento funciona.
        </p>
        <div className="bg-white p-4 rounded border">
          <p>✅ El componente se está renderizando correctamente</p>
          <p>✅ Los estilos de Tailwind funcionan</p>
          <p>✅ El enrutamiento a /shop está funcionando</p>
        </div>
      </div>
    </div>
  );
};

export default ShopTest;
