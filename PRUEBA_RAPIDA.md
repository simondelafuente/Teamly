# 🚀 Prueba Rápida de Imágenes

## ✅ Pasos para Probar

### 1. Asegúrate que el Backend esté corriendo
```bash
cd backend
npm start
```

### 2. Prueba las imágenes en el navegador

Abre estas URLs en tu navegador (reemplaza `192.168.0.4` con tu IP si es diferente):

**Desde tu PC:**
- http://localhost:3000/uploads/actividades/futbol.jpg
- http://localhost:3000/uploads/actividades/basquet.jpg
- http://localhost:3000/uploads/actividades/tenis.jpg
- http://localhost:3000/uploads/actividades/padel.jpg

**Desde tu teléfono (misma WiFi):**
- http://192.168.0.4:3000/uploads/actividades/futbol.jpg

✅ **Si ves las imágenes, el backend funciona correctamente.**

### 3. Verifica la Base de Datos

Ejecuta este SQL:
```sql
SELECT nombre_actividad, imagen FROM actividades;
```

**Importante:** Los valores deben ser solo el nombre del archivo:
- ✅ `futbol.jpg` 
- ❌ `/uploads/actividades/futbol.jpg` (NO debe tener ruta)

### 4. Prueba en la App

1. Abre la app
2. Ve a Publicaciones
3. Crea una nueva publicación con una actividad
4. Verifica que la imagen se muestre en:
   - La lista de publicaciones (avatar pequeño)
   - El detalle de la publicación (imagen grande)

## 🔍 Si no funciona

**Las imágenes no se ven en el navegador:**
- Verifica que el backend esté corriendo
- Verifica que los archivos existan en `backend/uploads/actividades/`

**Las imágenes se ven en el navegador pero no en la app:**
- Verifica la IP en `frontend/app.json` (debe ser `192.168.0.4`)
- Asegúrate de estar en la misma red WiFi
- Revisa la consola de la app para ver errores

