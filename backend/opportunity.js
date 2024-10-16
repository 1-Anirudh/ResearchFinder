const { db } = require('./firebaseConfig');
const admin = require('firebase-admin');
const { collection, addDoc, serverTimestamp } = require("firebase/firestore"); // Import necessary functions

async function addOpportunity(topic, description, location, experience) {
    try {
        const feedbackCollectionRef = collection(db, 'opportunities'); 
        const docRef = await addDoc(feedbackCollectionRef, {
            topic: topic,
            description: description,
            location: location,
            experience: experience,
            timestamp: serverTimestamp() // Use serverTimestamp() to get the current server time
        });
        console.log("Opportunity written with ID: ", docRef.id);
    } catch (error) {
        console.error("Error adding Opportunity: ", error);
        throw error;
    }
}

module.exports = { addOpportunity };