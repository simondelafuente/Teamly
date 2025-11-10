import { apiConfig } from '../config/api';

/**
 * Construye la URL completa de una imagen desde el backend
 * @param {string} imagePath - Ruta de la imagen (ej: 'futbol.jpg' o '/uploads/actividades/futbol.jpg')
 * @returns {string} URL completa de la imagen
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Si ya es una URL completa (http:// o https://), devolverla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Obtener la URL base del backend (sin /api)
  const baseUrl = apiConfig.baseURL.replace('/api', '');
  
  // Si la ruta ya empieza con /uploads, usar directamente
  // Esto incluye /uploads/avatars/avatar1.jpg, /uploads/actividades/futbol.jpg, etc.
  if (imagePath.startsWith('/uploads')) {
    const fullUrl = `${baseUrl}${imagePath}`;
    // Log para debugging (solo en desarrollo)
    if (__DEV__) {
      console.log('🖼️ Construyendo URL de imagen (uploads):', {
        imagePath,
        baseUrl,
        fullUrl
      });
    }
    return fullUrl;
  }
  
  // Si es solo un nombre de archivo (ej: 'futbol.jpg'), asumir que está en /uploads/actividades/
  if (!imagePath.includes('/')) {
    const fullUrl = `${baseUrl}/uploads/actividades/${imagePath}`;
    // Log para debugging (solo en desarrollo)
    if (__DEV__) {
      console.log('🖼️ Construyendo URL de imagen (actividades):', {
        imagePath,
        baseUrl,
        fullUrl
      });
    }
    return fullUrl;
  }
  
  // Si tiene una ruta relativa, agregar /uploads si no está presente
  if (!imagePath.startsWith('/')) {
    return `${baseUrl}/uploads/${imagePath}`;
  }
  
  return `${baseUrl}${imagePath}`;
};

/**
 * Obtiene la URL de una imagen con fallback
 * @param {string} primaryImage - Imagen principal
 * @param {string} fallbackImage - Imagen de respaldo
 * @param {string} defaultImage - Imagen por defecto (URL completa)
 * @returns {string} URL de la imagen a usar
 */
export const getImageWithFallback = (primaryImage, fallbackImage = null, defaultImage = 'https://via.placeholder.com/300') => {
  const primary = primaryImage ? getImageUrl(primaryImage) : null;
  const fallback = fallbackImage ? getImageUrl(fallbackImage) : null;
  
  return primary || fallback || defaultImage;
};

