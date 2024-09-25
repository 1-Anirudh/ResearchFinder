const { db } = require('./firebaseConfig');
const { collection, arrayUnion } = require('firebase/firestore');

// Function to save user details
async function saveUserDetails(uid, name, interests, skills) {
    try {
        const userDocRef = db.doc(collection('users'));

        // Update the user's document with interests and skills
        await userDocRef.updateDoc({
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