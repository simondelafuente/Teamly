const jwt = require('jsonwebtoken');

// Clave secreta para firmar tokens (debería estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'teamly_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // 7 días por defecto

/**
 * Genera un token JWT para un usuario
 * @param {Object} payload - Datos del usuario (id_usuario, email, etc.)
 * @returns {string} Token JWT
 */
const generateToken = (payload) => {
  return jwt.sign(
    {
      id_usuario: payload.id_usuario,
      email: payload.email,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
};

/**
 * Verifica y decodifica un token JWT
 * @param {string} token - Token JWT a verificar
 * @returns {Object|null} Datos decodificados del token o null si es inválido
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    } else {
      throw new Error('Error al verificar token');
    }
  }
};

/**
 * Extrae el token del header Authorization
 * @param {Object} headers - Headers de la petición
 * @returns {string|null} Token extraído o null
 */
const extractTokenFromHeader = (headers) => {
  const authHeader = headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  // Formato esperado: "Bearer <token>"
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
};

