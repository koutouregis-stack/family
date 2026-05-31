const express = require('express');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateTokenPair } = require('../utils/jwt');
const { validateRegister, validateLogin, validateInput } = require('../middleware/validation');
const { verifyToken, verifyRefreshToken } = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();

// Register
router.post('/register', validateInput(validateRegister), async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body;

    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const [result] = await pool.query(
      'INSERT INTO users (nom, prenom, email, password) VALUES (?, ?, ?, ?)',
      [nom, prenom, email, hashedPassword]
    );

    const user = { id: result.insertId, nom, prenom, email };
    const tokens = generateTokenPair(user);

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user,
      ...tokens
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// Login
router.post('/login', validateInput(validateLogin), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND is_active = TRUE', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Generate tokens
    const tokens = generateTokenPair(user);

    res.json({
      message: 'Connexion réussie',
      user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email },
      ...tokens
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Refresh token
router.post('/refresh-token', verifyRefreshToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }

    const tokens = generateTokenPair(users[0]);
    res.json(tokens);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du renouvellement du token' });
  }
});

// Get profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, nom, prenom, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    res.json(users[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

module.exports = router;
