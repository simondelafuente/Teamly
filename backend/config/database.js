// Configuración de base de datos - Supabase (PostgreSQL)
const { Pool } = require('pg');

// Determinar si se requiere SSL basado en la URL de conexión
const connectionString = process.env.SUPABASE_DB_URL;
const requiresSSL = connectionString && (
  connectionString.includes('supabase.co') || 
  connectionString.includes('supabase') ||
  process.env.DB_REQUIRE_SSL === 'true'
);

// Configuración base del pool
// Para Supabase: usar menos conexiones y timeouts más cortos para evitar problemas
const poolConfig = {
  connectionString: connectionString,
  max: requiresSSL ? 3 : 5, // Supabase tiene límites más estrictos
  min: 0,
  idleTimeoutMillis: requiresSSL ? 5000 : 10000, // Cerrar conexiones inactivas más rápido en Supabase
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: false,
  statement_timeout: 30000,
  // Configuración adicional para Supabase
  ...(requiresSSL && {
    keepAlive: true,
    keepAliveInitialDelayMillis: 0,
  }),
};

// Agregar SSL solo si es necesario (Supabase requiere SSL)
if (requiresSSL) {
  poolConfig.ssl = { rejectUnauthorized: false };
} else if (connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')) {
  // Para conexiones remotas que no sean localhost, intentar SSL pero no fallar si no está disponible
  poolConfig.ssl = false;
}

// Configuración del pool de conexiones
const pool = new Pool(poolConfig);

// Función para probar la conexión
const connectDB = async () => {
  if (!connectionString) {
    console.error('❌ Error: SUPABASE_DB_URL no está configurada en el archivo .env');
    console.error('   Por favor, crea un archivo .env en el directorio backend con:');
    console.error('   SUPABASE_DB_URL=tu_url_de_conexion');
    process.exit(1);
  }

  try {
    const client = await pool.connect();
    const dbType = requiresSSL ? 'Supabase' : 'PostgreSQL';
    console.log(`✅ Conectado a ${dbType} (PostgreSQL)`);
    client.release();
    return pool;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    if (error.message.includes('SSL')) {
      console.error('   Sugerencia: Si usas Supabase, asegúrate de que la URL sea correcta.');
      console.error('   Si usas PostgreSQL local, verifica que la URL no requiera SSL.');
    }
    process.exit(1);
  }
};

// Evento de error en el pool
pool.on('error', (err) => {
  // Filtrar errores comunes de Supabase que no son críticos
  const errorMessage = err.message || err.toString();
  
  // Errores que Supabase genera cuando cierra conexiones inactivas
  const ignorableErrors = [
    'client_termination',
    'shutdown',
    'Connection terminated',
    'Connection ended',
  ];
  
  const isIgnorable = ignorableErrors.some(ignorable => 
    errorMessage.includes(ignorable)
  );
  
  if (!isIgnorable) {
    console.error('⚠️ Error en el pool de conexiones:', errorMessage);
  }
  // El pool se recuperará automáticamente creando nuevas conexiones cuando sea necesario
});

// Función helper para ejecutar queries con manejo de errores mejorado
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.log('Query lenta detectada:', { text, duration: `${duration}ms` });
    }
    return result;
  } catch (error) {
    // Si es un error de conexión, intentar una vez más
    if (error.message && (
      error.message.includes('Connection terminated') ||
      error.message.includes('client_termination') ||
      error.message.includes('shutdown')
    )) {
      console.log('🔄 Reintentando query después de error de conexión...');
      try {
        return await pool.query(text, params);
      } catch (retryError) {
        throw new Error(`Error en query (reintento fallido): ${retryError.message}`);
      }
    }
    throw error;
  }
};

module.exports = {
  pool,
  connectDB,
  query
};

