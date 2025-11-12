require('dotenv').config();
const Usuario = require('../models/usuario.model');
const Publicacion = require('../models/publicacion.model');
const Comentario = require('../models/comentario.model');
const Puntuacion = require('../models/puntuacion.model');
const Actividad = require('../models/actividad.model');
const Mensaje = require('../models/mensaje.model');
const { connectDB } = require('../config/database');

// Datos de usuarios de prueba
const usuariosData = [
  { nombre: 'Carlos Martínez', email: 'carlos.martinez@test.com' },
  { nombre: 'Ana García', email: 'ana.garcia@test.com' },
  { nombre: 'Luis Rodríguez', email: 'luis.rodriguez@test.com' },
  { nombre: 'María López', email: 'maria.lopez@test.com' },
  { nombre: 'Juan Pérez', email: 'juan.perez@test.com' },
  { nombre: 'Laura Sánchez', email: 'laura.sanchez@test.com' },
  { nombre: 'Pedro Fernández', email: 'pedro.fernandez@test.com' },
  { nombre: 'Sofía Torres', email: 'sofia.torres@test.com' },
  { nombre: 'Diego Ramírez', email: 'diego.ramirez@test.com' },
  { nombre: 'Carmen Jiménez', email: 'carmen.jimenez@test.com' },
  { nombre: 'Miguel Hernández', email: 'miguel.hernandez@test.com' },
  { nombre: 'Elena Ruiz', email: 'elena.ruiz@test.com' }
];

// Datos de publicaciones variadas
const publicacionesData = [
  { titulo: 'Partido de fútbol en el parque', direccion: 'Parque Central, Calle Principal 123', zona: 'Centro', vacantes: 8, fecha: '2024-12-20', hora: '18:00' },
  { titulo: 'Torneo de básquet', direccion: 'Polideportivo Municipal', zona: 'Norte', vacantes: 10, fecha: '2024-12-21', hora: '19:30' },
  { titulo: 'Partido de padel', direccion: 'Club Deportivo Los Pinos', zona: 'Sur', vacantes: 2, fecha: '2024-12-22', hora: '17:00' },
  { titulo: 'Sesión de tenis', direccion: 'Canchas de Tenis Municipal', zona: 'Este', vacantes: 2, fecha: '2024-12-23', hora: '16:00' },
  { titulo: 'Partido de fútbol 5', direccion: 'Cancha Sintética La Esperanza', zona: 'Oeste', vacantes: 6, fecha: '2024-12-24', hora: '20:00' },
  { titulo: 'Torneo de CS2', direccion: 'Online - Discord', zona: null, vacantes: 8, fecha: '2024-12-20', hora: '21:00' },
  { titulo: 'Ranked de League of Legends', direccion: 'Online - Summoner\'s Rift', zona: null, vacantes: 5, fecha: '2024-12-21', hora: '22:00' },
  { titulo: 'Partido de Rocket League', direccion: 'Online - Steam', zona: null, vacantes: 6, fecha: '2024-12-22', hora: '19:00' },
  { titulo: 'Partido de fútbol amistoso', direccion: 'Campo Deportivo San Juan', zona: 'Centro', vacantes: 14, fecha: '2024-12-25', hora: '18:30' },
  { titulo: 'Entrenamiento de básquet', direccion: 'Gimnasio Municipal', zona: 'Norte', vacantes: 12, fecha: '2024-12-26', hora: '17:30' },
  { titulo: 'Partido de padel dobles', direccion: 'Club Deportivo El Roble', zona: 'Sur', vacantes: 2, fecha: '2024-12-27', hora: '18:00' },
  { titulo: 'Torneo de tenis', direccion: 'Club Tenis La Villa', zona: 'Este', vacantes: 4, fecha: '2024-12-28', hora: '16:30' },
  { titulo: 'Sesión de CS2 competitivo', direccion: 'Online - Faceit', zona: null, vacantes: 5, fecha: '2024-12-23', hora: '20:00' },
  { titulo: 'Aram de League of Legends', direccion: 'Online - Howling Abyss', zona: null, vacantes: 5, fecha: '2024-12-24', hora: '21:30' },
  { titulo: 'Torneo de Rocket League', direccion: 'Online - Epic Games', zona: null, vacantes: 6, fecha: '2024-12-25', hora: '20:30' },
  { titulo: 'Partido de fútbol 7', direccion: 'Campo Deportivo Los Álamos', zona: 'Oeste', vacantes: 10, fecha: '2024-12-29', hora: '19:00' },
  { titulo: 'Partido de básquet 3x3', direccion: 'Cancha Exterior Parque Norte', zona: 'Norte', vacantes: 6, fecha: '2024-12-30', hora: '18:00' },
  { titulo: 'Partido de padel mixto', direccion: 'Club Padel Central', zona: 'Centro', vacantes: 2, fecha: '2024-12-31', hora: '17:30' },
  { titulo: 'Partido de tenis individual', direccion: 'Canchas Club Deportivo', zona: 'Sur', vacantes: 2, fecha: '2025-01-01', hora: '15:00' },
  { titulo: 'Sesión gaming CS2', direccion: 'Online - Steam', zona: null, vacantes: 5, fecha: '2024-12-26', hora: '22:00' }
];

