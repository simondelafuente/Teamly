# 🧪 Prueba de Imágenes de Actividades

## ✅ Verificación Rápida

### 1. Verificar que el Backend esté corriendo
Asegúrate de que el servidor backend esté ejecutándose:
```bash
cd backend
npm start
# o
npm run dev
```

Deberías ver: `Servidor corriendo en el puerto: 3000`

### 2. Probar acceso directo a las imágenes

Abre en tu navegador estas URLs (reemplaza `192.168.0.4` con tu IP si es diferente):

**Desde tu computadora:**
- http://localhost:3000/uploads/actividades/futbol.jpg
- http://localhost:3000/uploads/actividades/basquet.jpg
- http://localhost:3000/uploads/actividades/tenis.jpg
- http://localhost:3000/uploads/actividades/padel.jpg
- http://localhost:3000/uploads/actividades/cs2.jpg
- http://localhost:3000/uploads/actividades/lol.jpg
- http://localhost:3000/uploads/actividades/rocket.jpg

**Desde tu teléfono (misma red WiFi):**
- http://192.168.0.4:3000/uploads/actividades/futbol.jpg
- http://192.168.0.4:3000/uploads/actividades/basquet.jpg
- etc.

✅ **Si las imágenes se ven en el navegador, el backend está funcionando correctamente.**

### 3. Verificar en la Base de Datos

Ejecuta este SQL para verificar que las actividades tengan imágenes asignadas:

```sql
SELECT nombre_actividad, imagen 
FROM actividades 
ORDER BY nombre_actividad;
```

**Importante:** Los valores en `imagen` deben ser solo el nombre del archivo:
- ✅ `futbol.jpg`
- ✅ `basquet.jpg`
- ❌ `/uploads/actividades/futbol.jpg` (NO debe tener ruta)
- ❌ `http://192.168.0.4:3000/uploads/actividades/futbol.jpg` (NO debe tener URL completa)

### 4. Probar en la App

1. **Abre la app** en tu dispositivo/emulador
2. **Ve a la pantalla de Publicaciones**
3. **Crea una nueva publicación** seleccionando una actividad
4. **Verifica que la imagen se muestre:**
   - En la lista de publicaciones (avatar pequeño)
   - En el detalle de la publicación (imagen grande)

### 5. Verificar en la Consola (Debug)

Si las imágenes no se muestran, revisa la consola del navegador o React Native:

**En el frontend, abre la consola y busca:**
- URLs de imágenes que se están intentando cargar
- Errores 404 (imagen no encontrada)
- Errores de CORS

**Ejemplo de URL que debería aparecer:**
```
http://192.168.0.4:3000/uploads/actividades/futbol.jpg
```

## 🔍 Solución de Problemas

### Problema: Las imágenes no se ven en el navegador
**Solución:**
1. Verifica que el backend esté corriendo
2. Verifica que las imágenes existan en `backend/uploads/actividades/`
3. Verifica que los nombres coincidan exactamente (mayúsculas/minúsculas importan)

### Problema: Las imágenes se ven en el navegador pero no en la app
**Solución:**
1. Verifica la IP en `frontend/app.json` y `frontend/config/api.js`
2. Asegúrate de que tu dispositivo esté en la misma red WiFi
3. Verifica que el firewall no esté bloqueando el puerto 3000

### Problema: Error 404 en la app
**Solución:**
1. Verifica que el nombre en la BD coincida exactamente con el archivo
2. Verifica que no haya espacios o caracteres especiales
3. Verifica que la URL se esté construyendo correctamente

### Problema: Imagen se ve distorsionada
**Solución:**
1. Verifica que las imágenes tengan el tamaño correcto (800x600 px)
2. Asegúrate de usar ratio 4:3

## 📝 Checklist de Verificación

- [ ] Backend corriendo en puerto 3000
- [ ] Imágenes accesibles desde navegador (localhost)
- [ ] Imágenes accesibles desde navegador (IP de red)
- [ ] Base de datos tiene valores correctos (solo nombre de archivo)
- [ ] App muestra imágenes en lista de publicaciones
- [ ] App muestra imágenes en detalle de publicación
- [ ] No hay errores en la consola

## 🎯 Prueba Rápida con curl (opcional)

Si tienes curl instalado, puedes probar desde la terminal:

```bash
# Desde tu computadora
curl -I http://localhost:3000/uploads/actividades/futbol.jpg

# Debería devolver: HTTP/1.1 200 OK
```

