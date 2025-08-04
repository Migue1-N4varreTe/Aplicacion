# 🧪 Sistema de Debugging de Productos

## Resumen Completado

✅ **Tareas completadas:**

- Escaneados todos los pasillos (1-15)
- Corregidas las categorías de productos para que coincidan con las definiciones
- Reemplazadas todas las imágenes por placeholders personalizables
- Conectadas las funciones de debugging
- Implementado análisis completo de discrepancias

## Estado Actual de Productos por Pasillo

| Pasillo | Categoría                | Productos Esperados | Estado |
| ------- | ------------------------ | ------------------- | ------ |
| 1       | Frutas y Verduras        | 75                  | ✅     |
| 2       | Panadería Bimbo          | 45                  | ✅     |
| 3       | Carnicería y Charcutería | 38                  | ✅     |
| 4       | Lácteos y Huevos         | 42                  | ✅     |
| 5       | Congelados               | 35                  | ✅     |
| 6       | Abarrotes Básicos        | 48                  | ✅     |
| 7       | Enlatados y Conservas    | 40                  | ✅     |
| 8       | Aceites y Condimentos    | 32                  | ✅     |
| 9       | Bebidas                  | 55                  | ✅     |
| 10      | Botanas y Dulces         | 44                  | ✅     |
| 11      | Desayuno y Cereales      | 36                  | ✅     |
| 12      | Cuidado Personal         | 38                  | ✅     |
| 13      | Limpieza del Hogar       | 35                  | ✅     |
| 14      | Bebidas Alcohólicas      | 42                  | ✅     |
| 15      | Productos para Bebés     | 32                  | ✅     |

## Funciones de Debugging Disponibles

### 🔧 Hook useDebugProducts()

```typescript
import { useDebugProducts } from "@/hooks/use-debug";

// En cualquier componente:
const debugInfo = useDebugProducts();
```

**Información que proporciona:**

- Validación completa de productos
- Análisis de conteos por categoría
- Distribución por pasillos
- Análisis de stock
- Análisis de imágenes
- Funciones globales disponibles

### 🎯 Componente ProductDiagnostic

```typescript
import ProductDiagnostic from "@/components/ProductDiagnostic";

// Solo se muestra en desarrollo
<ProductDiagnostic />
```

**Características:**

- Interfaz visual para debugging
- Botón flotante para activar
- Análisis detallado con gráficos
- Recomendaciones de acciones
- Estado en tiempo real

### 🌐 Funciones Globales (window.debugProducts)

En la consola del navegador:

```javascript
// Obtener total de productos
window.debugProducts.getTotalProducts();

// Productos por categoría
window.debugProducts.getProductsByCategory("frutas-verduras");

// Contar productos por categoría
window.debugProducts.getProductCountByCategory("panaderia-bimbo");

// Productos por pasillo
window.debugProducts.getProductCountByAisle("Pasillo 1");

// Análisis completo
window.debugProducts.categoryAnalysis;
window.debugProducts.aisleData;
window.debugProducts.stockAnalysis;
```

## Estructura de Archivos de Productos

### 📁 Archivos principales:

- `src/lib/data.ts` - Productos base y categorías
- `src/lib/data-extended.ts` - Productos adicionales para completar categorías
- `src/lib/bimbo-products.ts` - Productos específicos de Bimbo
- `src/lib/test-products.ts` - Productos de prueba para testing

### 🖼️ Imágenes

Todas las imágenes han sido reemplazadas por placeholders:

```
https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Imagen+del+Producto
```

Para productos de test:

```
https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=TEST+DISPONIBLE
https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=TEST+STOCK+BAJO
https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=TEST+AGOTADO
```

## Cómo Usar el Sistema

### 🚀 En Desarrollo

1. El hook `useDebugProducts()` se ejecuta automáticamente
2. Abre la consola del navegador para ver el análisis completo
3. Haz clic en el botón "Validación completa" para abrir el panel visual
4. Usa las funciones globales para inspección manual

### 🎯 Para Añadir Productos

1. Identifica la categoría en el panel de diagnóstico
2. Añade productos en el archivo correspondiente:
   - Productos base: `data.ts`
   - Productos adicionales: `data-extended.ts`
   - Productos Bimbo: `bimbo-products.ts`
3. Usa placeholders para imágenes
4. Ejecuta el debugging para verificar

### 🔄 Para Reemplazar Imágenes

```typescript
// Cambiar de:
image: "https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Imagen+del+Producto";

// A tu imagen:
image: "/images/productos/mi-producto.jpg";
```

## Validaciones Automáticas

El sistema verifica automáticamente:

- ✅ Propiedades requeridas en todos los productos
- ✅ Consistencia de stock (inStock vs stock)
- ✅ Precios válidos
- ✅ URLs de imágenes funcionales
- ✅ Conteos de productos por categoría
- ✅ Distribución por pasillos

## Próximos Pasos

1. **Reemplazar placeholders** con imágenes reales
2. **Ajustar stock** según inventario real
3. **Añadir productos específicos** según necesidades
4. **Configurar categorías personalizadas** si es necesario
5. **Remover productos de test** en producción

---

💡 **Tip:** El componente ProductDiagnostic solo aparece en modo desarrollo y proporciona una interfaz visual completa para monitorear el estado de todos los productos y categorías.
