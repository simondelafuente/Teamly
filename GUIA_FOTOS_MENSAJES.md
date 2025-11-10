# Guía para Fotos de Perfil en Mensajes

## 📍 Ubicación de las Fotos

Las fotos de perfil de los usuarios que envían mensajes deben colocarse en:

```
backend/uploads/avatars/
```

## 📝 Convención de Nombres

Las fotos deben nombrarse usando el **nombre completo del usuario** en formato:
- **Minúsculas**
- **Sin espacios** (reemplazados por guiones bajos `_`)
- **Sin acentos ni caracteres especiales**
- **Extensión `.jpg`**

### Ejemplos:

| Nombre del Usuario | Nombre del Archivo |
|-------------------|-------------------|
| Juan Pérez | `juan_perez.jpg` |
| María García | `maria_garcia.jpg` |
| Carlos López | `carlos_lopez.jpg` |
| Ana Martínez | `ana_martinez.jpg` |

## 🔧 Cómo Funciona

1. **En el Frontend (`MessagesListScreen.js`)**:
   - Los mensajes incluyen el campo `remitente_foto` con la ruta `/uploads/avatars/nombre_usuario.jpg`
   - El componente `getImageWithFallback` construye la URL completa desde el servidor
   - Si la foto no existe, se muestra un placeholder

2. **Estructura de Datos**:
   ```javascript
   {
     id: '1',
     remitente: 'Juan Pérez',
     remitente_email: 'juan@example.com',
     remitente_foto: '/uploads/avatars/juan_perez.jpg',
     mensaje: '...',
     fecha: '...'
   }
   ```

## 📋 Pasos para Agregar Fotos

1. **Preparar la imagen**:
   - Tamaño recomendado: 200x200px o 400x400px
   - Formato: JPG
   - Peso: 50-100KB (optimizado)

2. **Nombrar el archivo**:
   - Convertir el nombre del usuario a formato: `nombre_apellido.jpg`
   - Ejemplo: "Juan Pérez" → `juan_perez.jpg`

3. **Colocar en el servidor**:
   - Copiar el archivo a `backend/uploads/avatars/`
   - Verificar que el nombre coincida exactamente con el usado en el código

4. **Verificar**:
   - La URL completa será: `http://localhost:3000/uploads/avatars/juan_perez.jpg`
   - El backend ya está configurado para servir archivos desde `/uploads`

## ⚠️ Notas Importantes

- **Consistencia**: El nombre del archivo debe coincidir exactamente con el valor de `remitente_foto` en el código
- **Fallback**: Si la foto no existe, se mostrará un placeholder automáticamente
- **Formato**: Se recomienda usar JPG para mejor compatibilidad y menor tamaño
- **Mayúsculas/Minúsculas**: Los nombres de archivo son case-sensitive en algunos sistemas, usa siempre minúsculas

## 🔄 Cuando se Implemente el Backend Real

Cuando se conecte con el backend real, el campo `remitente_foto` vendrá directamente de la base de datos (campo `foto_perfil` del usuario emisor), y las fotos se cargarán automáticamente desde la ruta almacenada en la base de datos.

