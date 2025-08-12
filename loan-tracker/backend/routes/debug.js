const express = require('express');
const router = express.Router();

// Simple test endpoint
router.post('/test-create', (req, res) => {
  console.log('Test create received:', req.body);
  res.json({ message: 'Test create successful', data: req.body });
});

// Test loan creation without auth
router.post('/loan-no-auth', (req, res) => {
  console.log('Loan creation test:', req.body);
  const loan = {
    id: Date.now(),
    ...req.body,
    status: 'pending',
    created_at: new Date().toISOString()
  };
  res.status(201).json(loan);
});

module.exports = router;