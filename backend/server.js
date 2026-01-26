require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 3000;

// Iniciar servidor después de conectar a la base de datos
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, '0.0.0.0', () => {
      const os = require('os');
      const nets = os.networkInterfaces();
      let localIP = 'localhost';
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
            localIP = net.address;
            break;
          }
        }
        if (localIP !== 'localhost') break;
      }
      console.log(`Servidor corriendo en el puerto: ${PORT}`);
      console.log(`http://localhost:${PORT} y http://${localIP}:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

