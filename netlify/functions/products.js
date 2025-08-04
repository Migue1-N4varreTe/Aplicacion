// Import data directly as JSON for Netlify Functions
const { products, categories } = {
  categories: [
    {
      id: "abarrotes",
      name: "Abarrotes",
      icon: "🥫",
      description: "Productos básicos y de despensa",
      color: "bg-orange-500",
      products: 150
    },
    {
      id: "frutas-verduras",
      name: "Frutas y Verduras",
      icon: "🥬",
      description: "Productos frescos y naturales",
      color: "bg-green-500",
      products: 80
    }
  ],
  products: [
    {
      id: "coca-cola-600ml",
      name: "Coca-Cola 600ml",
      category: "bebidas",
      price: 25.00,
      originalPrice: 28.00,
      stock: 45,
      description: "Refresco de cola sabor original en botella de 600ml",
      image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop&crop=center",
      tags: ["bebida", "refresco", "cola", "600ml"],
      brand: "Coca-Cola",
      isOffer: true,
      isFeatured: true,
      rating: 4.8,
      reviews: 125,
      barcode: "7501055363057"
    }
  ]
};

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    const { httpMethod, path, queryStringParameters } = event;
    const pathSegments = path.split("/").filter(Boolean);

    switch (httpMethod) {
      case "GET":
        if (pathSegments.length === 2) {
          // GET /products
          const {
            category,
            search,
            limit = 50,
            page = 1,
          } = queryStringParameters || {};

          let filteredProducts = products;

          // Filtrar por categoría
          if (category) {
            filteredProducts = filteredProducts.filter(
              (p) => p.category === category,
            );
          }

          // Filtrar por búsqueda
          if (search) {
            const searchLower = search.toLowerCase();
            filteredProducts = filteredProducts.filter(
              (p) =>
                p.name.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower) ||
                p.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
            );
          }

          // Paginación
          const limitNum = parseInt(limit);
          const pageNum = parseInt(page);
          const startIndex = (pageNum - 1) * limitNum;
          const endIndex = startIndex + limitNum;
          const paginatedProducts = filteredProducts.slice(
            startIndex,
            endIndex,
          );

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              products: paginatedProducts,
              pagination: {
                page: pageNum,
                limit: limitNum,
                total: filteredProducts.length,
                pages: Math.ceil(filteredProducts.length / limitNum),
              },
            }),
          };
        } else if (pathSegments.length === 3) {
          // GET /products/:id
          const productId = pathSegments[2];
          const product = products.find((p) => p.id === productId);

          if (!product) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: "Producto no encontrado" }),
            };
          }

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(product),
          };
        }
        break;

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: "Método no permitido" }),
        };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Ruta no encontrada" }),
    };
  } catch (error) {
    console.error("Error en función products:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Error interno del servidor" }),
    };
  }
};
