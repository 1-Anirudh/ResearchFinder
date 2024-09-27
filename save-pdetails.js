const { db } = require('./firebaseConfig');
const { collection, doc, updateDoc } = require('firebase/firestore');

// Function to save user details
async function saveUserPersonalDetails(uid, userDetails) {
    try {
        const trimmedUid = uid.substring(0, 20);
        const userDocRef = doc(collection(db, 'users'), trimmedUid);

        await updateDoc(userDocRef, {
            firstName: userDetails.firstName,
            surName: userDetails.surName,
            phone: userDetails.phone,
            address1: userDetails.address1,
            address2: userDetails.address2,
            postcode: userDetails.postcode,
            state: userDetails.state,
            area: userDetails.area,
            education: userDetails.education,
            country: userDetails.country,
            region: userDetails.region
        });

        console.log('User details updated successfully');
        return true;
    } catch (error) {
        console.error('Error updating user details:', error);
        throw error;
    }
}

module.exports = { saveUserPersonalDetails };