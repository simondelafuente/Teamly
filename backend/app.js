const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
const indexRoutes = require('./routes/index.routes');
app.use('/api', indexRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a Teamly Backend',
    status: 'OK'
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;

