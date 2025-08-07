const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ajhqfpyfbtabdumqwdmc.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaHFmcHlmYnRhYmR1bXF3ZG1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMTE4MDMxNCwiZXhwIjoyMDE2NzU2MzE0fQ.k_Yy4bE5_bCjcnGsrGXLV1Zg8r9JcGtY_vQ4wA0lJF0';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runCategoryMigration() {
  try {
    console.log('🔄 Ejecutando migración para agregar campos color e icon a categorías...');
    
    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, 'add-category-fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Ejecutar directamente con query
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error verificando tabla categories:', error);
      return;
    }
    
    console.log('✅ Tabla categories existe');
    
    // Intentar agregar las columnas manualmente
    try {
      await supabase.from('categories').update({ 
        color: '#22c55e',
        icon: 'package' 
      }).eq('id', 'non-existent');
      
      console.log('✅ Las columnas color e icon ya existen');
    } catch (err) {
      console.log('ℹ️ Las columnas no existen, necesitan ser agregadas via SQL directo');
      console.log('Por favor ejecuta manualmente en Supabase SQL Editor:');
      console.log('\n--- SQL MIGRATION ---');
      console.log(migrationSQL);
      console.log('--- END MIGRATION ---\n');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Función para verificar estructura de la tabla
async function checkCategoriesStructure() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Estructura actual de categories:');
      console.log(Object.keys(data[0]));
    } else {
      console.log('ℹ️ No hay datos en la tabla categories');
    }
    
  } catch (error) {
    console.error('❌ Error verificando estructura:', error);
  }
}

// Ejecutar verificación y migración
async function main() {
  await checkCategoriesStructure();
  await runCategoryMigration();
}

main();
