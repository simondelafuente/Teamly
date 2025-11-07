const { pool } = require('../config/database');

class Mensaje {
  static tableName = 'mensajes';

  // Obtener todos los mensajes
  static async findAll() {
    try {
      const result = await pool.query(
        `SELECT m.*, 
                u1.nombre_completo as emisor_nombre, u1.foto_perfil as emisor_foto,
                u2.nombre_completo as receptor_nombre, u2.foto_perfil as receptor_foto
         FROM ${this.tableName} m
         LEFT JOIN usuarios u1 ON m.id_emisor = u1.id_usuario
         LEFT JOIN usuarios u2 ON m.id_receptor = u2.id_usuario
         ORDER BY m.fecha_envio DESC`
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener mensajes: ${error.message}`);
    }
  }

  // Obtener un mensaje por ID
  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT m.*, 
                u1.nombre_completo as emisor_nombre, u1.foto_perfil as emisor_foto,
                u2.nombre_completo as receptor_nombre, u2.foto_perfil as receptor_foto
         FROM ${this.tableName} m
         LEFT JOIN usuarios u1 ON m.id_emisor = u1.id_usuario
         LEFT JOIN usuarios u2 ON m.id_receptor = u2.id_usuario
         WHERE m.id_mensaje = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener mensaje: ${error.message}`);
    }
  }

  // Obtener conversación entre dos usuarios
  static async getConversacion(idUsuario1, idUsuario2) {
    try {
      const result = await pool.query(
        `SELECT m.*, 
                u1.nombre_completo as emisor_nombre, u1.foto_perfil as emisor_foto,
                u2.nombre_completo as receptor_nombre, u2.foto_perfil as receptor_foto
         FROM ${this.tableName} m
         LEFT JOIN usuarios u1 ON m.id_emisor = u1.id_usuario
         LEFT JOIN usuarios u2 ON m.id_receptor = u2.id_usuario
         WHERE (m.id_emisor = $1 AND m.id_receptor = $2) 
            OR (m.id_emisor = $2 AND m.id_receptor = $1)
         ORDER BY m.fecha_envio ASC`,
        [idUsuario1, idUsuario2]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener conversación: ${error.message}`);
    }
  }

  // Obtener mensajes enviados por un usuario
  static async findByEmisor(idEmisor) {
    try {
      const result = await pool.query(
        `SELECT m.*, 
                u1.nombre_completo as emisor_nombre, u1.foto_perfil as emisor_foto,
                u2.nombre_completo as receptor_nombre, u2.foto_perfil as receptor_foto
         FROM ${this.tableName} m
         LEFT JOIN usuarios u1 ON m.id_emisor = u1.id_usuario
         LEFT JOIN usuarios u2 ON m.id_receptor = u2.id_usuario
         WHERE m.id_emisor = $1
         ORDER BY m.fecha_envio DESC`,
        [idEmisor]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener mensajes enviados: ${error.message}`);
    }
  }

  // Obtener mensajes recibidos por un usuario
  static async findByReceptor(idReceptor) {
    try {
      const result = await pool.query(
        `SELECT m.*, 
                u1.nombre_completo as emisor_nombre, u1.foto_perfil as emisor_foto,
                u2.nombre_completo as receptor_nombre, u2.foto_perfil as receptor_foto
         FROM ${this.tableName} m
         LEFT JOIN usuarios u1 ON m.id_emisor = u1.id_usuario
         LEFT JOIN usuarios u2 ON m.id_receptor = u2.id_usuario
         WHERE m.id_receptor = $1
         ORDER BY m.fecha_envio DESC`,
        [idReceptor]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener mensajes recibidos: ${error.message}`);
    }
  }

  // Crear un nuevo mensaje
  static async create(data) {
    try {
      const { id_emisor, id_receptor, contenido } = data;
      const result = await pool.query(
        `INSERT INTO ${this.tableName} (id_emisor, id_receptor, contenido) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [id_emisor, id_receptor, contenido]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al crear mensaje: ${error.message}`);
    }
  }

  // Actualizar un mensaje
  static async update(id, data) {
    try {
      const { contenido } = data;
      
      if (contenido === undefined) {
        return await this.findById(id);
      }

      const result = await pool.query(
        `UPDATE ${this.tableName} 
         SET contenido = $1 
         WHERE id_mensaje = $2 
         RETURNING *`,
        [contenido, id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error al actualizar mensaje: ${error.message}`);
    }
  }

  // Eliminar un mensaje
  static async delete(id) {
    try {
      const result = await pool.query(
        `DELETE FROM ${this.tableName} WHERE id_mensaje = $1 RETURNING id_mensaje`,
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Error al eliminar mensaje: ${error.message}`);
    }
  }
}

module.exports = Mensaje;

