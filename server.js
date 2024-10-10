const express = require('express');
const { urlencoded } = require('body-parser');
const session = require('express-session');
const { join } = require('path');
const { config } = require('dotenv');
const { addOpportunity } = require('./opportunity');
const { sendReleNotification } = require('./notification');
const http = require('http');
const WebSocket = require('ws');


config();
const app = express();
const server = http.createServer(app);
const PORT = process.env.SERVER_PORT;

const wss = new WebSocket.Server({ port: process.env.WEB_SERVER_PORT });

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Function to send notifications to all clients
function sendNotification(message) {
    console.log('Sending notification:', message); // Add logging here
    wss.clients.forEach((client) => {
        console.log('client', client);
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Example usage: Send a notification every 10 seconds
// setInterval(() => {
//     console.log('Sending notification...');
//     sendNotification('This is a notification message');
// }, 10000);


// Define the route to render index.ejs
app.get('/neww', (req, res) => {
    res.render('not');
});

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} see http://localhost:${PORT}`);
});