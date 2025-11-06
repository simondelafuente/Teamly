# Teamly Frontend

Aplicación móvil desarrollada con React Native y Expo.

## Requisitos

- Node.js (versión 16 o superior)
- npm o yarn
- Expo CLI (se instala automáticamente con npm)

## Instalación

1. Instalar las dependencias:
```bash
npm install
```

o

```bash
yarn install
```

## Ejecutar la aplicación

### Desarrollo

Para iniciar el servidor de desarrollo de Expo:

```bash
npm start
```

o

```bash
yarn start
```

Esto abrirá Expo DevTools en tu navegador. Desde ahí puedes:
- Presionar `a` para abrir en Android emulador/dispositivo
- Presionar `i` para abrir en iOS simulador/dispositivo
- Escanear el código QR con la app Expo Go en tu dispositivo físico

### Comandos específicos

- Android: `npm run android`
- iOS: `npm run ios`
- Web: `npm run web`

## Estructura del proyecto

```
frontend/
├── assets/          # Imágenes, fuentes, etc.
├── components/      # Componentes reutilizables
├── screens/         # Pantallas de la aplicación
├── navigation/      # Configuración de navegación
├── services/        # Servicios API y lógica de negocio
├── utils/           # Utilidades y helpers
├── App.js           # Componente principal
├── app.json         # Configuración de Expo
└── package.json     # Dependencias del proyecto
```

## Características Implementadas

### Pantalla de Login
- Diseño moderno basado en la especificación
- Validación de campos
- Integración con el backend para autenticación
- Almacenamiento de sesión con AsyncStorage
- Navegación automática después del login exitoso

## Desarrollo

Para desarrollo con hot reload, simplemente ejecuta `npm start` y mantén el servidor corriendo. Los cambios se reflejarán automáticamente en tu dispositivo o emulador.

### Autenticación

La aplicación incluye un sistema de autenticación completo:
- **Login**: POST `/api/usuarios/login` con email y contraseña
- **Almacenamiento**: Los datos del usuario se guardan en AsyncStorage
- **Navegación**: Después del login exitoso, se navega automáticamente a la pantalla principal

### Configuración de API para dispositivos físicos

Si estás probando en un dispositivo físico, necesitarás cambiar la URL de la API en `config/api.js` de `localhost` a la IP local de tu computadora. Por ejemplo:

```javascript
const API_BASE_URL = 'http://192.168.1.100:3000/api';
```

Puedes encontrar tu IP local ejecutando:
- Windows: `ipconfig` (busca "IPv4 Address")
- Mac/Linux: `ifconfig` o `ip addr`

**Nota:** Asegúrate de que tu dispositivo móvil y tu computadora estén en la misma red WiFi.

## Testing

Para ejecutar tests (cuando estén configurados):

```bash
npm test
```

