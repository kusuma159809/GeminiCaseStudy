-- Create database
CREATE DATABASE loan_tracker;

-- Use the database
\c loan_tracker;

-- Users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan applications table
CREATE TABLE loan_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    loan_amount DECIMAL(12,2) NOT NULL,
    loan_type VARCHAR(50) NOT NULL,
    purpose TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    stage VARCHAR(50) DEFAULT 'application_submitted',
    applicant_name VARCHAR(200) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(20) NOT NULL,
    annual_income DECIMAL(12,2),
    employment_status VARCHAR(100),
    credit_score INTEGER,
    collateral_value DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan stages tracking
CREATE TABLE loan_stages (
    id SERIAL PRIMARY KEY,
    loan_id INTEGER REFERENCES loan_applications(id) ON DELETE CASCADE,
    stage_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    comments TEXT,
    processed_by INTEGER REFERENCES users(id),
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_loan_applications_user_id ON loan_applications(user_id);
CREATE INDEX idx_loan_applications_status ON loan_applications(status);
CREATE INDEX idx_loan_applications_stage ON loan_applications(stage);
CREATE INDEX idx_loan_stages_loan_id ON loan_stages(loan_id);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password, first_name, last_name, role) 
VALUES ('admin@loantracker.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin');