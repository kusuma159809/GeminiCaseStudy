const DataStorage = require('./storage');

class DataMigration {
  static migrations = {
    '1.0.0': (data) => data,
    '1.1.0': (data) => {
      // Add new fields to existing loans
      if (data.loans) {
        data.loans = data.loans.map(loan => ({
          ...loan,
          priority: loan.priority || 'normal',
          assigned_officer: loan.assigned_officer || null
        }));
      }
      return data;
    },
    '1.2.0': (data) => {
      // Add loan categories
      if (data.loans) {
        data.loans = data.loans.map(loan => ({
          ...loan,
          category: loan.category || 'standard',
          risk_level: loan.risk_level || 'medium'
        }));
      }
      return data;
    }
  };

  static runMigrations() {
    const currentVersion = DataStorage.getVersion();
    const targetVersion = '1.2.0';
    
    if (currentVersion.version === targetVersion) {
      console.log('Data is up to date');
      return true;
    }

    console.log(`Migrating from ${currentVersion.version} to ${targetVersion}`);
    
    // Create backup before migration
    const backupPath = DataStorage.backup();
    if (backupPath) {
      console.log(`Backup created at: ${backupPath}`);
    }

    try {
      // Load existing data
      const loans = DataStorage.loadLoans();
      const users = DataStorage.loadUsers();
      
      let data = { loans, users };

      // Apply migrations in order
      const versions = Object.keys(this.migrations).sort();
      const startIndex = versions.indexOf(currentVersion.version);
      
      for (let i = startIndex + 1; i < versions.length; i++) {
        const version = versions[i];
        console.log(`Applying migration for version ${version}`);
        data = this.migrations[version](data);
      }

      // Save migrated data
      DataStorage.saveLoans(data.loans);
      DataStorage.saveUsers(data.users);
      DataStorage.saveVersion({
        version: targetVersion,
        lastMigration: new Date().toISOString()
      });

      console.log('Migration completed successfully');
      return true;
    } catch (error) {
      console.error('Migration failed:', error);
      return false;
    }
  }

  static addSampleData() {
    const loans = DataStorage.loadLoans();
    if (loans.length === 0) {
      const sampleLoans = [
        {
          id: 1,
          user_id: 1,
          loan_amount: 50000,
          loan_type: 'home',
          purpose: 'Home purchase',
          status: 'approved',
          stage: 'approved',
          applicant_name: 'John Doe',
          applicant_email: 'john@example.com',
          applicant_phone: '1234567890',
          annual_income: 80000,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          user_id: 1,
          loan_amount: 25000,
          loan_type: 'personal',
          purpose: 'Debt consolidation',
          status: 'pending',
          stage: 'credit_check',
          applicant_name: 'Jane Smith',
          applicant_email: 'jane@example.com',
          applicant_phone: '0987654321',
          annual_income: 60000,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      DataStorage.saveLoans(sampleLoans);
      console.log('Sample data added');
    }
  }
}

module.exports = DataMigration;