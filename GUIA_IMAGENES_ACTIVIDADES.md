# Guía: Imágenes por Tipo de Actividad

## 📋 Resumen

Ahora el sistema está configurado para que al crear una publicación, automáticamente se use la imagen asociada al tipo de actividad. La imagen se obtiene de la tabla `actividades` en el campo `imagen`.

## ✅ Cambios Realizados

1. **Backend modificado**: El método `create` de `Publicacion` ahora devuelve la información completa de la actividad, incluyendo la imagen (`actividad_imagen`).

2. **Frontend ya configurado**: El frontend ya estaba preparado para usar `actividad_imagen` en:
   - `PublicationsScreen.js` - Lista de publicaciones
   - `PublicationDetailScreen.js` - Detalle de publicación

## 🔧 Qué Debes Hacer

### Opción 1: Actualizar la Base de Datos con SQL (Recomendado)

1. **Abre el SQL Editor** de tu base de datos (Supabase, pgAdmin, etc.)

2. **Ejecuta el script SQL** que está en `backend/database/update_actividades_imagenes.sql`

3. **Ajusta los nombres** de las actividades según las que tengas en tu base de datos:
   ```sql
   UPDATE actividades 
   SET imagen = 'futbol.jpg' 
   WHERE nombre_actividad = 'Fútbol';
   ```

4. **Ajusta las rutas de las imágenes** según donde las vayas a almacenar:
   - **Imágenes locales en el servidor**: `/uploads/futbol.jpg` o `futbol.jpg` (si están en una carpeta pública)
   - **URLs completas**: `https://tudominio.com/images/futbol.jpg`
   - **Imágenes en assets del frontend**: Si usas React Native, puedes usar `require('../assets/images/futbol.jpg')` pero necesitarías mapear el nombre en el frontend

### Opción 2: Actualizar usando la API

Puedes actualizar las actividades usando la API REST:

**Endpoint**: `PUT /api/actividades/:id`

**Ejemplo con Postman o curl**:
```json
PUT /api/actividades/{id_actividad}
Content-Type: application/json

{
  "nombre_actividad": "Fútbol",
  "imagen": "futbol.jpg"
}
```

### Opción 3: Actualizar desde el código (si tienes un script de inicialización)

Si tienes un script de inicialización de datos, puedes agregar las imágenes allí.

## 📁 Dónde Colocar las Imágenes

### Si usas imágenes locales en el servidor:

1. **Crea una carpeta** para las imágenes de actividades (por ejemplo: `backend/uploads/actividades/`)

2. **Coloca las imágenes** allí con nombres como:
   - `futbol.jpg`
   - `basquet.jpg`
   - `tenis.jpg`
   - etc.

3. **Actualiza las rutas en la base de datos**:
   ```sql
   UPDATE actividades 
   SET imagen = '/uploads/actividades/futbol.jpg' 
   WHERE nombre_actividad = 'Fútbol';
   ```

4. **Asegúrate de que el servidor sirva archivos estáticos** (ya está configurado en `backend/app.js`):
   ```javascript
   app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
   ```

### Si usas URLs externas:

Simplemente actualiza la base de datos con la URL completa:
```sql
UPDATE actividades 
SET imagen = 'https://ejemplo.com/imagenes/futbol.jpg' 
WHERE nombre_actividad = 'Fútbol';
```

### Si usas imágenes en el frontend (React Native):

Si las imágenes están en `frontend/assets/images/`, necesitarías mapear el nombre en el frontend. Por ejemplo, en `PublicationsScreen.js` podrías hacer:

```javascript
const getActivityImage = (imageName) => {
  const imageMap = {
    'futbol.jpg': require('../assets/images/futbol.jpg'),
    'basquet.jpg': require('../assets/images/basquet.jpg'),
    // ... más imágenes
  };
  return imageMap[imageName] || require('../assets/images/default.jpg');
};
```

## 🎯 Ejemplo Completo

1. **Tienes una actividad "Fútbol"** en tu base de datos
2. **Colocas la imagen** `futbol.jpg` en `backend/uploads/actividades/futbol.jpg`
3. **Actualizas la base de datos**:
   ```sql
   UPDATE actividades 
   SET imagen = '/uploads/actividades/futbol.jpg' 
   WHERE nombre_actividad = 'Fútbol';
   ```
4. **Al crear una publicación** con esa actividad, automáticamente se usará esa imagen

## 🔍 Verificar que Funciona

1. **Verifica las actividades en la base de datos**:
   ```sql
   SELECT id_actividad, nombre_actividad, imagen 
   FROM actividades;
   ```

2. **Crea una publicación** desde la app

3. **Verifica que la imagen se muestre** correctamente en:
   - La lista de publicaciones
   - El detalle de la publicación

## 📝 Notas Importantes

- El campo `imagen` en la tabla `actividades` ya existe y puede almacenar URLs o rutas de archivos
- Si una actividad no tiene imagen (`imagen` es NULL), el frontend usará una imagen por defecto o la foto del usuario
- Las imágenes se muestran automáticamente cuando se crea una publicación nueva
- Las publicaciones existentes también mostrarán la imagen si actualizas las actividades

## 🆘 Solución de Problemas

**Problema**: Las imágenes no se muestran
- Verifica que la ruta en la base de datos sea correcta
- Verifica que el servidor esté sirviendo archivos estáticos desde `/uploads`
- Verifica que la imagen exista en la ruta especificada

**Problema**: No sé qué nombres tienen mis actividades
- Ejecuta: `SELECT nombre_actividad FROM actividades;` en tu base de datos

**Problema**: Quiero usar nombres diferentes para las imágenes
- Puedes usar cualquier nombre, solo asegúrate de que coincida con el archivo real o la URL

