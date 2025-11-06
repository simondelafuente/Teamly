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
    const usuario = await Usuario.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Usuario creado correctamente',
      data: usuario
    });
  } catch (error) {
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
    
    // Validar contraseña (comparación simple - en producción usar bcrypt)
    if (usuario.contrasena !== contrasena) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }
    
    // Retornar datos del usuario sin la contraseña
    const { contrasena: _, ...usuarioSinPassword } = usuario;
    
    res.json({
      success: true,
      message: 'Login exitoso',
      data: usuarioSinPassword
    });
  } catch (error) {
    next(error);
  }
};

