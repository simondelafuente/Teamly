// Configuración de base de datos - Supabase (PostgreSQL)
const { Pool } = require('pg');

// Configuración del pool de conexiones para Supabase
const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }, // Supabase requiere SSL
  max: 5, // Reducir el máximo para evitar problemas con Supabase
  min: 0, // No mantener conexiones mínimas (Supabase las cierra)
  idleTimeoutMillis: 10000, // Cerrar conexiones inactivas después de 10 segundos
  connectionTimeoutMillis: 10000, // Timeout de conexión de 10 segundos
  allowExitOnIdle: false, // No permitir que el proceso termine cuando el pool está idle
  // Configuraciones adicionales para Supabase
  statement_timeout: 30000, // 30 segundos timeout para queries
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
  // No cerrar el proceso, solo loguear el error
  // El pool se recuperará automáticamente
});

module.exports = {
  pool,
  connectDB
};