// Comentarios de ejemplo
const comentariosEjemplo = [
  'Excelente jugador, muy puntual y respetuoso.',
  'Gran compañero de equipo, lo recomiendo.',
  'Muy buena experiencia jugando juntos.',
  'Jugador experimentado y amigable.',
  'Se nota que tiene experiencia, jugó muy bien.',
  'Persona confiable y buen deportista.',
  'Muy profesional y divertido al mismo tiempo.',
  'Excelente comunicación durante el partido.',
  'Jugador talentoso, espero volver a jugar con él.',
  'Muy buen ambiente, lo pasamos genial.',
  'Recomendado 100%, muy buen nivel.',
  'Persona agradable y buen compañero.',
  'Jugó muy bien, definitivamente volvería a invitarle.',
  'Muy puntual y organizado.',
  'Excelente actitud y buen nivel técnico.'
];

// Mensajes de ejemplo para conversaciones
const mensajesEjemplo = [
  'Hola! Me interesa unirme a tu publicación. ¿Todavía hay vacantes disponibles?',
  '¿A qué hora es el partido? Me gustaría participar.',
  'Perfecto, me apunto. ¿Dónde nos encontramos?',
  'Hola, vi tu publicación y me interesa mucho. ¿Puedo unirme?',
  '¿Qué nivel de juego buscas? No quiero que se sienta desbalanceado.',
  'Genial! Estaré ahí. ¿Necesitas que lleve algo?',
  'Hola, me encantaría participar. ¿Cuánto cuesta?',
  'Perfecto, confirmo mi asistencia. Nos vemos ahí!',
  '¿Todavía hay lugar? Me gustaría unirme si es posible.',
  'Hola! Vi tu publicación y me parece interesante. ¿Puedo unirme?',
  '¿El partido sigue en pie? Me gustaría confirmar.',
  'Genial! Me apunto. ¿Hay algún requisito especial?',
  'Hola, me interesa mucho. ¿Puedes darme más detalles?',
  'Perfecto, estaré ahí. Gracias por organizar!',
  '¿Todavía hay vacantes? Me gustaría participar.',
  'Hola! Me encantaría unirme. ¿Qué necesito llevar?',
  'Genial, me apunto. ¿A qué hora nos encontramos?',
  'Perfecto, confirmo. Nos vemos en el partido!',
  'Hola, me interesa. ¿Puedes darme la dirección exacta?',
  '¿El evento sigue confirmado? Me gustaría asistir.'
];

// Función para obtener una fecha futura aleatoria
function getRandomFutureDate(daysAhead = 30) {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + Math.floor(Math.random() * daysAhead) + 1);
  return futureDate.toISOString().split('T')[0];
}

