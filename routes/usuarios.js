const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuarios');

// GET /api/usuarios - Get all usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.getAll();
    res.json({
      success: true,
      data: usuarios,
      count: usuarios.length
    });
  } catch (error) {
    console.error('Error getting usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving usuarios',
      message: error.message
    });
  }
});

// GET /api/usuarios/:id - Get usuario by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.getById(id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario not found',
        message: `No usuario found with ID ${id}`
      });
    }
    
    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error getting usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving usuario',
      message: error.message
    });
  }
});

// POST /api/usuarios - Create new usuario
router.post('/', async (req, res) => {
  try {
    const { Nombre, Rol } = req.body;
    
    // Validation
    if (!Nombre || !Rol) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Nombre and Rol are required'
      });
    }
    
    const usuarioId = await Usuario.create({ Nombre, Rol });
    const newUsuario = await Usuario.getById(usuarioId);
    
    res.status(201).json({
      success: true,
      data: newUsuario,
      message: 'Usuario created successfully'
    });
  } catch (error) {
    console.error('Error creating usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating usuario',
      message: error.message
    });
  }
});

// PUT /api/usuarios/:id - Update usuario
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { Nombre, Rol } = req.body;
    
    // Validation
    if (!Nombre || !Rol) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Nombre and Rol are required'
      });
    }
    
    // Check if usuario exists
    const existingUsuario = await Usuario.getById(id);
    if (!existingUsuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario not found',
        message: `No usuario found with ID ${id}`
      });
    }
    
    const changes = await Usuario.update(id, { Nombre, Rol });
    
    if (changes === 0) {
      return res.status(400).json({
        success: false,
        error: 'Update failed',
        message: 'No changes made to usuario'
      });
    }
    
    const updatedUsuario = await Usuario.getById(id);
    
    res.json({
      success: true,
      data: updatedUsuario,
      message: 'Usuario updated successfully'
    });
  } catch (error) {
    console.error('Error updating usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating usuario',
      message: error.message
    });
  }
});

// DELETE /api/usuarios/:id - Delete usuario
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if usuario exists
    const existingUsuario = await Usuario.getById(id);
    if (!existingUsuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario not found',
        message: `No usuario found with ID ${id}`
      });
    }
    
    const changes = await Usuario.delete(id);
    
    res.json({
      success: true,
      message: 'Usuario deleted successfully',
      deletedId: id
    });
  } catch (error) {
    console.error('Error deleting usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting usuario',
      message: error.message
    });
  }
});

// GET /api/usuarios/:id/pases-salida - Get pases de salida for a usuario
router.get('/:id/pases-salida', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if usuario exists
    const usuario = await Usuario.getById(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuario not found',
        message: `No usuario found with ID ${id}`
      });
    }
    
    const pasesSalida = await Usuario.getPasesSalida(id);
    
    res.json({
      success: true,
      data: pasesSalida,
      count: pasesSalida.length
    });
  } catch (error) {
    console.error('Error getting pases de salida for usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving pases de salida',
      message: error.message
    });
  }
});

module.exports = router;
