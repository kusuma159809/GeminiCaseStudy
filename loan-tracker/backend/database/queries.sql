-- Common queries for the Loan Application Tracker

-- Get all loan applications with user details
SELECT 
    la.id,
    la.loan_amount,
    la.loan_type,
    la.status,
    la.stage,
    la.applicant_name,
    la.applicant_email,
    la.applicant_phone,
    la.created_at,
    u.first_name || ' ' || u.last_name as created_by
FROM loan_applications la
JOIN users u ON la.user_id = u.id
ORDER BY la.created_at DESC;

-- Get loan applications by status
SELECT * FROM loan_applications 
WHERE status = $1 
ORDER BY created_at DESC;

-- Get loan applications by stage
SELECT * FROM loan_applications 
WHERE stage = $1 
ORDER BY created_at DESC;

-- Get loan application with full details including stages
SELECT 
    la.*,
    u.first_name || ' ' || u.last_name as created_by,
    json_agg(
        json_build_object(
            'stage_name', ls.stage_name,
            'status', ls.status,
            'comments', ls.comments,
            'processed_at', ls.processed_at,
            'processed_by', pu.first_name || ' ' || pu.last_name
        ) ORDER BY ls.processed_at
    ) as stages
FROM loan_applications la
JOIN users u ON la.user_id = u.id
LEFT JOIN loan_stages ls ON la.id = ls.loan_id
LEFT JOIN users pu ON ls.processed_by = pu.id
WHERE la.id = $1
GROUP BY la.id, u.first_name, u.last_name;

-- Update loan application status and stage
UPDATE loan_applications 
SET status = $1, stage = $2, updated_at = CURRENT_TIMESTAMP 
WHERE id = $3;

-- Insert new loan stage entry
INSERT INTO loan_stages (loan_id, stage_name, status, comments, processed_by)
VALUES ($1, $2, $3, $4, $5);

-- Get loan statistics
SELECT 
    COUNT(*) as total_applications,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    AVG(loan_amount) as avg_loan_amount
FROM loan_applications;

-- Search loan applications
SELECT * FROM loan_applications 
WHERE 
    applicant_name ILIKE '%' || $1 || '%' OR
    applicant_email ILIKE '%' || $1 || '%' OR
    loan_type ILIKE '%' || $1 || '%'
ORDER BY created_at DESC;

-- Get user's loan applications
SELECT * FROM loan_applications 
WHERE user_id = $1 
ORDER BY created_at DESC;