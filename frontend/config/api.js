import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@teamly:auth_token';

<<<<<<< HEAD
const getApiUrl = () => {
  let apiUrl;

  if (Platform.OS === 'web') {
    apiUrl = 'http://localhost:3000/api';
  } else if (Constants.expoConfig?.extra?.apiUrl) {
    apiUrl = Constants.expoConfig.extra.apiUrl;
  } else {
    apiUrl = 'http://172.30.2.59:3000/api';
  }

  return apiUrl;
=======
/**
 * Extrae la IP del host desde la URL del servidor de desarrollo de Expo
 */
const getHostIP = () => {
  // Intentar obtener la IP del servidor de desarrollo de Expo
  // Expo proporciona esta información de diferentes formas según la versión
  // Probamos múltiples fuentes para máxima compatibilidad
  
  const possibleHosts = [
    Constants.expoConfig?.hostUri,
    Constants.expoConfig?.extra?.expoGo?.debuggerHost,
    Constants.manifest?.debuggerHost,
    Constants.manifest2?.extra?.expoGo?.debuggerHost,
    Constants.manifest?.hostUri,
    Constants.manifest2?.hostUri,
    // También intentar desde la URL de conexión si está disponible
    Constants.expoConfig?.extra?.expoGo?.hostUri,
  ];
  
  for (const debuggerHost of possibleHosts) {
    if (debuggerHost) {
      // El formato puede ser "IP:PUERTO" o solo "IP" o "exp://IP:PUERTO"
      let ip = debuggerHost;
      
      // Remover protocolo si existe
      ip = ip.replace(/^exp:\/\//, '').replace(/^http:\/\//, '').replace(/^https:\/\//, '');
      
      // Extraer IP (antes del primer : o /)
      ip = ip.split(':')[0].split('/')[0];
      
      // Validar que sea una IP válida (no localhost)
      if (ip && 
          ip !== 'localhost' && 
          ip !== '127.0.0.1' && 
          ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
        return ip;
      }
    }
  }
  
  return null;
};

/**
 * Obtiene la URL del API de forma automática y adaptable
 */
const getApiUrl = () => {
  // Prioridad 1: Configuración explícita en app.json (para producción o casos especiales)
  // Si está configurado como "auto", ignoramos esta opción
  const explicitUrl = Constants.expoConfig?.extra?.apiUrl;
  if (explicitUrl && explicitUrl !== 'auto' && explicitUrl !== '') {
    return explicitUrl;
  }
  
  // Prioridad 2: Web siempre usa localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  }
  
  // Prioridad 3: Detectar IP automáticamente desde el servidor de desarrollo de Expo
  const hostIP = getHostIP();
  if (hostIP) {
    return `http://${hostIP}:3000/api`;
  }
  
  // Prioridad 4: Android Emulador - usar IP especial del emulador
  if (Platform.OS === 'android') {
    // 10.0.2.2 es la IP especial del Android emulador para acceder al localhost del host
    return 'http://10.0.2.2:3000/api';
  }
  
  // Prioridad 5: iOS Simulator puede usar localhost
  if (Platform.OS === 'ios') {
    return 'http://localhost:3000/api';
  }
  
  // Fallback: localhost por defecto
  return 'http://localhost:3000/api';
>>>>>>> 11b55a19 (ip config)
};

const API_BASE_URL = getApiUrl();

// Log para debugging (solo en desarrollo)
if (__DEV__) {
  const detectedIP = getHostIP();
  console.log('🔗 API Base URL configurada:', API_BASE_URL);
  console.log('📱 Plataforma:', Platform.OS);
  console.log('🌐 Host IP detectada:', detectedIP || 'No detectada (usando fallback)');
  console.log('📋 Constants.expoConfig?.hostUri:', Constants.expoConfig?.hostUri);
  console.log('📋 Constants.manifest?.debuggerHost:', Constants.manifest?.debuggerHost);
  console.log('📋 Constants.expoConfig?.extra?.apiUrl:', Constants.expoConfig?.extra?.apiUrl);
}

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};


export const apiRequest = async (endpoint, options = {}) => {
  const url = `${apiConfig.baseURL}${endpoint}`;

  // Obtener token de autenticación
  let token = null;
  try {
    token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.warn('Error al obtener token:', error);
  }

  const config = {
    ...options,
    headers: {
      ...apiConfig.headers,
      ...options.headers,
    },
  };

  // Agregar token al header si existe (excepto para login y registro sin token)
  if (token && !endpoint.includes('/login') && !(endpoint === '/usuarios' && options.method === 'POST')) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // No agregar Content-Type si es FormData
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  } else if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const textData = await response.text();
      data = textData ? { message: textData } : {};
    }

    // Si el token es inválido o expirado, limpiar almacenamiento
    if (response.status === 401 && token) {
      try {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        await AsyncStorage.removeItem('@teamly:user_data');
      } catch (e) {
        console.warn('Error al limpiar almacenamiento:', e);
      }
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || `Error ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.message.includes('Network request failed') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('ERR_CONNECTION_TIMED_OUT') ||
      error.message.includes('ERR_CONNECTION_REFUSED')) {
      console.error('Error de conexión:', {
        url,
        error: error.message,
        apiBaseUrl: apiConfig.baseURL
      });
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose en ' + apiConfig.baseURL);
    }
    console.error('API Error:', error);
    throw error;
  }
};

export default apiConfig;

