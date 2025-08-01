#!/bin/bash

# Archivo a modificar
FILE="src/lib/data.ts"

# Reemplazar todos los placeholders restantes con una imagen genérica apropiada
sed -i 's|https://via\.placeholder\.com/400x300/f3f4f6/9ca3af?text=Imagen+del+Producto|https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format\&fit=crop\&w=400\&q=80|g' "$FILE"

echo "✅ Placeholders reemplazados exitosamente"
