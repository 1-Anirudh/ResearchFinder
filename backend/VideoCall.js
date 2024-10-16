const express = require('express');
const { urlencoded } = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const { join } = require('path');
const session = require('express-session');
const { config } = require('dotenv');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

config();

function getLocalIpAddress() {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
      for (const iface of networkInterfaces[interfaceName]) {
          // Check for IPv4 and not internal loopback address
          if (iface.family === 'IPv4' && !iface.internal) {
              return iface.address;
          }
      }
  }
  return null; // If no IP address is found
}

app.use(urlencoded({ extended: true }));
const PORT = process.env.VIDEO_CALL_SERVER_PORT;
const HOST = getLocalIpAddress(); // Replace with your desired IP address

// Extracted Middleware Configuration
function configureMiddleware(app) {
    // Set the view engine to EJS
    app.set('view engine', 'ejs');
    app.set('views', join(__dirname, 'views'));

    // Serve static files
    app.use(express.static(join(__dirname, 'public')));

    // Initialize session middleware
    app.use(session({
        secret: 'no_secrets',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } // Set to true if using HTTPS
    }));
}

configureMiddleware(app);

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', socket.id);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', socket.id);
    });

    socket.on('offer', (offer) => {
      socket.to(roomId).emit('offer', offer);
    });

    socket.on('answer', (answer) => {
      socket.to(roomId).emit('answer', answer);
    });

    socket.on('ice-candidate', (candidate) => {
      socket.to(roomId).emit('ice-candidate', candidate);
    });
  });
});

app.get('/video-call', (req, res) => {
    const roomId  = req.query.roomId;
    res.render('d1', { roomId: roomId });
  });

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
