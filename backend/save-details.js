const { db } = require('./firebaseConfig');
const { collection, doc, updateDoc, arrayUnion } = require('firebase/firestore');

// Function to save user details
async function saveUserDetails(uid, interests, skills) {
    try {
        const trimmedUid = uid.substring(0, 20);
        const userDocRef = doc(collection(db, 'users'), trimmedUid);

        // Update the user's document with interests and skills
        await updateDoc(userDocRef, {
            interests: arrayUnion(...interests),
            skills: arrayUnion(...skills)
        });

        console.log(trimmedUid, userDocRef.uid);

        console.log('User details updated successfully');
    } catch (error) {
        console.error('Error updating user details:', error);
        throw error;
    }
}

function formatDate(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
}

async function updateLastLogin(uid) {
    try {
        const trimmedUid = uid.substring(0, 20);
        const userDocRef = doc(collection(db, 'users'), trimmedUid);

        // Update the user's document with the current date and time
        await updateDoc(userDocRef, {
            lastLogin: formatDate(new Date().toISOString())
        });

        console.log('User last login updated successfully');
    } catch (error) {
        console.error('Error updating user last login:', error);
        throw error;
    }
}

module.exports = { saveUserDetails, updateLastLogin };