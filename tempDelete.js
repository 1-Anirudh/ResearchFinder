const { db } = require('./firebaseConfig');
const admin = require('firebase-admin');
const { collection, getDocs, doc, deleteDoc } = require("firebase/firestore"); // Import necessary functions

async function deleteData(collectionName) {
    const usersCollectionRef = collection(db, collectionName); // Get a reference to the 'users' collection
    const snapShot = await getDocs(usersCollectionRef); // Get the documents in the collection

    snapShot.forEach(document => {
        const docRef = doc(db, collectionName, document.id); // Get the document reference
        deleteDoc(docRef); // Delete the document
    });

}

module.exports = { deleteData };
