const express = require('express');
const router = express.Router();
const mensajeController = require('../controllers/mensaje.controller');

// Rutas de mensajes
router.get('/', mensajeController.getAll);
router.get('/conversacion/:idUsuario1/:idUsuario2', mensajeController.getConversacion);
router.get('/emisor/:idEmisor', mensajeController.getByEmisor);
router.get('/receptor/:idReceptor', mensajeController.getByReceptor);
router.get('/:id', mensajeController.getById);
router.post('/', mensajeController.create);
router.put('/:id', mensajeController.update);
router.delete('/:id', mensajeController.delete);

module.exports = router;

