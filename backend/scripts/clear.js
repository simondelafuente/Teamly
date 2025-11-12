require('dotenv').config();
const { pool, connectDB } = require('../config/database');

// Tablas en orden de eliminación (respetando claves foráneas)
const tablas = [
  'mensajes',        // FK a usuarios
  'comentarios',     // FK a usuarios
  'puntuacion',      // FK a usuarios
  'publicaciones',   // FK a usuarios y actividades
  'usuarios',        // Tabla principal
  'actividades'      // Tabla principal
];

async function clearDatabase() {
  try {
    console.log('🧹 Iniciando limpieza de la base de datos...\n');
    
    // Conectar a la base de datos
    await connectDB();
    console.log('✅ Conectado a la base de datos\n');

    const resultados = {};

    // Borrar datos de cada tabla en orden
    for (const tabla of tablas) {
      try {
        // Contar registros antes de borrar
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${tabla}`);
        const countBefore = parseInt(countResult.rows[0].count);

        // Borrar todos los registros
        await pool.query(`DELETE FROM ${tabla}`);
        
        resultados[tabla] = countBefore;
        console.log(`   ✅ ${tabla}: ${countBefore} registro(s) eliminado(s)`);
      } catch (error) {
        console.error(`   ❌ Error al limpiar ${tabla}:`, error.message);
        resultados[tabla] = { error: error.message };
      }
    }

    // Resumen final
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 RESUMEN DE LIMPIEZA');
    console.log('═══════════════════════════════════════════════════════');
    
    let totalEliminado = 0;
    for (const [tabla, count] of Object.entries(resultados)) {
      if (typeof count === 'number') {
        console.log(`🗑️  ${tabla}: ${count} registro(s) eliminado(s)`);
        totalEliminado += count;
      } else {
        console.log(`❌ ${tabla}: Error - ${count.error}`);
      }
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n✅ Total: ${totalEliminado} registro(s) eliminado(s)`);
    console.log('✅ ¡Limpieza completada exitosamente! 🎉\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante la limpieza:', error);
    process.exit(1);
  }
}

// Ejecutar la limpieza
clearDatabase();

