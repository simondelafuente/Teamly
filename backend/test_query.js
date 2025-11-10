// Script de prueba para verificar la consulta SQL
// Ejecuta con: node backend/test_query.js

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: process.env.SUPABASE_DB_URL?.includes('supabase.co') ? { rejectUnauthorized: false } : false
});

async function testQuery() {
  try {
    const result = await pool.query(
      `SELECT p.*, 
              u.nombre_completo as usuario_nombre, u.foto_perfil as usuario_foto,
              a.nombre_actividad, a.imagen as actividad_imagen, a.tipo as actividad_tipo
       FROM publicaciones p
       LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
       LEFT JOIN actividades a ON p.id_actividad = a.id_actividad
       ORDER BY p.created_at DESC
       LIMIT 3`
    );
    
    console.log('📊 Resultados de la consulta:');
    console.log('Total de filas:', result.rows.length);
    
    result.rows.forEach((row, index) => {
      console.log(`\n--- Publicación ${index + 1} ---`);
      console.log('ID:', row.id_publicacion);
      console.log('Título:', row.titulo);
      console.log('ID Actividad:', row.id_actividad);
      console.log('Nombre Actividad:', row.nombre_actividad);
      console.log('Tipo (actividad_tipo):', row.actividad_tipo);
      console.log('Tipo (directo):', row.tipo);
      console.log('Imagen:', row.actividad_imagen);
      console.log('Todas las claves:', Object.keys(row));
    });
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
  }
}

testQuery();

