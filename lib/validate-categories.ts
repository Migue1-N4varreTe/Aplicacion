import { allProducts, categories } from "./data";

// Función para validar que todos los productos estén en categorías existentes
export const validateProductCategories = () => {
  const categoryIds = categories.map((cat) => cat.id);
  const categoryCounts: Record<string, number> = {};
  const invalidProducts: string[] = [];

  // Contar productos por categoría y encontrar categorías inválidas
  allProducts.forEach((product) => {
    if (!categoryIds.includes(product.category)) {
      invalidProducts.push(
        `${product.id}: categoría "${product.category}" no existe`,
      );
    } else {
      categoryCounts[product.category] =
        (categoryCounts[product.category] || 0) + 1;
    }
  });

  // Comparar con los conteos esperados
  const expectedCounts = {
    "frutas-verduras": 75,
    "panaderia-bimbo": 45,
    "carniceria-cremeria": 36,
    "lacteos-huevos": 42,
    congelados: 35,
    "abarrotes-basicos": 48,
    "enlatados-conservas": 40,
    "aceites-condimentos": 32,
  };

  const countDiscrepancies: string[] = [];
  Object.entries(expectedCounts).forEach(([categoryId, expectedCount]) => {
    const actualCount = categoryCounts[categoryId] || 0;
    if (actualCount !== expectedCount) {
      countDiscrepancies.push(
        `${categoryId}: esperado ${expectedCount}, actual ${actualCount}`,
      );
    }
  });

  return {
    invalidProducts,
    countDiscrepancies,
    categoryCounts,
    totalProducts: allProducts.length,
    isValid: invalidProducts.length === 0 && countDiscrepancies.length === 0,
  };
};

// Función para verificar imágenes rotas (simulada)
export const validateProductImages = () => {
  const productsWithPotentiallyBrokenImages: string[] = [];

  allProducts.forEach((product) => {
    // Verificar patrones comunes de URLs rotas o genéricas
    if (
      !product.image ||
      product.image.includes("placeholder") ||
      product.image.includes("default") ||
      product.image === ""
    ) {
      productsWithPotentiallyBrokenImages.push(
        `${product.id}: imagen potencialmente problemática - ${product.image}`,
      );
    }
  });

  return {
    productsWithPotentiallyBrokenImages,
    totalChecked: allProducts.length,
  };
};

// Función principal de validación
export const runFullValidation = () => {
  console.log("🔍 Ejecutando validación completa de productos...\n");

  const categoryValidation = validateProductCategories();
  const imageValidation = validateProductImages();

  console.log("📊 VALIDACIÓN DE CATEGORÍAS:");
  console.log(`Total de productos: ${categoryValidation.totalProducts}`);
  console.log(
    `Categorías válidas: ${categoryValidation.isValid ? "✅" : "❌"}`,
  );

  if (categoryValidation.invalidProducts.length > 0) {
    console.log("\n❌ Productos con categorías inválidas:");
    categoryValidation.invalidProducts.forEach((error) =>
      console.log(`  - ${error}`),
    );
  }

  if (categoryValidation.countDiscrepancies.length > 0) {
    console.log("\n⚠️ Discrepancias en conteos:");
    categoryValidation.countDiscrepancies.forEach((error) =>
      console.log(`  - ${error}`),
    );
  }

  console.log("\n📊 Conteos por categoría:");
  Object.entries(categoryValidation.categoryCounts).forEach(
    ([category, count]) => {
      console.log(`  ${category}: ${count} productos`);
    },
  );

  console.log("\n🖼️ VALIDACIÓN DE IMÁGENES:");
  console.log(`Productos revisados: ${imageValidation.totalChecked}`);
  console.log(
    `Imágenes problemáticas: ${imageValidation.productsWithPotentiallyBrokenImages.length}`,
  );

  if (imageValidation.productsWithPotentiallyBrokenImages.length > 0) {
    console.log("\n⚠️ Imágenes potencialmente problemáticas:");
    imageValidation.productsWithPotentiallyBrokenImages
      .slice(0, 5)
      .forEach((error) => console.log(`  - ${error}`));
    if (imageValidation.productsWithPotentiallyBrokenImages.length > 5) {
      console.log(
        `  ... y ${imageValidation.productsWithPotentiallyBrokenImages.length - 5} más`,
      );
    }
  }

  return {
    categoryValidation,
    imageValidation,
    overallValid:
      categoryValidation.isValid &&
      imageValidation.productsWithPotentiallyBrokenImages.length === 0,
  };
};

export default runFullValidation;
