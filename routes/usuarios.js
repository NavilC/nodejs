const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuarios');
const bcrypt = require('bcryptjs');

// GET /api/usuarios - Get all usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.getAll();
    // remove password before returning
    const safe = usuarios.map(u => { const s = Object.assign({}, u); delete s.password; return s; });
    res.json({ success: true, data: safe, count: safe.length });
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
    const safe = Object.assign({}, usuario); delete safe.password;
    res.json({ success: true, data: safe });
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
    const { Nombre, Rol, password } = req.body;
    
    // Validation
    if (!Nombre || !Rol) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Nombre and Rol are required'
      });
    }
    // Hash password if provided
    let hashed = null;
    if (typeof password !== 'undefined' && password !== null && String(password).length > 0) {
      hashed = await bcrypt.hash(String(password), 10);
    }

    const usuarioId = await Usuario.create({ Nombre, Rol, password: hashed });
    const newUsuario = await Usuario.getById(usuarioId);
    const safe = Object.assign({}, newUsuario); delete safe.password;
    res.status(201).json({ success: true, data: safe, message: 'Usuario created successfully' });
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
  const { Nombre, Rol, password } = req.body;
    
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
    
    // If password present, hash it before updating
    let hashedPass;
    if (typeof password !== 'undefined') {
      hashedPass = password && String(password).length > 0 ? await bcrypt.hash(String(password), 10) : '';
    }
    const changes = await Usuario.update(id, { Nombre, Rol, password: typeof password !== 'undefined' ? hashedPass : undefined });
    
    if (changes === 0) {
      return res.status(400).json({
        success: false,
        error: 'Update failed',
        message: 'No changes made to usuario'
      });
    }
    
    const updatedUsuario = await Usuario.getById(id);
    const safe = Object.assign({}, updatedUsuario); delete safe.password;
    res.json({ success: true, data: safe, message: 'Usuario updated successfully' });
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
