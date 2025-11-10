const { pool } = require('../config/database');

class Comentario {
  static tableName = 'comentarios';

  // Obtener todos los comentarios
  static async findAll() {
    try {
      const result = await pool.query(
        `SELECT c.*, 
                u1.nombre_completo as usuario_nombre, u1.foto_perfil as usuario_foto,
                u2.nombre_completo as usuario_comentado_nombre
         FROM ${this.tableName} c
         LEFT JOIN usuarios u1 ON c.id_usuario = u1.id_usuario
         LEFT JOIN usuarios u2 ON c.id_usuario_comentado = u2.id_usuario
         ORDER BY c.created_at DESC`
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener comentarios: ${error.message}`);
    }
  }

  // Obtener un comentario por ID
  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT c.*, 
                u1.nombre_completo as usuario_nombre, u1.foto_perfil as usuario_foto,
                u2.nombre_completo as usuario_comentado_nombre
         FROM ${this.tableName} c
         LEFT JOIN usuarios u1 ON c.id_usuario = u1.id_usuario
         LEFT JOIN usuarios u2 ON c.id_usuario_comentado = u2.id_usuario
         WHERE c.id_comentario = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener comentario: ${error.message}`);
    }
  }

  // Obtener comentarios de un usuario (comentarios que recibió)
  static async findByUsuarioComentado(idUsuario) {
    try {
      const result = await pool.query(
        `SELECT c.*, 
                u1.nombre_completo as usuario_nombre, u1.foto_perfil as usuario_foto,
                u2.nombre_completo as usuario_comentado_nombre
         FROM ${this.tableName} c
         LEFT JOIN usuarios u1 ON c.id_usuario = u1.id_usuario
         LEFT JOIN usuarios u2 ON c.id_usuario_comentado = u2.id_usuario
         WHERE c.id_usuario_comentado = $1
         ORDER BY c.created_at DESC`,
        [idUsuario]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener comentarios del usuario: ${error.message}`);
    }
  }

  // Obtener comentarios hechos por un usuario
  static async findByUsuario(idUsuario) {
    try {
      const result = await pool.query(
        `SELECT c.*, 
                u1.nombre_completo as usuario_nombre, u1.foto_perfil as usuario_foto,
                u2.nombre_completo as usuario_comentado_nombre
         FROM ${this.tableName} c
         LEFT JOIN usuarios u1 ON c.id_usuario = u1.id_usuario
         LEFT JOIN usuarios u2 ON c.id_usuario_comentado = u2.id_usuario
         WHERE c.id_usuario = $1
         ORDER BY c.created_at DESC`,
        [idUsuario]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener comentarios del usuario: ${error.message}`);
    }
  }

  // Verificar si ya existe un comentario entre dos usuarios
  static async findByUsuarios(idUsuario, idUsuarioComentado) {
    let client;
    try {
      client = await pool.connect();
      const result = await client.query(
        `SELECT * FROM ${this.tableName} 
         WHERE id_usuario = $1 AND id_usuario_comentado = $2`,
        [idUsuario, idUsuarioComentado]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error al verificar comentario:', error);
      throw new Error(`Error al verificar comentario: ${error.message}`);
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  // Crear un nuevo comentario
  static async create(data) {
    let client;
    try {
      client = await pool.connect();
      const { contenido, id_usuario, id_usuario_comentado } = data;
      const result = await client.query(
        `INSERT INTO ${this.tableName} (contenido, id_usuario, id_usuario_comentado) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [contenido, id_usuario, id_usuario_comentado]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error al crear comentario:', error);
      throw new Error(`Error al crear comentario: ${error.message}`);
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  // Actualizar un comentario
  static async update(id, data) {
    let client;
    try {
      client = await pool.connect();
      const { contenido } = data;
      
      if (contenido === undefined) {
        return await this.findById(id);
      }

      // Obtener el comentario actual antes de actualizar para comparar
      const beforeUpdate = await this.findById(id);
      console.log('📋 Comentario ANTES de actualizar:', {
        id: beforeUpdate?.id_comentario,
        created_at: beforeUpdate?.created_at,
        updated_at: beforeUpdate?.updated_at
      });
      
      // Actualizar el contenido y updated_at manualmente
      // Esto asegura que updated_at se actualice incluso si el trigger no funciona
      const result = await client.query(
        `UPDATE ${this.tableName} 
         SET contenido = $1, updated_at = NOW()
         WHERE id_comentario = $2 
         RETURNING id_comentario, contenido, created_at, updated_at, id_usuario, id_usuario_comentado`,
        [contenido, id]
      );
      
      const updatedComment = result.rows[0] || null;
      
      // Log para debugging
      if (updatedComment) {
        console.log('✅ Comentario DESPUÉS de actualizar:', {
          id: updatedComment.id_comentario,
          contenido: updatedComment.contenido,
          created_at: updatedComment.created_at,
          updated_at: updatedComment.updated_at
        });
        
        // Verificar que updated_at se actualizó (debe ser diferente al anterior)
        if (beforeUpdate && beforeUpdate.updated_at) {
          const beforeUpdatedAt = new Date(beforeUpdate.updated_at).getTime();
          const afterUpdatedAt = new Date(updatedComment.updated_at).getTime();
          const timeDifference = afterUpdatedAt - beforeUpdatedAt;
          
          if (timeDifference > 0) {
            console.log('✅ updated_at se actualizó correctamente (diferencia:', timeDifference, 'ms)');
          } else {
            console.warn('⚠️ ADVERTENCIA: updated_at NO cambió después del UPDATE');
          }
        } else {
          console.log('✅ updated_at se estableció por primera vez');
        }
      } else {
        console.error('❌ No se encontró el comentario después del UPDATE');
      }
      
      return updatedComment;
    } catch (error) {
      console.error('❌ Error al actualizar comentario:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        code: error.code,
        detail: error.detail
      });
      throw new Error(`Error al actualizar comentario: ${error.message}`);
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  // Eliminar un comentario
  static async delete(id) {
    try {
      const result = await pool.query(
        `DELETE FROM ${this.tableName} WHERE id_comentario = $1 RETURNING id_comentario`,
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Error al eliminar comentario: ${error.message}`);
    }
  }
}

//Obtener comentarios por publicación

module.exports = Comentario;