// Función para obtener una hora aleatoria
function getRandomHour() {
  const hours = ['16:00', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];
  return hours[Math.floor(Math.random() * hours.length)];
}

// Zonas válidas disponibles en la aplicación
const zonasValidas = [
  'Recoleta',
  'Palermo',
  'San Telmo',
  'Belgrano',
  'Microcentro (Centro)',
  'Caballito',
  'Villa Urquiza',
  'Almagro',
  'Villa Devoto',
  'Puerto Madero'
];

// Función para obtener una zona aleatoria válida
function getRandomZona() {
  return getRandomElement(zonasValidas);
}

// Función para obtener un elemento aleatorio de un array
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Función para obtener múltiples elementos aleatorios únicos
function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Función para determinar el género basándose en el nombre
function determinarGenero(nombreCompleto) {
  // Extraer el primer nombre
  const primerNombre = nombreCompleto.split(' ')[0].toLowerCase();
  
  // Nombres comunes de hombres en español
  const nombresHombres = [
    'carlos', 'luis', 'juan', 'pedro', 'diego', 'miguel', 'jose', 'manuel',
    'francisco', 'antonio', 'david', 'javier', 'daniel', 'alejandro', 'mario', 'ricardo',
    'fernando', 'sergio', 'alberto', 'pablo', 'jorge', 'roberto', 'andres', 'oscar',
    'eduardo', 'rafael', 'gabriel', 'adrian', 'victor', 'raul', 'ivan', 'ruben',
    'enrique', 'arturo', 'felipe', 'sebastian', 'hugo', 'ignacio', 'rodrigo', 'esteban'
  ];
  
  // Nombres comunes de mujeres en español
  const nombresMujeres = [
    'ana', 'maria', 'laura', 'sofia', 'carmen', 'elena', 'patricia', 'monica',
    'isabel', 'cristina', 'andrea', 'paula', 'sara', 'lucia', 'claudia', 'natalia',
    'beatriz', 'teresa', 'mercedes', 'dolores', 'rosa', 'pilar', 'angeles', 'josefa',
    'francisca', 'marta', 'silvia', 'raquel', 'irene', 'noelia', 'ines', 'diana',
    'gema', 'alicia', 'susana', 'margarita', 'concepcion', 'esperanza'
  ];
  
  // Verificar si es nombre de hombre
  if (nombresHombres.includes(primerNombre)) {
    return 'hombre';
  }
  
  // Verificar si es nombre de mujer
  if (nombresMujeres.includes(primerNombre)) {
    return 'mujer';
  }
  
  // Si no se encuentra, intentar detectar por terminaciones comunes
  // Terminaciones típicas de nombres femeninos en español
  const terminacionesMujeres = ['a', 'ia', 'ina', 'ela', 'ela', 'ica', 'ela'];
  const ultimaLetra = primerNombre.slice(-1);
  const ultimasDos = primerNombre.slice(-2);
  const ultimasTres = primerNombre.slice(-3);
  
  if (terminacionesMujeres.includes(ultimaLetra) || 
      terminacionesMujeres.includes(ultimasDos) || 
      terminacionesMujeres.includes(ultimasTres)) {
    return 'mujer';
  }
  
  // Por defecto, asumir hombre (puedes cambiar esto según tu preferencia)
  return 'hombre';
}

// Función para obtener un avatar basado en el género
function obtenerAvatar(nombreCompleto) {
  const genero = determinarGenero(nombreCompleto);
  
  if (genero === 'hombre') {
    // Avatar1 o Avatar2 para hombres (aleatorio)
    const avatarNum = Math.random() < 0.5 ? 1 : 2;
    return `/uploads/avatars/avatar${avatarNum}.jpg`;
  } else {
    // Avatar3 o Avatar4 para mujeres (aleatorio)
    const avatarNum = Math.random() < 0.5 ? 3 : 4;
    return `/uploads/avatars/avatar${avatarNum}.jpg`;
  }
}

