# Teamly

Aplicación completa de gestión de equipos con backend en Node.js/Express y frontend en React Native con Expo.

## 🚀 Inicio Rápido

### Instalación

```bash
npm run install:all
```

### Ejecutar la Aplicación

**Terminal 1 - Backend:**
```bash
npm run backend
```

**Terminal 2 - Frontend:**
```bash
npm run frontend
```

En la terminal del frontend verás el QR code y los links para acceder a la app.

### Modo Desarrollo (con auto-reload del backend)

**Terminal 1:**
```bash
npm run backend:dev
```

**Terminal 2:**
```bash
npm run frontend
```

## 📱 Acceder al Frontend

Cuando ejecutes `npm run frontend`:
- **QR Code**: Escanéalo con Expo Go (Android) o Cámara (iOS)
- **Teclas**: Presiona `a` (Android), `i` (iOS), `w` (web)
- **DevTools**: Se abre en `http://localhost:19002`

## 🔧 Configuración

### Backend
Configura `backend/.env`:
```env
PORT=3000
SUPABASE_DB_URL=tu_url_de_supabase
```

### Frontend
La URL de la API está en `frontend/app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://192.168.0.4:3000/api"
    }
  }
}
```

**Nota:** 
- Actualiza la IP si cambia (puedes obtenerla con `ipconfig` en Windows)
- Si cambias la IP, **debes reiniciar Expo completamente** para que cargue la nueva configuración:
  1. Detén el servidor de Expo (Ctrl+C)
  2. Limpia el cache: `npx expo start -c`
  3. O reinicia la app en tu dispositivo

## 📚 Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run backend` | Inicia el backend |
| `npm run backend:dev` | Backend con auto-reload |
| `npm run frontend` | Inicia el frontend (con QR code) |
| `npm run install:all` | Instala todas las dependencias |

## 📝 Notas

- Asegúrate de que tu dispositivo y computadora estén en la misma red WiFi
- El backend escucha en `0.0.0.0` para permitir conexiones desde la red local
- Documentación de rutas API: `backend/RUTAS_POSTMAN.md`
