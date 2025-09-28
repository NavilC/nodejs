const express = require('express');
const router = express.Router();
const PaseSalida = require('../models/paseSalida');

// GET /api/pase-salida - Get all pases de salida
router.get('/', async (req, res) => {
  try {
    const pasesSalida = await PaseSalida.getAll();
    res.json({
      success: true,
      data: pasesSalida,
      count: pasesSalida.length
    });
  } catch (error) {
    console.error('Error getting pases de salida:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving pases de salida',
      message: error.message
    });
  }
});

// GET /api/pase-salida/:id - Get pase de salida by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const paseSalida = await PaseSalida.getById(id);
    
    if (!paseSalida) {
      return res.status(404).json({
        success: false,
        error: 'Pase de Salida not found',
        message: `No pase de salida found with ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: paseSalida
    });
  } catch (error) {
    console.error('Error getting pase de salida:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving pase de salida',
      message: error.message
    });
  }
});

// POST /api/pase-salida - Create new pase de salida
router.post('/', async (req, res) => {
  try {
    const { idProyecto, idUsuarios } = req.body;
    
    // Validation
    if (!idProyecto || !idUsuarios) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'idProyecto and idUsuarios are required'
      });
    }
    
    // Validate data types
    if (typeof idProyecto !== 'number' || typeof idUsuarios !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'idProyecto and idUsuarios must be numbers'
      });
    }
    
    const paseSalidaId = await PaseSalida.create({ idProyecto, idUsuarios });
    const newPaseSalida = await PaseSalida.getById(paseSalidaId);
    
    res.status(201).json({
      success: true,
      data: newPaseSalida,
      message: 'Pase de Salida created successfully'
    });
  } catch (error) {
    console.error('Error creating pase de salida:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating pase de salida',
      message: error.message
    });
  }
});

// PUT /api/pase-salida/:id - Update pase de salida
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { idProyecto, idUsuarios } = req.body;
    
    // Validation
    if (!idProyecto || !idUsuarios) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'idProyecto and idUsuarios are required'
      });
    }
    
    // Validate data types
    if (typeof idProyecto !== 'number' || typeof idUsuarios !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'idProyecto and idUsuarios must be numbers'
      });
    }
    
    // Check if pase de salida exists
    const existingPaseSalida = await PaseSalida.getById(id);
    if (!existingPaseSalida) {
      return res.status(404).json({
        success: false,
        error: 'Pase de Salida not found',
        message: `No pase de salida found with ID ${id}`
      });
    }
    
    const changes = await PaseSalida.update(id, { idProyecto, idUsuarios });
    
    if (changes === 0) {
      return res.status(400).json({
        success: false,
        error: 'Update failed',
        message: 'No changes made to pase de salida'
      });
    }
    
    const updatedPaseSalida = await PaseSalida.getById(id);
    
    res.json({
      success: true,
      data: updatedPaseSalida,
      message: 'Pase de Salida updated successfully'
    });
  } catch (error) {
    console.error('Error updating pase de salida:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating pase de salida',
      message: error.message
    });
  }
});

// DELETE /api/pase-salida/:id - Delete pase de salida
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if pase de salida exists
    const existingPaseSalida = await PaseSalida.getById(id);
    if (!existingPaseSalida) {
      return res.status(404).json({
        success: false,
        error: 'Pase de Salida not found',
        message: `No pase de salida found with ID ${id}`
      });
    }
    
    const changes = await PaseSalida.delete(id);
    
    res.json({
      success: true,
      message: 'Pase de Salida deleted successfully',
      deletedId: id
    });
  } catch (error) {
    console.error('Error deleting pase de salida:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting pase de salida',
      message: error.message
    });
  }
});

// GET /api/pase-salida/:id/detalles - Get detalles for a pase de salida
router.get('/:id/detalles', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if pase de salida exists
    const paseSalida = await PaseSalida.getById(id);
    if (!paseSalida) {
      return res.status(404).json({
        success: false,
        error: 'Pase de Salida not found',
        message: `No pase de salida found with ID ${id}`
      });
    }
    
    const detalles = await PaseSalida.getDetalles(id);
    
    res.json({
      success: true,
      data: detalles,
      count: detalles.length
    });
  } catch (error) {
    console.error('Error getting detalles for pase de salida:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving detalles',
      message: error.message
    });
  }
});

module.exports = router;
