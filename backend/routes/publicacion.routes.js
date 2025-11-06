const express = require('express');
const router = express.Router();
const publicacionController = require('../controllers/publicacion.controller');

// Rutas de publicaciones
router.get('/', publicacionController.getAll);
router.get('/usuario/:idUsuario', publicacionController.getByUsuario);
router.get('/actividad/:idActividad', publicacionController.getByActividad);
router.get('/:id', publicacionController.getById);
router.post('/', publicacionController.create);
router.put('/:id', publicacionController.update);
router.delete('/:id', publicacionController.delete);

module.exports = router;

