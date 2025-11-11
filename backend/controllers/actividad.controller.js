const Actividad = require('../models/actividad.model');

// Obtener todas las actividades
exports.getAll = async (req, res, next) => {
  try {
    const actividades = await Actividad.findAll();
    res.json({
      success: true,
      data: actividades,
      count: actividades.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener una actividad por ID
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const actividad = await Actividad.findById(id);
    
    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: actividad
    });
  } catch (error) {
    next(error);
  }
};

// Obtener actividades por tipo
exports.getByTipo = async (req, res, next) => {
  try {
    const { tipo } = req.params;
    const actividades = await Actividad.findByTipo(tipo);
    
    res.json({
      success: true,
      data: actividades,
      count: actividades.length
    });
  } catch (error) {
    console.error('Error en getByTipo:', error);
    next(error);
  }
};

// Crear una nueva actividad
exports.create = async (req, res, next) => {
  try {
    const actividad = await Actividad.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Actividad creada correctamente',
      data: actividad
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar una actividad
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const actividad = await Actividad.update(id, req.body);
    
    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Actividad actualizada correctamente',
      data: actividad
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar una actividad
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Actividad.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Actividad eliminada correctamente'
    });
  } catch (error) {
    next(error);
  }
};

