/**
 * Helper script to add phone-to-email mappings
 * Usage: node test/add-phone.js <phone> <email> [name]
 * Example: node test/add-phone.js 5215512345678 user@example.com "Juan Pérez"
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './database.db';

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
    console.error('Usage: node add-phone.js <phone> <email> [name]');
    console.error('Example: node add-phone.js 5215512345678 user@example.com "Juan Pérez"');
    process.exit(1);
}

const [phoneNumber, email, name] = args;

console.log('Adding phone-to-email mapping...');
console.log(`Phone: ${phoneNumber}`);
console.log(`Email: ${email}`);
console.log(`Name: ${name || '(not provided)'}`);

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});

// Insert or update mapping
const query = `
    INSERT INTO phone_email_mapping (phone_number, email, name, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(phone_number) 
    DO UPDATE SET email = ?, name = ?, updated_at = CURRENT_TIMESTAMP
`;

db.run(query, [phoneNumber, email, name || null, email, name || null], function(err) {
    if (err) {
        console.error('Error inserting/updating mapping:', err.message);
        db.close();
        process.exit(1);
    }

    console.log('\n✓ Mapping saved successfully!');
    console.log(`  Row ID: ${this.lastID}`);
    
    // Verify by reading back
    db.get('SELECT * FROM phone_email_mapping WHERE phone_number = ?', [phoneNumber], (err, row) => {
        if (err) {
            console.error('Error verifying:', err.message);
        } else if (row) {
            console.log('\nVerification:');
            console.log(`  Phone: ${row.phone_number}`);
            console.log(`  Email: ${row.email}`);
            console.log(`  Name: ${row.name || '(none)'}`);
            console.log(`  Created: ${row.created_at}`);
            console.log(`  Updated: ${row.updated_at}`);
        }
        
        db.close();
    });
});
