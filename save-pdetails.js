const { db } = require('./firebaseConfig');
const { collection, doc, updateDoc } = require('firebase/firestore');

// Function to save user details
async function saveUserPersonalDetails(uid, firstName, surName, phone, address1, address2, postcode, state, area, education, country, region) {
    try {
        const trimmedUid = uid.substring(0, 20);
        const userDocRef = doc(collection(db, 'users'), trimmedUid);

        await updateDoc(userDocRef, {
            firstName: firstName,
            surName: surName,
            phone: phone,
            address1: address1,
            address2: address2,
            postcode: postcode,
            state: state,
            area: area,
            education: education,
            country: country,
            region: region
        });

        console.log('User details updated successfully');
    } catch (error) {
        console.error('Error updating user details:', error);
        throw error;
    }
}

module.exports = { saveUserPersonalDetails };