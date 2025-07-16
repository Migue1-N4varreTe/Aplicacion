// Script para analizar productos duplicados y contar por categoría
const fs = require("fs");

// Leer el archivo de datos
const content = fs.readFileSync("./data.ts", "utf8");

// Extraer productos usando regex
const productMatches = content.match(/{[^}]+id:\s*"[^"]+",[\s\S]*?}/g);

if (productMatches) {
  const products = [];
  const ids = [];
  const names = [];
  const images = [];
  const categoryCounts = {};

  productMatches.forEach((match, index) => {
    try {
      // Extraer ID
      const idMatch = match.match(/id:\s*"([^"]+)"/);
      if (idMatch) {
        const id = idMatch[1];
        if (ids.includes(id)) {
          console.log(`❌ ID DUPLICADO: ${id}`);
        }
        ids.push(id);
      }

      // Extraer nombre
      const nameMatch = match.match(/name:\s*"([^"]+)"/);
      if (nameMatch) {
        const name = nameMatch[1];
        if (names.includes(name)) {
          console.log(`❌ NOMBRE DUPLICADO: ${name}`);
        }
        names.push(name);
      }

      // Extraer imagen
      const imageMatch = match.match(/image:\s*"([^"]+)"/);
      if (imageMatch) {
        const image = imageMatch[1];
        images.push(image);
      }

      // Extraer categoría
      const categoryMatch = match.match(/category:\s*"([^"]+)"/);
      if (categoryMatch) {
        const category = categoryMatch[1];
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    } catch (e) {
      console.log(`Error procesando producto ${index + 1}: ${e.message}`);
    }
  });

  console.log(`\n📊 TOTAL DE PRODUCTOS: ${products.length}`);
  console.log(`📊 IDs únicos: ${new Set(ids).size}`);
  console.log(`📊 Nombres únicos: ${new Set(names).size}`);
  console.log(`📊 Imágenes únicas: ${new Set(images).size}`);

  // Verificar imágenes duplicadas
  const imageCounts = {};
  images.forEach((img) => {
    imageCounts[img] = (imageCounts[img] || 0) + 1;
  });

  console.log("\n🖼️ IMÁGENES DUPLICADAS:");
  Object.entries(imageCounts).forEach(([img, count]) => {
    if (count > 1) {
      console.log(`❌ "${img}" usada ${count} veces`);
    }
  });

  console.log("\n📊 CONTEOS POR CATEGORÍA:");
  const expectedCounts = {
    "frutas-verduras": 75,
    "panaderia-bimbo": 45,
    "carniceria-charcuteria": 38,
    "lacteos-huevos": 42,
    congelados: 35,
    "abarrotes-basicos": 48,
    "enlatados-conservas": 40,
    "aceites-condimentos": 32,
  };

  Object.entries(categoryCounts).forEach(([category, count]) => {
    const expected = expectedCounts[category];
    const status = expected ? (count === expected ? "✅" : "❌") : "⚠️";
    console.log(
      `${status} ${category}: ${count} productos${expected ? ` (esperado: ${expected})` : ""}`,
    );
  });
} else {
  console.log("No se encontraron productos en el archivo");
}
