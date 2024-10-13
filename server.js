const express = require('express');
const { urlencoded } = require('body-parser');
const session = require('express-session');
const { join } = require('path');
const { config } = require('dotenv');
const { addOpportunity } = require('./opportunity');
const { sendReleNotification } = require('./notification');
const { deleteData } = require('./tempDelete');
const http = require('http');
const WebSocket = require('ws');
const { time } = require('console');
const os = require('os');
const https = require('https');


config();
const app = express();
const server = http.createServer(app);
const PORT = process.env.SERVER_PORT;


async function getLocalIpAddress() {
    https.get('https://api.ipify.org?format=json', (resp) => {
        let data = '';

        // A chunk of data has been received
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result
        resp.on('end', () => {
            const ip = JSON.parse(data).ip;
            console.log(`Your public IP address is: ${ip}`);

            return ip;
        });

    });
    return null; // If no IP address is found
}
async function startServer() {
    try {
        const localIPaddress = await getLocalIpAddress();

        // Start WebSocket server after IP is retrieved
        const wss = new WebSocket.Server({ host: localIPaddress, port: process.env.WEB_SERVER_PORT || 4000 });

        console.log(`Server is running on ${localIPaddress}:${process.env.WEB_SERVER_PORT || 4000}`);

        // Handle WebSocket connections
        const userConnections = new Map();

        wss.on('connection', (ws, req) => {
            const userId = req.url.split('?userId=')[1];
            console.log('userID', userId);

            if (userId) {
                userConnections.set(userId, ws);
                console.log(`User ${userId} connected`);

                ws.on('message', (message) => {
                    console.log(`Received message from ${userId} => ${message}`);
                    const parsedMessage = JSON.parse(message);
                    const targetUserId = parsedMessage.targetUserId;
                    const targetWs = userConnections.get(targetUserId);

                    if (parsedMessage.type === 'chat-message' && targetWs && targetWs.readyState === WebSocket.OPEN) {
                        targetWs.send(JSON.stringify({
                            from: userId,
                            message: parsedMessage.message,
                            timestamp: parsedMessage.timestamp,
                            type: 'chat-message'
                        }));
                    }
                });

                ws.on('close', () => {
                    userConnections.delete(userId);
                    console.log(`User ${userId} disconnected`);
                });
            } else {
                ws.close();
                console.log('Connection closed due to missing user ID');
            }
        });

        // Function to send notifications to all clients
        function sendNotification(message) {
            console.log('Sending notification:', message);
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    } catch (error) {
        console.error('Error retrieving IP address:', error);
    }
}

// Call the function to start the server
startServer();


// Middleware to parse form data
app.use(urlencoded({ extended: true }));

// Extracted Middleware Configuration
function configureMiddleware(app) {
    // Set the view engine to EJS
    app.set('view engine', 'ejs');
    app.set('views', join(__dirname, 'views'));

    // Serve static files
    app.use(express.static(join(__dirname, 'public')));

    // Initialize session middleware
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } // Set to true if using HTTPS
    }));
}

configureMiddleware(app);

app.get('/', (req, res) => {
    res.render('opportunitiy');
});

app.post('/add-Opportunity', async (req, res) => {
    const { topic, description, location, experience } = req.body;
    console.log('topic', topic);
    console.log('description', description);
    console.log('location', location);
    console.log('experience', experience);
    try {
        await addOpportunity(topic, description, location, experience);
        await sendReleNotification(topic);
        res.status(201).send('Opportunity added successfully');
    } catch (error) {
        res.status(500).send('Error adding opportunity');
    }
});

app.get('/deleteuserData', (req, res) => {
    deleteData('opportunities');
    res.send('Data deleted successfully');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} see http://localhost:${PORT}`);
});