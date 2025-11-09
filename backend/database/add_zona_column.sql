-- Script SQL para agregar las columnas 'zona' y 'vacantes_disponibles' a la tabla 'publicaciones'
-- Ejecuta este script en el SQL Editor de Supabase

-- Agregar columna zona si no existe
ALTER TABLE publicaciones 
ADD COLUMN IF NOT EXISTS zona VARCHAR(255);

-- Agregar columna vacantes_disponibles si no existe
ALTER TABLE publicaciones 
ADD COLUMN IF NOT EXISTS vacantes_disponibles INTEGER DEFAULT 0;

-- Comentarios sobre las columnas
COMMENT ON COLUMN publicaciones.zona IS 'Zona geográfica donde se realizará la actividad (ej: Recoleta, Palermo, etc.)';
COMMENT ON COLUMN publicaciones.vacantes_disponibles IS 'Número de vacantes disponibles para la actividad';

