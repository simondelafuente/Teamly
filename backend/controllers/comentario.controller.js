const Comentario = require('../models/comentario.model');

// Obtener todos los comentarios
exports.getAll = async (req, res, next) => {
  try {
    const comentarios = await Comentario.findAll();
    res.json({
      success: true,
      data: comentarios,
      count: comentarios.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un comentario por ID
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comentario = await Comentario.findById(id);
    
    if (!comentario) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: comentario
    });
  } catch (error) {
    next(error);
  }
};

// Obtener comentarios de un usuario (comentarios que recibió)
exports.getByUsuarioComentado = async (req, res, next) => {
  try {
    const { idUsuario } = req.params;
    const comentarios = await Comentario.findByUsuarioComentado(idUsuario);
    res.json({
      success: true,
      data: comentarios,
      count: comentarios.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener comentarios hechos por un usuario
exports.getByUsuario = async (req, res, next) => {
  try {
    const { idUsuario } = req.params;
    const comentarios = await Comentario.findByUsuario(idUsuario);
    res.json({
      success: true,
      data: comentarios,
      count: comentarios.length
    });
  } catch (error) {
    next(error);
  }
};

// Verificar si ya existe un comentario entre dos usuarios
exports.checkByUsuarios = async (req, res, next) => {
  try {
    const { idUsuario, idUsuarioComentado } = req.query;
    if (!idUsuario || !idUsuarioComentado) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren idUsuario e idUsuarioComentado'
      });
    }
    const comentario = await Comentario.findByUsuarios(idUsuario, idUsuarioComentado);
    res.json({
      success: true,
      exists: comentario !== null,
      data: comentario
    });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo comentario
exports.create = async (req, res, next) => {
  try {
    const comentario = await Comentario.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Comentario creado correctamente',
      data: comentario
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un comentario
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comentario = await Comentario.update(id, req.body);
    
    if (!comentario) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Comentario actualizado correctamente',
      data: comentario
    });
  } catch (error) {
    console.error('Error en controller al actualizar comentario:', error);
    next(error);
  }
};

// Eliminar un comentario
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Comentario.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Comentario eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

