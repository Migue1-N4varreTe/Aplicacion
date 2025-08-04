-- Agregar soporte de peso a la tabla order_items
-- Para ejecutar en Supabase SQL Editor

-- 1. Agregar columnas de peso si no existen
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS weight DECIMAL(8,3),
ADD COLUMN IF NOT EXISTS sell_by_weight BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS weight_unit VARCHAR(10) DEFAULT 'kg';

-- 2. Agregar comentarios para documentar las columnas
COMMENT ON COLUMN public.order_items.weight IS 'Peso real del producto vendido (en kg o g según weight_unit)';
COMMENT ON COLUMN public.order_items.sell_by_weight IS 'Indica si este item fue vendido por peso';
COMMENT ON COLUMN public.order_items.weight_unit IS 'Unidad del peso: kg, g, etc.';

-- 3. Agregar índice para consultas por peso
CREATE INDEX IF NOT EXISTS idx_order_items_weight ON public.order_items(weight) WHERE weight IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_order_items_sell_by_weight ON public.order_items(sell_by_weight) WHERE sell_by_weight = true;

-- 4. Actualizar tabla inventory_movements para soportar peso
ALTER TABLE public.inventory_movements 
ADD COLUMN IF NOT EXISTS weight_moved DECIMAL(8,3),
ADD COLUMN IF NOT EXISTS movement_unit VARCHAR(10) DEFAULT 'unit';

COMMENT ON COLUMN public.inventory_movements.weight_moved IS 'Peso movido en el inventario (para productos por peso)';
COMMENT ON COLUMN public.inventory_movements.movement_unit IS 'Unidad del movimiento: kg, g, unit, etc.';

-- 5. Agregar campos de peso a products si no existen
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sell_by_weight BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS weight_per_unit DECIMAL(8,3);

COMMENT ON COLUMN public.products.sell_by_weight IS 'Indica si el producto se vende por peso';
COMMENT ON COLUMN public.products.weight_per_unit IS 'Peso unitario del producto (para cálculos)';

-- 6. Crear vista para reportes de ventas por peso
CREATE OR REPLACE VIEW weight_sales_summary AS
SELECT 
    o.id as order_id,
    o.order_number,
    o.created_at,
    o.total_amount,
    SUM(CASE WHEN oi.sell_by_weight THEN oi.weight ELSE 0 END) as total_weight,
    COUNT(CASE WHEN oi.sell_by_weight THEN 1 END) as weight_items_count,
    SUM(CASE WHEN oi.sell_by_weight THEN oi.line_total ELSE 0 END) as weight_items_revenue,
    json_agg(
        CASE 
            WHEN oi.sell_by_weight THEN 
                json_build_object(
                    'product_name', p.name,
                    'weight', oi.weight,
                    'weight_unit', oi.weight_unit,
                    'unit_price', oi.unit_price,
                    'total_price', oi.line_total
                )
            ELSE NULL 
        END
    ) FILTER (WHERE oi.sell_by_weight) as weight_items
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
LEFT JOIN public.products p ON oi.product_id = p.id
GROUP BY o.id, o.order_number, o.created_at, o.total_amount
HAVING COUNT(CASE WHEN oi.sell_by_weight THEN 1 END) > 0;

-- 7. Crear función para calcular precio por peso
CREATE OR REPLACE FUNCTION calculate_weight_price(
    base_price DECIMAL,
    weight DECIMAL,
    price_unit VARCHAR,
    weight_unit VARCHAR
) RETURNS DECIMAL AS $$
DECLARE
    calculated_price DECIMAL;
BEGIN
    -- Calcular precio basado en peso y unidades
    IF price_unit = 'kg' AND weight_unit = 'kg' THEN
        calculated_price := base_price * weight;
    ELSIF price_unit = 'g' AND weight_unit = 'kg' THEN
        calculated_price := base_price * (weight * 1000);
    ELSIF price_unit = 'kg' AND weight_unit = 'g' THEN
        calculated_price := base_price * (weight / 1000);
    ELSIF price_unit = 'g' AND weight_unit = 'g' THEN
        calculated_price := base_price * weight;
    ELSE
        calculated_price := base_price * weight;
    END IF;
    
    RETURN ROUND(calculated_price, 2);
END;
$$ LANGUAGE plpgsql;

-- 8. Crear trigger para validar datos de peso
CREATE OR REPLACE FUNCTION validate_weight_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar que productos por peso tengan peso
    IF NEW.sell_by_weight = true AND (NEW.weight IS NULL OR NEW.weight <= 0) THEN
        RAISE EXCEPTION 'Productos vendidos por peso deben tener un peso válido';
    END IF;
    
    -- Validar que productos normales no tengan peso
    IF NEW.sell_by_weight = false AND NEW.weight IS NOT NULL THEN
        NEW.weight := NULL;
        NEW.weight_unit := NULL;
    END IF;
    
    -- Establecer unidad por defecto
    IF NEW.sell_by_weight = true AND NEW.weight_unit IS NULL THEN
        NEW.weight_unit := 'kg';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a order_items
DROP TRIGGER IF EXISTS validate_weight_data_trigger ON public.order_items;
CREATE TRIGGER validate_weight_data_trigger
    BEFORE INSERT OR UPDATE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION validate_weight_data();

-- 9. Actualizar productos existentes con datos de ejemplo
UPDATE public.products 
SET sell_by_weight = true 
WHERE unit IN ('kg', 'g') 
AND name ILIKE ANY(ARRAY['%manzana%', '%plátano%', '%carne%', '%queso%', '%fruta%', '%verdura%']);

-- 10. Crear índices adicionales para rendimiento
CREATE INDEX IF NOT EXISTS idx_products_sell_by_weight ON public.products(sell_by_weight);
CREATE INDEX IF NOT EXISTS idx_orders_created_at_btree ON public.orders(created_at);

-- Mensaje de confirmación
SELECT 'Soporte de ventas por peso agregado exitosamente' as message;
