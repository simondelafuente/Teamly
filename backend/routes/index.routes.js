const express = require('express');
const router = express.Router();

const usuarioRoutes = require('./usuario.routes');
const actividadRoutes = require('./actividad.routes');
const publicacionRoutes = require('./publicacion.routes');
const puntuacionRoutes = require('./puntuacion.routes');
const comentarioRoutes = require('./comentario.routes');
const mensajeRoutes = require('./mensaje.routes');

// Rutas
router.use('/usuarios', usuarioRoutes);
router.use('/actividades', actividadRoutes);
router.use('/publicaciones', publicacionRoutes);
router.use('/puntuaciones', puntuacionRoutes);
router.use('/comentarios', comentarioRoutes);
router.use('/mensajes', mensajeRoutes);

// Ruta de prueba
router.get('/', (req, res) => {
  res.json({
    message: 'API Teamly funcionando correctamente',
    endpoints: {
      usuarios: '/api/usuarios',
      actividades: '/api/actividades',
      publicaciones: '/api/publicaciones',
      puntuaciones: '/api/puntuaciones',
      comentarios: '/api/comentarios',
      mensajes: '/api/mensajes'
    }
  });
});

module.exports = router;

