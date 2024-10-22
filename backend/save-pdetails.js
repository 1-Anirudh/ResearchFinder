const { db } = require('./firebaseConfig');
const { collection, doc, updateDoc } = require('firebase/firestore');


// Function to save user details
async function saveUserRole(uid, userDetails) {
    try {
        console.log('Updating user details:', userDetails);
        console.log('User ID:', uid);
        const trimmedUid = uid.substring(0, 20);
        const userDocRef = doc(collection(db, 'users'), trimmedUid);
        console.log('User doc ref:', userDocRef);

        await updateDoc(userDocRef, {
            role: userDetails.role
        });

        console.log('User details updated successfully');
    } catch (error) {
        console.error('Error updating user details:', error);
        throw error;
    }
}


// Function to save user details
async function saveUserPersonalDetails(uid, userDetails) {
    try {
        console.log('Updating user details:', userDetails);
        console.log('User ID:', uid);
        const trimmedUid = uid.substring(0, 20);
        const userDocRef = doc(collection(db, 'users'), trimmedUid);
        console.log('User doc ref:', userDocRef);

        await updateDoc(userDocRef, {
            firstName: userDetails.firstName,
            surName: userDetails.surName,
            phone: userDetails.phone,
            address1: userDetails.address1,
            address2: userDetails.address2,
            postcode: userDetails.postcode,
            state: userDetails.state,
            education: userDetails.education,
            country: userDetails.country,
            region: userDetails.region
        });

        console.log('User details updated successfully');
    } catch (error) {
        console.error('Error updating user details:', error);
        throw error;
    }
}

async function editUserPersonalDetails(uid, userDetails) {
    try {
        console.log('Updating user details:', userDetails);
        console.log('User ID:', uid);
        const trimmedUid = uid.substring(0, 20);
        const userDocRef = doc(collection(db, 'users'), trimmedUid);
        console.log('User doc ref:', userDocRef);

        await updateDoc(userDocRef, {
            role: userDetails.role,
            firstName: userDetails.firstName,
            surName: userDetails.surName,
            phone: userDetails.phone,
            address1: userDetails.address1,
            address2: userDetails.address2,
            postcode: userDetails.postcode,
            state: userDetails.state,
            education: userDetails.education,
            country: userDetails.country,
            region: userDetails.region,
            interests: userDetails.interests,
            skills: userDetails.skills
        });

        console.log('User details updated successfully');
    } catch (error) {
        console.error('Error updating user details:', error);
        throw error;
    }
}

module.exports = { saveUserRole, saveUserPersonalDetails, editUserPersonalDetails };