// Función para encontrar la actividad correcta basada en el título de la publicación
function encontrarActividadPorTitulo(titulo, actividades) {
  const tituloLower = titulo.toLowerCase();
  
  // Mapeo de palabras clave del título a palabras clave para buscar en actividades
  const mapeoPalabrasClave = {
    // Deportes
    'fútbol': ['fútbol', 'futbol', 'football'],
    'básquet': ['básquet', 'basquet', 'basketball', 'baloncesto'],
    'padel': ['padel', 'pádel'],
    'tenis': ['tenis', 'tennis'],
    // Gaming
    'cs2': ['cs2', 'counter-strike', 'counter strike', 'cs 2'],
    'league of legends': ['league of legends', 'lol', 'league'],
    'rocket league': ['rocket league', 'rocket']
  };
  
  // Buscar coincidencia en el título
  for (const [categoria, palabrasClave] of Object.entries(mapeoPalabrasClave)) {
    for (const palabraClave of palabrasClave) {
      if (tituloLower.includes(palabraClave)) {
        // Buscar la actividad en la lista que contenga alguna de las palabras clave
        const actividadEncontrada = actividades.find(act => {
          const nombreActLower = act.nombre_actividad.toLowerCase();
          // Buscar coincidencia parcial en el nombre de la actividad
          return palabrasClave.some(pc => nombreActLower.includes(pc.toLowerCase()));
        });
        
        if (actividadEncontrada) {
          return actividadEncontrada;
        }
        
        // Si no se encuentra por nombre, buscar por tipo
        const esGaming = ['cs2', 'league of legends', 'rocket league'].includes(categoria);
        const tipoBuscado = esGaming ? 'Gaming' : 'Deportes';
        
        const actividadPorTipo = actividades.find(act => 
          act.tipo && act.tipo.toLowerCase() === tipoBuscado.toLowerCase()
        );
        
        if (actividadPorTipo) {
          return actividadPorTipo;
        }
      }
    }
  }
  
  // Si no se encuentra ninguna coincidencia, devolver una actividad aleatoria
  console.log(`   ⚠️  No se encontró actividad específica para "${titulo}", usando aleatoria`);
  return getRandomElement(actividades);
}

