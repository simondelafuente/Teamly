# Teamly Backend

Backend desarrollado con Node.js y Express siguiendo el patrón MVC.

## Estructura del Proyecto

```
backend/
├── config/          # Configuraciones (base de datos, etc.)
├── controllers/     # Controladores (lógica de negocio)
├── middleware/      # Middlewares personalizados
├── models/          # Modelos de datos
├── routes/          # Definición de rutas
├── views/           # Vistas (si es necesario)
├── app.js           # Configuración de Express
├── server.js        # Punto de entrada de la aplicación
└── package.json     # Dependencias del proyecto
```

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

3. Configurar variables de entorno en `.env`:
   - Obtén la URL de conexión de Supabase desde tu proyecto:
     - Ve a Settings > Database > Connection string
     - Selecciona "URI" y copia la cadena de conexión
     - Pégala en `SUPABASE_DB_URL` en tu archivo `.env`

## Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## Estructura MVC

### Models (Modelos)
Los modelos representan la estructura de datos y la lógica de acceso a la base de datos.
Ubicación: `models/`

### Views (Vistas)
Las vistas manejan la presentación de datos (opcional para APIs REST).
Ubicación: `views/`

### Controllers (Controladores)
Los controladores manejan la lógica de negocio y coordinan entre modelos y vistas.
Ubicación: `controllers/`

### Routes (Rutas)
Las rutas definen los endpoints de la API.
Ubicación: `routes/`

## Ejemplo de Uso

El proyecto incluye un ejemplo completo en:
- `routes/example.routes.js` - Rutas de ejemplo
- `controllers/example.controller.js` - Controlador de ejemplo
- `models/example.model.js` - Modelo de ejemplo

Puedes acceder a las rutas de ejemplo en:
- `GET /api/examples` - Obtener todos
- `GET /api/examples/:id` - Obtener uno por ID
- `POST /api/examples` - Crear nuevo
- `PUT /api/examples/:id` - Actualizar
- `DELETE /api/examples/:id` - Eliminar

## Configuración de Supabase

Este proyecto está configurado para usar **Supabase** como base de datos (PostgreSQL).

### Pasos para configurar:

1. **Crear un proyecto en Supabase**:
   - Ve a [supabase.com](https://supabase.com)
   - Crea una cuenta y un nuevo proyecto

2. **Obtener la URL de conexión**:
   - En tu proyecto de Supabase, ve a Settings > Database
   - En "Connection string", selecciona "URI"
   - Copia la cadena de conexión (tendrá el formato: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`)

3. **Configurar el archivo .env**:
   ```env
   SUPABASE_DB_URL=postgresql://postgres:[TU-PASSWORD]@db.[TU-PROJECT-REF].supabase.co:5432/postgres
   ```

4. **Crear tablas en Supabase**:
   - Ve al SQL Editor en Supabase
   - Ejecuta el siguiente SQL para crear la tabla de ejemplo:
   ```sql
   CREATE TABLE examples (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     description TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

### Consultas SQL útiles:

Para ver tus tablas:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

## Próximos Pasos

1. ✅ Base de datos configurada (Supabase)
2. Implementar autenticación en `middleware/auth.js` (considera usar Supabase Auth)
3. Crear tus propios modelos, controladores y rutas
4. Agregar validación de datos (considera usar `express-validator` o `joi`)
5. Agregar logging (considera usar `winston`)

## Tecnologías Utilizadas

- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **Supabase (PostgreSQL)** - Base de datos
- **pg** - Cliente PostgreSQL para Node.js
- **dotenv** - Variables de entorno
- **cors** - Manejo de CORS
- **morgan** - Logger HTTP

