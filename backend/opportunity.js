const { db } = require('./firebaseConfig');
const admin = require('firebase-admin');
const { collection, addDoc, serverTimestamp, getDocs } = require("firebase/firestore"); // Import necessary functions

async function addOpportunity(opportunityItem) {
    try {
        const feedbackCollectionRef = collection(db, 'opportunities'); 

        const docRef = await addDoc(feedbackCollectionRef, {
            topic: opportunityItem.topic,
            shortDescription: opportunityItem.shortDescription,
            longDescription: opportunityItem.longDescription,
            title: opportunityItem.title,
            postBy: opportunityItem.provider,
            institution: opportunityItem.institution,
            stipend: opportunityItem.stipend,
            duration: opportunityItem.duration,
            link: opportunityItem.link,
            tags: opportunityItem.tags,
            location: opportunityItem.location,
            timestamp: serverTimestamp() // Use serverTimestamp() to get the current server time
        });
        console.log("Opportunity written with ID: ", docRef.id);
    } catch (error) {
        console.error("Error adding Opportunity: ", error);
        throw error;
    }
}

async function readOpportunities() {
    const opportunitiesRef = collection(db, "opportunities");
    const snapshot = await getDocs(opportunitiesRef);

    
    let opportunityDataTemp = {};

    snapshot.forEach((doc) => {
        const opportunityData = doc.data();
        opportunityDataTemp[doc.id] = opportunityData;
    });

    return opportunityDataTemp;

}

module.exports = { readOpportunities, addOpportunity };