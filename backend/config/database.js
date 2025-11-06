// Configuración de base de datos - Supabase (PostgreSQL)
const { Pool } = require('pg');

// Configuración del pool de conexiones para Supabase
const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }, // Supabase requiere SSL
  max: 20, // Máximo número de clientes en el pool
  idleTimeoutMillis: 30000, // Cerrar conexiones inactivas después de 30 segundos
  connectionTimeoutMillis: 30000, // Timeout de conexión de 30 segundos
});

// Función para probar la conexión
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado a Supabase (PostgreSQL)');
    client.release();
    return pool;
  } catch (error) {
    console.error('❌ Error conectando a Supabase:', error.message);
    process.exit(1);
  }
};

// Evento de error en el pool
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de conexiones:', err);
  process.exit(-1);
});

module.exports = {
  pool,
  connectDB
};

