const express = require('express');
const router = express.Router();
const puntuacionController = require('../controllers/puntuacion.controller');

// Rutas de puntuaciones
router.get('/', puntuacionController.getAll);
router.get('/usuario/:idUsuario/promedio', puntuacionController.getPromedioByUsuario);
router.get('/usuario/:idUsuario', puntuacionController.getByUsuarioPuntuado);
router.get('/:id', puntuacionController.getById);
router.post('/', puntuacionController.create);
router.post('/create-or-update', puntuacionController.createOrUpdate);
router.put('/:id', puntuacionController.update);
router.delete('/:id', puntuacionController.delete);

module.exports = router;

