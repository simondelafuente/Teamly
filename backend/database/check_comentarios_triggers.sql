-- Script SQL para verificar triggers y constraints en la tabla comentarios
-- Ejecuta este script en el SQL Editor de tu base de datos

-- 1. Verificar si hay triggers en la tabla comentarios
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'comentarios';

-- Si no aparece nada arriba, también verificar en pg_trigger (PostgreSQL específico)
SELECT 
    tgname as trigger_name,
    tgtype::text as trigger_type,
    tgenabled as is_enabled
FROM pg_trigger
WHERE tgrelid = 'comentarios'::regclass;

-- 2. Verificar la estructura de la columna created_at
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable,
    is_updatable
FROM information_schema.columns
WHERE table_name = 'comentarios'
AND column_name = 'created_at';

-- 3. Verificar constraints en la tabla comentarios
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints
WHERE table_name = 'comentarios';

-- 4. Si hay un trigger que impide actualizar created_at, eliminarlo
-- (Descomenta las siguientes líneas si necesitas eliminar un trigger)
-- DROP TRIGGER IF EXISTS nombre_del_trigger ON comentarios;

-- 5. Verificar que created_at se puede actualizar manualmente
-- (Descomenta para probar)
-- UPDATE comentarios 
-- SET created_at = CURRENT_TIMESTAMP 
-- WHERE id_comentario = 1 
-- RETURNING id_comentario, created_at;

