const { getDatabase } = require('../database/database');

class Usuario {
  constructor(data) {
    this.id = data.id;
    this.Nombre = data.Nombre;
    this.Rol = data.Rol;
    this.password = data.password;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async getAll() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM usuarios ORDER BY id';
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Usuario(row)));
        }
      });
    });
  }

  static async getById(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM usuarios WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new Usuario(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  static async create(data) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const { Nombre, Rol, password } = data;
      const sql = 'INSERT INTO usuarios (Nombre, Rol, password) VALUES (?, ?, ?)';
      
      db.run(sql, [Nombre, Rol, password || null], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  static async update(id, data) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const { Nombre, Rol, password } = data;
      // allow updating password optionally
      let sql, params;
      if (typeof password !== 'undefined') {
        sql = 'UPDATE usuarios SET Nombre = ?, Rol = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        params = [Nombre, Rol, password, id];
      } else {
        sql = 'UPDATE usuarios SET Nombre = ?, Rol = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        params = [Nombre, Rol, id];
      }
      
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  static async delete(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM usuarios WHERE id = ?';
      
      db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  static async getPasesSalida(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT ps.*, p.Nombre as proyecto_nombre, p."Orden de Venta"
        FROM "Pase de Salida" ps
        JOIN Proyecto p ON ps.idProyecto = p.id
        WHERE ps.idUsuarios = ?
        ORDER BY ps.created_at DESC
      `;
      
      db.all(sql, [id], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = Usuario;
