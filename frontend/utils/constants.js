// Constantes de la aplicación

export const COLORS = {
  primary: '#6200ee',
  primaryBlue: '#007AFF', // Azul brillante para botones principales
  secondary: '#03dac6',
  background: '#ffffff',
  surface: '#f5f5f5',
  inputBackground: '#E8E0F0', // Lavanda claro para inputs
  error: '#b00020',
  text: '#000000',
  textSecondary: '#666666',
  textDark: '#333333',
  border: '#e0e0e0',
};

export const SIZES = {
  // Espaciado
  padding: 16,
  margin: 16,
  
  // Tamaños de fuente
  small: 12,
  medium: 14,
  large: 16,
  xlarge: 20,
  xxlarge: 24,
  
  // Border radius
  borderRadius: 8,
  borderRadiusLarge: 16,
};

export const API_ENDPOINTS = {
  users: '/users',
  teams: '/teams',
  projects: '/projects',
  tasks: '/tasks',
};

export default {
  COLORS,
  SIZES,
  API_ENDPOINTS,
};

