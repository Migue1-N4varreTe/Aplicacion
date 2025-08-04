// Import data directly as JSON for Netlify Functions
const { categories } = {
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
    },
    {
      id: "carnes-embutidos",
      name: "Carnes y Embutidos",
      icon: "🥩",
      description: "Carnes frescas y embutidos",
      color: "bg-red-500",
      products: 60
    },
    {
      id: "lacteos",
      name: "Lácteos",
      icon: "🥛",
      description: "Leche, quesos y derivados",
      color: "bg-blue-500",
      products: 45
    },
    {
      id: "panaderia",
      name: "Panadería",
      icon: "🍞",
      description: "Pan fresco y productos horneados",
      color: "bg-yellow-500",
      products: 35
    },
    {
      id: "bebidas",
      name: "Bebidas",
      icon: "🥤",
      description: "Bebidas refrescantes y calientes",
      color: "bg-purple-500",
      products: 70
    },
    {
      id: "limpieza",
      name: "Limpieza",
      icon: "🧽",
      description: "Productos de limpieza para el hogar",
      color: "bg-teal-500",
      products: 40
    },
    {
      id: "cuidado-personal",
      name: "Cuidado Personal",
      icon: "🧴",
      description: "Higiene y cuidado personal",
      color: "bg-pink-500",
      products: 55
    }
  ]
};

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET",
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
    if (event.httpMethod === "GET") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          categories: categories,
          total: categories.length,
        }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Método no permitido" }),
    };
  } catch (error) {
    console.error("Error en función categories:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Error interno del servidor" }),
    };
  }
};
