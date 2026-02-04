const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const database = require('./database');
const apiClient = require('./api-client');
const emailService = require('./email-service');

class WhatsAppHandler {
    constructor() {
        this.client = null;
        this.ready = false;
    }

    /**
     * Initialize WhatsApp client
     */
    async initialize() {
        console.log('Initializing WhatsApp client...');

        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            }
        });

        // QR Code generation
        this.client.on('qr', (qr) => {
            console.log('QR Code received. Scan with WhatsApp:');
            qrcode.generate(qr, { small: true });
        });

        // Client ready
        this.client.on('ready', () => {
            console.log('WhatsApp client is ready!');
            this.ready = true;
        });

        // Authentication
        this.client.on('authenticated', () => {
            console.log('WhatsApp client authenticated');
        });

        // Authentication failure
        this.client.on('auth_failure', (msg) => {
            console.error('WhatsApp authentication failed:', msg);
        });

        // Disconnection
        this.client.on('disconnected', (reason) => {
            console.log('WhatsApp client disconnected:', reason);
            this.ready = false;
        });

        // Message handler
        this.client.on('message', async (message) => {
            await this.handleMessage(message);
        });

        // Initialize client
        await this.client.initialize();
    }

    /**
     * Handle incoming WhatsApp message
     * @param {Object} message - WhatsApp message object
     */
    async handleMessage(message) {
        try {
            // Extract phone number (remove @c.us suffix)
            const phoneNumber = message.from.replace('@c.us', '');
            const messageBody = message.body;

            console.log(`\n--- New message from ${phoneNumber} ---`);
            console.log(`Message: ${messageBody}`);

            // Get email associated with phone number
            const userInfo = await database.getEmailByPhone(phoneNumber);

            if (!userInfo) {
                console.log(`No email found for phone number: ${phoneNumber}`);
                await message.reply(
                    'Lo siento, tu número de teléfono no está registrado en nuestro sistema. ' +
                    'Por favor contacta al administrador para registrar tu información.'
                );
                return;
            }

            console.log(`Email found: ${userInfo.email} (${userInfo.name})`);

            // Create ticket via API
            const ticketResult = await apiClient.createTicket({
                phoneNumber: phoneNumber,
                message: messageBody,
                email: userInfo.email,
                name: userInfo.name
            });

            if (!ticketResult.success || !ticketResult.serviceNumber) {
                console.error('Failed to create ticket');
                await message.reply(
                    'Lo siento, hubo un error al crear tu ticket. Por favor intenta de nuevo más tarde.'
                );
                return;
            }

            console.log(`Ticket created with service number: ${ticketResult.serviceNumber}`);

            // Send confirmation email
            const emailSent = await emailService.sendTicketConfirmation({
                to: userInfo.email,
                name: userInfo.name,
                serviceNumber: ticketResult.serviceNumber,
                message: messageBody
            });

            // Send WhatsApp confirmation
            const confirmationMessage = 
                `✅ Tu ticket ha sido creado exitosamente.\n\n` +
                `📝 Número de servicio: #${ticketResult.serviceNumber}\n\n` +
                `📧 Se ha enviado una confirmación a: ${userInfo.email}\n\n` +
                `Gracias por contactarnos. Nuestro equipo atenderá tu solicitud pronto.`;

            await message.reply(confirmationMessage);

            if (emailSent) {
                console.log('✓ Process completed successfully');
            } else {
                console.warn('✓ Ticket created but email failed to send');
            }

        } catch (error) {
            console.error('Error handling message:', error);
            try {
                await message.reply(
                    'Lo siento, ocurrió un error al procesar tu mensaje. Por favor intenta de nuevo.'
                );
            } catch (replyError) {
                console.error('Error sending error reply:', replyError);
            }
        }
    }

    /**
     * Get client status
     */
    isReady() {
        return this.ready;
    }

    /**
     * Destroy client
     */
    async destroy() {
        if (this.client) {
            await this.client.destroy();
        }
    }
}

module.exports = WhatsAppHandler;
