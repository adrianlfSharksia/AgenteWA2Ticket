const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = null;
        this.initialized = false;
    }

    /**
     * Initialize email transporter
     */
    async initialize() {
        try {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            // Verify connection
            await this.transporter.verify();
            console.log('Email service initialized successfully');
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing email service:', error.message);
            this.initialized = false;
        }
    }

    /**
     * Send ticket confirmation email
     * @param {Object} emailData - Email information
     * @param {string} emailData.to - Recipient email address
     * @param {string} emailData.name - Recipient name
     * @param {string} emailData.serviceNumber - Ticket service number
     * @param {string} emailData.message - Original WhatsApp message
     * @returns {Promise<boolean>} Success status
     */
    async sendTicketConfirmation(emailData) {
        if (!this.initialized) {
            console.error('Email service not initialized');
            return false;
        }

        try {
            const { to, name, serviceNumber, message } = emailData;

            const mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Sistema de Tickets',
                    address: process.env.EMAIL_FROM || process.env.SMTP_USER
                },
                to: to,
                subject: `Ticket Creado: #${serviceNumber}`,
                html: this.generateEmailHTML(name, serviceNumber, message),
                text: this.generateEmailText(name, serviceNumber, message)
            };

            console.log(`Sending confirmation email to ${to}...`);
            const info = await this.transporter.sendMail(mailOptions);
            
            console.log('Email sent successfully:', info.messageId);
            return true;

        } catch (error) {
            console.error('Error sending email:', error.message);
            return false;
        }
    }

    /**
     * Generate HTML email template
     */
    generateEmailHTML(name, serviceNumber, message) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .ticket-number { font-size: 24px; font-weight: bold; color: #4CAF50; margin: 20px 0; }
        .message-box { background-color: white; padding: 15px; border-left: 4px solid #4CAF50; margin: 15px 0; }
        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Ticket Creado Exitosamente</h1>
        </div>
        <div class="content">
            <p>Hola <strong>${name || 'Usuario'}</strong>,</p>
            
            <p>Tu ticket ha sido creado correctamente.</p>
            
            <div class="ticket-number">
                Número de Ticket: #${serviceNumber}
            </div>
            
            <p><strong>Mensaje recibido:</strong></p>
            <div class="message-box">
                ${message}
            </div>
            
            <p>Nuestro equipo revisará tu solicitud y te contactará pronto.</p>
            
            <p>Gracias por contactarnos.</p>
        </div>
        <div class="footer">
            <p>Este es un correo automático, por favor no responder.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * Generate plain text email
     */
    generateEmailText(name, serviceNumber, message) {
        return `
Hola ${name || 'Usuario'},

Tu ticket ha sido creado correctamente.

Número de Ticket: #${serviceNumber}

Mensaje recibido:
${message}

Nuestro equipo revisará tu solicitud y te contactará pronto.

Gracias por contactarnos.

---
Este es un correo automático, por favor no responder.
        `;
    }
}

module.exports = new EmailService();
