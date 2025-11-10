-- Script SQL para agregar la columna updated_at a la tabla comentarios
-- Ejecuta este script en el SQL Editor de tu base de datos (Supabase, PostgreSQL, etc.)

-- 1. Agregar la columna updated_at si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'comentarios' 
        AND column_name = 'updated_at'
    ) THEN
        -- Agregar la columna con tipo TIMESTAMP WITH TIME ZONE
        -- Esto es consistente con created_at y permite manejar zonas horarias correctamente
        ALTER TABLE comentarios 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        
        -- Actualizar todos los registros existentes para que updated_at = created_at
        UPDATE comentarios 
        SET updated_at = created_at 
        WHERE updated_at IS NULL;
        
        RAISE NOTICE 'Columna updated_at agregada exitosamente a la tabla comentarios';
    ELSE
        RAISE NOTICE 'La columna updated_at ya existe en la tabla comentarios';
    END IF;
END $$;

-- 2. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_comentarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Crear trigger que se ejecute antes de cada UPDATE
-- Este trigger actualizará automáticamente updated_at cada vez que se modifique un registro
DROP TRIGGER IF EXISTS trigger_update_comentarios_updated_at ON comentarios;

CREATE TRIGGER trigger_update_comentarios_updated_at
    BEFORE UPDATE ON comentarios
    FOR EACH ROW
    EXECUTE FUNCTION update_comentarios_updated_at();

-- 4. Verificar que la columna se agregó correctamente
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable,
    is_updatable
FROM information_schema.columns
WHERE table_name = 'comentarios'
AND column_name IN ('created_at', 'updated_at')
ORDER BY column_name;

-- 5. Verificar que el trigger se creó correctamente
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'comentarios'
AND trigger_name = 'trigger_update_comentarios_updated_at';
