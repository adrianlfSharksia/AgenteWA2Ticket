/**
 * Mock API Server for Testing
 * Simulates a ticket creation API endpoint
 * Run with: node test/mock-api.js
 */

const http = require('http');

const PORT = 3001;

// Simple request body parser
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                reject(e);
            }
        });
    });
}

// Generate random service number
function generateServiceNumber() {
    return Math.floor(10000 + Math.random() * 90000);
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle OPTIONS request (CORS preflight)
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Log request
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);

    // Handle POST to /api/tickets
    if (req.method === 'POST' && req.url === '/api/tickets') {
        try {
            const body = await parseBody(req);
            console.log('Request Body:', JSON.stringify(body, null, 2));

            // Validate authorization (optional)
            const authHeader = req.headers.authorization;
            if (authHeader) {
                console.log('Authorization:', authHeader);
            }

            // Generate mock response
            const serviceNumber = generateServiceNumber();
            const response = {
                success: true,
                serviceNumber: serviceNumber,
                ticketId: serviceNumber,
                id: serviceNumber,
                status: 'created',
                message: 'Ticket created successfully',
                data: {
                    phone: body.phone,
                    email: body.email,
                    name: body.name,
                    message: body.message,
                    source: body.source,
                    timestamp: body.timestamp,
                    createdAt: new Date().toISOString()
                }
            };

            console.log('Response:', JSON.stringify(response, null, 2));

            // Send success response
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));

        } catch (error) {
            console.error('Error processing request:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: 'Invalid request body',
                message: error.message
            }));
        }
    } else {
        // Handle 404
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            error: 'Endpoint not found',
            message: `${req.method} ${req.url} is not supported`
        }));
    }
});

// Start server
server.listen(PORT, () => {
    console.log('===========================================');
    console.log('  Mock Ticket API Server');
    console.log('===========================================');
    console.log(`\nServer running at http://localhost:${PORT}/`);
    console.log(`\nEndpoint: POST http://localhost:${PORT}/api/tickets`);
    console.log('\nWaiting for requests...\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\nShutting down server...');
    server.close(() => {
        console.log('Server stopped');
        process.exit(0);
    });
});
