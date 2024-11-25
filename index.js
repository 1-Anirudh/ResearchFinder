const express = require('express');
const session = require('express-session');
const path = require('path');
const { registerUser, signInUser } = require('./backend/firebaseConfig');
const { urlencoded } = require('body-parser');
const { getUserDetails } = require('./backend/get-details');
const { submitFeedback } = require('./backend/feedback');
const { getUserNotifications } = require('./backend/notification');
const { getRecommendations } = require('./backend/pinecone');
const { addRecommendations } = require('./backend/utils');

const { sendReleNotification } = require('./backend/notification');

const { saveUserDetails, updateLastLogin } = require('./backend/save-details');
const { saveUserRole, saveUserPersonalDetails, editUserPersonalDetails } = require('./backend/save-pdetails');


const { chatToDB } = require('./backend/notification');
const { getConversations } = require('./backend/get-conversations');
const { realTimeMessaging, readDatabase } = require('./backend/realtimedb');
const { database } = require('firebase-admin');
const { on } = require('events');
const { getDatabase, ref, onValue, set, push, get, child, remove, update } = require('firebase/database');
const { default: firebase } = require('firebase/compat/app');

const firebaseConfig = require('./frontend/public/firebase-config.json');

const { addOpportunity, readOpportunities} = require('./backend/opportunity');



// const RedisStore = require("connect-redis").default;
// const { createClient } =  require('redis');
// const { send } = require('process');

// const client = createClient({
//     legacyMode: false,
//     password: 'UINYMj5lOi0LOczZOsnrqcmE2M86dBpE',
//     socket: {
//         host: 'redis-18485.c265.us-east-1-2.ec2.redns.redis-cloud.com',
//         port: 18485
//     }
// });

const { dbs } = require('./backend/serviceAccount');
const FirestoreStore = require('firestore-store')(session); // Custom Firestore session store library


const app = express();
const port = process.argv[2] || 3000;

async function configureApp() {
    try {
        // Set up EJS as the template engine
        
        // await client.connect();
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, 'views'));

        app.use(express.json());
        app.use(express.static(path.join(__dirname, '/frontend/public')));

        app.use(urlencoded({ extended: true }));

        app.use(session({
            // store: new RedisStore({
            //     client: client,
            //     ttl: 3 * 60
            // }),
            store: new FirestoreStore({
                database: dbs,
                ttl: 3 * 60
            }),
            secret: 'your_secret_key',
            resave: false,
            saveUninitialized: true,
            cookie: { 
                secure: false,
                maxAge: 10 * 60 * 1000
            } // Set to true if using HTTPS
        }));
    } catch (error) {
        console.error('Error configuring app:', error);
        throw error;
    }
}

class SessionUtils {
    static getUserId(session) {
        return session.userId;
    }

    static getEmail(session){
        return session.email;
    }

