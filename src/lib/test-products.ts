import { Product } from "./data";

// Productos de prueba para validar funcionalidad del carrito
export const testProducts: Product[] = [
  {
    id: "test-producto-disponible",
    name: "🧪 Test - Producto Disponible",
    price: 10,
    category: "frutas-verduras",
    subcategory: "frutas-frescas",
    aisle: "Pasillo Test",
    image:
      "https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=TEST+DISPONIBLE",
    description: "Producto de prueba con stock disponible",
    inStock: true,
    stock: 100,
    brand: "Test Brand",
    tags: ["test", "disponible", "prueba"],
    rating: 5.0,
    reviewCount: 999,
    deliveryTime: "5 min",
  },
  {
    id: "test-producto-stock-bajo",
    name: "🧪 Test - Stock Bajo (2 unidades)",
    price: 15,
    category: "frutas-verduras",
    subcategory: "frutas-frescas",
    aisle: "Pasillo Test",
    image:
      "https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=TEST+STOCK+BAJO",
    description: "Producto de prueba con stock bajo",
    inStock: true,
    stock: 2,
    brand: "Test Brand",
    tags: ["test", "stock-bajo", "prueba"],
    rating: 4.5,
    reviewCount: 50,
    deliveryTime: "5 min",
  },
  {
    id: "test-producto-agotado",
    name: "🧪 Test - Producto Agotado",
    price: 20,
    category: "frutas-verduras",
    subcategory: "frutas-frescas",
    aisle: "Pasillo Test",
    image:
      "https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=TEST+AGOTADO",
    description: "Producto de prueba sin stock",
    inStock: false,
    stock: 0,
    brand: "Test Brand",
    tags: ["test", "agotado", "prueba"],
    rating: 4.0,
    reviewCount: 25,
    deliveryTime: "No disponible",
  },
  {
    id: "test-producto-oferta",
    name: "🧪 Test - Producto en Oferta",
    price: 8,
    originalPrice: 12,
    category: "frutas-verduras",
    subcategory: "frutas-frescas",
    aisle: "Pasillo Test",
    image: "https://images.pexels.com/photos/429807/pexels-photo-429807.jpeg",
    description: "Producto de prueba con descuento",
    inStock: true,
    stock: 25,
    brand: "Test Brand",
    tags: ["test", "oferta", "descuento", "prueba"],
    rating: 4.8,
    reviewCount: 75,
    deliveryTime: "5 min",
    isOffer: true,
  },
  {
    id: "test-producto-nuevo",
    name: "🧪 Test - Producto Nuevo",
    price: 18,
    category: "frutas-verduras",
    subcategory: "frutas-frescas",
    aisle: "Pasillo Test",
    image: "https://images.pexels.com/photos/197907/pexels-photo-197907.jpeg",
    description: "Producto de prueba marcado como nuevo",
    inStock: true,
    stock: 50,
    brand: "Test Brand",
    tags: ["test", "nuevo", "prueba"],
    rating: 4.9,
    reviewCount: 10,
    deliveryTime: "5 min",
    isNew: true,
  },
];

// Función para agregar productos de prueba en desarrollo
export const addTestProducts = (): Product[] => {
  if (process.env.NODE_ENV === "development") {
    console.log("🧪 Agregando productos de prueba para desarrollo");
    return testProducts;
  }
  return [];
};
