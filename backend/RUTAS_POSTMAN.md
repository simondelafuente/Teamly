# Documentación de Rutas API - Teamly

Base URL: `http://localhost:3000/api`

## 📋 Tabla de Contenidos
- [Usuarios](#usuarios)
- [Actividades](#actividades)
- [Publicaciones](#publicaciones)
- [Puntuaciones](#puntuaciones)
- [Comentarios](#comentarios)
- [Mensajes](#mensajes)

---

## 👤 Usuarios

### GET /api/usuarios
Obtener todos los usuarios

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 0
}
```

### GET /api/usuarios/:id
Obtener un usuario por ID

**Parámetros:**
- `id` (UUID): ID del usuario

**Response:**
```json
{
  "success": true,
  "data": {
    "id_usuario": "uuid",
    "nombre_completo": "string",
    "email": "string",
    "foto_perfil": "string",
    ...
  }
}
```

### GET /api/usuarios/email/:email
Obtener un usuario por email

**Parámetros:**
- `email` (string): Email del usuario

### POST /api/usuarios
Crear un nuevo usuario

**Body (JSON):**
```json
{
  "nombre_completo": "Juan Pérez",
  "email": "juan@example.com",
  "contrasena": "password123",
  "pregunta_seguridad": "¿Cuál es tu color favorito?",
  "respuesta_seguridad": "Azul",
  "foto_perfil": "https://example.com/foto.jpg",
  "fcm_token": "token_fcm"
}
```

### PUT /api/usuarios/:id
Actualizar un usuario

**Parámetros:**
- `id` (UUID): ID del usuario

**Body (JSON):** (todos los campos son opcionales)
```json
{
  "nombre_completo": "Juan Pérez Actualizado",
  "email": "nuevo@example.com",
  "contrasena": "nuevapassword",
  "foto_perfil": "https://example.com/nueva-foto.jpg"
}
```

### DELETE /api/usuarios/:id
Eliminar un usuario

**Parámetros:**
- `id` (UUID): ID del usuario

---

## 🎯 Actividades

### GET /api/actividades
Obtener todas las actividades

### GET /api/actividades/:id
Obtener una actividad por ID

**Parámetros:**
- `id` (UUID): ID de la actividad

### POST /api/actividades
Crear una nueva actividad

**Body (JSON):**
```json
{
  "nombre_actividad": "Fútbol",
  "imagen": "https://example.com/futbol.jpg"
}
```

### PUT /api/actividades/:id
Actualizar una actividad

**Parámetros:**
- `id` (UUID): ID de la actividad

**Body (JSON):**
```json
{
  "nombre_actividad": "Fútbol Sala",
  "imagen": "https://example.com/futbol-sala.jpg"
}
```

### DELETE /api/actividades/:id
Eliminar una actividad

**Parámetros:**
- `id` (UUID): ID de la actividad

---

## 📝 Publicaciones

### GET /api/publicaciones
Obtener todas las publicaciones (con información de usuario y actividad)

### GET /api/publicaciones/:id
Obtener una publicación por ID

**Parámetros:**
- `id` (UUID): ID de la publicación

### GET /api/publicaciones/usuario/:idUsuario
Obtener publicaciones de un usuario específico

**Parámetros:**
- `idUsuario` (UUID): ID del usuario

### GET /api/publicaciones/actividad/:idActividad
Obtener publicaciones de una actividad específica

**Parámetros:**
- `idActividad` (UUID): ID de la actividad

### POST /api/publicaciones
Crear una nueva publicación

**Body (JSON):**
```json
{
  "titulo": "Partido de Fútbol",
  "direccion": "Campo Deportivo Central",
  "fecha": "2024-12-25",
  "hora": "18:00:00",
  "id_usuario": "uuid-del-usuario",
  "id_actividad": "uuid-de-la-actividad"
}
```

### PUT /api/publicaciones/:id
Actualizar una publicación

**Parámetros:**
- `id` (UUID): ID de la publicación

**Body (JSON):**
```json
{
  "titulo": "Partido de Fútbol Actualizado",
  "direccion": "Nueva Dirección",
  "fecha": "2024-12-26",
  "hora": "19:00:00"
}
```

### DELETE /api/publicaciones/:id
Eliminar una publicación

**Parámetros:**
- `id` (UUID): ID de la publicación

---

## ⭐ Puntuaciones

### GET /api/puntuaciones
Obtener todas las puntuaciones

### GET /api/puntuaciones/:id
Obtener una puntuación por ID

**Parámetros:**
- `id` (UUID): ID de la puntuación

### GET /api/puntuaciones/usuario/:idUsuario
Obtener todas las puntuaciones que recibió un usuario

**Parámetros:**
- `idUsuario` (UUID): ID del usuario puntuado

### GET /api/puntuaciones/usuario/:idUsuario/promedio
Obtener el promedio de puntuación de un usuario

**Parámetros:**
- `idUsuario` (UUID): ID del usuario

**Response:**
```json
{
  "success": true,
  "data": {
    "promedio": "4.5",
    "total_puntuaciones": "10"
  }
}
```

### POST /api/puntuaciones
Crear una nueva puntuación

**Body (JSON):**
```json
{
  "id_usuario": "uuid-del-usuario-que-puntua",
  "id_usuario_puntuado": "uuid-del-usuario-puntuado",
  "puntuacion": 5
}
```

**Nota:** La puntuación debe estar entre 1 y 5. Solo se puede puntuar una vez por usuario.

### POST /api/puntuaciones/create-or-update
Crear o actualizar una puntuación (si ya existe, la actualiza)

**Body (JSON):**
```json
{
  "id_usuario": "uuid-del-usuario-que-puntua",
  "id_usuario_puntuado": "uuid-del-usuario-puntuado",
  "puntuacion": 4
}
```

### PUT /api/puntuaciones/:id
Actualizar una puntuación

**Parámetros:**
- `id` (UUID): ID de la puntuación

**Body (JSON):**
```json
{
  "puntuacion": 5
}
```

### DELETE /api/puntuaciones/:id
Eliminar una puntuación

**Parámetros:**
- `id` (UUID): ID de la puntuación

---

## 💬 Comentarios

### GET /api/comentarios
Obtener todos los comentarios

### GET /api/comentarios/:id
Obtener un comentario por ID

**Parámetros:**
- `id` (UUID): ID del comentario

### GET /api/comentarios/usuario/:idUsuario
Obtener comentarios que recibió un usuario

**Parámetros:**
- `idUsuario` (UUID): ID del usuario comentado

### GET /api/comentarios/hechos-por/:idUsuario
Obtener comentarios hechos por un usuario

**Parámetros:**
- `idUsuario` (UUID): ID del usuario que hizo los comentarios

### POST /api/comentarios
Crear un nuevo comentario

**Body (JSON):**
```json
{
  "contenido": "Excelente jugador, muy recomendado!",
  "id_usuario": "uuid-del-usuario-que-comenta",
  "id_usuario_comentado": "uuid-del-usuario-comentado"
}
```

### PUT /api/comentarios/:id
Actualizar un comentario

**Parámetros:**
- `id` (UUID): ID del comentario

**Body (JSON):**
```json
{
  "contenido": "Comentario actualizado"
}
```

### DELETE /api/comentarios/:id
Eliminar un comentario

**Parámetros:**
- `id` (UUID): ID del comentario

---

## 📨 Mensajes

### GET /api/mensajes
Obtener todos los mensajes

### GET /api/mensajes/:id
Obtener un mensaje por ID

**Parámetros:**
- `id` (UUID): ID del mensaje

### GET /api/mensajes/conversacion/:idUsuario1/:idUsuario2
Obtener la conversación completa entre dos usuarios

**Parámetros:**
- `idUsuario1` (UUID): ID del primer usuario
- `idUsuario2` (UUID): ID del segundo usuario

### GET /api/mensajes/emisor/:idEmisor
Obtener mensajes enviados por un usuario

**Parámetros:**
- `idEmisor` (UUID): ID del usuario emisor

### GET /api/mensajes/receptor/:idReceptor
Obtener mensajes recibidos por un usuario

**Parámetros:**
- `idReceptor` (UUID): ID del usuario receptor

### POST /api/mensajes
Crear un nuevo mensaje

**Body (JSON):**
```json
{
  "id_emisor": "uuid-del-usuario-emisor",
  "id_receptor": "uuid-del-usuario-receptor",
  "contenido": "Hola, ¿quieres jugar fútbol mañana?"
}
```

### PUT /api/mensajes/:id
Actualizar un mensaje

**Parámetros:**
- `id` (UUID): ID del mensaje

**Body (JSON):**
```json
{
  "contenido": "Mensaje actualizado"
}
```

### DELETE /api/mensajes/:id
Eliminar un mensaje

**Parámetros:**
- `id` (UUID): ID del mensaje

---

## 🔧 Notas para Postman

1. **Base URL:** Configura la variable de entorno `base_url` como `http://localhost:3000/api`

2. **Headers:** Para todas las peticiones, asegúrate de incluir:
   ```
   Content-Type: application/json
   ```

3. **UUIDs:** Todos los IDs son UUIDs. Asegúrate de usar UUIDs válidos en tus pruebas.

4. **Fechas:** El formato de fecha es `YYYY-MM-DD` y el formato de hora es `HH:MM:SS`

5. **Respuestas de Error:** Todas las rutas devuelven errores en el siguiente formato:
   ```json
   {
     "success": false,
     "message": "Mensaje de error"
   }
   ```

6. **Códigos de Estado:**
   - `200`: Éxito
   - `201`: Creado exitosamente
   - `404`: No encontrado
   - `500`: Error del servidor

---

## 📝 Ejemplo de Flujo Completo

1. **Crear un usuario:**
   ```
   POST /api/usuarios
   Body: { "nombre_completo": "Juan", "email": "juan@test.com", "contrasena": "123" }
   ```

2. **Crear una actividad:**
   ```
   POST /api/actividades
   Body: { "nombre_actividad": "Fútbol", "imagen": "url" }
   ```

3. **Crear una publicación:**
   ```
   POST /api/publicaciones
   Body: { "titulo": "Partido", "direccion": "Campo", "fecha": "2024-12-25", "hora": "18:00", "id_usuario": "...", "id_actividad": "..." }
   ```

4. **Crear una puntuación:**
   ```
   POST /api/puntuaciones
   Body: { "id_usuario": "...", "id_usuario_puntuado": "...", "puntuacion": 5 }
   ```

5. **Crear un comentario:**
   ```
   POST /api/comentarios
   Body: { "contenido": "Excelente!", "id_usuario": "...", "id_usuario_comentado": "..." }
   ```

6. **Enviar un mensaje:**
   ```
   POST /api/mensajes
   Body: { "id_emisor": "...", "id_receptor": "...", "contenido": "Hola!" }
   ```

