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
        return userDoc.data().notifications || [];
    } catch (error) {
        console.error("Error getting notifications: ", error);
        throw error;
    }
}


async function chatToDB(userID, targetId, message) {
    console.log('Sending message:', message);
    try {
        const userId = userID.substring(0, 20);
        const targetID = targetId.substring(0, 20);
        const userDocRef = doc(collection(db, 'users'), userId);
        const targetDocRef = doc(collection(db, 'users'), targetID);
        const userDoc = await getDoc(userDocRef);
        const targetDoc = await getDoc(targetDocRef);
        const userChat = userDoc.data().chat || [];
        const targetChat = targetDoc.data().chat || [];
        const chat = {
            message: message,
            timestamp: Timestamp.now()
        };
        userChat.push({
            senderId: userId,
            targetID: targetID,
            chat: chat
        });
        targetChat.push({
            senderId: userId,
            targetID: targetID,
            chat: chat
        });
        await updateDoc(userDocRef, {
            chat: userChat
        });
        await updateDoc(targetDocRef, {
            chat: targetChat
        });

        console.log('Message sent successfully');
    } catch (error) {
        console.error("Error sending message: ", error);
        throw error;
    }
}

module.exports = { sendReleNotification, getUserNotifications, chatToDB };