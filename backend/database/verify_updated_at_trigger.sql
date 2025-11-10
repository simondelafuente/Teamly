-- Script SQL para verificar que el trigger de updated_at está funcionando
-- Ejecuta este script en el SQL Editor de tu base de datos

-- 1. Verificar que la columna updated_at existe
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'comentarios'
AND column_name = 'updated_at';

-- 2. Verificar que el trigger existe y está activo
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'comentarios'
AND trigger_name = 'trigger_update_comentarios_updated_at';

-- 3. Verificar la función del trigger
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'update_comentarios_updated_at';

-- 4. Probar manualmente el trigger (reemplaza 1 con un ID de comentario real)
-- Primero, ver el estado actual
SELECT id_comentario, contenido, created_at, updated_at 
FROM comentarios 
WHERE id_comentario = 1;

-- Luego, actualizar y ver si updated_at cambió
UPDATE comentarios 
SET contenido = 'Test de actualización - ' || CURRENT_TIMESTAMP
WHERE id_comentario = 1
RETURNING id_comentario, contenido, created_at, updated_at;

-- Verificar nuevamente
SELECT id_comentario, contenido, created_at, updated_at 
FROM comentarios 
WHERE id_comentario = 1;

