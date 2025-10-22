const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuarios');
const bcrypt = require('bcryptjs');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { credential, password } = req.body;
    if (!credential || !password) return res.status(400).json({ success: false, message: 'Nombre y contraseña requeridos' });

    const usuarios = await Usuario.getAll();
    // buscar por Nombre (case-insensitive)
    const nc = String(credential).trim().toLowerCase();
    const user = usuarios.find(u => u.Nombre && String(u.Nombre).trim().toLowerCase() === nc);

    if (!user) return res.status(401).json({ success: false, message: 'Usuario no encontrado' });

    if (!user.password) return res.status(401).json({ success: false, message: 'Usuario no tiene contraseña registrada' });

    const match = await bcrypt.compare(String(password), String(user.password));
    if (!match) return res.status(401).json({ success: false, message: 'Credenciales inválidas' });

    const safeUser = Object.assign({}, user);
    delete safeUser.password;
    return res.json({ success: true, data: safeUser });
  } catch (err) {
    console.error('POST /api/auth/login error:', err);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;
