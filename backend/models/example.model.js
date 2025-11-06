// Modelo de ejemplo usando Supabase (PostgreSQL)
// NOTA: Asegúrate de crear la tabla 'examples' en Supabase antes de usar este modelo
// SQL para crear la tabla:
// CREATE TABLE examples (
//   id SERIAL PRIMARY KEY,
//   name VARCHAR(255) NOT NULL,
//   description TEXT,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

const { pool } = require('../config/database');

class Example {
  // Nombre de la tabla en la base de datos
  static tableName = 'examples';

  // Obtener todos los registros
  static async findAll() {
    try {
      const result = await pool.query(
        `SELECT * FROM ${this.tableName} ORDER BY created_at DESC`
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener registros: ${error.message}`);
    }
  }

  // Obtener un registro por ID
  static async findById(id) {
    try {
      const result = await pool.query(
        `SELECT * FROM ${this.tableName} WHERE id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener registro: ${error.message}`);
    }
  }

  // Crear un nuevo registro
  static async create(data) {
    try {
      const { name, description } = data;
      const result = await pool.query(
        `INSERT INTO ${this.tableName} (name, description) 
         VALUES ($1, $2) 
         RETURNING *`,
        [name, description]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al crear registro: ${error.message}`);
    }
  }

  // Actualizar un registro
  static async update(id, data) {
    try {
      const { name, description } = data;
      const result = await pool.query(
        `UPDATE ${this.tableName} 
         SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3 
         RETURNING *`,
        [name, description, id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error al actualizar registro: ${error.message}`);
    }
  }

  // Eliminar un registro
  static async delete(id) {
    try {
      const result = await pool.query(
        `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`,
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Error al eliminar registro: ${error.message}`);
    }
  }
}

module.exports = Example;

