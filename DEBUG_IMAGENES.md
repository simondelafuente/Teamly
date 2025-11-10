# 🔍 Debug de Imágenes en Frontend

## Pasos para Verificar

### 1. Verificar que la Base de Datos tenga los valores correctos

Ejecuta este SQL:
```sql
SELECT nombre_actividad, imagen, id_actividad 
FROM actividades;
```

**Debe mostrar algo como:**
```
nombre_actividad | imagen      | id_actividad
-----------------|-------------|-------------
Fútbol           | futbol.jpg  | uuid...
Básquet          | basquet.jpg | uuid...
```

**❌ NO debe tener:**
- `/uploads/actividades/futbol.jpg`
- `http://192.168.0.4:3000/uploads/actividades/futbol.jpg`

### 2. Verificar que las Publicaciones tengan actividad_imagen

Ejecuta este SQL:
```sql
SELECT 
  p.id_publicacion,
  p.titulo,
  a.nombre_actividad,
  a.imagen as actividad_imagen
FROM publicaciones p
LEFT JOIN actividades a ON p.id_actividad = a.id_actividad
LIMIT 5;
```

**Debe mostrar el campo `actividad_imagen` con valores como `futbol.jpg`**

### 3. Verificar en la Consola del Frontend

1. Abre la app en desarrollo
2. Abre la consola de React Native (Metro bundler o DevTools)
3. Busca logs que digan: `🖼️ Construyendo URL de imagen:`
4. Verifica que las URLs se estén construyendo correctamente

**Ejemplo de log esperado:**
```
🖼️ Construyendo URL de imagen: {
  imagePath: 'futbol.jpg',
  baseUrl: 'http://192.168.0.4:3000',
  fullUrl: 'http://192.168.0.4:3000/uploads/actividades/futbol.jpg'
}
```

### 4. Probar la URL construida

Copia la URL del log y pégala en el navegador. Debe mostrar la imagen.

### 5. Verificar en React Native Debugger (opcional)

Si usas React Native Debugger:
1. Abre React Native Debugger
2. Ve a la pestaña "Network"
3. Busca las peticiones de imágenes
4. Verifica que las URLs sean correctas

## Soluciones Comunes

### Problema: No aparece el log de construcción de URL
**Solución:** Verifica que `__DEV__` esté activo y que la app esté en modo desarrollo.

### Problema: La URL se construye pero la imagen no carga
**Solución:** 
1. Verifica que el backend esté corriendo
2. Prueba la URL directamente en el navegador
3. Verifica que no haya problemas de CORS

### Problema: actividad_imagen es null o undefined
**Solución:**
1. Verifica que la publicación tenga un `id_actividad` válido
2. Verifica que la actividad tenga un valor en el campo `imagen`
3. Crea una nueva publicación para probar

### Problema: La imagen se muestra pero muy pequeña o distorsionada
**Solución:**
1. Verifica el tamaño de la imagen (debe ser 800x600 px)
2. Verifica los estilos en `styles.avatar` y `styles.eventImage`

