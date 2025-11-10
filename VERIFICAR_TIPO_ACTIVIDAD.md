# 🔍 Verificación del Tipo de Actividad

## Pasos para Verificar

### 1. Verificar en la Base de Datos

Ejecuta este SQL para verificar que las actividades tengan el campo `tipo`:

```sql
SELECT id_actividad, nombre_actividad, tipo, imagen 
FROM actividades 
LIMIT 5;
```

**Debe mostrar algo como:**
```
id_actividad | nombre_actividad | tipo      | imagen
-------------|------------------|-----------|----------
uuid...      | Fútbol          | Deportes  | futbol.jpg
uuid...      | Básquet         | Deportes  | basquet.jpg
```

### 2. Verificar que las Publicaciones tengan el tipo

Ejecuta este SQL para verificar que las publicaciones estén obteniendo el tipo:

```sql
SELECT 
  p.id_publicacion,
  p.titulo,
  a.nombre_actividad,
  a.tipo as actividad_tipo
FROM publicaciones p
LEFT JOIN actividades a ON p.id_actividad = a.id_actividad
LIMIT 5;
```

**Debe mostrar el campo `actividad_tipo` con valores**

### 3. Probar el Backend directamente

Abre en tu navegador o usa Postman:
```
GET http://localhost:3000/api/publicaciones
```

**Verifica en la respuesta JSON que cada publicación tenga:**
```json
{
  "id_publicacion": "...",
  "titulo": "...",
  "actividad_tipo": "Deportes",  // ← Este campo debe estar presente
  "nombre_actividad": "Fútbol",
  ...
}
```

### 4. Verificar en la Consola del Frontend

1. Abre la app en desarrollo
2. Abre la consola (Metro bundler o React Native Debugger)
3. Busca estos logs:
   - `📋 Publicaciones cargadas: X`
   - `🖼️ Ejemplo de publicación con imagen:`
   - `🔑 Claves disponibles en publicación:`

**Verifica que:**
- `actividad_tipo` aparezca en el objeto de ejemplo
- `actividad_tipo` aparezca en la lista de claves disponibles

### 5. Verificar Visualmente

Si ves un badge rojo que dice "NO TIPO" en las tarjetas, significa que:
- ✅ El badge se está renderizando correctamente
- ❌ El campo `actividad_tipo` está llegando como `null` o `undefined`

Si NO ves ningún badge:
- Verifica que el estilo esté aplicado correctamente
- Verifica que la tarjeta tenga `position: 'relative'`

## Soluciones Comunes

### Problema: El campo `tipo` no existe en la tabla `actividades`
**Solución:**
```sql
-- Verificar si la columna existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'actividades' AND column_name = 'tipo';

-- Si no existe, crearla
ALTER TABLE actividades ADD COLUMN tipo VARCHAR(50);
```

### Problema: Las actividades no tienen valores en `tipo`
**Solución:**
```sql
-- Actualizar actividades con tipos
UPDATE actividades SET tipo = 'Deportes' WHERE nombre_actividad ILIKE '%fútbol%' OR nombre_actividad ILIKE '%basquet%';
UPDATE actividades SET tipo = 'Videojuegos' WHERE nombre_actividad ILIKE '%lol%' OR nombre_actividad ILIKE '%cs2%';
-- etc.
```

### Problema: El backend no está devolviendo `actividad_tipo`
**Solución:**
1. Verifica que el modelo de Publicacion tenga `a.tipo as actividad_tipo` en todas las consultas
2. Reinicia el servidor backend
3. Verifica que no haya errores en la consola del backend

### Problema: El frontend no está recibiendo el campo
**Solución:**
1. Verifica los logs en la consola del frontend
2. Verifica que `actividad_tipo` aparezca en `Object.keys(response.data[0])`
3. Si no aparece, el problema está en el backend

