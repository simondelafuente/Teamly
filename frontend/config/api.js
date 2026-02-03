import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@teamly:auth_token';

const getApiUrl = () => {

  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }
  if (Platform.OS === 'ios') {
    return 'http://localhost:3000/api';
  }

  const explicitUrl = Constants.expoConfig?.extra?.apiUrl;
  if (explicitUrl && explicitUrl !== 'auto' && explicitUrl !== '') {
    return explicitUrl;
  }
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiUrl();


export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};


export const apiRequest = async (endpoint, options = {}) => {
  const url = `${apiConfig.baseURL}${endpoint}`;

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

  if (token && !endpoint.includes('/login') && !(endpoint === '/usuarios' && options.method === 'POST')) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
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

