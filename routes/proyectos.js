const express = require('express');
const router = express.Router();
const Proyecto = require('../models/proyectos');

// GET /api/proyectos - Get all proyectos
router.get('/', async (req, res) => {
  try {
    const proyectos = await Proyecto.getAll();
    res.json({
      success: true,
      data: proyectos,
      count: proyectos.length
    });
  } catch (error) {
    console.error('Error getting proyectos:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving proyectos',
      message: error.message
    });
  }
});

// GET /api/proyectos/:id - Get proyecto by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await Proyecto.getById(id);
    
    if (!proyecto) {
      return res.status(404).json({
        success: false,
        error: 'Proyecto not found',
        message: `No proyecto found with ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: proyecto
    });
  } catch (error) {
    console.error('Error getting proyecto:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving proyecto',
      message: error.message
    });
  }
});

// POST /api/proyectos - Create new proyecto
router.post('/', async (req, res) => {
  try {
    const { 'Orden de Venta': ordenVenta, Nombre, SEC } = req.body;
    
    // Validation
    if (!ordenVenta || !Nombre || !SEC) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Orden de Venta, Nombre, and SEC are required'
      });
    }
    
    // Validate data types
    if (typeof ordenVenta !== 'number' || typeof SEC !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Orden de Venta and SEC must be numbers'
      });
    }
    
    const proyectoId = await Proyecto.create({ 'Orden de Venta': ordenVenta, Nombre, SEC });
    const newProyecto = await Proyecto.getById(proyectoId);
    
    res.status(201).json({
      success: true,
      data: newProyecto,
      message: 'Proyecto created successfully'
    });
  } catch (error) {
    console.error('Error creating proyecto:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating proyecto',
      message: error.message
    });
  }
});

// PUT /api/proyectos/:id - Update proyecto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 'Orden de Venta': ordenVenta, Nombre, SEC } = req.body;
    
    // Validation
    if (!ordenVenta || !Nombre || !SEC) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Orden de Venta, Nombre, and SEC are required'
      });
    }
    
    // Validate data types
    if (typeof ordenVenta !== 'number' || typeof SEC !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Orden de Venta and SEC must be numbers'
      });
    }
    
    // Check if proyecto exists
    const existingProyecto = await Proyecto.getById(id);
    if (!existingProyecto) {
      return res.status(404).json({
        success: false,
        error: 'Proyecto not found',
        message: `No proyecto found with ID ${id}`
      });
    }
    
    const changes = await Proyecto.update(id, { 'Orden de Venta': ordenVenta, Nombre, SEC });
    
    if (changes === 0) {
      return res.status(400).json({
        success: false,
        error: 'Update failed',
        message: 'No changes made to proyecto'
      });
    }
    
    const updatedProyecto = await Proyecto.getById(id);
    
    res.json({
      success: true,
      data: updatedProyecto,
      message: 'Proyecto updated successfully'
    });
  } catch (error) {
    console.error('Error updating proyecto:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating proyecto',
      message: error.message
    });
  }
});

// DELETE /api/proyectos/:id - Delete proyecto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if proyecto exists
    const existingProyecto = await Proyecto.getById(id);
    if (!existingProyecto) {
      return res.status(404).json({
        success: false,
        error: 'Proyecto not found',
        message: `No proyecto found with ID ${id}`
      });
    }
    
    const changes = await Proyecto.delete(id);
    
    res.json({
      success: true,
      message: 'Proyecto deleted successfully',
      deletedId: id
    });
  } catch (error) {
    console.error('Error deleting proyecto:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting proyecto',
      message: error.message
    });
  }
});

// GET /api/proyectos/:id/pases-salida - Get pases de salida for a proyecto
router.get('/:id/pases-salida', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if proyecto exists
    const proyecto = await Proyecto.getById(id);
    if (!proyecto) {
      return res.status(404).json({
        success: false,
        error: 'Proyecto not found',
        message: `No proyecto found with ID ${id}`
      });
    }
    
    const pasesSalida = await Proyecto.getPasesSalida(id);
    
    res.json({
      success: true,
      data: pasesSalida,
      count: pasesSalida.length
    });
  } catch (error) {
    console.error('Error getting pases de salida for proyecto:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving pases de salida',
      message: error.message
    });
  }
});

module.exports = router;
