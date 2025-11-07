require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 3000;

// Iniciar servidor después de conectar a la base de datos
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en el puerto: ${PORT}`);
      console.log(`http://localhost:${PORT} y http://192.168.0.67:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

