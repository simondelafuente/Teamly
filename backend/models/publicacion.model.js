const { pool } = require('../config/database');

class Publicacion {
  static tableName = 'publicaciones';

  // Obtener todas las publicaciones
  static async findAll() {
    try {
      const result = await pool.query(
        `SELECT p.id_publicacion, p.titulo, p.direccion, p.zona, p.vacantes_disponibles, 
                p.fecha, p.hora, p.id_usuario, p.id_actividad, p.created_at, p.updated_at,
                u.nombre_completo as usuario_nombre, u.foto_perfil as usuario_foto,
                a.nombre_actividad, a.imagen as actividad_imagen, a.tipo as actividad_tipo
         FROM ${this.tableName} p
         LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
         LEFT JOIN actividades a ON p.id_actividad = a.id_actividad
         ORDER BY p.created_at DESC`
      );
      
      // Log para debugging
      if (process.env.NODE_ENV === 'development' && result.rows.length > 0) {
        console.log('🔍 Modelo - Primera publicación:', {
          id: result.rows[0].id_publicacion,
          titulo: result.rows[0].titulo,
          id_actividad: result.rows[0].id_actividad,
          nombre_actividad: result.rows[0].nombre_actividad,
          actividad_tipo: result.rows[0].actividad_tipo,
          'tipo (directo)': result.rows[0].tipo,
          claves: Object.keys(result.rows[0])
        });
      }
      
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener publicaciones: ${error.message}`);
    }
  }

  // Obtener una publicación por ID
  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT p.*, 
                u.nombre_completo as usuario_nombre, u.foto_perfil as usuario_foto,
                a.nombre_actividad, a.imagen as actividad_imagen, a.tipo as actividad_tipo
         FROM ${this.tableName} p
         LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
         LEFT JOIN actividades a ON p.id_actividad = a.id_actividad
         WHERE p.id_publicacion = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener publicación: ${error.message}`);
    }
  }

  // Obtener publicaciones por usuario
  static async findByUsuario(idUsuario) {
    try {
      const result = await pool.query(
        `SELECT p.*, 
                u.nombre_completo as usuario_nombre, u.foto_perfil as usuario_foto,
                a.nombre_actividad, a.imagen as actividad_imagen, a.tipo as actividad_tipo
         FROM ${this.tableName} p
         LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
         LEFT JOIN actividades a ON p.id_actividad = a.id_actividad
         WHERE p.id_usuario = $1
         ORDER BY p.created_at DESC`,
        [idUsuario]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener publicaciones por usuario: ${error.message}`);
    }
  }

  // Obtener publicaciones por actividad
  static async findByActividad(idActividad) {
    try {
      const result = await pool.query(
        `SELECT p.*, 
                u.nombre_completo as usuario_nombre, u.foto_perfil as usuario_foto,
                a.nombre_actividad, a.imagen as actividad_imagen, a.tipo as actividad_tipo
         FROM ${this.tableName} p
         LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
         LEFT JOIN actividades a ON p.id_actividad = a.id_actividad
         WHERE p.id_actividad = $1
         ORDER BY p.created_at DESC`,
        [idActividad]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener publicaciones por actividad: ${error.message}`);
    }
  }

  // Crear una nueva publicación
  static async create(data) {
    try {
      const { titulo, direccion, zona, vacantes_disponibles, fecha, hora, id_usuario, id_actividad } = data;
      let createdPublication;
      
      // Intentar insertar con zona y vacantes_disponibles
      try {
        const result = await pool.query(
          `INSERT INTO ${this.tableName} (titulo, direccion, zona, vacantes_disponibles, fecha, hora, id_usuario, id_actividad) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
           RETURNING *`,
          [titulo, direccion, zona || null, vacantes_disponibles || null, fecha, hora, id_usuario, id_actividad]
        );
        createdPublication = result.rows[0];
      } catch (error) {
        // Si alguna columna no existe, intentar sin ella
        if (error.message.includes('zona') || error.message.includes('vacantes_disponibles')) {
          try {
            // Intentar con zona pero sin vacantes
            if (!error.message.includes('zona')) {
              const { titulo, direccion, zona, fecha, hora, id_usuario, id_actividad } = data;
              const result = await pool.query(
                `INSERT INTO ${this.tableName} (titulo, direccion, zona, fecha, hora, id_usuario, id_actividad) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) 
                 RETURNING *`,
                [titulo, direccion, zona || null, fecha, hora, id_usuario, id_actividad]
              );
              createdPublication = result.rows[0];
            } else {
              // Intentar sin zona ni vacantes
              const { titulo, direccion, fecha, hora, id_usuario, id_actividad } = data;
              const result = await pool.query(
                `INSERT INTO ${this.tableName} (titulo, direccion, fecha, hora, id_usuario, id_actividad) 
                 VALUES ($1, $2, $3, $4, $5, $6) 
                 RETURNING *`,
                [titulo, direccion, fecha, hora, id_usuario, id_actividad]
              );
              createdPublication = result.rows[0];
            }
          } catch (innerError) {
            throw new Error(`Error al crear publicación: ${innerError.message}`);
          }
        } else {
          throw error;
        }
      }
      
      // Obtener la publicación completa con información de usuario y actividad
      const fullResult = await pool.query(
        `SELECT p.*, 
                u.nombre_completo as usuario_nombre, u.foto_perfil as usuario_foto,
                a.nombre_actividad, a.imagen as actividad_imagen, a.tipo as actividad_tipo
         FROM ${this.tableName} p
         LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
         LEFT JOIN actividades a ON p.id_actividad = a.id_actividad
         WHERE p.id_publicacion = $1`,
        [createdPublication.id_publicacion]
      );
      
      return fullResult.rows[0] || createdPublication;
    } catch (error) {
      throw new Error(`Error al crear publicación: ${error.message}`);
    }
  }

  // Actualizar una publicación
  static async update(id, data) {
    try {
      const { titulo, direccion, fecha, hora, id_usuario, id_actividad } = data;
      
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (titulo !== undefined) {
        updates.push(`titulo = $${paramCount++}`);
        values.push(titulo);
      }
      if (direccion !== undefined) {
        updates.push(`direccion = $${paramCount++}`);
        values.push(direccion);
      }
      if (fecha !== undefined) {
        updates.push(`fecha = $${paramCount++}`);
        values.push(fecha);
      }
      if (hora !== undefined) {
        updates.push(`hora = $${paramCount++}`);
        values.push(hora);
      }
      if (id_usuario !== undefined) {
        updates.push(`id_usuario = $${paramCount++}`);
        values.push(id_usuario);
      }
      if (id_actividad !== undefined) {
        updates.push(`id_actividad = $${paramCount++}`);
        values.push(id_actividad);
      }

      if (updates.length === 0) {
        return await this.findById(id);
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const result = await pool.query(
        `UPDATE ${this.tableName} 
         SET ${updates.join(', ')} 
         WHERE id_publicacion = $${paramCount} 
         RETURNING *`,
        values
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error al actualizar publicación: ${error.message}`);
    }
  }

  // Eliminar una publicación
  static async delete(id) {
    try {
      const result = await pool.query(
        `DELETE FROM ${this.tableName} WHERE id_publicacion = $1 RETURNING id_publicacion`,
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Error al eliminar publicación: ${error.message}`);
    }
  }
}

module.exports = Publicacion;

