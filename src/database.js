const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

class Database {
    constructor() {
        this.dbPath = process.env.DB_PATH || './database.db';
        this.db = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    resolve();
                }
            });
        });
    }

    /**
     * Get email address associated with a phone number
     * @param {string} phoneNumber - Phone number in international format
     * @returns {Promise<string|null>} Email address or null if not found
     */
    getEmailByPhone(phoneNumber) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT email, name FROM phone_email_mapping WHERE phone_number = ?';
            
            this.db.get(query, [phoneNumber], (err, row) => {
                if (err) {
                    console.error('Database query error:', err.message);
                    reject(err);
                } else {
                    resolve(row || null);
                }
            });
        });
    }

    /**
     * Add or update phone-to-email mapping
     * @param {string} phoneNumber - Phone number in international format
     * @param {string} email - Email address
     * @param {string} name - User name (optional)
     * @returns {Promise<void>}
     */
    upsertPhoneEmail(phoneNumber, email, name = null) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO phone_email_mapping (phone_number, email, name, updated_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(phone_number) 
                DO UPDATE SET email = ?, name = ?, updated_at = CURRENT_TIMESTAMP
            `;
            
            this.db.run(query, [phoneNumber, email, name, email, name], (err) => {
                if (err) {
                    console.error('Database insert/update error:', err.message);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err.message);
                        reject(err);
                    } else {
                        console.log('Database connection closed');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = new Database();
