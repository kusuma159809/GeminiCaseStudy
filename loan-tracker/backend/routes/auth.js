const express = require('express');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const logger = require('../config/logger');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Simple test login - accepts any email with password 'admin123'
    if (password === 'admin123') {
      const token = jwt.sign(
        { userId: 1, email: email, role: 'admin' },
        'test-secret-key',
        { expiresIn: '24h' }
      );
      
      logger.info(`User ${email} logged in successfully`);
      return res.json({
        token,
        user: {
          id: 1,
          email: email,
          first_name: 'Test',
          last_name: 'User',
          role: 'admin'
        }
      });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = await UserModel.create({ email, password, first_name, last_name });
    logger.info(`New user registered: ${email}`);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

module.exports = router;