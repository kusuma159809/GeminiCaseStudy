export interface Loan {
  id?: number;
  user_id?: number;
  loan_amount: number;
  loan_type: string;
  purpose?: string;
  status?: string;
  stage?: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  annual_income?: number;
  employment_status?: string;
  credit_score?: number;
  collateral_value?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}