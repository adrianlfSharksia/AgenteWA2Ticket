require('dotenv').config();
const database = require('./database');
const emailService = require('./email-service');
const WhatsAppHandler = require('./whatsapp-handler');

// Main application
async function main() {
    console.log('===========================================');
    console.log('  WhatsApp to Ticket Agent');
    console.log('===========================================\n');

    try {
        // Initialize database connection
        console.log('1. Connecting to database...');
        await database.connect();

        // Initialize email service
        console.log('2. Initializing email service...');
        await emailService.initialize();

        // Initialize WhatsApp handler
        console.log('3. Starting WhatsApp client...');
        const whatsappHandler = new WhatsAppHandler();
        await whatsappHandler.initialize();

        console.log('\n===========================================');
        console.log('  Agent is running!');
        console.log('  Waiting for WhatsApp messages...');
        console.log('===========================================\n');

        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n\nShutting down gracefully...');
            await whatsappHandler.destroy();
            await database.close();
            console.log('Goodbye!');
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('\n\nReceived SIGTERM, shutting down...');
            await whatsappHandler.destroy();
            await database.close();
            process.exit(0);
        });

    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

// Run the application
main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
