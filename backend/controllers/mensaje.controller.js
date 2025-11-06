const Mensaje = require('../models/mensaje.model');

// Obtener todos los mensajes
exports.getAll = async (req, res, next) => {
  try {
    const mensajes = await Mensaje.findAll();
    res.json({
      success: true,
      data: mensajes,
      count: mensajes.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un mensaje por ID
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mensaje = await Mensaje.findById(id);
    
    if (!mensaje) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: mensaje
    });
  } catch (error) {
    next(error);
  }
};

// Obtener conversación entre dos usuarios
exports.getConversacion = async (req, res, next) => {
  try {
    const { idUsuario1, idUsuario2 } = req.params;
    const mensajes = await Mensaje.getConversacion(idUsuario1, idUsuario2);
    res.json({
      success: true,
      data: mensajes,
      count: mensajes.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener mensajes enviados por un usuario
exports.getByEmisor = async (req, res, next) => {
  try {
    const { idEmisor } = req.params;
    const mensajes = await Mensaje.findByEmisor(idEmisor);
    res.json({
      success: true,
      data: mensajes,
      count: mensajes.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener mensajes recibidos por un usuario
exports.getByReceptor = async (req, res, next) => {
  try {
    const { idReceptor } = req.params;
    const mensajes = await Mensaje.findByReceptor(idReceptor);
    res.json({
      success: true,
      data: mensajes,
      count: mensajes.length
    });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo mensaje
exports.create = async (req, res, next) => {
  try {
    const mensaje = await Mensaje.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Mensaje enviado correctamente',
      data: mensaje
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un mensaje
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mensaje = await Mensaje.update(id, req.body);
    
    if (!mensaje) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Mensaje actualizado correctamente',
      data: mensaje
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un mensaje
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Mensaje.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Mensaje eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

