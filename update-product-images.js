const fs = require('fs');
const path = require('path');

// Mapping de productos específicos a imágenes de Unsplash
const productImageMap = {
  // Frutas frescas
  'melon-kg': 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=400&q=80',
  'peras-kg': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=400&q=80',
  'durazno-kg': 'https://images.unsplash.com/photo-1629828874514-d59ee3580d3f?auto=format&fit=crop&w=400&q=80',
  'kiwi-kg': 'https://images.unsplash.com/photo-1585059895524-72359e06133a?auto=format&fit=crop&w=400&q=80',
  'toronja-kg': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
  'mandarina-kg': 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=400&q=80',
  'coco-pieza': 'https://images.unsplash.com/photo-1459181215473-0a9dd180d6d5?auto=format&fit=crop&w=400&q=80',
  'granada-kg': 'https://images.unsplash.com/photo-1580905367936-e6ea9afdd1b4?auto=format&fit=crop&w=400&q=80',
  'ciruela-kg': 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=400&q=80',
  
  // Verduras
  'papa-kg': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80',
  'calabaza-kg': 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=400&q=80',
  'chayote-kg': 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=400&q=80',
  'nopales-kg': 'https://images.unsplash.com/photo-1551807264-888ad5b66a55?auto=format&fit=crop&w=400&q=80',
  'brocoli-kg': 'https://images.unsplash.com/photo-1459663313100-6676fc14954a?auto=format&fit=crop&w=400&q=80',
  'coliflor-kg': 'https://images.unsplash.com/photo-1568584911219-7d7b7ebf7ba3?auto=format&fit=crop&w=400&q=80',
  'elote-pieza': 'https://images.unsplash.com/photo-1602491915926-b9f8b92b7de9?auto=format&fit=crop&w=400&q=80',
  'chile-poblano-kg': 'https://images.unsplash.com/photo-1583049290885-6be5e7b5e67a?auto=format&fit=crop&w=400&q=80',
  'chile-jalapeño-kg': 'https://images.unsplash.com/photo-1583049290885-6be5e7b5e67a?auto=format&fit=crop&w=400&q=80',
  
  // Hierbas aromáticas
  'cilantro-manojo': 'https://images.unsplash.com/photo-1616084489617-3d36dda78b8d?auto=format&fit=crop&w=400&q=80',
  'perejil-manojo': 'https://images.unsplash.com/photo-1616684072764-4eec1fb3a8e5?auto=format&fit=crop&w=400&q=80',
  'albahaca-manojo': 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=400&q=80',
  'hierbabuena-manojo': 'https://images.unsplash.com/photo-1616084489617-3d36dda78b8d?auto=format&fit=crop&w=400&q=80',
  
  // Productos orgánicos
  'lechuga-organica': 'https://images.unsplash.com/photo-1556801712-102246837aa7?auto=format&fit=crop&w=400&q=80',
  'tomate-organico': 'https://images.unsplash.com/photo-1592841200221-21e1c7d95b6b?auto=format&fit=crop&w=400&q=80',
  'zanahoria-organica': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=400&q=80',
  
  // Jugos
  'jugo-naranja': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=400&q=80',
  'jugo-verde': 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=400&q=80',
  'jugo-zanahoria': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=400&q=80',
  
  // Pan dulce
  'pan-dulce': 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=400&q=80',
  'concha-chocolate': 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=400&q=80',
  'concha-vainilla': 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=400&q=80',
  'cuerno': 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=400&q=80',
  'dona-azucar': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=400&q=80',
  'dona-chocolate': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=400&q=80',
};

// Imágenes genéricas por categoría
const categoryImages = {
  'frutas': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
  'verduras': 'https://images.unsplash.com/photo-1556801712-102246837aa7?auto=format&fit=crop&w=400&q=80',
  'hierbas': 'https://images.unsplash.com/photo-1616084489617-3d36dda78b8d?auto=format&fit=crop&w=400&q=80',
  'organicos': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
  'jugos': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=400&q=80',
  'pan': 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=400&q=80'
};

function updateProductImages() {
  const filePath = path.join(__dirname, 'src', 'lib', 'data.ts');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Reemplazar placeholders con imágenes específicas
  Object.entries(productImageMap).forEach(([productId, imageUrl]) => {
    // Buscar el producto por ID y reemplazar su imagen placeholder
    const productRegex = new RegExp(
      `(\\s+id: ["']${productId}["'][\\s\\S]*?image:\\s*)["']https://via\\.placeholder\\.com/400x300/f3f4f6/9ca3af\\?text=Imagen\\+del\\+Producto["']`,
      'g'
    );
    content = content.replace(productRegex, `$1"${imageUrl}"`);
  });
  
  // Reemplazar placeholders restantes con imágenes genéricas según contexto
  const placeholderRegex = /"https:\/\/via\.placeholder\.com\/400x300\/f3f4f6\/9ca3af\?text=Imagen\+del\+Producto"/g;
  
  // Para placeholders restantes, usar imagen genérica de productos
  const defaultImage = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80';
  content = content.replace(placeholderRegex, `"${defaultImage}"`);
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Imágenes de productos actualizadas exitosamente');
}

updateProductImages();
