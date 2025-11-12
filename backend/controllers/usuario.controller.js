const Usuario = require('../models/usuario.model');

// Obtener todos los usuarios
exports.getAll = async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json({
      success: true,
      data: usuarios,
      count: usuarios.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un usuario por ID
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un usuario por email
exports.getByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;
    const usuario = await Usuario.findByEmail(email);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo usuario
exports.create = async (req, res, next) => {
  try {
    // Validar campos requeridos
    if (!req.body.nombre_completo || !req.body.email || !req.body.contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Nombre completo, email y contraseña son requeridos'
      });
    }

    if (!req.body.pregunta_seguridad || !req.body.respuesta_seguridad) {
      return res.status(400).json({
        success: false,
        message: 'Pregunta y respuesta de seguridad son requeridas'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await Usuario.findByEmail(req.body.email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Preparar datos del usuario
    const userData = {
      nombre_completo: req.body.nombre_completo.trim(),
      email: req.body.email.trim().toLowerCase(),
      contrasena: req.body.contrasena,
      pregunta_seguridad: req.body.pregunta_seguridad.trim(),
      respuesta_seguridad: req.body.respuesta_seguridad.trim(),
      foto_perfil: null,
    };

    if (req.file) {
      userData.foto_perfil = `/uploads/${req.file.filename}`;
    } else if (req.body.foto_perfil) {
      userData.foto_perfil = req.body.foto_perfil;
    }

    const usuario = await Usuario.create(userData);
    res.status(201).json({
      success: true,
      message: 'Usuario creado correctamente',
      data: usuario
    });
  } catch (error) {
    console.error('Error en create usuario:', error);
    if (error.message && error.message.includes('duplicate key')) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }
    next(error);
  }
};

// Actualizar un usuario
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.update(id, req.body);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Usuario actualizado correctamente',
      data: usuario
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un usuario
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Usuario.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

// Login de usuario
exports.login = async (req, res, next) => {
  try {
    const { email, contrasena } = req.body;
    
    if (!email || !contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }
    
    // Buscar usuario por email (incluyendo contraseña para validación)
    const usuario = await Usuario.findByEmail(email);
    
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }
    
    // Validar contraseña (comparación simple)
    if (usuario.contrasena !== contrasena) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }
    
    // Generar token JWT
    const { generateToken } = require('../utils/jwt');
    const token = generateToken({
      id_usuario: usuario.id_usuario,
      email: usuario.email
    });
    
    // Retornar datos del usuario sin la contraseña
    const { contrasena: _, ...usuarioSinPassword } = usuario;
    
    res.json({
      success: true,
      message: 'Login exitoso',
      data: usuarioSinPassword,
      token: token
    });
  } catch (error) {
    next(error);
  }
};

// Verificar credenciales de seguridad para recuperar contraseña
exports.verifySecurity = async (req, res, next) => {
  try {
    const { email, pregunta_seguridad, respuesta_seguridad } = req.body;
    
    if (!email || !pregunta_seguridad || !respuesta_seguridad) {
      return res.status(400).json({
        success: false,
        message: 'Email, pregunta de seguridad y respuesta son requeridos'
      });
    }
    
    // Buscar usuario por email
    const usuario = await Usuario.findByEmail(email);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar pregunta y respuesta de seguridad
    if (usuario.pregunta_seguridad !== pregunta_seguridad || 
        usuario.respuesta_seguridad !== respuesta_seguridad) {
      return res.status(401).json({
        success: false,
        message: 'Pregunta o respuesta de seguridad incorrectas'
      });
    }
    
    res.json({
      success: true,
      message: 'Credenciales verificadas correctamente',
      data: {
        id_usuario: usuario.id_usuario,
        email: usuario.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// Resetear contraseña
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, nueva_contrasena } = req.body;
    
    if (!email || !nueva_contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Email y nueva contraseña son requeridos'
      });
    }
    
    if (nueva_contrasena.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }
    
    // Buscar usuario por email
    const usuario = await Usuario.findByEmail(email);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Actualizar contraseña
    const usuarioActualizado = await Usuario.update(usuario.id_usuario, {
      contrasena: nueva_contrasena
    });
    
    if (!usuarioActualizado) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar la contraseña'
      });
    }
    
    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    next(error);
  }
};

// Verificar token JWT
exports.verifyToken = async (req, res, next) => {
  try {
    const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
    
    // Extraer token del header
    const token = extractTokenFromHeader(req.headers);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    // Verificar token
    const decoded = verifyToken(token);
    
    // Obtener datos actualizados del usuario
    const usuario = await Usuario.findById(decoded.id_usuario);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Retornar datos del usuario sin la contraseña
    const { contrasena: _, ...usuarioSinPassword } = usuario;
    
    res.json({
      success: true,
      message: 'Token válido',
      data: usuarioSinPassword
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Token inválido o expirado'
    });
  }
};

