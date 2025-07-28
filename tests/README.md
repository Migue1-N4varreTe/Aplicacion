# Testing Guide

Este proyecto utiliza dos tipos de tests:

## Tests Unitarios (Vitest)

Los tests unitarios prueban funciones y componentes individuales.

### Ejecutar tests unitarios:
```bash
# Ejecutar todos los tests unitarios una vez
npm test
# o
npm run test:unit

# Ejecutar tests en modo watch (re-ejecuta cuando cambian archivos)
npm run test:unit:watch
```

### Estructura:
- Los tests unitarios están en archivos `*.spec.ts` o `*.test.ts`
- Configuración en `vitest.config.ts`
- Setup en `src/test-setup.ts`

## Tests End-to-End (Playwright)

Los tests e2e prueban la aplicación completa en un navegador real.

### Pre-requisitos:
```bash
# Instalar navegadores de Playwright (solo la primera vez)
npm run test:e2e:install
```

### Ejecutar tests e2e:
```bash
# Ejecutar todos los tests e2e
npm run test:e2e

# Ejecutar con interfaz gráfica
npm run test:e2e:ui

# Ejecutar en modo debug
npm run test:e2e:debug

# Ver reporte de resultados
npm run test:e2e:report
```

### Estructura:
- Tests e2e están en `tests/e2e/`
- Configuración en `playwright.config.ts`
- Los tests e2e requieren que el servidor esté corriendo (`npm run dev`)

## Notas Importantes

1. **Separación**: Los tests unitarios y e2e están completamente separados
2. **CI/CD**: Los tests unitarios se ejecutan rápidamente, los e2e requieren más tiempo
3. **Desarrollo**: Ejecuta `npm test` para tests unitarios rápidos durante desarrollo
4. **Pre-deployment**: Ejecuta ambos tipos de tests antes de hacer deploy

## Troubleshooting

### "Playwright browsers not installed"
```bash
npm run test:e2e:install
```

### "Port already in use" para tests e2e
Asegúrate de que el servidor de desarrollo esté corriendo:
```bash
npm run dev
```

### Tests unitarios fallan
Verifica que las dependencias estén instaladas:
```bash
npm install
```
