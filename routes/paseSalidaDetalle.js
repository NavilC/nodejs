const express = require('express');
const router = express.Router();
const PaseSalidaDetalle = require('../models/paseSalidaDetalle');

// GET /api/pase-salida-detalle - Get all pase salida detalles
router.get('/', async (req, res) => {
  try {
    const paseSalidaDetalles = await PaseSalidaDetalle.getAll();
    res.json({
      success: true,
      data: paseSalidaDetalles,
      count: paseSalidaDetalles.length
    });
  } catch (error) {
    console.error('Error getting pase salida detalles:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving pase salida detalles',
      message: error.message
    });
  }
});

// GET /api/pase-salida-detalle/:id - Get pase salida detalle by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const paseSalidaDetalle = await PaseSalidaDetalle.getById(id);
    
    if (!paseSalidaDetalle) {
      return res.status(404).json({
        success: false,
        error: 'Pase Salida Detalle not found',
        message: `No pase salida detalle found with ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: paseSalidaDetalle
    });
  } catch (error) {
    console.error('Error getting pase salida detalle:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving pase salida detalle',
      message: error.message
    });
  }
});

// POST /api/pase-salida-detalle - Create new pase salida detalle
router.post('/', async (req, res) => {
  try {
    const { idPaseSalida, idDetallePieza, Cantidad } = req.body;
    
    // Validation
    if (!idPaseSalida || !idDetallePieza || !Cantidad) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'idPaseSalida, idDetallePieza, and Cantidad are required'
      });
    }
    
    // Validate data types
    if (typeof idPaseSalida !== 'number' || typeof idDetallePieza !== 'number' || typeof Cantidad !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'idPaseSalida, idDetallePieza, and Cantidad must be numbers'
      });
    }
    
    // Validate positive quantities
    if (Cantidad <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Cantidad must be a positive number'
      });
    }
    
    const paseSalidaDetalleId = await PaseSalidaDetalle.create({ idPaseSalida, idDetallePieza, Cantidad });
    const newPaseSalidaDetalle = await PaseSalidaDetalle.getById(paseSalidaDetalleId);
    
    res.status(201).json({
      success: true,
      data: newPaseSalidaDetalle,
      message: 'Pase Salida Detalle created successfully'
    });
  } catch (error) {
    console.error('Error creating pase salida detalle:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating pase salida detalle',
      message: error.message
    });
  }
});

// PUT /api/pase-salida-detalle/:id - Update pase salida detalle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('PUT /api/pase-salida-detalle/' + id + ' body:', req.body);
    const { idPaseSalida, idDetallePieza, Cantidad } = req.body;
    
    // Validation
    if (!idPaseSalida || !idDetallePieza || !Cantidad) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'idPaseSalida, idDetallePieza, and Cantidad are required'
      });
    }
    
    // Validate data types
    if (typeof idPaseSalida !== 'number' || typeof idDetallePieza !== 'number' || typeof Cantidad !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'idPaseSalida, idDetallePieza, and Cantidad must be numbers'
      });
    }
    
    // Validate positive quantities
    if (Cantidad <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Cantidad must be a positive number'
      });
    }
    
    // Check if pase salida detalle exists
    const existingPaseSalidaDetalle = await PaseSalidaDetalle.getById(id);
    if (!existingPaseSalidaDetalle) {
      return res.status(404).json({
        success: false,
        error: 'Pase Salida Detalle not found',
        message: `No pase salida detalle found with ID ${id}`
      });
    }
    
    const changes = await PaseSalidaDetalle.update(id, { idPaseSalida, idDetallePieza, Cantidad });
    
    if (changes === 0) {
      return res.status(400).json({
        success: false,
        error: 'Update failed',
        message: 'No changes made to pase salida detalle'
      });
    }
    
    const updatedPaseSalidaDetalle = await PaseSalidaDetalle.getById(id);
    
    res.json({
      success: true,
      data: updatedPaseSalidaDetalle,
      message: 'Pase Salida Detalle updated successfully'
    });
  } catch (error) {
    console.error('Error updating pase salida detalle:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating pase salida detalle',
      message: error.message
    });
  }
});

// DELETE /api/pase-salida-detalle/:id - Delete pase salida detalle
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if pase salida detalle exists
    const existingPaseSalidaDetalle = await PaseSalidaDetalle.getById(id);
    if (!existingPaseSalidaDetalle) {
      return res.status(404).json({
        success: false,
        error: 'Pase Salida Detalle not found',
        message: `No pase salida detalle found with ID ${id}`
      });
    }
    
    const changes = await PaseSalidaDetalle.delete(id);
    
    res.json({
      success: true,
      message: 'Pase Salida Detalle deleted successfully',
      deletedId: id
    });
  } catch (error) {
    console.error('Error deleting pase salida detalle:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting pase salida detalle',
      message: error.message
    });
  }
});

// GET /api/pase-salida-detalle/pase-salida/:id - Get detalles by pase salida ID
router.get('/pase-salida/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const paseSalidaDetalles = await PaseSalidaDetalle.getByPaseSalida(id);
    
    res.json({
      success: true,
      data: paseSalidaDetalles,
      count: paseSalidaDetalles.length
    });
  } catch (error) {
    console.error('Error getting pase salida detalles by pase salida ID:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving pase salida detalles',
      message: error.message
    });
  }
});

// GET /api/pase-salida-detalle/detalle-pieza/:id - Get detalles by detalle pieza ID
router.get('/detalle-pieza/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const paseSalidaDetalles = await PaseSalidaDetalle.getByDetallePieza(id);
    
    res.json({
      success: true,
      data: paseSalidaDetalles,
      count: paseSalidaDetalles.length
    });
  } catch (error) {
    console.error('Error getting pase salida detalles by detalle pieza ID:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving pase salida detalles',
      message: error.message
    });
  }
});

module.exports = router;
