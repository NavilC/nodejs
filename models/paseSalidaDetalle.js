const { getDatabase } = require('../database/database');

class PaseSalidaDetalle {
  constructor(data) {
    this.id = data.id;
    this.idPaseSalida = data.idPaseSalida;
    this.idDetallePieza = data.idDetallePieza;
    this.Cantidad = data.Cantidad;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async getAll() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT psd.*, 
               ps.id as pase_salida_id,
               p.Nombre as proyecto_nombre,
               u.Nombre as usuario_nombre,
               dp.Tipo as pieza_tipo,
               dp.Marca as pieza_marca
        FROM PaseSalidaDetalle psd
        JOIN "Pase de Salida" ps ON psd.idPaseSalida = ps.id
        JOIN Proyecto p ON ps.idProyecto = p.id
        JOIN usuarios u ON ps.idUsuarios = u.id
        JOIN "Detalle de Pieza" dp ON psd.idDetallePieza = dp.id
        ORDER BY psd.created_at DESC
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
        SELECT psd.*, 
               ps.id as pase_salida_id,
               p.Nombre as proyecto_nombre,
               u.Nombre as usuario_nombre,
               dp.Tipo as pieza_tipo,
               dp.Marca as pieza_marca
        FROM PaseSalidaDetalle psd
        JOIN "Pase de Salida" ps ON psd.idPaseSalida = ps.id
        JOIN Proyecto p ON ps.idProyecto = p.id
        JOIN usuarios u ON ps.idUsuarios = u.id
        JOIN "Detalle de Pieza" dp ON psd.idDetallePieza = dp.id
        WHERE psd.id = ?
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
      const { idPaseSalida, idDetallePieza, Cantidad } = data;
      const sql = 'INSERT INTO PaseSalidaDetalle (idPaseSalida, idDetallePieza, Cantidad) VALUES (?, ?, ?)';
      
      db.run(sql, [idPaseSalida, idDetallePieza, Cantidad], function(err) {
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
      const { idPaseSalida, idDetallePieza, Cantidad } = data;
      const sql = 'UPDATE PaseSalidaDetalle SET idPaseSalida = ?, idDetallePieza = ?, Cantidad = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      
      db.run(sql, [idPaseSalida, idDetallePieza, Cantidad, id], function(err) {
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
      const sql = 'DELETE FROM PaseSalidaDetalle WHERE id = ?';
      
      db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  static async getByPaseSalida(idPaseSalida) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT psd.*, 
               dp.Tipo as pieza_tipo,
               dp.Marca as pieza_marca,
               dp.cantidad as stock_cantidad
        FROM PaseSalidaDetalle psd
        JOIN "Detalle de Pieza" dp ON psd.idDetallePieza = dp.id
        WHERE psd.idPaseSalida = ?
        ORDER BY psd.created_at DESC
      `;
      
      db.all(sql, [idPaseSalida], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async getByDetallePieza(idDetallePieza) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT psd.*, 
               ps.id as pase_salida_id,
               p.Nombre as proyecto_nombre,
               u.Nombre as usuario_nombre
        FROM PaseSalidaDetalle psd
        JOIN "Pase de Salida" ps ON psd.idPaseSalida = ps.id
        JOIN Proyecto p ON ps.idProyecto = p.id
        JOIN usuarios u ON ps.idUsuarios = u.id
        WHERE psd.idDetallePieza = ?
        ORDER BY psd.created_at DESC
      `;
      
      db.all(sql, [idDetallePieza], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = PaseSalidaDetalle;
