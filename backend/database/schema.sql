-- Script SQL para crear la tabla de ejemplo en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- Crear tabla de ejemplos
CREATE TABLE IF NOT EXISTS examples (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_examples_updated_at 
  BEFORE UPDATE ON examples
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunos datos de ejemplo (opcional)
INSERT INTO examples (name, description) VALUES
  ('Ejemplo 1', 'Descripción del ejemplo 1'),
  ('Ejemplo 2', 'Descripción del ejemplo 2')
ON CONFLICT DO NOTHING;

