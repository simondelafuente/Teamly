const Puntuacion = require('../models/puntuacion.model');

// Obtener todas las puntuaciones
exports.getAll = async (req, res, next) => {
  try {
    const puntuaciones = await Puntuacion.findAll();
    res.json({
      success: true,
      data: puntuaciones,
      count: puntuaciones.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener una puntuación por ID
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const puntuacion = await Puntuacion.findById(id);
    
    if (!puntuacion) {
      return res.status(404).json({
        success: false,
        message: 'Puntuación no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: puntuacion
    });
  } catch (error) {
    next(error);
  }
};

// Obtener puntuaciones de un usuario (puntuaciones que recibió)
exports.getByUsuarioPuntuado = async (req, res, next) => {
  try {
    const { idUsuario } = req.params;
    const puntuaciones = await Puntuacion.findByUsuarioPuntuado(idUsuario);
    res.json({
      success: true,
      data: puntuaciones,
      count: puntuaciones.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener promedio de puntuación de un usuario
exports.getPromedioByUsuario = async (req, res, next) => {
  try {
    const { idUsuario } = req.params;
    const promedio = await Puntuacion.getPromedioByUsuario(idUsuario);
    res.json({
      success: true,
      data: promedio
    });
  } catch (error) {
    next(error);
  }
};

// Crear o actualizar una puntuación
exports.createOrUpdate = async (req, res, next) => {
  try {
    const { id_usuario, id_usuario_puntuado, puntuacion } = req.body;
    
    // Verificar si ya existe una puntuación
    const existe = await Puntuacion.findByUsuarios(id_usuario, id_usuario_puntuado);
    
    if (existe) {
      // Actualizar puntuación existente
      const puntuacionActualizada = await Puntuacion.update(existe.id_puntuacion, { puntuacion });
      return res.json({
        success: true,
        message: 'Puntuación actualizada correctamente',
        data: puntuacionActualizada
      });
    } else {
      // Crear nueva puntuación
      const nuevaPuntuacion = await Puntuacion.create(req.body);
      return res.status(201).json({
        success: true,
        message: 'Puntuación creada correctamente',
        data: nuevaPuntuacion
      });
    }
  } catch (error) {
    next(error);
  }
};

// Crear una nueva puntuación
exports.create = async (req, res, next) => {
  try {
    const puntuacion = await Puntuacion.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Puntuación creada correctamente',
      data: puntuacion
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar una puntuación
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const puntuacion = await Puntuacion.update(id, req.body);
    
    if (!puntuacion) {
      return res.status(404).json({
        success: false,
        message: 'Puntuación no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Puntuación actualizada correctamente',
      data: puntuacion
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar una puntuación
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Puntuacion.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Puntuación no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Puntuación eliminada correctamente'
    });
  } catch (error) {
    next(error);
  }
};