    static handleLoginSuccess(req, userCredential) {
        req.session.isLoggedIn = true;
        req.session.userId = userCredential.user.uid; // Store the user's UID in the session
        console.log("userCredential.user.uid", userCredential.user.uid);
        updateLastLogin(userCredential.user.uid);
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


configureApp()
    .then(() => {

        const ensureLoggedIn = (req, res, next) => {
            if (!req.session.isLoggedIn) {
                SessionUtils.handleRedirectWithMessage(res, 'Access denied. Please login first.');
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

        app.get('/', (req, res) => {
            if (req.session.isLoggedIn) {
                res.redirect('/home');
            } else {
                res.redirect('/index');
            }
        });

        app.post('/register', async (req, res) => {
            const { email, password, role } = req.body;
            req.session.role = role;
            req.session.email = email;
            try {
                const userCredential = await registerUser(email, password);
                SessionUtils.handleLoginSuccess(req, userCredential);
                await saveUserRole(SessionUtils.getUserId(req.session), { role: role });
                res.redirect('/add-pdetails');
            } catch (error) {
                SessionUtils.handleRedirectWithMessage(res, `Registration failed: ${error.message}`);
            }
        });

        // Handle login form submission
        app.post('/login', async (req, res) => {
            const { email, password } = req.body;
            req.session.email = email;
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
            const opportunityData = await readOpportunities();
            const notifications = await getUserNotifications(SessionUtils.getUserId(req.session));
            const userDetails = await SessionUtils.userDetails(req);

            const recommendations = await getRecommendations(opportunityData, userDetails.interests);

            const recOpportunityData = addRecommendations(opportunityData, recommendations);
            
            res.render('landing', { 
                role: userDetails.role,
                logoName: 'ResearchFinder', 
                profileName: userDetails.firstName || 'User',
                jobTitle: userDetails.role,
                notifications: notifications,
                firebaseConfig: JSON.stringify(firebaseConfig),
                opportunityData: JSON.stringify(recOpportunityData)
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

        app.get('/get-voice-nav-status', (req, res) => {
            res.json({ voiceNavEnabled: req.session.voiceNavEnabled || false });
        });

        app.post('/set-voice-nav-status', (req, res) => {
            req.session.voiceNavEnabled = req.body.voiceNavEnabled;
            res.json({ success: true });
        });

        app.get('/get-theme', (req, res) => {
            res.json({ theme: req.session.theme || 'light' });
        });

        app.post('/set-theme', (req, res) => {
            req.session.theme = req.body.theme;
            res.json({ success: true });
        });

        app.get('/get-user-language', (req, res) => {
            res.json({ userLanguage: req.session.userLanguage || 'en' });
        });

        app.post('/set-user-language', (req, res) => {
            req.session.userLanguage = req.body.userLanguage;
            res.json({ success: true });
        });

        app.get('/add-pdetails', ensureLoggedIn, (req, res) => {
            res.render('add-pdetails');
        });

        app.post('/save-pdetails', async (req, res) => {
            const { firstName, surName, phone, address1,  address2, postcode, state, education, country, region} = req.body;
            const userDetails = {
                firstName: firstName,
                surName: surName,
                phone: phone,
                address1: address1,
                address2: address2,
                postcode: postcode,
                state: state,
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
            const { firstName, surName, phone, address1,  address2, postcode, state, education, country, region, interests, skills} = req.body;
            interestsList = interests ? JSON.parse(interests) : pUserDetails.interests;
            skillsList = skills ? JSON.parse(skills) : pUserDetails.skills;
            const userDetails = {
                role: pUserDetails.role || 'client',
                firstName: firstName || pUserDetails.firstName,
                surName: surName || pUserDetails.surName,
                phone: phone || pUserDetails.phone,
                address1: address1 || pUserDetails.address1,
                address2: address2 || pUserDetails.address2,
                postcode: postcode || pUserDetails.postcode,
                state: state || pUserDetails.state,
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
            interestsList = interests;
            skillsList = skills;
            const userDetails = {
                role: pUserDetails.role,
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
            interestsList = JSON.parse(interests);
            skillsList = JSON.parse(skills);
            if (!SessionUtils.getUserId(req.session)) {
                return res.send('Error: User not logged in.');
            }
            try {
                await saveUserDetails(SessionUtils.getUserId(req.session), interestsList, skillsList);
                SessionUtils.handleRedirectWithMessage(res, 'Details saved successfully!');
            } catch (error) {
                SessionUtils.handleRedirectWithMessage(res, `Error saving details: ${error.message}`);
            }
        });


        app.get('/profile', async (req, res) => {
            try {
                const uDetails = await SessionUtils.userDetails(req);
                res.render('profile', {
                    theme: req.session.theme || 'dark-theme',
                    profileImage: '/images/default.avif',
                    userName: uDetails.firstName + ' ' + uDetails.surName,
                    userEmail: uDetails.email,
                    firstName: uDetails.firstName,
                    surname: uDetails.surName,
                    mobileNumber: uDetails.phone,
                    addressLine1: uDetails.address1,
                    addressLine2: uDetails.address2,
                    postcode: uDetails.postcode,
                    state: uDetails.state,
                    email: uDetails.email,
                    education: uDetails.education,
                    country: uDetails.country,
                    stateRegion: uDetails.region,
                    interests: JSON.stringify(uDetails.interests),
                    skills: JSON.stringify(uDetails.skills)
                });
            } catch (error) {
                SessionUtils.handleRedirectWithMessage(res, `Error getting user details: ${error.message}`);
            }
        });


        app.get('/add-opportunity', ensureLoggedIn, async (req, res) => {
            res.render('opportunity');
        })


        app.post('/post-opportunity', ensureLoggedIn, async (req, res) => {
            const {topic, title, shortDescription, longDescription, stipend, institution, location, duration, link, tags, mode, type} = req.body;
            provider = req.session.email;
            tagsList = tags.split(',');
            newOpportunity = {
                topic: topic,
                provider: provider,
                title: title,
                shortDescription: shortDescription,
                longDescription: longDescription,
                stipend: stipend,
                institution: institution,
                location: location,
                duration: duration,
                link: link,
                mode: mode,
                type: type,
                tags: tagsList
            }

            addOpportunity(newOpportunity);
            sendReleNotification(newOpportunity.topic);
            res.redirect('/home')
        });

        app.post('/realtime-chat', async (req, res) => {
            const { senderID, receiverID, message, timestamp } = req.body;
            console.log("senderID", senderID);
            console.log("receiverID", receiverID);
            console.log("message", message);
            console.log("timestamp", timestamp);
            if (!senderID || !receiverID || !message || !timestamp) {
                return res.status(400).send({ success: false, error: 'Sender ID, receiver ID, message, and timestamp are required' });
            }

            realTimeMessaging(senderID, receiverID, message, timestamp);
            return res.status(200).send({ success: true }); // Send success response
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
            // console.log(chatData);
            // console.log(localIPaddress);
            // console.log(readDatabase);
            res.render('chat', {
                conversations: JSON.stringify(conversations),
                chatData: JSON.stringify(chatData),
                userId: userId,
                database: JSON.stringify(readDatabase),
                firebaseConfig: JSON.stringify(firebaseConfig)
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


        // Start the server only after the app is configured
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error('Failed to configure the app:', error);
    });