var admin = require("firebase-admin");

var serviceAccount = require("../frontend/public/service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://eurekatribe-b7904-default-rtdb.firebaseio.com"
});


const dbs = admin.firestore();

module.exports = { dbs };