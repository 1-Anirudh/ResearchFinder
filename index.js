const express = require('express');
const session = require('express-session');
const path = require('path');
const { registerUser, signInUser } = require('./backend/firebaseConfig');
const { urlencoded } = require('body-parser');
const { getUserDetails } = require('./backend/get-details');
const { submitFeedback } = require('./backend/feedback');
const { getUserNotifications } = require('./backend/notification');

const { saveUserDetails } = require('./backend/save-details');
const { saveUserPersonalDetails, editUserPersonalDetails } = require('./backend/save-pdetails');


const { chatToDB } = require('./backend/notification');
const { getConversations } = require('./backend/get-conversations');
const { readServerIP } = require('./backend/serverIP');


const app = express();
const port = process.argv[2] || 3000;

// Set up EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.static(path.join(__dirname, '/frontend/public')));

app.use(urlencoded({ extended: true }));

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

const ensureLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        SessionUtils.handleRedirectWithMessage(res, 'Access denied. Please login first.');
    } else {
        next();
    }
};

class SessionUtils {
    static getUserId(session) {
        return session.userId;
    }

    static handleLoginSuccess(req, userCredential) {
        req.session.isLoggedIn = true;
        req.session.userId = userCredential.user.uid; // Store the user's UID in the session
        console.log("userCredential.user.uid", userCredential.user.uid);
    }

    static handleRedirectWithMessage(res, message, redirectUrl = '/') {
        const validUrls = ['/add-details', '/another-valid-url']; // List of valid URLs
        if (!validUrls.includes(redirectUrl)) {
            redirectUrl = '/'; // Default to home if URL is not valid
        }
        res.send(`
            <p>${message}</p>
            <script>
                setTimeout(function() {
                    window.location.href = '${redirectUrl}';
                }, 3000);
            </script>
        `);
    }

    static async userDetails(req) {
        try {
            if (!req.session.userDetails) {
                req.session.userDetails = await getUserDetails(SessionUtils.getUserId(req.session));
            }

            return req.session.userDetails;
        }
        catch (error) {
            console.error('Error getting user details:', error);
            throw error;
        }
    }

    static async editUserDetails(req, uDetails) {
        try {
            req.session.userDetails = uDetails;
        }
        catch (error) {
            console.error('Error getting user details:', error);
            throw error;
        }
    }
}

app.get('/index', (req, res) => {
    if (req.session.isLoggedIn) {
        res.redirect('/home');
    }
    res.render('index');
});

app.get('/', (req, res) => {
    if (req.session.isLoggedIn) {
        res.redirect('/home');
    } else {
        res.redirect('/index');
    }
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userCredential = await registerUser(email, password);
        SessionUtils.handleLoginSuccess(req, userCredential);
        SessionUtils.userDetails(req);
        res.redirect('/add-pdetails');
    } catch (error) {
        SessionUtils.handleRedirectWithMessage(res, `Registration failed: ${error.message}`);
    }
});

// Handle login form submission
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log("email", email);
    console.log("password", password);
    try {
        const userCredential = await signInUser(email, password);
        SessionUtils.handleLoginSuccess(req, userCredential);
        SessionUtils.userDetails(req);
        res.redirect('/');
    } catch (error) {
        SessionUtils.handleRedirectWithMessage(res, `Login failed: ${error.message}`);
    }
});

app.get('/home', ensureLoggedIn, async (req, res) => {
    console.log("userID" , SessionUtils.getUserId(req.session));
    const notifications = await getUserNotifications(SessionUtils.getUserId(req.session));
    const userDetails = await SessionUtils.userDetails(req);
    res.render('landing', { 
        logoName: 'ResearchFinder', 
        profileName: userDetails.firstName || 'User', 
        jobTitle: 'Student',
        notifications: notifications
    });
});

app.get('/feedback', (req, res) => {
    res.render('feedback');
});

app.post('/feedback', async (req, res) => {
    const { score, feedback } = req.body;
    console.log("score", score);
    console.log("feedback", feedback);
    try {
        await submitFeedback(score, feedback);
        SessionUtils.handleRedirectWithMessage(res, 'Thank you for the feedback!');
    } catch (error) {
        SessionUtils.handleRedirectWithMessage(res, `Error submitting feedback: ${error.message}`);
    }
});


app.get('/add-pdetails', ensureLoggedIn, (req, res) => {
    res.render('add-pdetails');
});

app.post('/save-pdetails', async (req, res) => {
    const { firstName, surName, phone, address1,  address2, postcode, state, area, education, country, region} = req.body;
    const userDetails = {
        firstName: firstName,
        surName: surName,
        phone: phone,
        address1: address1,
        address2: address2,
        postcode: postcode,
        state: state,
        area: area,
        education: education,
        country: country,
        region: region
    }
    if (!SessionUtils.getUserId(req.session)) {
        return res.send('Error: User not logged in.');
    }
    try {
        await saveUserPersonalDetails(SessionUtils.getUserId(req.session), userDetails);
        SessionUtils.handleRedirectWithMessage(res, 'Details saved successfully!', '/add-details');
    } catch (error) {
        SessionUtils.handleRedirectWithMessage(res, `Error saving personal details: ${error.message}`);
    }
});

