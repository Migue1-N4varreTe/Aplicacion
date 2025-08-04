-- Add color and icon fields to categories table if they don't exist
DO $$
BEGIN
    -- Add color column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'color') THEN
        ALTER TABLE categories ADD COLUMN color VARCHAR(7) DEFAULT '#22c55e';
    END IF;
    
    -- Add icon column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'icon') THEN
        ALTER TABLE categories ADD COLUMN icon VARCHAR(50) DEFAULT 'package';
    END IF;
END $$;

-- Update existing categories with default values if they have NULL values
UPDATE categories 
SET color = '#22c55e' 
WHERE color IS NULL;

UPDATE categories 
SET icon = 'package' 
WHERE icon IS NULL;

-- Ensure the columns are not null
ALTER TABLE categories ALTER COLUMN color SET NOT NULL;
ALTER TABLE categories ALTER COLUMN icon SET NOT NULL;

COMMENT ON COLUMN categories.color IS 'Hex color code for category display (e.g., #22c55e)';
COMMENT ON COLUMN categories.icon IS 'Icon identifier for category display';
