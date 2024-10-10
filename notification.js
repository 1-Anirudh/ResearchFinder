const { db } = require('./firebaseConfig');
const admin = require('firebase-admin');
const { collection, query, where, getDocs, doc, updateDoc, arrayUnion, Timestamp, getDoc } = require("firebase/firestore"); // Import necessary functions

async function sendReleNotification(topic) {
    try {
        const usersCollectionRef = collection(db, 'users'); 
        const q = query(usersCollectionRef, where('interests', 'array-contains', topic));
        
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((document) => {
            console.log(`User ID: ${document.id}`);
            const userDocRef = doc(collection(db, 'users'), document.id);
            updateDoc(userDocRef, {
                notifications: arrayUnion({
                    message: `New opportunity in ${topic}!`,
                    timestamp: Timestamp.now() // Use Firestore's Timestamp object
                })
            });
            
        });

    } catch (error) {
        console.error("Error fetching users: ", error);
        throw error;
    }
}

async function getUserNotifications(uid) {
    try {
        const trimmedUid = uid.substring(0, 20);
        const userDocRef = doc(collection(db, 'users'), trimmedUid);
        const userDoc = await getDoc(userDocRef);
        console.log("User ID: ", userDoc.id);
        console.log("User data: ", userDoc.data());
        console.log("User notifications: ", userDoc.data().notifications);
        return userDoc.data().notifications || [];
    } catch (error) {
        console.error("Error getting notifications: ", error);
        throw error;
    }
}

module.exports = { sendReleNotification, getUserNotifications };