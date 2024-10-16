const { db } = require('./firebaseConfig');
const admin = require('firebase-admin');
const { collection, addDoc, serverTimestamp } = require("firebase/firestore"); // Import necessary functions


async function searchData(topic, location, experience, stipend) {

    let query = collection(db, 'opportunities');

    if (topic) {
        query = query.where('topic', '==', topic);
    }
    if (location) {
        query = query.where('location', '==', location);
    }
    if (experience) {
        query = query.where('otherCriteria', '==', otherCriteria);
    }
    if (stipend) {
        query = query.where('stipend', '==', stipend);
    }

    try {
        const snapshot = await query.get();
        if (snapshot.empty) {
            return res.status(404).send('No matching documents.');
        }

        let results = [];
        snapshot.forEach(doc => {
            results.push(doc.data());
        });

        console.log('Results:', results);

        res.status(200).json(results);
    } catch (error) {
        res.status(500).send(`Error retrieving data: ${error.message}`);
    }
}