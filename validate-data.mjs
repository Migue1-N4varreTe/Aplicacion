import fs from "fs";

// Read the data file
const dataFileContent = fs.readFileSync("./src/lib/data.ts", "utf8");

// Extract categories from the file (simple regex extraction)
const categoriesMatch = dataFileContent.match(
  /export const categories[^=]*=\s*\[([^;]*)\];/s,
);
const allProductsMatch = dataFileContent.match(
  /export const allProducts[^=]*=\s*\[([^;]*)\];/s,
);

if (!categoriesMatch || !allProductsMatch) {
  console.log("❌ Could not parse data file");
  process.exit(1);
}

// Extract category product counts
const categoryRegex = /productCount:\s*(\d+)/g;
const categoryCountMatches = [...categoriesMatch[1].matchAll(categoryRegex)];
const categoryIdRegex = /id:\s*"([^"]+)"/g;
const categoryIdMatches = [...categoriesMatch[1].matchAll(categoryIdRegex)];

console.log("🔍 Testing data integrity...\n");

// Create category expectations
const expectedCounts = {};
categoryIdMatches.forEach((match, index) => {
  const categoryId = match[1];
  const count = parseInt(categoryCountMatches[index][1]);
  expectedCounts[categoryId] = count;
});

// Count occurrences of each category in products
const actualCounts = {};
Object.keys(expectedCounts).forEach((catId) => {
  const regex = new RegExp(`category:\\s*"${catId}"`, "g");
  const matches = [...allProductsMatch[1].matchAll(regex)];
  actualCounts[catId] = matches.length;
});

console.log("📊 Category analysis:");
let totalExpected = 0;
let totalActual = 0;
let hasDiscrepancies = false;

Object.entries(expectedCounts).forEach(([categoryId, expected]) => {
  const actual = actualCounts[categoryId] || 0;
  const status = actual === expected ? "✅" : "❌";

  totalExpected += expected;
  totalActual += actual;

  if (actual !== expected) {
    hasDiscrepancies = true;
  }

  console.log(
    `${status} ${categoryId}: expected ${expected}, actual ${actual}`,
  );

  if (actual !== expected) {
    const difference = actual - expected;
    const action = difference > 0 ? "remove" : "add";
    console.log(
      `  🔧 Needs adjustment: ${action} ${Math.abs(difference)} products`,
    );
  }
});

console.log(`\n📈 Total expected: ${totalExpected}`);
console.log(`📈 Total actual: ${totalActual}`);
console.log(
  `${totalExpected === totalActual && !hasDiscrepancies ? "✅" : "❌"} Overall status: ${totalExpected === totalActual && !hasDiscrepancies ? "VALID" : "NEEDS FIXES"}`,
);

if (hasDiscrepancies) {
  console.log(
    "\n🔧 Action required: Update productCount values in categories or adjust product distribution",
  );
}
