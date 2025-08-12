const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../models/database');
const router = express.Router();

// Test database connection
router.get('/db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ status: 'Database connected', time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// Check if users table exists and has data
router.get('/users', async (req, res) => {
  try {
    const result = await db.query('SELECT id, email, first_name, last_name FROM users');
    res.json({ users: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Users table error', details: error.message });
  }
});

// Create test user
router.post('/create-user', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const result = await db.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email',
      ['admin@loantracker.com', hashedPassword, 'Admin', 'User', 'admin']
    );
    res.json({ message: 'User created', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'User creation failed', details: error.message });
  }
});

module.exports = router;