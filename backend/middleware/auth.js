const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');

/**
 * Middleware para autenticar peticiones usando JWT
 * Verifica el token y agrega los datos del usuario a req.user
 */
const authenticate = (req, res, next) => {
  try {
    // Extraer token del header
    const token = extractTokenFromHeader(req.headers);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
    }

    // Verificar y decodificar el token
    const decoded = verifyToken(token);
    
    // Agregar datos del usuario a la petición
    req.user = {
      id_usuario: decoded.id_usuario,
      email: decoded.email
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Token inválido o expirado'
    });
  }
};

module.exports = { authenticate };

