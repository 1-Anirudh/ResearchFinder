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

const { saveUserDetails } = require('./backend/save-details');
const { saveUserRole, saveUserPersonalDetails, editUserPersonalDetails } = require('./backend/save-pdetails');


const { chatToDB } = require('./backend/notification');
const { getConversations } = require('./backend/get-conversations');
const { readServerIP } = require('./backend/serverIP');
const { realTimeMessaging, readDatabase } = require('./realtimedb');
const { database } = require('firebase-admin');
const { on } = require('events');
const { getDatabase, ref, onValue, set, push, get, child, remove } = require('firebase/database');
const { default: firebase } = require('firebase/compat/app');

const firebaseConfig = require('./frontend/public/firebase-config.json');

const { addOpportunity, readOpportunities} = require('./backend/opportunity');

const RedisStore = require("connect-redis").default;
const { createClient } =  require('redis');

const client = createClient({
    legacyMode: false,
    password: 'zUI8ywPybMDC1ev23ktz2bwwWJruUkMt',
    socket: {
        host: 'redis-14766.c264.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 14766
    }
});

const app = express();
const port = process.argv[2] || 3000;

async function configureApp() {
    try {
        // Set up EJS as the template engine
        
        await client.connect();
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, 'views'));

        app.use(express.json());
        app.use(express.static(path.join(__dirname, '/frontend/public')));

        app.use(urlencoded({ extended: true }));

        app.use(session({
            store: new RedisStore({ client: client }),
            secret: 'your_secret_key',
            resave: false,
            saveUninitialized: true,
            cookie: { 
                secure: false,
                maxAge: 60 * 60 * 1000
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
            console.log("session");

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

        app.get('/tempcheck', async (req, res) => {
            const opportunityData = await readOpportunities();
            res.render('not', { 
                logoName: 'ResearchFinder', 
                profileName: 'User', 
                jobTitle: 'Student',
                notifications: [ 
                    {
                        message: "helo",
                        timestamp: {
                            seconds: 1633497600
                        }
                    },
                    {
                        message: "helo1",
                        timestamp: {
                            seconds: 1633497600
                        }
                    }
                ],
                firebaseConfig: JSON.stringify(firebaseConfig),
                opportunityData: JSON.stringify(opportunityData)
            });
        });


        app.get('/home', ensureLoggedIn, async (req, res) => {
            console.log("userID" , SessionUtils.getUserId(req.session));
            console.log("email:", SessionUtils.getEmail(req.session));
            const opportunityData = await readOpportunities();
            const notifications = await getUserNotifications(SessionUtils.getUserId(req.session));
            const userDetails = await SessionUtils.userDetails(req);
            const recommendations = await getRecommendations(opportunityData, userDetails.interests);
            console.log("recommendations", recommendations);

            const recOpportunityData = addRecommendations(opportunityData, recommendations);
            // console.log("opportunityData", recOpportunityData);
            
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
            interestsList = interests ? interests.split(',') : pUserDetails.interests;
            skillsList = skills ? skills.split(',') : pUserDetails.skills;
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
            interestsList = interests.split(',');
            skillsList = skills.split(',');
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
            console.log("interests", interestsList);
            console.log("skills", skillsList);
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
                    interests: uDetails.interests,
                    skills: uDetails.skills
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

            console.log(newOpportunity);

            addOpportunity(newOpportunity);
            res.redirect('/home')
        });

        app.get('/temp', async (req, res) => {
            const opportunityData = await readOpportunities();
            res.render('oppcard', { 
                logoName: 'ResearchFinder', 
                profileName: 'User', 
                jobTitle: 'Student',
                notifications: [ 
                    {
                        message: "helo",
                        timestamp: {
                            seconds: 1633497600
                        }
                    },
                    {
                        message: "helo1",
                        timestamp: {
                            seconds: 1633497600
                        }
                    }
                ],
                firebaseConfig: JSON.stringify(firebaseConfig),
                opportunityData: JSON.stringify(opportunityData)
            });
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
            // console.log(chatData);
            // console.log(localIPaddress);
            // console.log(readDatabase);
            res.render('chat', {
                serverIPaddress: localIPaddress,
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