# Teamly - Aplicación de Gestión de Equipos

Aplicación completa con backend (Express + PostgreSQL) y frontend (React Native + Expo).

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js (v14 o superior)
- npm o yarn
- PostgreSQL o cuenta de Supabase
- Expo CLI (se instala automáticamente con npm install)

### Instalación

1. **Instalar todas las dependencias:**
   ```bash
   npm run install:all
   ```

2. **Configurar el backend:**
   - Crear un archivo `.env` en la carpeta `backend/`
   - Agregar la siguiente línea:
     ```
     SUPABASE_DB_URL=tu_url_de_conexion_postgresql
     PORT=3000
     JWT_SECRET=tu_secret_key_aqui
     ```
   - Si usas Supabase, la URL se encuentra en: Settings → Database → Connection string

3. **Iniciar el backend:**
   ```bash
   npm run backend
   # o para desarrollo con auto-reload:
   npm run backend:dev
   ```

4. **Iniciar el frontend:**
   ```bash
   npm run frontend
   ```

## 🔧 Configuración Automática de Red

La aplicación **detecta automáticamente** la URL del backend según el entorno:

- **Web**: Usa `localhost:3000/api` automáticamente
- **iOS Simulator**: Usa `localhost:3000/api` automáticamente  
- **Android Emulador**: Usa `10.0.2.2:3000/api` automáticamente
- **Dispositivos físicos**: Detecta automáticamente la IP del servidor de desarrollo de Expo

**No necesitas cambiar ninguna configuración manualmente** - la aplicación se adapta automáticamente.

### Si necesitas obtener tu IP local manualmente:

```bash
npm run get-ip
```

Esto mostrará todas las IPs locales disponibles. Solo necesitarás esto si usas un dispositivo físico y la detección automática no funciona.

### Configuración Manual (Opcional)

Si necesitas configurar manualmente la URL del API, edita `frontend/app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://TU_IP:3000/api"
    }
  }
}
```

O usa `"auto"` para detección automática (recomendado).

## 📁 Estructura del Proyecto

```
Teamly/
├── backend/          # Servidor Express
│   ├── controllers/ # Controladores MVC
│   ├── models/       # Modelos de datos
│   ├── routes/       # Rutas de la API
│   ├── middleware/   # Middlewares (auth, upload, etc.)
│   └── server.js     # Punto de entrada del servidor
├── frontend/         # Aplicación React Native
│   ├── screens/      # Pantallas de la app
│   ├── components/   # Componentes reutilizables
│   ├── config/       # Configuración (API, etc.)
│   └── services/     # Servicios (auth, etc.)
└── scripts/          # Scripts de utilidad
```

## 🛠️ Scripts Disponibles

- `npm run backend` - Inicia el servidor backend
- `npm run backend:dev` - Inicia el backend en modo desarrollo (con auto-reload)
- `npm run frontend` - Inicia el servidor de desarrollo de Expo
- `npm run install:all` - Instala todas las dependencias
- `npm run get-ip` - Muestra las IPs locales disponibles

## 🔍 Solución de Problemas

### Error: "No se pudo conectar con el servidor"

1. **Verifica que el backend esté corriendo:**
   - Debe mostrar: `Servidor corriendo en el puerto: 3000`
   - Debe mostrar la IP local detectada

2. **Verifica la consola del frontend:**
   - Busca el mensaje: `🔗 API Base URL configurada: ...`
   - Verifica que la URL sea correcta
   - Revisa los logs de detección de IP

3. **Si la aplicación usa una IP antigua (caché de Expo):**
   ```bash
   # Limpiar caché y reiniciar
   npm run frontend:clear
   # O manualmente:
   cd frontend
   npm run start:clear
   ```

4. **Si usas un dispositivo físico:**
   - Asegúrate de que el dispositivo esté en la misma red WiFi
   - Ejecuta `npm run get-ip` y verifica la IP
   - Si es necesario, configura manualmente en `app.json`:
     ```json
     {
       "expo": {
         "extra": {
           "apiUrl": "http://TU_IP_ACTUAL:3000/api"
         }
       }
     }
     ```

### El backend no inicia

- Verifica que PostgreSQL esté corriendo (si es local)
- Verifica que la URL en `.env` sea correcta
- Verifica que el puerto 3000 no esté en uso

## 📝 Notas para el Profesor

Esta aplicación está configurada para funcionar automáticamente en cualquier entorno. Solo necesitas:

1. Instalar dependencias: `npm run install:all`
2. Configurar el archivo `.env` en `backend/` con tu conexión a PostgreSQL
3. Iniciar el backend: `npm run backend`
4. Iniciar el frontend: `npm run frontend`

La aplicación detectará automáticamente la configuración de red correcta. No es necesario cambiar ninguna IP manualmente.

## 📄 Licencia

ISC
