-- Schema for WhatsApp to Email mapping
CREATE TABLE IF NOT EXISTS phone_email_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_phone_number ON phone_email_mapping(phone_number);

-- Example data for testing (REMOVE THESE LINES BEFORE PRODUCTION DEPLOYMENT)
-- To add your own mappings, use: npm run add-phone <phone> <email> [name]
-- Or uncomment and modify the lines below:
-- INSERT OR IGNORE INTO phone_email_mapping (phone_number, email, name) VALUES 
--     ('5215512345678', 'usuario1@example.com', 'Usuario 1'),
--     ('5215587654321', 'usuario2@example.com', 'Usuario 2');
