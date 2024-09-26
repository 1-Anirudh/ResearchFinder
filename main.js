const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { registerUser, signInUser } = require('./firebaseConfig');
const { saveUserDetails } = require('./save-details');
const { submitFeedback } = require('./feedback');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Initialize session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// --- Extracted Utility Functions --- //

const handleLoginSuccess = (req, userCredential) => {
    req.session.isLoggedIn = true;
    req.session.userId = userCredential.user.uid; // Store the user's UID in the session
};

const handleRedirectWithMessage = (res, message, redirectUrl = '/') => {
    res.send(`
        <p>${message}</p>
        <script>
            setTimeout(function() {
                window.location.href = '${redirectUrl}';
            }, 1000);
        </script>
    `);
};

// --- Route Handlers --- //

// Handle registration form submission
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userCredential = await registerUser(email, password);
        handleLoginSuccess(req, userCredential);
        res.redirect('/add-pdetails');
    } catch (error) {
        res.send(`Registration failed: ${error.message}`);
    }
});

// Handle login form submission
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log("email", email);
    console.log("password", password);
    try {
        const userCredential = await signInUser(email, password);
        handleLoginSuccess(req, userCredential);
        res.redirect('/');
    } catch (error) {
        handleRedirectWithMessage(res, `Login failed: ${error.message}`);
    }
});

// Access control utility
const ensureLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        handleRedirectWithMessage(res, 'Access denied. Please login first.');
    } else {
        next();
    }
};

app.get('/index', (req, res) => {
    if (req.session.isLoggedIn) {
        res.redirect('/home');
    }
    res.render('index');
});

// Home page route
app.get('/home', ensureLoggedIn, (req, res) => {
    res.render('landing', { 
        logoName: 'EurekaTribe', 
        profileName: req.session.name || 'User', 
        jobTitle: 'Student'
    });
});

// Serve index and login redirects
app.get('/', (req, res) => {
    if (req.session.isLoggedIn) {
        res.redirect('/home');
    } else {
        res.redirect('/index');
    }
});

app.get('/add-pdetails', ensureLoggedIn, (req, res) => {
    res.render('add-pdetails');
});

app.post('/save-pdetails', async (req, res) => {
    const { firstName, surName } = req.body;
    console.log("firstName", firstName);
    console.log("surName", surName);
    const uid = req.session.userId;
    if (!uid) {
        return res.send('Error: User not logged in.');
    }
    try {
        await saveUserDetails(firstName, surName);
        handleRedirectWithMessage(res, 'Details saved successfully!', '/add-details');
    }
    catch (error) {
        handleRedirectWithMessage(res, `Error saving details: ${error.message}`, '/add-details');
    }
});

// Serve add-details form
app.get('/add-details', ensureLoggedIn, (req, res) => {
    res.render('add-details');
});

// Handle saving details
app.post('/save-details', async (req, res) => {
    const { name, interests, skills } = req.body;
    req.session.name = name;
    const uid = req.session.userId;
    if (!uid) {
        return res.send('Error: User not logged in.');
    }
    try {
        await saveUserDetails(uid, name, interests, skills);
        handleRedirectWithMessage(res, 'Details saved successfully!');
    } catch (error) {
        handleRedirectWithMessage(res, `Error saving details: ${error.message}`);
    }
});

// Serve feedback form
app.get('/feedback', (req, res) => {
    res.render('feedback');
});

// Handle feedback form submission
app.post('/feedback', async (req, res) => {
    const { score, feedback } = req.body;
    console.log("score", score);
    console.log("feedback", feedback);
    try {
        await submitFeedback(score, feedback);
        handleRedirectWithMessage(res, 'Thank you for the feedback!');
    } catch (error) {
        handleRedirectWithMessage(res, `Error submitting feedback: ${error.message}`);
    }
});

// Serve profile page
app.get('/profile', (req, res) => {
    res.render('profile', {
        profileImage: 'https://via.placeholder.com/150',
        userName: req.session.name || 'User',
        userEmail: req.session.email || 'user@example.com',
        firstName: 'John',
        surname: 'Doe',
        mobileNumber: '1234567890',
        addressLine1: '123, Main Street',
        addressLine2: 'Area',
        postcode: '12345',
        state: 'State',
        area: 'Area',
        email: 'user@example.com',
        education: 'Degree',
        country: 'Country',
        stateRegion: 'State',
        experienceDesigning: '5 years',
        additionalDetails: 'Additional details'
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/');
        }
        res.redirect('/'); // Redirect to login or home page after logout
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} see http://localhost:${PORT}`);
});
