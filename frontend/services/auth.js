import { apiRequest } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@teamly:auth_token';
const USER_DATA_KEY = '@teamly:user_data';

export const authService = {
  // Login de usuario
  login: async (email, password) => {
    try {
      const response = await apiRequest('/usuarios/login', {
        method: 'POST',
        body: {
          email,
          contrasena: password,
        },
      });

      if (response.success && response.data) {
        // Guardar datos del usuario en AsyncStorage
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data));
        // Si el backend devuelve un token, guardarlo también
        if (response.token) {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
        }
        return response;
      } else {
        throw new Error(response.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      // Si el error tiene un mensaje, usarlo; si no, usar un mensaje genérico
      const errorMessage = error.message || 'Error al conectar con el servidor';
      throw new Error(errorMessage);
    }
  },

  // Logout
  logout: async () => {
    try {
      // Intentar eliminar ambos items, incluso si uno falla
      try {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      } catch (e) {
        console.warn('Error al eliminar token:', e);
      }
      
      try {
        await AsyncStorage.removeItem(USER_DATA_KEY);
      } catch (e) {
        console.warn('Error al eliminar datos de usuario:', e);
      }
      
      // Verificar que se eliminaron correctamente
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      
      return true;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Devolver true de todas formas para permitir la navegación
      return true;
    }
  },

  // Obtener datos del usuario guardados
  getUserData: async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  },

  // Obtener token de autenticación
  getToken: async () => {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData !== null;
    } catch (error) {
      return false;
    }
  },

  // Registro de usuario
  register: async (userData, imageUri = null) => {
    try {
      let response;

      // Si hay imagen, usar FormData
      if (imageUri && typeof imageUri === 'string' && imageUri.startsWith('file://')) {
        const formData = new FormData();
        formData.append('nombre_completo', userData.nombre_completo);
        formData.append('email', userData.email);
        formData.append('contrasena', userData.contrasena);
        formData.append('pregunta_seguridad', userData.pregunta_seguridad);
        formData.append('respuesta_seguridad', userData.respuesta_seguridad);
        
        // Agregar imagen
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('foto_perfil', {
          uri: imageUri,
          name: filename,
          type: type,
        });

        // Hacer request con FormData
        const { apiConfig } = require('../config/api');
        const url = `${apiConfig.baseURL}/usuarios`;
        
        response = await fetch(url, {
          method: 'POST',
          body: formData,
        });

        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const textData = await response.text();
          data = textData ? { message: textData } : {};
        }

        if (!response.ok) {
          const errorMessage = data.message || data.error || `Error ${response.status}: ${response.statusText}`;
          throw new Error(errorMessage);
        }

        return data;
      } else {
        // Sin imagen, usar JSON normal
        response = await apiRequest('/usuarios', {
          method: 'POST',
          body: userData,
        });

        if (response.success) {
          return response;
        } else {
          throw new Error(response.message || 'Error al crear la cuenta');
        }
      }
    } catch (error) {
      const errorMessage = error.message || 'Error al conectar con el servidor';
      throw new Error(errorMessage);
    }
  },
};

export default authService;

