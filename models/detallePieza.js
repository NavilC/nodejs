const { getDatabase } = require('../database/database');

class DetallePieza {
  constructor(data) {
    this.id = data.id;
    this.cantidad = data.cantidad;
    this.Tipo = data.Tipo;
    this.Marca = data.Marca;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async getAll() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM "Detalle de Pieza" ORDER BY id';
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new DetallePieza(row)));
        }
      });
    });
  }

  static async getById(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM "Detalle de Pieza" WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new DetallePieza(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  static async create(data) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const { cantidad, Tipo, Marca } = data;
      const sql = 'INSERT INTO "Detalle de Pieza" (cantidad, Tipo, Marca) VALUES (?, ?, ?)';
      
      db.run(sql, [cantidad, Tipo, Marca], function(err) {
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
      const { cantidad, Tipo, Marca } = data;
      const sql = 'UPDATE "Detalle de Pieza" SET cantidad = ?, Tipo = ?, Marca = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      
      db.run(sql, [cantidad, Tipo, Marca, id], function(err) {
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
      const sql = 'DELETE FROM "Detalle de Pieza" WHERE id = ?';
      
      db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  static async getPaseSalidaDetalles(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT psd.*, ps.id as pase_salida_id, u.Nombre as usuario_nombre, p.Nombre as proyecto_nombre
        FROM PaseSalidaDetalle psd
        JOIN "Pase de Salida" ps ON psd.idPaseSalida = ps.id
        JOIN usuarios u ON ps.idUsuarios = u.id
        JOIN Proyecto p ON ps.idProyecto = p.id
        WHERE psd.idDetallePieza = ?
        ORDER BY psd.created_at DESC
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

module.exports = DetallePieza;
