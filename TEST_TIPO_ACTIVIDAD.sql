-- Script para verificar el tipo de actividad en publicaciones
-- Ejecuta este script en tu base de datos

-- 1. Verificar que las actividades tengan el campo tipo
SELECT 
  id_actividad,
  nombre_actividad,
  tipo,
  imagen
FROM actividades
LIMIT 10;

-- 2. Verificar el JOIN entre publicaciones y actividades
SELECT 
  p.id_publicacion,
  p.titulo,
  p.id_actividad,
  a.id_actividad as actividad_id,
  a.nombre_actividad,
  a.tipo,
  a.tipo as actividad_tipo  -- Este es el alias que usa el backend
FROM publicaciones p
LEFT JOIN actividades a ON p.id_actividad = a.id_actividad
LIMIT 10;

-- 3. Verificar si hay publicaciones sin actividad asociada
SELECT 
  COUNT(*) as publicaciones_sin_actividad
FROM publicaciones p
LEFT JOIN actividades a ON p.id_actividad = a.id_actividad
WHERE a.id_actividad IS NULL;

-- 4. Verificar si hay actividades con tipo NULL
SELECT 
  COUNT(*) as actividades_sin_tipo
FROM actividades
WHERE tipo IS NULL OR tipo = '';

-- 5. Ver todas las actividades y sus tipos
SELECT 
  nombre_actividad,
  tipo,
  CASE 
    WHEN tipo IS NULL THEN 'NULL'
    WHEN tipo = '' THEN 'VACÍO'
    ELSE tipo
  END as estado_tipo
FROM actividades
ORDER BY nombre_actividad;

