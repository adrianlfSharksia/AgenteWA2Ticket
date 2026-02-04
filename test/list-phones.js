/**
 * Helper script to list all phone-to-email mappings
 * Usage: node test/list-phones.js
 */

const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const dbPath = process.env.DB_PATH || './database.db';

console.log('Reading phone-to-email mappings from database...\n');

// Connect to database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});

// Query all mappings
db.all('SELECT * FROM phone_email_mapping ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
        console.error('Error querying database:', err.message);
        db.close();
        process.exit(1);
    }

    if (rows.length === 0) {
        console.log('No phone mappings found in database.');
        console.log('\nTo add a mapping, run:');
        console.log('  node test/add-phone.js <phone> <email> [name]');
    } else {
        console.log(`Found ${rows.length} mapping(s):\n`);
        console.log('═'.repeat(80));
        
        rows.forEach((row, index) => {
            console.log(`\n${index + 1}. ID: ${row.id}`);
            console.log(`   Phone:   ${row.phone_number}`);
            console.log(`   Email:   ${row.email}`);
            console.log(`   Name:    ${row.name || '(not set)'}`);
            console.log(`   Created: ${row.created_at}`);
            console.log(`   Updated: ${row.updated_at}`);
            console.log('─'.repeat(80));
        });
    }

    db.close();
});
