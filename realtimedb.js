const { initializeApp } = require('firebase/app');
const { getDatabase, ref, onValue, set, push, get, child, remove } = require('firebase/database');
const firebaseConfig = require('./frontend/public/firebase-config.json'); // Your service account credentials

// Initialize Firebase
const app = initializeApp(firebaseConfig, 'realtime-db-write');
const firebaseApp = initializeApp(firebaseConfig, 'realtime-db-read0');
// Get a reference to the database
const database = getDatabase(app);
const readDatabase = getDatabase(firebaseApp);

function listenForMessages() {
  const chatRoom = `chat/conversations/user1`;
  const conversationRef = ref(database, chatRoom);
  onValue(conversationRef, (snapshot) => {
    const messages = snapshot.val();
    console.log(messages); // Access the messages data

    // for (const key in messages) {
    //   if (messages.hasOwnProperty(key)) {
    //     const messageData = messages[key];
    //     console.log(messageData.timestamp); // Access the message data
    //   }
    // }
  });
}


function realTimeMessaging(senderID, receiverID, message, timestamp) {
  const room1 = ref(database, `chat/conversations/${senderID}`);
  const room2 = ref(database, `chat/conversations/${receiverID}`);
  const newMessageRef1 = push(room1);
  const newMessageRef2 = push(room2);
  set(newMessageRef1, {
    sender: senderID,
    receiver: receiverID,
    content: message,
    timestamp: timestamp
  })
  .then(() => {
    console.log('Data written successfully with push');
  })
  .catch((error) => {
    console.error('Error writing data with push:', error);
  });
  set(newMessageRef2, {
    sender: senderID,
    receiver: receiverID,
    content: message,
    timestamp: timestamp
  })
  .then(() => {
    console.log('Data written successfully with push');
  })
  .catch((error) => {
    console.error('Error writing data with push:', error);
  });
}

async function readConversationDataOnce(userID) {
  const chatRoom = `chat/conversations/`;
  const conversationRef = ref(database, chatRoom); // Assuming conversations are organized by user IDs

  get(child(conversationRef, `${userID}`)).then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val());
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  });
}

// realTimeMessaging('user1', 'user2', 'Hello', Date.now());
// readConversationDataOnce('user1');
// readConversationDataOnce('user2');

listenForMessages();

module.exports = { realTimeMessaging, readDatabase };