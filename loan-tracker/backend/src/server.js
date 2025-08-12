const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('../routes/auth');
const loanRoutes = require('../routes/loans');
const testRoutes = require('../routes/test');
const debugRoutes = require('../routes/debug');
const logger = require('../config/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Loan Tracker API', version: '1.0.0', endpoints: ['/api/auth/login', '/api/auth/register', '/api/loans', '/api/health'] });
});

app.post('/api/test-login', (req, res) => {
  res.json({ message: 'Test endpoint working', body: req.body });
});

app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/test', testRoutes);
app.use('/api/debug', debugRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Loan Tracker API is running' });
});

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});