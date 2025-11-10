const Publicacion = require('../models/publicacion.model');

// Obtener todas las publicaciones
exports.getAll = async (req, res, next) => {
  try {
    const publicaciones = await Publicacion.findAll();
    // Log para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === 'development' && publicaciones.length > 0) {
      console.log('📋 Publicaciones obtenidas:', publicaciones.length);
      console.log('🔍 Ejemplo de publicación:', {
        id: publicaciones[0].id_publicacion,
        titulo: publicaciones[0].titulo,
        id_actividad: publicaciones[0].id_actividad,
        nombre_actividad: publicaciones[0].nombre_actividad,
        actividad_tipo: publicaciones[0].actividad_tipo,
        actividad_imagen: publicaciones[0].actividad_imagen
      });
    }
    res.json({
      success: true,
      data: publicaciones,
      count: publicaciones.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener una publicación por ID
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const publicacion = await Publicacion.findById(id);
    
    if (!publicacion) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: publicacion
    });
  } catch (error) {
    next(error);
  }
};

// Obtener publicaciones por usuario
exports.getByUsuario = async (req, res, next) => {
  try {
    const { idUsuario } = req.params;
    const publicaciones = await Publicacion.findByUsuario(idUsuario);
    res.json({
      success: true,
      data: publicaciones,
      count: publicaciones.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener publicaciones por actividad
exports.getByActividad = async (req, res, next) => {
  try {
    const { idActividad } = req.params;
    const publicaciones = await Publicacion.findByActividad(idActividad);
    res.json({
      success: true,
      data: publicaciones,
      count: publicaciones.length
    });
  } catch (error) {
    next(error);
  }
};

// Crear una nueva publicación
exports.create = async (req, res, next) => {
  try {
    const publicacion = await Publicacion.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Publicación creada correctamente',
      data: publicacion
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar una publicación
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const publicacion = await Publicacion.update(id, req.body);
    
    if (!publicacion) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Publicación actualizada correctamente',
      data: publicacion
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar una publicación
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Publicacion.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Publicación eliminada correctamente'
    });
  } catch (error) {
    next(error);
  }
};

