const { db } = require('./firebaseConfig');
const admin = require('firebase-admin');
const { collection, getDocs, doc } = require("firebase/firestore"); // Import necessary functions

async function getConversations() {
    try {
        const usersCollectionRef = collection(db, 'users'); // Get a reference to the 'users' collection
        const snapShot = await getDocs(usersCollectionRef); // Get the documents in the collection

        let usersList = [];

        snapShot.forEach(doc => {
            const data = doc.data();
            const user = {
                user: data.firstName,
                userID: data.uid,
                username: `${data.firstName} ${data.surName}`,
                email: data.email
            }
            usersList.push(user);
        });


        let chatDataList = {};

        snapShot.forEach(doc => {
            const data = doc.data();
            const UID = data.uid;
            const chatData = {
                title : `${data.firstName} ${data.surName}`,
                subtitle : "joined on 2021-10-10",
                profilePics : [],
                messages: []
            }
            chatDataList[UID] = chatData;
        });

        let ret = [];
        ret.push(usersList);
        ret.push(chatDataList);

        return ret;
    } catch (error) {
        console.error("Error getting details: ", error);
        throw error;
    }
}

module.exports = { getConversations };