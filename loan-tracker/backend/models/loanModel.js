const db = require('./database');

class LoanModel {
  static async create(loanData) {
    const query = `
      INSERT INTO loan_applications (
        user_id, loan_amount, loan_type, purpose, applicant_name, 
        applicant_email, applicant_phone, annual_income, employment_status, 
        credit_score, collateral_value
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const values = [
      loanData.user_id, loanData.loan_amount, loanData.loan_type,
      loanData.purpose, loanData.applicant_name, loanData.applicant_email,
      loanData.applicant_phone, loanData.annual_income, loanData.employment_status,
      loanData.credit_score, loanData.collateral_value
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT la.*, u.first_name || ' ' || u.last_name as created_by
      FROM loan_applications la
      JOIN users u ON la.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (filters.status) {
      paramCount++;
      query += ` AND la.status = $${paramCount}`;
      values.push(filters.status);
    }

    if (filters.stage) {
      paramCount++;
      query += ` AND la.stage = $${paramCount}`;
      values.push(filters.stage);
    }

    if (filters.search) {
      paramCount++;
      query += ` AND (la.applicant_name ILIKE $${paramCount} OR la.applicant_email ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
    }

    query += ' ORDER BY la.created_at DESC';
    const result = await db.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT la.*, u.first_name || ' ' || u.last_name as created_by
      FROM loan_applications la
      JOIN users u ON la.user_id = u.id
      WHERE la.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, updateData) {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE loan_applications 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${fields.length + 1}
      RETURNING *
    `;
    values.push(id);
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM loan_applications WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async addStage(loanId, stageData) {
    const query = `
      INSERT INTO loan_stages (loan_id, stage_name, status, comments, processed_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [loanId, stageData.stage_name, stageData.status, stageData.comments, stageData.processed_by];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async getStages(loanId) {
    const query = `
      SELECT ls.*, u.first_name || ' ' || u.last_name as processed_by_name
      FROM loan_stages ls
      LEFT JOIN users u ON ls.processed_by = u.id
      WHERE ls.loan_id = $1
      ORDER BY ls.processed_at ASC
    `;
    const result = await db.query(query, [loanId]);
    return result.rows;
  }
}

module.exports = LoanModel;