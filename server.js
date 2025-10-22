const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const usuariosRoutes = require('./routes/usuarios');
const proyectosRoutes = require('./routes/proyectos');
const detallePiezaRoutes = require('./routes/detallePieza');
const paseSalidaRoutes = require('./routes/paseSalida');
const paseSalidaDetalleRoutes = require('./routes/paseSalidaDetalle');

// Import database setup
const { initDatabase } = require('./database/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static('public'));

// Routes
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/detalle-pieza', detallePiezaRoutes);
app.use('/api/pase-salida', paseSalidaRoutes);
app.use('/api/pase-salida-detalle', paseSalidaDetalleRoutes);
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'CRUD API for Database Schema',
    endpoints: {
      usuarios: '/api/usuarios',
      proyectos: '/api/proyectos',
      detallePieza: '/api/detalle-pieza',
      paseSalida: '/api/pase-salida',
      paseSalidaDetalle: '/api/pase-salida-detalle',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Initialize database and start server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

module.exports = app;
