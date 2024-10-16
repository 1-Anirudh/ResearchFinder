const { db } = require('./firebaseConfig');
const admin = require('firebase-admin');
const { doc, collection, getDocs, getDoc, serverTimestamp, updateDoc } = require("firebase/firestore"); // Import necessary functions


async function getServerIPDocId() {
    const serverIPCollectionRef = collection(db, 'serverUtils');
    const querySnapshot = await getDocs(serverIPCollectionRef);
    let docId = null;
    querySnapshot.forEach((doc) => {
        docId = doc.id; // Assuming there's only one document, we take the first one
    });
    return docId;
}


async function writeServerIP(newIP) {
    try {
        const docId = await getServerIPDocId();
        if (!docId) {
            throw new Error("No document found in the serverIP collection");
        }
        const docRef = doc(db, 'serverUtils', docId);
        await updateDoc(docRef, {
            ip: newIP,
            timestamp: serverTimestamp() // Optionally update the timestamp
        });
        console.log("Document updated with new IP: ", newIP);
    } catch (error) {
        console.error("Error updating document: ", error);
        throw error;
    }
}

async function readServerIP() {
    try {
        const docId = await getServerIPDocId();
        if (!docId) {
            throw new Error("No document found in the serverIP collection");
        }
        const docRef = doc(db, 'serverUtils', docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const ip = docSnap.data().ip;
            console.log("Current IP address: ", ip);
            console.log("reading done");
            return ip;
        } else {
            throw new Error("No such document!");
        }
    } catch (error) {
        console.error("Error reading document: ", error);
        throw error;
    }
}


module.exports = { getServerIPDocId, writeServerIP, readServerIP };