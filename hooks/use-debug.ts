import { useEffect } from "react";
import {
  allProducts,
  categories,
  getTotalProducts,
  getProductsByCategory,
  getProductCountByCategory,
  getProductCountByAisle,
} from "@/lib/data";

export const useDebugProducts = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.group("🛒 COMPREHENSIVE PRODUCT DEBUG ANALYSIS");

      // Basic Product Validation
      console.group("🔍 Product Validation");

      // Check for products without required properties
      const problematicProducts = allProducts.filter((product) => {
        return (
          !product.id ||
          !product.name ||
          product.price === undefined ||
          product.inStock === undefined ||
          product.stock === undefined ||
          !product.image ||
          !product.category
        );
      });

      if (problematicProducts.length > 0) {
        console.warn(
          "❌ Products with missing required properties:",
          problematicProducts,
        );
      } else {
        console.log("✅ All products have required properties");
      }

      // Check for products with stock 0 but inStock true
      const stockInconsistencies = allProducts.filter(
        (product) => product.inStock === true && product.stock === 0,
      );

      if (stockInconsistencies.length > 0) {
        console.warn(
          "❌ Products with stock inconsistencies:",
          stockInconsistencies,
        );
      } else {
        console.log("✅ No stock inconsistencies found");
      }

      // Check for products with invalid prices
      const invalidPrices = allProducts.filter(
        (product) => product.price <= 0 || isNaN(product.price),
      );

      if (invalidPrices.length > 0) {
        console.warn("❌ Products with invalid prices:", invalidPrices);
      } else {
        console.log("✅ All products have valid prices");
      }

      console.groupEnd();

      // Category Analysis
      console.group("📊 Category Count Analysis");
      const categoryAnalysis: {
        [key: string]: { actual: number; expected: number; status: string };
      } = {};
      let totalDiscrepancies = 0;

      categories.forEach((category) => {
        const actualCount = getProductCountByCategory(category.id);
        const expectedCount = category.productCount;
        const diff = actualCount - expectedCount;
        const status =
          actualCount === expectedCount
            ? "✅ CORRECT"
            : actualCount > expectedCount
              ? `⬆️ OVER (+${diff})`
              : `⬇️ UNDER (${diff})`;

        categoryAnalysis[category.id] = {
          actual: actualCount,
          expected: expectedCount,
          status,
        };

        if (actualCount !== expectedCount) {
          totalDiscrepancies++;
        }

        console.log(
          `${status} ${category.name.padEnd(25)}: ${actualCount}/${expectedCount}`,
        );
      });

      console.log(
        `\n📊 Total categories with discrepancies: ${totalDiscrepancies}`,
      );
      console.groupEnd();

      // Aisle Analysis
      console.group("🏪 Aisle Distribution");
      const aisleData: { [key: string]: number } = {};
      for (let i = 1; i <= 15; i++) {
        const aisleProducts = getProductCountByAisle(`Pasillo ${i}`);
        aisleData[`Pasillo ${i}`] = aisleProducts;
        const category = categories.find((c) => c.aisle === i);
        const categoryName = category ? `(${category.name})` : "";
        console.log(
          `Pasillo ${i} ${categoryName.padEnd(30)}: ${aisleProducts} products`,
        );
      }

      const testProducts = getProductCountByAisle("Pasillo Test");
      if (testProducts > 0) {
        console.log(`🧪 Pasillo Test: ${testProducts} products`);
      }
      console.groupEnd();

      // Stock Analysis
      console.group("📦 Stock Analysis");
      const outOfStock = allProducts.filter((p) => !p.inStock || p.stock === 0);
      const lowStock = allProducts.filter(
        (p) => p.inStock && p.stock <= 5 && p.stock > 0,
      );
      const goodStock = allProducts.filter((p) => p.inStock && p.stock > 5);

      console.log(`✅ Good stock (>5): ${goodStock.length} products`);
      console.log(`⚠️ Low stock (1-5): ${lowStock.length} products`);
      console.log(`❌ Out of stock: ${outOfStock.length} products`);

      if (lowStock.length > 0) {
        console.log(
          "Low stock products:",
          lowStock.map((p) => `${p.name} (${p.stock})`),
        );
      }
      console.groupEnd();

      // Image Analysis
      console.group("🖼️ Image Analysis");
      const placeholderImages = allProducts.filter((p) =>
        p.image.includes("placeholder"),
      );
      const externalImages = allProducts.filter(
        (p) => !p.image.includes("placeholder"),
      );

      console.log(
        `📷 Using placeholders: ${placeholderImages.length} products`,
      );
      console.log(
        `🌐 Using external images: ${externalImages.length} products`,
      );

      if (placeholderImages.length === allProducts.length) {
        console.log(
          "✅ All products using placeholders - ready for custom images!",
        );
      }
      console.groupEnd();

      // Summary
      console.group("📋 SUMMARY");
      console.log(`📊 Total products: ${getTotalProducts()}`);
      console.log(`📊 Total categories: ${categories.length}`);
      console.log(
        `✅ Products in stock: ${allProducts.filter((p) => p.inStock).length}`,
      );
      console.log(
        `❌ Products out of stock: ${allProducts.filter((p) => !p.inStock).length}`,
      );
      console.log(`🎯 Categories needing adjustment: ${totalDiscrepancies}`);
      console.groupEnd();

      // Global Debug Functions
      console.group("🔧 Debug Functions Available");
      console.log(
        "Access these functions in console via window.debugProducts:",
      );
      console.log("• getTotalProducts() - Get total product count");
      console.log(
        "• getProductsByCategory('category-id') - Get products by category",
      );
      console.log(
        "• getProductCountByCategory('category-id') - Count products in category",
      );
      console.log(
        "• getProductCountByAisle('Pasillo X') - Count products in aisle",
      );
      console.log("• categoryAnalysis - Category count analysis object");
      console.log("• aisleData - Products per aisle data");
      console.groupEnd();

      console.groupEnd();

      // Make functions available globally for console debugging
      (window as any).debugProducts = {
        getTotalProducts,
        getProductsByCategory,
        getProductCountByCategory,
        getProductCountByAisle,
        allProducts,
        categories,
        categoryAnalysis,
        aisleData,
        stockAnalysis: {
          outOfStock,
          lowStock,
          goodStock,
        },
      };
    }
  }, []);

  return {
    totalProducts: allProducts.length,
    inStockProducts: allProducts.filter((p) => p.inStock).length,
    outOfStockProducts: allProducts.filter((p) => !p.inStock).length,
  };
};

export default useDebugProducts;
