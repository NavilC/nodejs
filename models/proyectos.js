const { getDatabase } = require('../database/database');

class Proyecto {
  constructor(data) {
    this.id = data.id;
    this['Orden de Venta'] = data['Orden de Venta'];
    this.Nombre = data.Nombre;
    this.SEC = data.SEC;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async getAll() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Proyecto ORDER BY id';
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Proyecto(row)));
        }
      });
    });
  }

  static async getById(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Proyecto WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new Proyecto(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  static async create(data) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const { 'Orden de Venta': ordenVenta, Nombre, SEC } = data;
      const sql = 'INSERT INTO Proyecto ("Orden de Venta", Nombre, SEC) VALUES (?, ?, ?)';
      
      db.run(sql, [ordenVenta, Nombre, SEC], function(err) {
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
      const { 'Orden de Venta': ordenVenta, Nombre, SEC } = data;
      const sql = 'UPDATE Proyecto SET "Orden de Venta" = ?, Nombre = ?, SEC = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      
      db.run(sql, [ordenVenta, Nombre, SEC, id], function(err) {
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
      const sql = 'DELETE FROM Proyecto WHERE id = ?';
      
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
        SELECT ps.*, u.Nombre as usuario_nombre, u.Rol
        FROM "Pase de Salida" ps
        JOIN usuarios u ON ps.idUsuarios = u.id
        WHERE ps.idProyecto = ?
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

module.exports = Proyecto;
