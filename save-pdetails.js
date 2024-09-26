const { db } = require('./firebaseConfig');
const { collection, doc, updateDoc, arrayUnion } = require('firebase/firestore');

// Function to save user details
async function saveUserDetails(firstName, surName) {
    try {
        console.log("firstName", firstName);
        console.log("surName", surName);

        console.log('User details updated successfully');
    } catch (error) {
        console.error('Error updating user details:', error);
        throw error;
    }
}

module.exports = { saveUserDetails };