const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');

// Rutas de usuarios
router.get('/', usuarioController.getAll);
router.get('/email/:email', usuarioController.getByEmail);
router.get('/:id', usuarioController.getById);
router.post('/', usuarioController.create);
router.post('/login', usuarioController.login);
router.put('/:id', usuarioController.update);
router.delete('/:id', usuarioController.delete);

module.exports = router;

