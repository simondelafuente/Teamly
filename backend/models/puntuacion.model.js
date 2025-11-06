// Modelo de Puntuación
const { pool } = require('../config/database');

class Puntuacion {
  static tableName = 'puntuacion';

  // Obtener todas las puntuaciones
  static async findAll() {
    try {
      const result = await pool.query(
        `SELECT p.*, 
                u1.nombre_completo as usuario_nombre, 
                u2.nombre_completo as usuario_puntuado_nombre
         FROM ${this.tableName} p
         LEFT JOIN usuarios u1 ON p.id_usuario = u1.id_usuario
         LEFT JOIN usuarios u2 ON p.id_usuario_puntuado = u2.id_usuario
         ORDER BY p.created_at DESC`
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener puntuaciones: ${error.message}`);
    }
  }

  // Obtener una puntuación por ID
  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT p.*, 
                u1.nombre_completo as usuario_nombre, 
                u2.nombre_completo as usuario_puntuado_nombre
         FROM ${this.tableName} p
         LEFT JOIN usuarios u1 ON p.id_usuario = u1.id_usuario
         LEFT JOIN usuarios u2 ON p.id_usuario_puntuado = u2.id_usuario
         WHERE p.id_puntuacion = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener puntuación: ${error.message}`);
    }
  }

  // Obtener puntuaciones de un usuario (puntuaciones que recibió)
  static async findByUsuarioPuntuado(idUsuario) {
    try {
      const result = await pool.query(
        `SELECT p.*, 
                u1.nombre_completo as usuario_nombre, 
                u2.nombre_completo as usuario_puntuado_nombre
         FROM ${this.tableName} p
         LEFT JOIN usuarios u1 ON p.id_usuario = u1.id_usuario
         LEFT JOIN usuarios u2 ON p.id_usuario_puntuado = u2.id_usuario
         WHERE p.id_usuario_puntuado = $1
         ORDER BY p.created_at DESC`,
        [idUsuario]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener puntuaciones del usuario: ${error.message}`);
    }
  }

  // Obtener puntuación promedio de un usuario
  static async getPromedioByUsuario(idUsuario) {
    try {
      const result = await pool.query(
        `SELECT AVG(puntuacion) as promedio, COUNT(*) as total_puntuaciones
         FROM ${this.tableName} 
         WHERE id_usuario_puntuado = $1`,
        [idUsuario]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al obtener promedio de puntuación: ${error.message}`);
    }
  }

  // Verificar si ya existe una puntuación entre dos usuarios
  static async findByUsuarios(idUsuario, idUsuarioPuntuado) {
    try {
      const result = await pool.query(
        `SELECT * FROM ${this.tableName} 
         WHERE id_usuario = $1 AND id_usuario_puntuado = $2`,
        [idUsuario, idUsuarioPuntuado]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error al verificar puntuación: ${error.message}`);
    }
  }

  // Crear una nueva puntuación
  static async create(data) {
    try {
      const { id_usuario, id_usuario_puntuado, puntuacion } = data;
      const result = await pool.query(
        `INSERT INTO ${this.tableName} (id_usuario, id_usuario_puntuado, puntuacion) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [id_usuario, id_usuario_puntuado, puntuacion]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al crear puntuación: ${error.message}`);
    }
  }

  // Actualizar una puntuación
  static async update(id, data) {
    try {
      const { puntuacion } = data;
      
      if (puntuacion === undefined) {
        return await this.findById(id);
      }

      const result = await pool.query(
        `UPDATE ${this.tableName} 
         SET puntuacion = $1 
         WHERE id_puntuacion = $2 
         RETURNING *`,
        [puntuacion, id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error al actualizar puntuación: ${error.message}`);
    }
  }

  // Eliminar una puntuación
  static async delete(id) {
    try {
      const result = await pool.query(
        `DELETE FROM ${this.tableName} WHERE id_puntuacion = $1 RETURNING id_puntuacion`,
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Error al eliminar puntuación: ${error.message}`);
    }
  }
}

module.exports = Puntuacion;

