import { apiConfig } from '../config/api';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  const baseUrl = apiConfig.baseURL.replace('/api', '');
  
  if (imagePath.startsWith('/uploads')) {
    return `${baseUrl}${imagePath}`;
  }
  
  if (!imagePath.includes('/')) {
    return `${baseUrl}/uploads/actividades/${imagePath}`;
  }
  
  if (!imagePath.startsWith('/')) {
    return `${baseUrl}/uploads/${imagePath}`;
  }
  
  return `${baseUrl}${imagePath}`;
};

export const getImageWithFallback = (primaryImage, fallbackImage = null, defaultImage = 'https://via.placeholder.com/300') => {
  const primary = primaryImage ? getImageUrl(primaryImage) : null;
  const fallback = fallbackImage ? getImageUrl(fallbackImage) : null;
  
  return primary || fallback || defaultImage;
};

