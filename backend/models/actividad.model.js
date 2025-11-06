// Modelo de Actividad
const { pool } = require('../config/database');

class Actividad {
  static tableName = 'actividades';

  // Obtener todas las actividades
  static async findAll() {
    try {
      const result = await pool.query(
        `SELECT * FROM ${this.tableName} ORDER BY created_at DESC`
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener actividades: ${error.message}`);
    }
  }

  // Obtener una actividad por ID
  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT * FROM ${this.tableName} WHERE id_actividad = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener actividad: ${error.message}`);
    }
  }

  // Crear una nueva actividad
  static async create(data) {
    try {
      const { nombre_actividad, imagen } = data;
      const result = await pool.query(
        `INSERT INTO ${this.tableName} (nombre_actividad, imagen) 
         VALUES ($1, $2) 
         RETURNING *`,
        [nombre_actividad, imagen]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al crear actividad: ${error.message}`);
    }
  }

  // Actualizar una actividad
  static async update(id, data) {
    try {
      const { nombre_actividad, imagen } = data;
      
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (nombre_actividad !== undefined) {
        updates.push(`nombre_actividad = $${paramCount++}`);
        values.push(nombre_actividad);
      }
      if (imagen !== undefined) {
        updates.push(`imagen = $${paramCount++}`);
        values.push(imagen);
      }

      if (updates.length === 0) {
        return await this.findById(id);
      }

      values.push(id);

      const result = await pool.query(
        `UPDATE ${this.tableName} 
         SET ${updates.join(', ')} 
         WHERE id_actividad = $${paramCount} 
         RETURNING *`,
        values
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error al actualizar actividad: ${error.message}`);
    }
  }

  // Eliminar una actividad
  static async delete(id) {
    try {
      const result = await pool.query(
        `DELETE FROM ${this.tableName} WHERE id_actividad = $1 RETURNING id_actividad`,
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Error al eliminar actividad: ${error.message}`);
    }
  }
}

module.exports = Actividad;

