const { getDatabase } = require('../database/database');

class PaseSalida {
  constructor(data) {
    this.id = data.id;
    this.idProyecto = data.idProyecto;
    this.idUsuarios = data.idUsuarios;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async getAll() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT ps.*, 
               p.Nombre as proyecto_nombre, 
               p."Orden de Venta" as orden_venta,
               u.Nombre as usuario_nombre, 
               u.Rol as usuario_rol
        FROM "Pase de Salida" ps
        JOIN Proyecto p ON ps.idProyecto = p.id
        JOIN usuarios u ON ps.idUsuarios = u.id
        ORDER BY ps.created_at DESC
      `;
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async getById(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT ps.*, 
               p.Nombre as proyecto_nombre, 
               p."Orden de Venta" as orden_venta,
               u.Nombre as usuario_nombre, 
               u.Rol as usuario_rol
        FROM "Pase de Salida" ps
        JOIN Proyecto p ON ps.idProyecto = p.id
        JOIN usuarios u ON ps.idUsuarios = u.id
        WHERE ps.id = ?
      `;
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(row);
        } else {
          resolve(null);
        }
      });
    });
  }

  static async create(data) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const { idProyecto, idUsuarios } = data;
      const sql = 'INSERT INTO "Pase de Salida" (idProyecto, idUsuarios) VALUES (?, ?)';
      
      db.run(sql, [idProyecto, idUsuarios], function(err) {
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
      const { idProyecto, idUsuarios } = data;
      const sql = 'UPDATE "Pase de Salida" SET idProyecto = ?, idUsuarios = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      
      db.run(sql, [idProyecto, idUsuarios, id], function(err) {
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
      const sql = 'DELETE FROM "Pase de Salida" WHERE id = ?';
      
      db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  static async getDetalles(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT psd.*, 
               dp.Tipo, 
               dp.Marca, 
               dp.cantidad as stock_cantidad
        FROM PaseSalidaDetalle psd
        JOIN "Detalle de Pieza" dp ON psd.idDetallePieza = dp.id
        WHERE psd.idPaseSalida = ?
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

module.exports = PaseSalida;
