const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');

let db;

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
      createTables().then(resolve).catch(reject);
    });
  });
};

const createTables = () => {
  return new Promise((resolve, reject) => {
    const tables = [
      // Usuarios table
      `CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        Nombre TEXT NOT NULL,
        Rol TEXT NOT NULL,
        password TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Proyecto table
      `CREATE TABLE IF NOT EXISTS Proyecto (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        "Orden de Venta" INTEGER NOT NULL,
        Nombre TEXT NOT NULL,
        SEC INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Detalle de Pieza table
      `CREATE TABLE IF NOT EXISTS "Detalle de Pieza" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cantidad INTEGER NOT NULL,
        Tipo TEXT NOT NULL,
        Marca TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Pase de Salida table
      `CREATE TABLE IF NOT EXISTS "Pase de Salida" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idProyecto INTEGER NOT NULL,
        idUsuarios INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (idProyecto) REFERENCES Proyecto(id) ON DELETE CASCADE,
        FOREIGN KEY (idUsuarios) REFERENCES usuarios(id) ON DELETE CASCADE
      )`,
      
      // PaseSalidaDetalle table
      `CREATE TABLE IF NOT EXISTS PaseSalidaDetalle (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        idPaseSalida INTEGER NOT NULL,
        idDetallePieza INTEGER NOT NULL,
        Cantidad INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (idPaseSalida) REFERENCES "Pase de Salida"(id) ON DELETE CASCADE,
        FOREIGN KEY (idDetallePieza) REFERENCES "Detalle de Pieza"(id) ON DELETE CASCADE
      )`
    ];

    let completed = 0;
    const total = tables.length;

    tables.forEach((sql, index) => {
      db.run(sql, (err) => {
        if (err) {
          console.error(`Error creating table ${index + 1}:`, err.message);
          reject(err);
          return;
        }
        completed++;
        if (completed === total) {
          console.log('All tables created successfully');
          // Ensure usuarios table has password column (for upgrades)
          db.all("PRAGMA table_info(usuarios)", (err, cols) => {
            if (err) { console.error('Error reading table info:', err.message); insertSampleData().then(resolve).catch(reject); return; }
            const hasPassword = cols && cols.some(c => c.name && c.name.toLowerCase() === 'password');
            if (!hasPassword) {
              db.run("ALTER TABLE usuarios ADD COLUMN password TEXT", (alterErr) => {
                if (alterErr) console.error('Error adding password column:', alterErr.message);
                insertSampleData().then(resolve).catch(reject);
              });
            } else {
              insertSampleData().then(resolve).catch(reject);
            }
          });
        }
      });
    });
  });
};

const insertSampleData = () => {
  return new Promise((resolve, reject) => {
    // Check if data already exists
    db.get("SELECT COUNT(*) as count FROM usuarios", (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (row.count > 0) {
        console.log('Sample data already exists');
        resolve();
        return;
      }

      const sampleData = [
        // Insert sample usuarios
        `INSERT INTO usuarios (Nombre, Rol) VALUES 
         ('Juan Pérez', 'Administrador'),
         ('María García', 'Operador'),
         ('Carlos López', 'Supervisor')`,
        
        // Insert sample proyectos
        `INSERT INTO Proyecto ("Orden de Venta", Nombre, SEC) VALUES 
         (1001, 'Proyecto Alpha', 12345),
         (1002, 'Proyecto Beta', 12346),
         (1003, 'Proyecto Gamma', 12347)`,
        
        // Insert sample detalle de pieza
        `INSERT INTO "Detalle de Pieza" (cantidad, Tipo, Marca) VALUES 
         (50, 'Tornillo', 'Bosch'),
         (25, 'Tuerca', 'DeWalt'),
         (100, 'Arandela', 'Stanley')`,
        
        // Insert sample pase de salida
        `INSERT INTO "Pase de Salida" (idProyecto, idUsuarios) VALUES 
         (1, 1),
         (2, 2),
         (1, 3)`,
        
        // Insert sample pase salida detalle
        `INSERT INTO PaseSalidaDetalle (idPaseSalida, idDetallePieza, Cantidad) VALUES 
         (1, 1, 10),
         (1, 2, 5),
         (2, 3, 20),
         (3, 1, 15)`
      ];

      let completed = 0;
      const total = sampleData.length;

      sampleData.forEach((sql, index) => {
        db.run(sql, (err) => {
          if (err) {
            console.error(`Error inserting sample data ${index + 1}:`, err.message);
            reject(err);
            return;
          }
          completed++;
          if (completed === total) {
            console.log('Sample data inserted successfully');
            resolve();
          }
        });
      });
    });
  });
};

const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase
};
