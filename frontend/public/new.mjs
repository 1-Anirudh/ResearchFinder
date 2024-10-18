import { getDatabase, ref, onValue, set, push, get, child, remove } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';

firebaseConfig = window.firebaseConfig;
const firebaseApp = initializeApp(firebaseConfig, 'realtime-db-read');
const database = getDatabase(firebaseApp);

const chatRoom = `chat/conversations/${window.userId}`;

const conversationRef = ref(database, chatRoom); // Assuming conversations are organized by user IDs

get(conversationRef).then((snapshot) => {
    console.log('snapshot');
    if (snapshot.exists()) {
        const messagesData = snapshot.val();
        console.log('messagesData', messagesData); // Access the messages data
    
        for (const key in messagesData) {
            if (messagesData.hasOwnProperty(key)) {
                const messageData = messagesData[key];
                const newMessageData = {
                    time : messageData.timestamp,
                    text : messageData.content,
                    sent : messageData.sender === window.userId
                }
                const room = messageData.sender === window.userId ? messageData.receiver : messageData.sender;
                window.chatData[room].messages.push(newMessageData);
                console.log('messageData', messageData); // Access the message data
            }
        }
    } else {
      console.log("No data available");
    }
    }).catch((error) => {
        console.error(error);
});


onValue(conversationRef, (snapshot) => {
    const messages = snapshot.val();
    console.log('received a message');
    console.log('window.targetId:', window.targetId);

    for (const key in messages) {
        if (messages.hasOwnProperty(key)) {
            const messageData = messages[key];
            console.log('messageTime:', messageData.timestamp);
            console.log('window.timestamp:', window.timestamp);

            if (messageData.timestamp >= window.timestamp + 1000 && 
                ((messageData.sender === window.targetId && messageData.receiver === window.userId) || 
                (messageData.sender === window.userId && messageData.receiver === window.targetId))) {
                const chatArea = document.querySelector('.chat-area-main');
                const chatMessage = document.createElement('div');
                if (messageData.sender === window.userId) {
                    chatMessage.classList.add('chat-msg', 'owner');
                } else {
                    chatMessage.classList.add('chat-msg');
                }
                const profilePic = 'images/default.avif';
                chatMessage.innerHTML = `
                    <div class="chat-msg-profile">
                        <img class="chat-msg-img" src="${profilePic}" alt="" />
                        <div class="chat-msg-date">Message ${messageData.timestamp}</div>
                    </div>
                    <div class="chat-msg-content">
                        <div class="chat-msg-text">${messageData.content}</div>
                    </div>
                `;
                chatArea.appendChild(chatMessage);

                const sent = messageData.sender === window.userId;

                const newMessage = {
                    time : window.Message.time,
                    text : window.Message.text,
                    sent : sent
                }

                const oId = sent ? messageData.receiver : messageData.sender;

                window.chatData[oId].messages.push(newMessage);
                console.log('messageData', messageData); // Access the message data
            }
        }
    }
});
