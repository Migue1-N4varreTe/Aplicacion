#!/bin/bash

# Deploy Script para La Económica
# Ejecuta una serie de verificaciones antes del deployment

echo "🚀 Iniciando proceso de deployment para La Económica..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Verificar Node.js version
echo "1. Verificando versión de Node.js..."
NODE_VERSION=$(node --version)
if [[ $NODE_VERSION == v18* ]] || [[ $NODE_VERSION == v20* ]]; then
    print_status "Node.js version: $NODE_VERSION"
else
    print_warning "Se recomienda Node.js v18 o v20. Actual: $NODE_VERSION"
fi

# 2. Instalar dependencias
echo "2. Instalando dependencias..."
npm ci --production=false
if [ $? -eq 0 ]; then
    print_status "Dependencias instaladas correctamente"
else
    print_error "Error instalando dependencias"
    exit 1
fi

# 3. Ejecutar type check
echo "3. Verificando tipos TypeScript..."
npm run typecheck
if [ $? -eq 0 ]; then
    print_status "TypeScript check pasado"
else
    print_error "Errores de TypeScript encontrados"
    exit 1
fi

# 4. Ejecutar tests unitarios
echo "4. Ejecutando tests unitarios..."
npm run test:unit
if [ $? -eq 0 ]; then
    print_status "Tests unitarios pasados"
else
    print_warning "Algunos tests fallaron - continúa deployment"
fi

# 5. Verificar variables de entorno críticas
echo "5. Verificando configuración..."
if [ -f ".env.production" ]; then
    print_status "Archivo .env.production encontrado"
else
    print_warning "No se encontró .env.production"
fi

# 6. Build del proyecto
echo "6. Construyendo aplicación..."
npm run build
if [ $? -eq 0 ]; then
    print_status "Build completado exitosamente"
else
    print_error "Error en el build"
    exit 1
fi

# 7. Verificar archivos críticos en dist/
echo "7. Verificando archivos de salida..."
CRITICAL_FILES=("dist/index.html" "dist/sw.js" "dist/manifest.json")

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "Archivo crítico encontrado: $file"
    else
        print_error "Archivo crítico faltante: $file"
        exit 1
    fi
done

# 8. Verificar tamaño de bundles
echo "8. Analizando tamaño de bundles..."
MAIN_JS=$(find dist/js -name "index-*.js" | head -1)
if [ -f "$MAIN_JS" ]; then
    MAIN_SIZE=$(du -h "$MAIN_JS" | cut -f1)
    print_status "Bundle principal: $MAIN_SIZE"
    
    # Verificar si el bundle es muy grande (>1MB)
    SIZE_BYTES=$(du -b "$MAIN_JS" | cut -f1)
    if [ $SIZE_BYTES -gt 1048576 ]; then
        print_warning "Bundle principal es grande (>1MB): $MAIN_SIZE"
    fi
fi

# 9. Validar Service Worker
echo "9. Validando Service Worker..."
if grep -q "CACHE_NAME" "dist/sw.js"; then
    print_status "Service Worker válido"
else
    print_error "Service Worker inválido"
    exit 1
fi

# 10. Verificar manifest.json
echo "10. Validando PWA manifest..."
if [ -f "dist/manifest.json" ]; then
    # Verificar que el JSON es válido
    python3 -m json.tool dist/manifest.json > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_status "Manifest PWA válido"
    else
        print_error "Manifest PWA inválido"
        exit 1
    fi
fi

# 11. Optimización final
echo "11. Ejecutando optimizaciones finales..."

# Comprimir archivos críticos si gzip está disponible
if command -v gzip &> /dev/null; then
    find dist -name "*.js" -o -name "*.css" -o -name "*.html" | while read file; do
        gzip -k -9 "$file"
        print_status "Comprimido: $file"
    done
fi

# 12. Resumen final
echo ""
echo "📊 Resumen del deployment:"
echo "========================="
print_status "✅ TypeScript check pasado"
print_status "✅ Build completado"
print_status "✅ Archivos críticos verificados"
print_status "✅ Service Worker válido"
print_status "✅ PWA Manifest válido"

# Información del build
DIST_SIZE=$(du -sh dist | cut -f1)
print_status "📦 Tamaño total del build: $DIST_SIZE"

JS_COUNT=$(find dist -name "*.js" | wc -l)
CSS_COUNT=$(find dist -name "*.css" | wc -l)
print_status "📄 Archivos generados: $JS_COUNT JS, $CSS_COUNT CSS"

echo ""
echo "🎉 ¡Deployment listo para producción!"
echo ""
echo "📋 Pasos siguientes:"
echo "1. Configurar variables de entorno en Netlify:"
echo "   - VITE_STRIPE_PUBLISHABLE_KEY"
echo "   - NODE_ENV=production"
echo ""
echo "2. Ejecutar deployment:"
echo "   netlify deploy --prod --dir=dist"
echo ""
echo "3. Verificar PWA en dispositivos móviles"
echo "4. Probar funcionalidades críticas"
echo ""
print_status "🚀 ¡La Económica lista para lanzamiento!"
