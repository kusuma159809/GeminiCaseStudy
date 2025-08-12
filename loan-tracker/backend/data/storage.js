const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'files');
const LOANS_FILE = path.join(DATA_DIR, 'loans.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const VERSION_FILE = path.join(DATA_DIR, 'version.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class DataStorage {
  static loadLoans() {
    try {
      if (fs.existsSync(LOANS_FILE)) {
        const data = fs.readFileSync(LOANS_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading loans:', error);
    }
    return [];
  }

  static saveLoans(loans) {
    try {
      fs.writeFileSync(LOANS_FILE, JSON.stringify(loans, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving loans:', error);
      return false;
    }
  }

  static loadUsers() {
    try {
      if (fs.existsSync(USERS_FILE)) {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
    return [];
  }

  static saveUsers(users) {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving users:', error);
      return false;
    }
  }

  static getVersion() {
    try {
      if (fs.existsSync(VERSION_FILE)) {
        const data = fs.readFileSync(VERSION_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading version:', error);
    }
    return { version: '1.0.0', lastMigration: null };
  }

  static saveVersion(versionInfo) {
    try {
      fs.writeFileSync(VERSION_FILE, JSON.stringify(versionInfo, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving version:', error);
      return false;
    }
  }

  static backup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(DATA_DIR, 'backups', timestamp);
    
    try {
      fs.mkdirSync(backupDir, { recursive: true });
      
      if (fs.existsSync(LOANS_FILE)) {
        fs.copyFileSync(LOANS_FILE, path.join(backupDir, 'loans.json'));
      }
      if (fs.existsSync(USERS_FILE)) {
        fs.copyFileSync(USERS_FILE, path.join(backupDir, 'users.json'));
      }
      if (fs.existsSync(VERSION_FILE)) {
        fs.copyFileSync(VERSION_FILE, path.join(backupDir, 'version.json'));
      }
      
      return backupDir;
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  }
}

module.exports = DataStorage;