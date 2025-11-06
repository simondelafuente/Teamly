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
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
      return true;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return false;
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
};

export default authService;

