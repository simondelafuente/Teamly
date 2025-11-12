const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const upload = require('../middleware/upload');

// Rutas de usuarios
router.get('/', usuarioController.getAll);
router.get('/email/:email', usuarioController.getByEmail);
router.get('/:id', usuarioController.getById);
router.post('/', (req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    upload.single('foto_perfil')(req, res, next);
  } else {
    next();
  }
}, usuarioController.create);
router.post('/login', usuarioController.login);
router.post('/verify-security', usuarioController.verifySecurity);
router.put('/reset-password', usuarioController.resetPassword);
router.put('/:id', (req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    upload.single('foto_perfil')(req, res, next);
  } else {
    next();
  }
}, usuarioController.update);
router.delete('/:id', usuarioController.delete);

module.exports = router;

