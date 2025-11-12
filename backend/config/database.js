const { Pool } = require('pg');


const connectionString = process.env.SUPABASE_DB_URL;
const requiresSSL = connectionString && (
  connectionString.includes('supabase.co') || 
  connectionString.includes('supabase') ||
  process.env.DB_REQUIRE_SSL === 'true'
);

const poolConfig = {
  connectionString: connectionString,
  max: requiresSSL ? 3 : 5, 
  min: 0,
  idleTimeoutMillis: requiresSSL ? 5000 : 10000, 
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: false,
  statement_timeout: 30000,
  ...(requiresSSL && {
    keepAlive: true,
    keepAliveInitialDelayMillis: 0,
  }),
};

if (requiresSSL) {
  poolConfig.ssl = { rejectUnauthorized: false };
} else if (connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')) {
  poolConfig.ssl = false;
}


const pool = new Pool(poolConfig);


const connectDB = async () => {
  if (!connectionString) {
    console.error(' Error: SUPABASE_DB_URL no está configurada en el archivo .env');
    console.error('   Por favor, crea un archivo .env en el directorio backend con:');
    console.error('   SUPABASE_DB_URL=tu_url_de_conexion');
    process.exit(1);
  }

  try {
    const client = await pool.connect();
    const dbType = requiresSSL ? 'Supabase' : 'PostgreSQL';
    console.log(` Conectado a ${dbType} (PostgreSQL)`);
    client.release();
    return pool;
  } catch (error) {
    console.error(' Error conectando a la base de datos:', error.message);
    if (error.message.includes('SSL')) {
      console.error('   Sugerencia: Si usas Supabase, asegúrate de que la URL sea correcta.');
      console.error('   Si usas PostgreSQL local, verifica que la URL no requiera SSL.');
    }
    process.exit(1);
  }
};


pool.on('error', (err) => {
  const errorMessage = err.message || err.toString();
  
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
});

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
      console.log(' Reintentando query después de error de conexión...');
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

