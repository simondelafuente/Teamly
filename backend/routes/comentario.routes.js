const express = require('express');
const router = express.Router();
const comentarioController = require('../controllers/comentario.controller');

// Rutas de comentarios
router.get('/', comentarioController.getAll);
router.get('/verificar', comentarioController.checkByUsuarios);
router.get('/usuario/:idUsuario', comentarioController.getByUsuarioComentado);
router.get('/hechos-por/:idUsuario', comentarioController.getByUsuario);
router.get('/:id', comentarioController.getById);
router.post('/', comentarioController.create);
router.put('/:id', comentarioController.update);
router.delete('/:id', comentarioController.delete);

module.exports = router;

