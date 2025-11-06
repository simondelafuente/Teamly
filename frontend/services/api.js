import { apiRequest } from '../config/api';

// Servicios de API para diferentes recursos
// Ejemplo de cómo estructurar las llamadas a la API

export const userService = {
  // Ejemplo: Obtener todos los usuarios
  getAll: async () => {
    return await apiRequest('/users');
  },

  // Ejemplo: Obtener un usuario por ID
  getById: async (id) => {
    return await apiRequest(`/users/${id}`);
  },

  // Ejemplo: Crear un usuario
  create: async (userData) => {
    return await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Ejemplo: Actualizar un usuario
  update: async (id, userData) => {
    return await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Ejemplo: Eliminar un usuario
  delete: async (id) => {
    return await apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Agregar más servicios según sea necesario
// export const teamService = { ... };
// export const projectService = { ... };

export default {
  userService,
};

