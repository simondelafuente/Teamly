require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Actividad = require('../models/actividad.model');
const { connectDB } = require('../config/database');

// Mapeo de nombres de archivos a nombres de actividades y tipos
const actividadesConfig = {
  'basquet.jpg': {
    nombre: 'Básquet',
    tipo: 'Deporte'
  },
  'cs2.jpg': {
    nombre: 'Counter-Strike 2',
    tipo: 'Videojuego'
  },
  'futbol.jpg': {
    nombre: 'Fútbol',
    tipo: 'Deporte'
  },
  'lol.jpg': {
    nombre: 'League of Legends',
    tipo: 'Videojuego'
  },
  'padel.jpg': {
    nombre: 'Pádel',
    tipo: 'Deporte'
  },
  'rocket.jpg': {
    nombre: 'Rocket League',
    tipo: 'Videojuego'
  },
  'tenis.jpg': {
    nombre: 'Tenis',
    tipo: 'Deporte'
  }
};

async function seedActividades() {
  try {
    console.log('🏃 Iniciando proceso de seeding de actividades...\n');
    
    // Conectar a la base de datos
    await connectDB();
    console.log('✅ Conectado a la base de datos\n');

    // Ruta a la carpeta de actividades
    const actividadesDir = path.join(__dirname, '../uploads/actividades');
    
    // Verificar que la carpeta existe
    if (!fs.existsSync(actividadesDir)) {
      console.error(`❌ Error: La carpeta ${actividadesDir} no existe`);
      console.error('   Por favor, asegúrate de que la carpeta uploads/actividades existe y contiene las imágenes.');
      process.exit(1);
    }

    // Leer archivos de la carpeta
    const archivos = fs.readdirSync(actividadesDir);
    console.log(`📁 Archivos encontrados en uploads/actividades: ${archivos.length}\n`);

    let actividadesCreadas = 0;
    let actividadesActualizadas = 0;
    let actividadesOmitidas = 0;

    // Procesar cada archivo de imagen
    for (const archivo of archivos) {
      // Solo procesar archivos de imagen
      const extensionesPermitidas = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const ext = path.extname(archivo).toLowerCase();
      
      if (!extensionesPermitidas.includes(ext)) {
        console.log(`   ⚠️  Omitiendo ${archivo} (no es una imagen)`);
        continue;
      }

      try {
        // Buscar configuración para este archivo
        const config = actividadesConfig[archivo];
        
        if (!config) {
          console.log(`   ⚠️  No hay configuración para ${archivo}, usando nombre del archivo`);
          // Generar nombre basado en el archivo
          const nombreBase = path.basename(archivo, ext);
          const nombreActividad = nombreBase.charAt(0).toUpperCase() + nombreBase.slice(1);
          const tipo = 'Deporte'; // Por defecto
          
          await crearOActualizarActividad(nombreActividad, archivo, tipo);
          actividadesCreadas++;
          continue;
        }

        const { nombre, tipo } = config;
        
        // Verificar si la actividad ya existe
        const actividadesExistentes = await Actividad.findAll();
        const actividadExistente = actividadesExistentes.find(
          act => act.nombre_actividad.toLowerCase() === nombre.toLowerCase()
        );

        if (actividadExistente) {
          // Actualizar la imagen y tipo si es diferente
          const imagenPath = `/uploads/actividades/${archivo}`;
          const necesitaActualizacion = 
            actividadExistente.imagen !== imagenPath || 
            (actividadExistente.tipo && actividadExistente.tipo !== tipo);
          
          if (necesitaActualizacion) {
            await Actividad.update(actividadExistente.id_actividad, {
              imagen: imagenPath,
              tipo: tipo
            });
            console.log(`   🔄 Actividad actualizada: ${nombre} (${tipo})`);
            actividadesActualizadas++;
          } else {
            console.log(`   ⏭️  Actividad ya existe: ${nombre} (omitida)`);
            actividadesOmitidas++;
          }
        } else {
          // Crear nueva actividad
          await crearOActualizarActividad(nombre, archivo, tipo);
          actividadesCreadas++;
        }
      } catch (error) {
        console.error(`   ❌ Error procesando ${archivo}:`, error.message);
      }
    }

    // Resumen final
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 RESUMEN DEL SEEDING DE ACTIVIDADES');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Actividades creadas: ${actividadesCreadas}`);
    console.log(`🔄 Actividades actualizadas: ${actividadesActualizadas}`);
    console.log(`⏭️  Actividades omitidas: ${actividadesOmitidas}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n✅ ¡Seeding de actividades completado exitosamente! 🎉\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante el seeding de actividades:', error);
    process.exit(1);
  }
}

// Función auxiliar para crear o actualizar actividad
async function crearOActualizarActividad(nombre, archivo, tipo) {
  const imagenPath = `/uploads/actividades/${archivo}`;
  
  // Intentar crear con tipo (el modelo manejará si el campo no existe)
  const actividad = await Actividad.create({
    nombre_actividad: nombre,
    imagen: imagenPath,
    tipo: tipo
  });
  
  console.log(`   ✅ Actividad creada: ${nombre} (${tipo}) - ${imagenPath}`);
  return actividad;
}

// Ejecutar el seeding
seedActividades();

