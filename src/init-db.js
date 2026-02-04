const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './database.db';
const schemaPath = path.join(__dirname, '../schema.sql');

console.log('Initializing database...');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database');
});

// Read and execute schema
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema, (err) => {
    if (err) {
        console.error('Error executing schema:', err.message);
        process.exit(1);
    }
    console.log('Database schema created successfully');
    
    // Close connection
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
            process.exit(1);
        }
        console.log('Database initialization completed');
    });
});
