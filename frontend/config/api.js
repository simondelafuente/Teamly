import Constants from 'expo-constants';
import { Platform } from 'react-native';


const getApiUrl = () => {
  let apiUrl;
  
  if (Constants.expoConfig?.extra?.apiUrl) {
    apiUrl = Constants.expoConfig.extra.apiUrl;
  } else if (Platform.OS === 'web') {
    apiUrl = 'http://localhost:3000/api';
  } else {
    apiUrl = 'http://192.168.0.4:3000/api';
  }
  
  // Log para debugging (solo en desarrollo)
  if (__DEV__) {
    console.log('🔗 API URL configurada:', apiUrl);
  }
  
  return apiUrl;
};

const API_BASE_URL = getApiUrl();

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${apiConfig.baseURL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      ...apiConfig.headers,
      ...options.headers,
    },
  };

  if (config.body && typeof config.body === 'object') {
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
      console.error('❌ Error de conexión:', {
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

