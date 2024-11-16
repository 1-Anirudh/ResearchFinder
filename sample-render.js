const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '/frontend/public')));

// Define a route to render the EJS file
app.get('/', (req, res) => {
    res.render('demo_com');
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port} see http://localhost:${port}`);
});