async function seed() {
  try {
    console.log('🌱 Iniciando proceso de seeding...\n');
    
    // Conectar a la base de datos
    await connectDB();
    console.log('✅ Conectado a la base de datos\n');

    // 1. Crear usuarios
    console.log('👥 Creando usuarios...');
    const usuariosCreados = [];
    
    for (const usuarioData of usuariosData) {
      try {
        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.findByEmail(usuarioData.email);
        if (usuarioExistente) {
          console.log(`   ⚠️  Usuario ${usuarioData.email} ya existe, omitiendo...`);
          usuariosCreados.push(usuarioExistente);
          continue;
        }

        // Obtener avatar basado en el género del nombre
        const avatar = obtenerAvatar(usuarioData.nombre);
        
        const usuario = await Usuario.create({
          nombre_completo: usuarioData.nombre,
          email: usuarioData.email,
          contrasena: 'password123', // Contraseña simple para testing
          pregunta_seguridad: '¿Cuál es el nombre de tu mascota?',
          respuesta_seguridad: 'test123',
          foto_perfil: avatar
        });
        usuariosCreados.push(usuario);
        const genero = determinarGenero(usuarioData.nombre);
        console.log(`   ✅ Usuario creado: ${usuarioData.nombre} (${usuarioData.email}) - ${genero} - ${avatar}`);
      } catch (error) {
        console.error(`   ❌ Error creando usuario ${usuarioData.email}:`, error.message);
      }
    }
    
    console.log(`\n✅ ${usuariosCreados.length} usuarios listos\n`);

    // 2. Obtener actividades existentes
    console.log('🏃 Obteniendo actividades...');
    let actividades = await Actividad.findAll();
    
    if (actividades.length === 0) {
      console.log('   ⚠️  No hay actividades en la base de datos.');
      console.log('   💡 Por favor, crea actividades primero desde la aplicación.\n');
      return;
    }
    
    console.log(`   ✅ ${actividades.length} actividades encontradas\n`);

    // 3. Crear publicaciones
    console.log('📝 Creando publicaciones...');
    const publicacionesCreadas = [];
    
    for (let i = 0; i < publicacionesData.length && i < 20; i++) {
      const pubData = publicacionesData[i];
      
      // Seleccionar usuario aleatorio
      const usuarioAleatorio = getRandomElement(usuariosCreados);
      
      // Encontrar la actividad correcta basada en el título
      const actividadCorrecta = encontrarActividadPorTitulo(pubData.titulo, actividades);
      
      // Determinar la zona según el tipo de actividad
      let zonaFinal = pubData.zona;
      
      // Si la actividad es de tipo "Deporte", usar una zona válida
      if (actividadCorrecta.tipo === 'Deporte') {
        // Si pubData.zona es null o no está en las zonas válidas, asignar una aleatoria
        if (!pubData.zona || !zonasValidas.includes(pubData.zona)) {
          zonaFinal = getRandomZona();
        } else {
          zonaFinal = pubData.zona; // Mantener la zona si es válida
        }
      } else if (actividadCorrecta.tipo === 'Videojuego') {
        // Los videojuegos son online, zona debe ser null
        zonaFinal = null;
      }
      
      try {
        const publicacion = await Publicacion.create({
          titulo: pubData.titulo,
          direccion: pubData.direccion,
          zona: zonaFinal,
          vacantes_disponibles: pubData.vacantes,
          fecha: pubData.fecha || getRandomFutureDate(),
          hora: pubData.hora || getRandomHour(),
          id_usuario: usuarioAleatorio.id_usuario,
          id_actividad: actividadCorrecta.id_actividad
        });
        publicacionesCreadas.push(publicacion);
        const zonaInfo = zonaFinal ? ` - Zona: ${zonaFinal}` : ' - Online';
        console.log(`   ✅ Publicación creada: "${pubData.titulo}" por ${usuarioAleatorio.nombre_completo} (${actividadCorrecta.nombre_actividad})${zonaInfo}`);
      } catch (error) {
        console.error(`   ❌ Error creando publicación "${pubData.titulo}":`, error.message);
      }
    }
    
    console.log(`\n✅ ${publicacionesCreadas.length} publicaciones creadas\n`);

    // 4. Crear comentarios entre usuarios (cada comentario incluye una puntuación)
    console.log('💬 Creando comentarios con puntuaciones...');
    let comentariosCreados = 0;
    let puntuacionesCreadas = 0;
    
    // Crear comentarios entre diferentes usuarios
    for (let i = 0; i < usuariosCreados.length; i++) {
      for (let j = 0; j < usuariosCreados.length; j++) {
        // No comentar sobre uno mismo
        if (i === j) continue;
        
        // Crear comentario aleatoriamente (30% de probabilidad)
        if (Math.random() < 0.3) {
          try {
            // Verificar si ya existe un comentario entre estos usuarios
            const comentarioExistente = await Comentario.findByUsuarios(
              usuariosCreados[i].id_usuario,
              usuariosCreados[j].id_usuario
            );
            
            if (!comentarioExistente) {
              // Crear el comentario
              const comentario = await Comentario.create({
                contenido: getRandomElement(comentariosEjemplo),
                id_usuario: usuariosCreados[i].id_usuario,
                id_usuario_comentado: usuariosCreados[j].id_usuario
              });
              comentariosCreados++;
              
              // Crear puntuación asociada al comentario
              // Verificar si ya existe una puntuación entre estos usuarios
              const puntuacionExistente = await Puntuacion.findByUsuarios(
                usuariosCreados[i].id_usuario,
                usuariosCreados[j].id_usuario
              );
              
              if (!puntuacionExistente) {
                // Puntuación aleatoria entre 3 y 5
                const puntuacion = Math.floor(Math.random() * 3) + 3; // 3, 4 o 5
                
                await Puntuacion.create({
                  id_usuario: usuariosCreados[i].id_usuario,
                  id_usuario_puntuado: usuariosCreados[j].id_usuario,
                  puntuacion: puntuacion
                });
                puntuacionesCreadas++;
                console.log(`   ✅ Comentario + Puntuación: ${usuariosCreados[i].nombre_completo} → ${usuariosCreados[j].nombre_completo} (${puntuacion}/5)`);
              } else {
                console.log(`   ✅ Comentario: ${usuariosCreados[i].nombre_completo} → ${usuariosCreados[j].nombre_completo} (puntuación ya existía)`);
              }
            }
          } catch (error) {
            console.error(`   ❌ Error creando comentario/puntuación:`, error.message);
          }
        }
      }
    }
    
    console.log(`\n✅ ${comentariosCreados} comentarios creados`);
    console.log(`✅ ${puntuacionesCreadas} puntuaciones creadas (asociadas a comentarios)\n`);

    // 5. Crear mensajes entre usuarios
    console.log('💌 Creando mensajes entre usuarios...');
    let mensajesCreados = 0;
    
    // Crear mensajes relacionados con publicaciones
    for (let i = 0; i < publicacionesCreadas.length; i++) {
      const publicacion = publicacionesCreadas[i];
      const creadorId = publicacion.id_usuario;
      
      // Seleccionar algunos usuarios aleatorios para enviar mensajes al creador
      const usuariosInteresados = getRandomElements(
        usuariosCreados.filter(u => u.id_usuario !== creadorId),
        Math.min(3, usuariosCreados.length - 1)
      );
      
      for (const usuarioInteresado of usuariosInteresados) {
        // 60% de probabilidad de crear un mensaje
        if (Math.random() < 0.6) {
          try {
            const mensaje = await Mensaje.create({
              id_emisor: usuarioInteresado.id_usuario,
              id_receptor: creadorId,
              contenido: getRandomElement(mensajesEjemplo)
            });
            mensajesCreados++;
            console.log(`   ✅ Mensaje: ${usuarioInteresado.nombre_completo} → ${publicacion.titulo.substring(0, 30)}...`);
          } catch (error) {
            console.error(`   ❌ Error creando mensaje:`, error.message);
          }
        }
      }
    }
    
    // Crear algunos mensajes adicionales entre usuarios (no relacionados con publicaciones)
    for (let i = 0; i < usuariosCreados.length; i++) {
      for (let j = 0; j < usuariosCreados.length; j++) {
        // No enviar mensaje a uno mismo
        if (i === j) continue;
        
        // 15% de probabilidad de crear un mensaje adicional
        if (Math.random() < 0.15) {
          try {
            const mensaje = await Mensaje.create({
              id_emisor: usuariosCreados[i].id_usuario,
              id_receptor: usuariosCreados[j].id_usuario,
              contenido: getRandomElement(mensajesEjemplo)
            });
            mensajesCreados++;
            console.log(`   ✅ Mensaje: ${usuariosCreados[i].nombre_completo} → ${usuariosCreados[j].nombre_completo}`);
          } catch (error) {
            console.error(`   ❌ Error creando mensaje:`, error.message);
          }
        }
      }
    }
    
    console.log(`\n✅ ${mensajesCreados} mensajes creados\n`);

    // Resumen final
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 RESUMEN DEL SEEDING');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`👥 Usuarios: ${usuariosCreados.length}`);
    console.log(`📝 Publicaciones: ${publicacionesCreadas.length}`);
    console.log(`💬 Comentarios: ${comentariosCreados}`);
    console.log(`⭐ Puntuaciones: ${puntuacionesCreadas}`);
    console.log(`💌 Mensajes: ${mensajesCreados}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n✅ ¡Seeding completado exitosamente! 🎉\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante el seeding:', error);
    process.exit(1);
  }
}

// Ejecutar el seeding
seed();

