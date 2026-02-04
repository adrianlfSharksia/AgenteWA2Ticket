const axios = require('axios');
require('dotenv').config();

class TicketAPI {
    constructor() {
        this.apiEndpoint = process.env.API_ENDPOINT;
        this.apiKey = process.env.API_KEY;
        
        if (!this.apiEndpoint) {
            console.warn('Warning: API_ENDPOINT not configured');
        }
    }

    /**
     * Create a ticket in the REST API
     * @param {Object} ticketData - Ticket information
     * @param {string} ticketData.phoneNumber - Phone number of the requester
     * @param {string} ticketData.message - WhatsApp message content
     * @param {string} ticketData.email - Email associated with phone number
     * @param {string} ticketData.name - Name of the requester (optional)
     * @returns {Promise<Object>} API response with service number
     */
    async createTicket(ticketData) {
        try {
            const payload = {
                phone: ticketData.phoneNumber,
                message: ticketData.message,
                email: ticketData.email,
                name: ticketData.name || 'Usuario',
                source: 'whatsapp',
                timestamp: new Date().toISOString()
            };

            console.log('Creating ticket via API...');
            
            const response = await axios.post(this.apiEndpoint, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                timeout: 30000 // 30 seconds timeout
            });

            console.log('Ticket created successfully:', response.data);

            // Extract service number from response
            // Adjust this based on your actual API response structure
            const serviceNumber = response.data.serviceNumber 
                || response.data.ticketId 
                || response.data.id 
                || response.data.number;

            if (!serviceNumber) {
                console.warn('Service number not found in API response:', response.data);
            }

            return {
                success: true,
                serviceNumber: serviceNumber,
                data: response.data
            };

        } catch (error) {
            console.error('Error creating ticket:', error.message);
            
            if (error.response) {
                console.error('API response error:', error.response.status, error.response.data);
            }
            
            return {
                success: false,
                error: error.message,
                serviceNumber: null
            };
        }
    }
}

module.exports = new TicketAPI();
