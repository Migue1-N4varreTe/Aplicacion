import { categories, allProducts } from "./src/lib/data.js";

console.log("🔍 Testing data integrity...\n");

// Check categories and their product counts
const categoryProductCounts = {};
const categoryIds = categories.map((cat) => cat.id);

// Count actual products per category
allProducts.forEach((product) => {
  if (!categoryProductCounts[product.category]) {
    categoryProductCounts[product.category] = 0;
  }
  categoryProductCounts[product.category]++;
});

console.log("📊 Category analysis:");
categories.forEach((category) => {
  const actualCount = categoryProductCounts[category.id] || 0;
  const expectedCount = category.productCount;
  const status = actualCount === expectedCount ? "✅" : "❌";

  console.log(
    `${status} ${category.name} (${category.id}): expected ${expectedCount}, actual ${actualCount}`,
  );

  if (actualCount !== expectedCount) {
    console.log(
      `  🔧 Needs adjustment: ${actualCount - expectedCount > 0 ? "remove" : "add"} ${Math.abs(actualCount - expectedCount)} products`,
    );
  }
});

// Check for products in non-existent categories
console.log("\n🔍 Checking for invalid categories:");
const invalidProducts = allProducts.filter(
  (product) => !categoryIds.includes(product.category),
);
if (invalidProducts.length > 0) {
  console.log(
    `❌ Found ${invalidProducts.length} products with invalid categories:`,
  );
  invalidProducts.forEach((product) => {
    console.log(
      `  - ${product.name} (${product.id}): category "${product.category}"`,
    );
  });
} else {
  console.log("✅ All products have valid categories");
}

console.log(`\n📈 Total products: ${allProducts.length}`);
console.log(`📈 Total categories: ${categories.length}`);

// Summary
const totalExpected = categories.reduce(
  (sum, cat) => sum + cat.productCount,
  0,
);
const totalActual = allProducts.length;
console.log(`\n🎯 Expected total products: ${totalExpected}`);
console.log(`🎯 Actual total products: ${totalActual}`);
console.log(
  `${totalExpected === totalActual ? "✅" : "❌"} Totals match: ${totalExpected === totalActual}`,
);