app.post('/edit-pdetails', async (req, res) => {
    const pUserDetails = await SessionUtils.userDetails(req);
    const { firstName, surName, phone, address1,  address2, postcode, state, area, education, country, region, interests, skills} = req.body;
    interestsList = interests.split(',');
    skillsList = skills.split(',');
    const userDetails = {
        firstName: firstName || pUserDetails.firstName,
        surName: surName || pUserDetails.surName,
        phone: phone || pUserDetails.phone,
        address1: address1 || pUserDetails.address1,
        address2: address2 || pUserDetails.address2,
        postcode: postcode || pUserDetails.postcode,
        state: state || pUserDetails.state,
        area: area || pUserDetails.area,
        education: education || pUserDetails.education,
        country: country || pUserDetails.country,
        region: region || pUserDetails.region,
        interests: interestsList || pUserDetails.interests,
        skills: skillsList || pUserDetails.skills
    }
    if (!SessionUtils.getUserId(req.session)) {
        return res.send('Error: User not logged in.');
    }
    try {
        await editUserPersonalDetails(SessionUtils.getUserId(req.session), userDetails);
        SessionUtils.editUserDetails(req, userDetails);
        SessionUtils.handleRedirectWithMessage(res, 'Details saved successfully!', '/home');
    } catch (error) {
        SessionUtils.handleRedirectWithMessage(res, `Error saving personal details: ${error.message}`);
    }
});

app.post('/edit-interests', async (req, res) => {
    const pUserDetails = await SessionUtils.userDetails(req);
    const { interests, skills} = req.body;
    console.log("interests", interests);
    console.log("skills", skills);
    interestsList = interests.split(',');
    skillsList = skills.split(',');
    const userDetails = {
        interests: interestsList || pUserDetails.interests,
        skills: skillsList || pUserDetails.skills
    }
    if (!SessionUtils.getUserId(req.session)) {
        return res.send('Error: User not logged in.');
    }
    try {
        await editUserPersonalDetails(SessionUtils.getUserId(req.session), userDetails);
        SessionUtils.editUserDetails(req, userDetails);
        SessionUtils.handleRedirectWithMessage(res, 'Details saved successfully!', '/home');
    } catch (error) {
        SessionUtils.handleRedirectWithMessage(res, `Error saving personal details: ${error.message}`);
    }
});

// Serve add-details form
app.get('/add-details', ensureLoggedIn, (req, res) => {
    res.render('add-details');
});

// Handle saving details
app.post('/save-details', async (req, res) => {
    const { interests, skills } = req.body;
    req.session.name = "name";
    if (!SessionUtils.getUserId(req.session)) {
        return res.send('Error: User not logged in.');
    }
    try {
        await saveUserDetails(SessionUtils.getUserId(req.session), interests, skills);
        SessionUtils.handleRedirectWithMessage(res, 'Details saved successfully!');
    } catch (error) {
        SessionUtils.handleRedirectWithMessage(res, `Error saving details: ${error.message}`);
    }
});


app.get('/profile', async (req, res) => {
    try {
        const uDetails = await SessionUtils.userDetails(req);
        res.render('profile', {
            profileImage: '/images/default.jpg',
            userName: uDetails.firstName + ' ' + uDetails.surName,
            userEmail: uDetails.email,
            firstName: uDetails.firstName,
            surname: uDetails.surName,
            mobileNumber: uDetails.phone,
            addressLine1: uDetails.address1,
            addressLine2: uDetails.address2,
            postcode: uDetails.postcode,
            state: uDetails.state,
            area: uDetails.area,
            email: uDetails.email,
            education: uDetails.education,
            country: uDetails.country,
            stateRegion: uDetails.region,
            interests: uDetails.interests,
            skills: uDetails.skills
        });
    } catch (error) {
        SessionUtils.handleRedirectWithMessage(res, `Error getting user details: ${error.message}`);
    }
});


app.post('/send-messages', async (req, res) => {
    const { target, message } = req.body;

    console.log('Received target:', target);
    console.log('Received message:', message);

    if (!target || !message) {
        return res.status(400).send({ success: false, error: 'Target and message are required' });
    }

    try {
        // Assuming SessionUtils.getUserId is working correctly to get the session user ID
        console.log(SessionUtils.getUserId(req.session));
        await chatToDB(SessionUtils.getUserId(req.session), target, message);
        
        console.log('Message sent successfully to the database');
        return res.status(200).send({ success: true }); // Send success response
    } catch (error) {
        console.error('Error sending message to the database:', error);
        return res.status(500).send({ success: false, error: 'Error sending message' });
    }
});

app.get('/chat', ensureLoggedIn, async (req, res) => {
    const userId = SessionUtils.getUserId(req.session);
    const ret = await getConversations();
    const conversations = ret[0];
    const chatData = ret[1];
    const localIPaddress = await readServerIP();
    console.log(localIPaddress);
    console.log(chatData);
    res.render('chat', {
        serverIPaddress: localIPaddress,
        conversations: conversations,
        chatData: chatData,
        userId: userId
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


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});