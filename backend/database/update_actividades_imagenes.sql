-- Script SQL para actualizar las actividades con nombres de imágenes
-- Ejecuta este script en el SQL Editor de tu base de datos (Supabase, PostgreSQL, etc.)
-- 
-- IMPORTANTE: 
-- - Coloca las imágenes en: backend/uploads/actividades/
-- - Usa SOLO el nombre del archivo (ej: 'futbol.jpg'), NO la ruta completa
-- - Los nombres deben estar en minúsculas, sin espacios, sin acentos

-- Ejemplo 1: Actualizar actividad por nombre exacto
UPDATE actividades 
SET imagen = 'futbol.jpg' 
WHERE nombre_actividad = 'Fútbol';

-- Ejemplo 2: Actualizar múltiples actividades (búsqueda flexible)
UPDATE actividades 
SET imagen = 'futbol.jpg' 
WHERE nombre_actividad ILIKE '%fútbol%' OR nombre_actividad ILIKE '%futbol%';

UPDATE actividades 
SET imagen = 'basquet.jpg' 
WHERE nombre_actividad ILIKE '%basquet%' OR nombre_actividad ILIKE '%básquet%';

UPDATE actividades 
SET imagen = 'tenis.jpg' 
WHERE nombre_actividad ILIKE '%tenis%';

UPDATE actividades 
SET imagen = 'natacion.jpg' 
WHERE nombre_actividad ILIKE '%natación%' OR nombre_actividad ILIKE '%natacion%';

UPDATE actividades 
SET imagen = 'running.jpg' 
WHERE nombre_actividad ILIKE '%running%' OR nombre_actividad ILIKE '%correr%';

UPDATE actividades 
SET imagen = 'voley.jpg' 
WHERE nombre_actividad ILIKE '%voley%' OR nombre_actividad ILIKE '%voleibol%';

UPDATE actividades 
SET imagen = 'padel.jpg' 
WHERE nombre_actividad ILIKE '%padel%' OR nombre_actividad ILIKE '%pádel%';

UPDATE actividades 
SET imagen = 'ciclismo.jpg' 
WHERE nombre_actividad ILIKE '%ciclismo%';

UPDATE actividades 
SET imagen = 'yoga.jpg' 
WHERE nombre_actividad ILIKE '%yoga%';

UPDATE actividades 
SET imagen = 'gym.jpg' 
WHERE nombre_actividad ILIKE '%gym%' OR nombre_actividad ILIKE '%gimnasio%';

-- Ver todas las actividades y sus imágenes actuales
SELECT id_actividad, nombre_actividad, imagen 
FROM actividades 
ORDER BY nombre_actividad;

-- Ver actividades sin imagen asignada
SELECT id_actividad, nombre_actividad 
FROM actividades 
WHERE imagen IS NULL OR imagen = ''
ORDER BY nombre_actividad;

