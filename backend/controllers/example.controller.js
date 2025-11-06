const Example = require('../models/example.model');

// Obtener todos los ejemplos
exports.getAll = async (req, res, next) => {
  try {
    const examples = await Example.findAll();
    res.json({
      success: true,
      data: examples
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un ejemplo por ID
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const example = await Example.findById(id);
    
    if (!example) {
      return res.status(404).json({
        success: false,
        message: 'Ejemplo no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: example
    });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo ejemplo
exports.create = async (req, res, next) => {
  try {
    const example = await Example.create(req.body);
    res.status(201).json({
      success: true,
      data: example
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un ejemplo
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const example = await Example.update(id, req.body);
    
    if (!example) {
      return res.status(404).json({
        success: false,
        message: 'Ejemplo no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: example
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un ejemplo
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Example.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Ejemplo no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Ejemplo eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

