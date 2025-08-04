import { supabase } from '@/lib/supabase';
import { categories as localCategories } from '@/lib/data';

export interface CategoryFromDB {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_count?: number;
  total_stock?: number;
  total_value?: number;
  avg_price?: number;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  image_url?: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  is_active?: boolean;
}

class CategoriesService {
  // Obtener todas las categorías desde Supabase
  async getCategories(includeStats = false): Promise<CategoryFromDB[]> {
    try {
      let query = supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (includeStats) {
        query = supabase
          .from('categories')
          .select(`
            *,
            products(id, name, price, current_stock, is_active)
          `)
          .eq('is_active', true)
          .order('name');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Error al obtener categorías');
      }

      // Si incluye estadísticas, calcular los valores
      if (includeStats && data) {
        return data.map((category: any) => {
          const activeProducts = category.products?.filter((p: any) => p.is_active) || [];
          const totalValue = activeProducts.reduce(
            (sum: number, p: any) => sum + (p.price || 0) * (p.current_stock || 0),
            0
          );

          return {
            ...category,
            product_count: activeProducts.length,
            total_stock: activeProducts.reduce(
              (sum: number, p: any) => sum + (p.current_stock || 0),
              0
            ),
            total_value: totalValue,
            avg_price: activeProducts.length > 0
              ? activeProducts.reduce((sum: number, p: any) => sum + (p.price || 0), 0) / activeProducts.length
              : 0,
          };
        });
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
  }

  // Obtener categoría por ID
  async getCategoryById(id: string): Promise<CategoryFromDB | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          products(
            id,
            name,
            description,
            price,
            current_stock,
            is_active,
            created_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Categoría no encontrada
        }
        throw error;
      }

      // Calcular estadísticas
      const activeProducts = data.products?.filter((p: any) => p.is_active) || [];
      const stats = {
        product_count: activeProducts.length,
        total_stock: activeProducts.reduce(
          (sum: number, p: any) => sum + (p.current_stock || 0),
          0
        ),
        avg_price: activeProducts.length > 0
          ? activeProducts.reduce((sum: number, p: any) => sum + (p.price || 0), 0) / activeProducts.length
          : 0,
        total_value: activeProducts.reduce(
          (sum: number, p: any) => sum + (p.price || 0) * (p.current_stock || 0),
          0
        ),
      };

      return {
        ...data,
        ...stats,
      };
    } catch (error) {
      console.error('Error in getCategoryById:', error);
      throw new Error('Error al obtener categoría');
    }
  }

  // Crear nueva categoría
  async createCategory(categoryData: CreateCategoryData): Promise<CategoryFromDB> {
    try {
      // Verificar que el nombre no existe
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryData.name)
        .single();

      if (existingCategory) {
        throw new Error('Ya existe una categoría con ese nombre');
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          description: categoryData.description || null,
          image_url: categoryData.image_url || null,
          color: categoryData.color || '#22c55e',
          icon: categoryData.icon || 'package',
          is_active: true,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating category:', error);
        throw new Error('Error al crear categoría');
      }

      return data;
    } catch (error) {
      console.error('Error in createCategory:', error);
      throw error;
    }
  }

  // Actualizar categoría
  async updateCategory(id: string, categoryData: UpdateCategoryData): Promise<CategoryFromDB> {
    try {
      // Verificar que la categoría existe
      const existingCategory = await this.getCategoryById(id);
      if (!existingCategory) {
        throw new Error('Categoría no encontrada');
      }

      // Verificar nombre único si se está actualizando
      if (categoryData.name && categoryData.name !== existingCategory.name) {
        const { data: duplicateName } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryData.name)
          .neq('id', id)
          .single();

        if (duplicateName) {
          throw new Error('Ya existe una categoría con ese nombre');
        }
      }

      const { data, error } = await supabase
        .from('categories')
        .update({
          ...categoryData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating category:', error);
        throw new Error('Error al actualizar categoría');
      }

      return data;
    } catch (error) {
      console.error('Error in updateCategory:', error);
      throw error;
    }
  }

  // Eliminar categoría (soft delete)
  async deleteCategory(id: string): Promise<CategoryFromDB> {
    try {
      const category = await this.getCategoryById(id);
      if (!category) {
        throw new Error('Categoría no encontrada');
      }

      // Verificar si tiene productos asociados
      if (category.product_count && category.product_count > 0) {
        throw new Error('No se puede eliminar la categoría porque tiene productos asociados');
      }

      const { data, error } = await supabase
        .from('categories')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Error deleting category:', error);
        throw new Error('Error al eliminar categoría');
      }

      return data;
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      throw error;
    }
  }

  // Migrar categorías locales a Supabase
  async migrateLocalCategories(): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;

    console.log('Iniciando migración de categorías locales a Supabase...');

    for (const localCategory of localCategories) {
      try {
        // Verificar si ya existe
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('name', localCategory.name)
          .single();

        if (existingCategory) {
          console.log(`Categoría "${localCategory.name}" ya existe, omitiendo...`);
          continue;
        }

        // Mapear datos locales al formato de Supabase
        const categoryData: CreateCategoryData = {
          name: localCategory.name,
          description: localCategory.description,
          image_url: localCategory.image,
          color: this.mapColorToHex(localCategory.color),
          icon: localCategory.icon,
        };

        await this.createCategory(categoryData);
        success++;
        console.log(`✓ Categoría "${localCategory.name}" migrada exitosamente`);
      } catch (error) {
        const errorMsg = `Error al migrar "${localCategory.name}": ${error instanceof Error ? error.message : 'Error desconocido'}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log(`Migración completada: ${success} exitosas, ${errors.length} errores`);
    return { success, errors };
  }

  // Mapear colores de TailwindCSS a hex
  private mapColorToHex(tailwindColor: string): string {
    const colorMap: Record<string, string> = {
      'bg-fresh-500': '#22c55e',
      'bg-yellow-400': '#facc15',
      'bg-red-500': '#ef4444',
      'bg-orange-400': '#fb923c',
      'bg-mint-400': '#4ade80',
      'bg-violet-400': '#a78bfa',
      'bg-sky-600': '#0284c7',
      'bg-mint-600': '#059669',
      'bg-sky-500': '#0ea5e9',
      'bg-violet-500': '#8b5cf6',
      'bg-mint-500': '#10b981',
      'bg-sky-400': '#38bdf8',
      'bg-violet-600': '#7c3aed',
      'bg-neutral-600': '#525252',
    };

    return colorMap[tailwindColor] || '#22c55e';
  }

  // Obtener estadísticas generales de categorías
  async getCategoriesStats(): Promise<{
    total_categories: number;
    active_categories: number;
    total_products: number;
    total_value: number;
  }> {
    try {
      const { data: categoriesData, error } = await supabase
        .from('categories')
        .select(`
          id,
          is_active,
          products(id, price, current_stock, is_active)
        `);

      if (error) {
        throw new Error('Error al obtener estadísticas');
      }

      const activeCategories = categoriesData?.filter(c => c.is_active) || [];
      const allProducts = categoriesData?.flatMap(c => c.products?.filter((p: any) => p.is_active) || []) || [];
      const totalValue = allProducts.reduce(
        (sum: number, p: any) => sum + (p.price || 0) * (p.current_stock || 0),
        0
      );

      return {
        total_categories: categoriesData?.length || 0,
        active_categories: activeCategories.length,
        total_products: allProducts.length,
        total_value: totalValue,
      };
    } catch (error) {
      console.error('Error in getCategoriesStats:', error);
      throw error;
    }
  }
}

export const categoriesService = new CategoriesService();
export default categoriesService;
