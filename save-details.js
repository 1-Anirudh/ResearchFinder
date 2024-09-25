const { db } = require('./firebaseConfig');
const { collection, doc, updateDoc, arrayUnion } = require('firebase/firestore');

// Function to save user details
async function saveUserDetails(uid, name, interests, skills) {
    try {
        const userDocRef = doc(collection(db, 'users'));

        // Update the user's document with interests and skills
        await updateDoc(userDocRef, {
            name: name,
            interests: arrayUnion(...interests),
            skills: arrayUnion(...skills)
        });

        console.log('User details updated successfully');
    } catch (error) {
        console.error('Error updating user details:', error);
        throw error;
    }
}

module.exports = { saveUserDetails };