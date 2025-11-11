const express = require('express');
const router = express.Router();
const actividadController = require('../controllers/actividad.controller');

// Rutas de actividades
router.get('/', actividadController.getAll);
router.get('/tipo/:tipo', actividadController.getByTipo);
router.get('/:id', actividadController.getById);
router.post('/', actividadController.create);
router.put('/:id', actividadController.update);
router.delete('/:id', actividadController.delete);

module.exports = router;

