import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configuración de la API
// En desarrollo, usa la IP local para dispositivos físicos/emuladores
// En producción, usa la URL del servidor
const getApiUrl = () => {
  // Si está configurado en app.json, usarlo
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig.extra.apiUrl;
  }
  
  // Para web, usar localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  }
  
  // Para dispositivos físicos/emuladores, usar IP local
  // La IP se configura en app.json en la sección "extra.apiUrl"
  // Si no está configurada, usar esta IP por defecto
  return 'http://192.168.0.67:3000/api';
};

const API_BASE_URL = getApiUrl();

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Funciones helper para hacer requests
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${apiConfig.baseURL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      ...apiConfig.headers,
      ...options.headers,
    },
  };

  // Si hay body, asegurarse de que sea string (JSON)
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    // Manejar respuestas vacías
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const textData = await response.text();
      data = textData ? { message: textData } : {};
    }
    
    if (!response.ok) {
      // Si el backend devuelve un formato de error estándar
      const errorMessage = data.message || data.error || `Error ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    
    return data;
  } catch (error) {
    // Si es un error de red, proporcionar un mensaje más claro
    if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
    }
    console.error('API Error:', error);
    throw error;
  }
};

export default apiConfig;

