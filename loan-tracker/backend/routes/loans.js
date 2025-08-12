const express = require('express');
const LoanModel = require('../models/loanModel');
const { authenticateToken } = require('../middleware/auth');
const { checkStatusUpdatePermission } = require('../middleware/rbac');
const logger = require('../config/logger');
const DataStorage = require('../data/storage');

const router = express.Router();

// Load existing loans from storage
let loans = DataStorage.loadLoans();
let loanIdCounter = loans.length > 0 ? Math.max(...loans.map(l => l.id)) + 1 : 1;

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { status, stage, search } = req.query;
    let filteredLoans = loans;
    
    if (status) {
      filteredLoans = filteredLoans.filter(loan => loan.status === status);
    }
    if (stage) {
      filteredLoans = filteredLoans.filter(loan => loan.stage === stage);
    }
    if (search) {
      filteredLoans = filteredLoans.filter(loan => 
        loan.applicant_name.toLowerCase().includes(search.toLowerCase()) ||
        loan.applicant_email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json(filteredLoans);
  } catch (error) {
    logger.error('Get loans error:', error);
    res.status(500).json({ error: 'Failed to fetch loans' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const loan = loans.find(l => l.id == req.params.id);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    res.json({ ...loan, stages: [] });
  } catch (error) {
    logger.error('Get loan error:', error);
    res.status(500).json({ error: 'Failed to fetch loan' });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('Received loan data:', req.body);
    console.log('User:', req.user);
    
    const loan = {
      id: loanIdCounter++,
      ...req.body,
      user_id: 1,
      status: 'pending',
      stage: 'application_submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    loans.push(loan);
    DataStorage.saveLoans(loans);
    console.log('Created loan:', loan);
    console.log('Total loans:', loans.length);
    
    logger.info(`New loan application created: ${loan.id}`);
    res.status(201).json(loan);
  } catch (error) {
    console.error('Create loan error:', error);
    logger.error('Create loan error:', error);
    res.status(500).json({ error: 'Failed to create loan application' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const loanIndex = loans.findIndex(l => l.id == req.params.id);
    if (loanIndex === -1) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    loans[loanIndex] = { ...loans[loanIndex], ...req.body, updated_at: new Date().toISOString() };
    DataStorage.saveLoans(loans);
    logger.info(`Loan ${req.params.id} updated`);
    res.json(loans[loanIndex]);
  } catch (error) {
    logger.error('Update loan error:', error);
    res.status(500).json({ error: 'Failed to update loan' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const loanIndex = loans.findIndex(l => l.id == req.params.id);
    if (loanIndex === -1) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    loans.splice(loanIndex, 1);
    DataStorage.saveLoans(loans);
    logger.info(`Loan ${req.params.id} deleted`);
    res.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    logger.error('Delete loan error:', error);
    res.status(500).json({ error: 'Failed to delete loan' });
  }
});

router.post('/:id/stages', async (req, res) => {
  try {
    const stage = {
      id: Date.now(),
      loan_id: req.params.id,
      ...req.body,
      processed_by: 1,
      processed_at: new Date().toISOString()
    };
    
    logger.info(`Stage added to loan ${req.params.id}`);
    res.status(201).json(stage);
  } catch (error) {
    logger.error('Add stage error:', error);
    res.status(500).json({ error: 'Failed to add stage' });
  }
});

router.get('/dashboard/stats', async (req, res) => {
  try {
    const totalLoans = loans.length;
    const totalAmount = loans.reduce((sum, loan) => sum + parseFloat(loan.loan_amount || 0), 0);
    const approvedLoans = loans.filter(loan => loan.status === 'approved');
    const pendingLoans = loans.filter(loan => loan.status === 'pending');
    const rejectedLoans = loans.filter(loan => loan.status === 'rejected');
    
    const approvedAmount = approvedLoans.reduce((sum, loan) => sum + parseFloat(loan.loan_amount || 0), 0);
    const pendingAmount = pendingLoans.reduce((sum, loan) => sum + parseFloat(loan.loan_amount || 0), 0);
    
    // Loan trends by month
    const monthlyData = {};
    loans.forEach(loan => {
      const month = new Date(loan.created_at).toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { count: 0, amount: 0 };
      }
      monthlyData[month].count++;
      monthlyData[month].amount += parseFloat(loan.loan_amount || 0);
    });
    
    const trends = Object.keys(monthlyData).sort().map(month => ({
      month,
      count: monthlyData[month].count,
      amount: monthlyData[month].amount
    }));
    
    res.json({
      totalLoans,
      totalAmount,
      approvedCount: approvedLoans.length,
      pendingCount: pendingLoans.length,
      rejectedCount: rejectedLoans.length,
      approvedAmount,
      pendingAmount,
      trends
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

router.patch('/:id/status', checkStatusUpdatePermission, async (req, res) => {
  try {
    const { status } = req.body;
    const loanIndex = loans.findIndex(l => l.id == req.params.id);
    
    if (loanIndex === -1) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    const oldStatus = loans[loanIndex].status;
    loans[loanIndex] = {
      ...loans[loanIndex],
      status,
      updated_at: new Date().toISOString(),
      updated_by: req.user?.email || 'system'
    };
    
    logger.info(`Loan ${req.params.id} status changed from ${oldStatus} to ${status} by ${req.user?.email}`);
    res.json(loans[loanIndex]);
  } catch (error) {
    logger.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

router.get('/permissions', async (req, res) => {
  const userRole = req.user?.role || 'user';
  const permissions = {
    'user': { canUpdate: false, allowedStatuses: [] },
    'loan_officer': { canUpdate: true, allowedStatuses: ['pending'] },
    'senior_officer': { canUpdate: true, allowedStatuses: ['pending', 'approved', 'rejected'] },
    'admin': { canUpdate: true, allowedStatuses: ['pending', 'approved', 'rejected'] }
  };
  
  res.json(permissions[userRole] || permissions['user']);
});

module.exports = router;