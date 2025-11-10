# 📸 Especificaciones de Imágenes para Actividades

## 📐 Tamaños Recomendados

### Para la Lista de Publicaciones (Avatar pequeño)
- **Tamaño**: 150x150 píxeles
- **Formato**: JPG o PNG
- **Peso máximo**: 50 KB
- **Uso**: Se muestra como avatar pequeño en la lista de publicaciones

### Para el Detalle de Publicación (Imagen grande)
- **Tamaño**: 800x600 píxeles (o 4:3 ratio)
- **Formato**: JPG (recomendado) o PNG
- **Peso máximo**: 200 KB
- **Uso**: Se muestra como imagen principal en el detalle de la publicación

### Recomendación General
- **Tamaño ideal**: 800x600 píxeles (funciona bien para ambos casos)
- **Formato**: JPG (mejor compresión)
- **Peso**: Entre 100-200 KB
- **Ratio**: 4:3 o 16:9 (evitar imágenes muy verticales)

## 📁 Ubicación de las Imágenes

### Estructura de Carpetas
```
backend/
  └── uploads/
      └── actividades/
          ├── futbol.jpg
          ├── basquet.jpg
          ├── tenis.jpg
          ├── natacion.jpg
          └── ... (más imágenes)
```

### Ruta Completa
Las imágenes deben estar en: **`backend/uploads/actividades/`**

## 📝 Nombres de Archivos

### Convención de Nombres
- **Formato**: `nombre-actividad.jpg` (todo en minúsculas, sin espacios, sin acentos)
- **Extensión**: `.jpg` o `.png`
- **Ejemplos**:
  - `futbol.jpg`
  - `basquet.jpg`
  - `tenis.jpg`
  - `natacion.jpg`
  - `running.jpg`
  - `voley.jpg`
  - `padel.jpg`
  - `ciclismo.jpg`

### ⚠️ Importante
- **NO usar espacios**: `futbol sala.jpg` ❌ → `futbol-sala.jpg` ✅
- **NO usar acentos**: `fútbol.jpg` ❌ → `futbol.jpg` ✅
- **Usar minúsculas**: `Futbol.jpg` ❌ → `futbol.jpg` ✅
- **Usar guiones para separar palabras**: `futbol sala.jpg` ❌ → `futbol-sala.jpg` ✅

## 💾 Valores en la Base de Datos

En la tabla `actividades`, el campo `imagen` debe contener **solo el nombre del archivo**:

```sql
-- ✅ CORRECTO
UPDATE actividades SET imagen = 'futbol.jpg' WHERE nombre_actividad = 'Fútbol';

-- ❌ INCORRECTO (no incluir ruta completa)
UPDATE actividades SET imagen = '/uploads/actividades/futbol.jpg' WHERE nombre_actividad = 'Fútbol';
UPDATE actividades SET imagen = 'http://192.168.0.4:3000/uploads/actividades/futbol.jpg' WHERE nombre_actividad = 'Fútbol';
```

El sistema automáticamente construye la URL completa basándose en la configuración del backend.

## 🔧 Cómo Configurar

### Paso 1: Crear la Carpeta
```bash
mkdir -p backend/uploads/actividades
```

### Paso 2: Colocar las Imágenes
Coloca todas las imágenes en `backend/uploads/actividades/` con los nombres correspondientes:
- `futbol.jpg`
- `basquet.jpg`
- `tenis.jpg`
- etc.

### Paso 3: Actualizar la Base de Datos
Ejecuta este SQL (ajusta los nombres según tus actividades):

```sql
-- Actualizar actividades con nombres de imágenes
UPDATE actividades SET imagen = 'futbol.jpg' WHERE nombre_actividad ILIKE '%fútbol%' OR nombre_actividad ILIKE '%futbol%';
UPDATE actividades SET imagen = 'basquet.jpg' WHERE nombre_actividad ILIKE '%basquet%' OR nombre_actividad ILIKE '%básquet%';
UPDATE actividades SET imagen = 'tenis.jpg' WHERE nombre_actividad ILIKE '%tenis%';
UPDATE actividades SET imagen = 'natacion.jpg' WHERE nombre_actividad ILIKE '%natación%' OR nombre_actividad ILIKE '%natacion%';
UPDATE actividades SET imagen = 'running.jpg' WHERE nombre_actividad ILIKE '%running%' OR nombre_actividad ILIKE '%correr%';
UPDATE actividades SET imagen = 'voley.jpg' WHERE nombre_actividad ILIKE '%voley%' OR nombre_actividad ILIKE '%voleibol%';
UPDATE actividades SET imagen = 'padel.jpg' WHERE nombre_actividad ILIKE '%padel%' OR nombre_actividad ILIKE '%pádel%';
UPDATE actividades SET imagen = 'ciclismo.jpg' WHERE nombre_actividad ILIKE '%ciclismo%';
```

### Paso 4: Verificar
```sql
-- Ver todas las actividades y sus imágenes
SELECT nombre_actividad, imagen FROM actividades;
```

## 🎨 Herramientas para Optimizar Imágenes

### Online (Gratis)
- **TinyPNG**: https://tinypng.com/ (comprime sin perder calidad)
- **Squoosh**: https://squoosh.app/ (Google, muy completo)
- **ImageOptim**: https://imageoptim.com/ (Mac)

### Software
- **Photoshop**: Exportar para web
- **GIMP**: Gratis, exportar con calidad 85-90%
- **ImageMagick** (línea de comandos):
  ```bash
  convert imagen-original.jpg -resize 800x600 -quality 85 futbol.jpg
  ```

## 📱 Cómo Funciona en la App

1. **Al crear una publicación**: El backend obtiene la imagen de la actividad asociada
2. **En la lista**: Se muestra la imagen como avatar pequeño (150x150)
3. **En el detalle**: Se muestra la imagen grande (800x600)
4. **Si no hay imagen**: Se usa la foto del usuario o una imagen por defecto

## ✅ Checklist

- [ ] Crear carpeta `backend/uploads/actividades/`
- [ ] Preparar imágenes con tamaño 800x600 píxeles
- [ ] Optimizar imágenes (peso < 200 KB)
- [ ] Renombrar archivos según convención (minúsculas, sin espacios, sin acentos)
- [ ] Colocar imágenes en `backend/uploads/actividades/`
- [ ] Actualizar base de datos con nombres de archivos (solo el nombre, sin ruta)
- [ ] Verificar que el backend esté sirviendo archivos estáticos desde `/uploads`
- [ ] Probar creando una publicación nueva

## 🆘 Solución de Problemas

**Problema**: Las imágenes no se muestran
- Verifica que las imágenes estén en `backend/uploads/actividades/`
- Verifica que el nombre en la BD coincida exactamente con el archivo
- Verifica que el backend esté ejecutándose
- Verifica la URL en el navegador: `http://192.168.0.4:3000/uploads/actividades/futbol.jpg`

**Problema**: Imagen muy pesada o lenta
- Optimiza la imagen con TinyPNG o Squoosh
- Reduce el tamaño a 800x600 píxeles
- Usa formato JPG en lugar de PNG

**Problema**: Imagen se ve distorsionada
- Asegúrate de usar ratio 4:3 o 16:9
- Evita imágenes muy verticales o muy horizontales

