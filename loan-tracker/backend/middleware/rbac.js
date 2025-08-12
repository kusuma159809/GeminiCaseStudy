const checkStatusUpdatePermission = (req, res, next) => {
  const userRole = req.user?.role || 'user';
  const { status } = req.body;
  
  const permissions = {
    'user': [],
    'loan_officer': ['pending'],
    'senior_officer': ['pending', 'approved', 'rejected'],
    'admin': ['pending', 'approved', 'rejected']
  };
  
  const allowedStatuses = permissions[userRole] || [];
  
  if (status && !allowedStatuses.includes(status)) {
    return res.status(403).json({
      error: `Role '${userRole}' cannot set status to '${status}'`,
      allowedStatuses
    });
  }
  
  next();
};

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role || 'user';
    
    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.'
      });
    }
  };
};

module.exports = { checkStatusUpdatePermission, checkRole };