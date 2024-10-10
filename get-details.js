const { db } = require('./firebaseConfig');
const admin = require('firebase-admin');
const { collection, addDoc, serverTimestamp, getDoc, doc } = require("firebase/firestore"); // Import necessary functions

async function getUserDetails(uid) {
    const cid = uid.substring(0, 20);
    try {
        const usersCollectionRef = collection(db, 'users'); // Get a reference to the 'users' collection
        const usersSnapshot = doc(usersCollectionRef, cid); // Get the documents in the collection
        const usersSnapshotData = await getDoc(usersSnapshot);
        return usersSnapshotData.data();
    } catch (error) {
        console.error("Error getting details: ", error);
        throw error;
    }
}

module.exports = { getUserDetails };