const express = require('express');
const router = express.Router();
const DetallePieza = require('../models/detallePieza');

// GET /api/detalle-pieza - Get all detalle piezas
router.get('/', async (req, res) => {
  try {
    const detallePiezas = await DetallePieza.getAll();
    res.json({
      success: true,
      data: detallePiezas,
      count: detallePiezas.length
    });
  } catch (error) {
    console.error('Error getting detalle piezas:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving detalle piezas',
      message: error.message
    });
  }
});

// GET /api/detalle-pieza/:id - Get detalle pieza by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const detallePieza = await DetallePieza.getById(id);
    
    if (!detallePieza) {
      return res.status(404).json({
        success: false,
        error: 'Detalle Pieza not found',
        message: `No detalle pieza found with ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: detallePieza
    });
  } catch (error) {
    console.error('Error getting detalle pieza:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving detalle pieza',
      message: error.message
    });
  }
});

// POST /api/detalle-pieza - Create new detalle pieza
router.post('/', async (req, res) => {
  try {
    const { cantidad, Tipo, Marca } = req.body;
    
    // Validation
    if (!cantidad || !Tipo || !Marca) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'cantidad, Tipo, and Marca are required'
      });
    }
    
    // Validate data types
    if (typeof cantidad !== 'number' || cantidad <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'cantidad must be a positive number'
      });
    }
    
    const detallePiezaId = await DetallePieza.create({ cantidad, Tipo, Marca });
    const newDetallePieza = await DetallePieza.getById(detallePiezaId);
    
    res.status(201).json({
      success: true,
      data: newDetallePieza,
      message: 'Detalle Pieza created successfully'
    });
  } catch (error) {
    console.error('Error creating detalle pieza:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating detalle pieza',
      message: error.message
    });
  }
});

// PUT /api/detalle-pieza/:id - Update detalle pieza
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad, Tipo, Marca } = req.body;
    
    // Validation
    if (!cantidad || !Tipo || !Marca) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'cantidad, Tipo, and Marca are required'
      });
    }
    
    // Validate data types
    if (typeof cantidad !== 'number' || cantidad <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'cantidad must be a positive number'
      });
    }
    
    // Check if detalle pieza exists
    const existingDetallePieza = await DetallePieza.getById(id);
    if (!existingDetallePieza) {
      return res.status(404).json({
        success: false,
        error: 'Detalle Pieza not found',
        message: `No detalle pieza found with ID ${id}`
      });
    }
    
    const changes = await DetallePieza.update(id, { cantidad, Tipo, Marca });
    
    if (changes === 0) {
      return res.status(400).json({
        success: false,
        error: 'Update failed',
        message: 'No changes made to detalle pieza'
      });
    }
    
    const updatedDetallePieza = await DetallePieza.getById(id);
    
    res.json({
      success: true,
      data: updatedDetallePieza,
      message: 'Detalle Pieza updated successfully'
    });
  } catch (error) {
    console.error('Error updating detalle pieza:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating detalle pieza',
      message: error.message
    });
  }
});

// DELETE /api/detalle-pieza/:id - Delete detalle pieza
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if detalle pieza exists
    const existingDetallePieza = await DetallePieza.getById(id);
    if (!existingDetallePieza) {
      return res.status(404).json({
        success: false,
        error: 'Detalle Pieza not found',
        message: `No detalle pieza found with ID ${id}`
      });
    }
    
    const changes = await DetallePieza.delete(id);
    
    res.json({
      success: true,
      message: 'Detalle Pieza deleted successfully',
      deletedId: id
    });
  } catch (error) {
    console.error('Error deleting detalle pieza:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting detalle pieza',
      message: error.message
    });
  }
});

// GET /api/detalle-pieza/:id/pase-salida-detalles - Get pase salida detalles for a detalle pieza
router.get('/:id/pase-salida-detalles', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if detalle pieza exists
    const detallePieza = await DetallePieza.getById(id);
    if (!detallePieza) {
      return res.status(404).json({
        success: false,
        error: 'Detalle Pieza not found',
        message: `No detalle pieza found with ID ${id}`
      });
    }
    
    const paseSalidaDetalles = await DetallePieza.getPaseSalidaDetalles(id);
    
    res.json({
      success: true,
      data: paseSalidaDetalles,
      count: paseSalidaDetalles.length
    });
  } catch (error) {
    console.error('Error getting pase salida detalles for detalle pieza:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving pase salida detalles',
      message: error.message
    });
  }
});

module.exports = router;
