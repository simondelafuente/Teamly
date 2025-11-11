const { pool } = require('../config/database');

class Usuario {
  static tableName = 'usuarios';

  // Obtener todos los usuarios
  static async findAll() {
    try {
      const result = await pool.query(
        `SELECT id_usuario, nombre_completo, email, pregunta_seguridad, foto_perfil, created_at, updated_at 
         FROM ${this.tableName} 
         ORDER BY created_at DESC`
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  // Obtener un usuario por ID
  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT id_usuario, nombre_completo, email, pregunta_seguridad, foto_perfil, created_at, updated_at 
         FROM ${this.tableName} 
         WHERE id_usuario = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error.message}`);
    }
  }

  // Obtener un usuario por email
  static async findByEmail(email) {
    try {
      const result = await pool.query(
        `SELECT * FROM ${this.tableName} WHERE email = $1`,
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener usuario por email: ${error.message}`);
    }
  }

  // Crear un nuevo usuario
  static async create(data) {
    const client = await pool.connect();
    try {
      const { nombre_completo, email, contrasena, pregunta_seguridad, respuesta_seguridad, foto_perfil } = data;
      
      if (!nombre_completo || !email || !contrasena || !pregunta_seguridad || !respuesta_seguridad) {
        throw new Error('Todos los campos requeridos deben estar presentes');
      }

      const result = await client.query(
        `INSERT INTO ${this.tableName} 
         (nombre_completo, email, contrasena, pregunta_seguridad, respuesta_seguridad, foto_perfil) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id_usuario, nombre_completo, email, pregunta_seguridad, foto_perfil, created_at, updated_at`,
        [nombre_completo, email, contrasena, pregunta_seguridad, respuesta_seguridad, foto_perfil || null]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error en Usuario.create:', error);
      throw new Error(`Error al crear usuario: ${error.message}`);
    } finally {
      client.release();
    }
  }

  // Actualizar un usuario
  static async update(id, data) {
    try {
      const { nombre_completo, email, contrasena, pregunta_seguridad, respuesta_seguridad, foto_perfil } = data;
      
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (nombre_completo !== undefined) {
        updates.push(`nombre_completo = $${paramCount++}`);
        values.push(nombre_completo);
      }
      if (email !== undefined) {
        updates.push(`email = $${paramCount++}`);
        values.push(email);
      }
      if (contrasena !== undefined) {
        updates.push(`contrasena = $${paramCount++}`);
        values.push(contrasena);
      }
      if (pregunta_seguridad !== undefined) {
        updates.push(`pregunta_seguridad = $${paramCount++}`);
        values.push(pregunta_seguridad);
      }
      if (respuesta_seguridad !== undefined) {
        updates.push(`respuesta_seguridad = $${paramCount++}`);
        values.push(respuesta_seguridad);
      }
      if (foto_perfil !== undefined) {
        updates.push(`foto_perfil = $${paramCount++}`);
        values.push(foto_perfil);
      }

      if (updates.length === 0) {
        return await this.findById(id);
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const result = await pool.query(
        `UPDATE ${this.tableName} 
         SET ${updates.join(', ')} 
         WHERE id_usuario = $${paramCount} 
         RETURNING id_usuario, nombre_completo, email, pregunta_seguridad, foto_perfil, created_at, updated_at`,
        values
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  // Eliminar un usuario
  static async delete(id) {
    try {
      const result = await pool.query(
        `DELETE FROM ${this.tableName} WHERE id_usuario = $1 RETURNING id_usuario`,
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }
}

module.exports = Usuario;

