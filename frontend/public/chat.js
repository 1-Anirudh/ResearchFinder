
const userId = '<%= userId %>';
var targetId = '';
var Message = {time: '', text: '', senderID: userId, targetID: ''};
var userDATA = '';
var targetUID = '';

    // Sample chat data for each user, including details for the detail-area-header
// Sample chat data for each user, including details for the detail-area-header


const messages = JSON.parse('<%- conversations %>');

const chatData = JSON.parse('<%- chatData %>');

console.log(chatData);
console.log(messages);

const database = JSON.parse('<%- database %>');

const { getDatabase, ref, onValue, set, push, get, child, remove } = require('firebase/database');

// console.log(database);

// socket implementation

// socket.addEventListener('message', function(event) {
//   const chatArea = document.querySelector('.chat-area-main');
//   const data = JSON.parse(event.data);
//   console.log("data", data);
//   const chatMessage = document.createElement('div');
//   chatMessage.classList.add('chat-msg');
//   const profilePic = 'images/default.avif';
//   chatMessage.innerHTML = `
//       <div class="chat-msg-profile">
//           <img class="chat-msg-img" src="${profilePic}" alt="" />
//           <div class="chat-msg-date">Message ${data.timestamp}</div>
//       </div>
//       <div class="chat-msg-content">
//           <div class="chat-msg-text">${data.message}</div>
//       </div>
//   `;
//   chatArea.appendChild(chatMessage);

//   const newMessage = {time : data.timestamp, text: data.message, sent: false};

//   chatData[data.from].messages.push(newMessage);
// });


// real timeDB implementation
// Initialize Firebase
// const app = initializeApp(firebaseConfig, 'realtime-db-read');

// Get a reference to the database
// const database = getDatabase(app);

// Read data for a specific conversation
const chatRoom = `chat/conversations/${userId}`;
const conversationRef = ref(database, chatRoom); // Assuming conversations are organized by user IDs

onValue(conversationRef, (snapshot) => {
  const messages = snapshot.val();
  console.log(messages); // Access the messages data

  // Render the messages in the conversation area

    for (const key in messages) {
      if (messages.hasOwnProperty(key)) {
        const messageData = messages[key];
        console.log(messageData.timestamp); // Access the message data


        const chatArea = document.querySelector('.chat-area-main');
        const chatMessage = document.createElement('div');
        chatMessage.classList.add('chat-msg');
        const profilePic = 'images/default.avif';
        chatMessage.innerHTML = `
            <div class="chat-msg-profile">
                <img class="chat-msg-img" src="${profilePic}" alt="" />
                <div class="chat-msg-date" data-translate="true" >Message ${messageData.timestamp}</div>
            </div>
            <div class="chat-msg-content">
                <div class="chat-msg-text" data-translate="true" >${messageData.content}</div>
            </div>
        `;
        chatArea.appendChild(chatMessage);

        const sent = messageData.sender === userId;

        const newMessage = {time : data.timestamp, text: data.content, sent: sent};

        chatData[data.sender].messages.push(newMessage);
      }
    }
});


// Function to create and append messages to the conversation area
function loadMessages() {
    const conversationArea = document.getElementById("conversation-area");
    messages.forEach(msg => {
        // Create message div
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("msg");
        msgDiv.setAttribute("data-user", msg.user);
        msgDiv.setAttribute("data-user-UID", msg.userID);

        // Create profile image
        const profileImg = document.createElement("img");
        profileImg.classList.add("msg-profile");
        // profileImg.src = msg.profileImage;
        profileImg.src = "/images/default.avif";
        profileImg.alt = "";

        // Create message details
        const msgDetailDiv = document.createElement("div");
        msgDetailDiv.classList.add("msg-detail");

        // Create username
        const usernameDiv = document.createElement("div");
        usernameDiv.classList.add("msg-username");
        usernameDiv.textContent = msg.username;

        // Create message content
        const contentDiv = document.createElement("div");
        contentDiv.classList.add("msg-content");

        const messageSpan = document.createElement("span");
        messageSpan.classList.add("msg-message");
        messageSpan.textContent = msg.message;

        const dateSpan = document.createElement("span");
        dateSpan.classList.add("msg-date");
        dateSpan.textContent = msg.date;

        // Append elements
        contentDiv.appendChild(messageSpan);
        contentDiv.appendChild(dateSpan);
        msgDetailDiv.appendChild(usernameDiv);
        msgDetailDiv.appendChild(contentDiv);
        msgDiv.appendChild(profileImg);
        msgDiv.appendChild(msgDetailDiv);
        conversationArea.appendChild(msgDiv);
    });
}

// Call the function to load messages
loadMessages();

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strTime = `${hours}:${minutes} ${ampm}`;
    return `${day}-${month}-${year} ${strTime}`;
}


async function videocall() {   
  const roomId = userId < targetUID ? userId + targetUID : targetUID + userId;
  window.open(`https://meet.ffmuc.net/${roomId}`, '_blank');
}

async function handleKeyPress(event) {
    if (event.key === 'Enter') {
        submitForm();
    }
}

async function submitForm() {
    // Get the value of the input field

    const receiveUID = targetUID;

    const chatArea = document.querySelector('.chat-area-main');
    Message.text = document.getElementById("chatInput").value;
    document.getElementById("chatInput").value = '';
    Message.time = formatDate(new Date());
    Message.targetID = targetId;
    Message.sent = true;
    
    // Log the input value
    console.log("User Input: " + Message.text, "time: " + Message.time, "target Id:" + targetId );

    const newMessage = {time : Message.time, text: Message.text, sent: true};

    chatData[targetId].messages.push(newMessage);

    const chatMessage = document.createElement('div');
      chatMessage.classList.add('chat-msg', 'owner'); 
      const profilePic = 'images/default.avif';
      chatMessage.innerHTML = `
          <div class="chat-msg-profile">
              <img class="chat-msg-img" src="${profilePic}" alt="" />
              <div class="chat-msg-date" data-translate="true" >Message ${Message.time}</div>
          </div>
          <div class="chat-msg-content">
              <div class="chat-msg-text" data-translate="true" >${Message.text}</div>
          </div>
      `;
      chatArea.appendChild(chatMessage);

      // socket implementation
              // socket.send(JSON.stringify({
              //   type: 'chat-message',
              //   targetUserId: targetUID,
              //   message: Message.text,
              //   timestamp: formatDate(new Date())
              // }));

      // real time message sending

      try {
        const response = await fetch('/realtime-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ target: targetUID, message: Message.text }),
            });
      } catch (error) {
          console.error('Error sending Message:', error);
      }


      // chattoDB persistent DB
      try {
        const response = await fetch('/send-messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  senderID: userId,
                  receiverID: receiveUID,
                  message: Message.text,
                  time: Message.time
                }),
            });
      } catch (error) {
          console.error('Error sending Message:', error);
      }

    // Clear the input field
  }

function changeChat(userId) {
    const chatArea = document.querySelector('.chat-area-main');
    const chatTitle = document.querySelector('.chat-area-title');
    const chatGroup = document.querySelector('.chat-area-group');
    const detailTitle = document.querySelector('.detail-title');
    const detailSubtitle = document.querySelector('.detail-subtitle');
    const msgProfileGroup = document.querySelector('.msg-profile.group');
    const detailArea = document.querySelector('.detail-area');
    const chatAreaFooter = document.querySelector('.chat-area-footer');

    const userData = chatData[userId];
    userDATA = userData;

    // Clear the previous chat content
    chatArea.innerHTML = '';

    // Set the chat title and detail area
    chatTitle.innerText = userData.title;
    detailTitle.innerText = userData.title;
    detailSubtitle.innerText = userData.subtitle;

    // Clear and set profile images in chat header group
    chatGroup.innerHTML = '';

    console.log("userData.profilePics" + userData.profilePics);

    const img = document.createElement('img');
    img.classList.add('chat-area-profile');
    img.src = '/images/default.avif';
    img.alt = '';
    chatGroup.appendChild(img);

    if( userData.profilePics.length > 0) {
      userData.profilePics.forEach(pic => {
          const img = document.createElement('img');
          img.classList.add('chat-area-profile');
          img.src = pic;
          img.alt = '';
          chatGroup.appendChild(img);
      });
    }
    
    console.log("userData.messages" + userData.messages);

    // Add the messages to the chat area
    userData.messages.forEach(msg => {
        const chatMessage = document.createElement('div');
        var profilePic = 'images/default.avif';
        if(msg.sent) {
          chatMessage.classList.add('chat-msg', 'owner'); 
        } else {
          chatMessage.classList.add('chat-msg');
          profilePic = 'images/default.avif';
        }
        chatMessage.innerHTML = `
            <div class="chat-msg-profile">
                <img class="chat-msg-img" data-translate="true" src="${profilePic}" alt="" />
                <div class="chat-msg-date" data-translate="true" >Message ${msg.time}</div>
            </div>
            <div class="chat-msg-content">
                <div class="chat-msg-text" data-translate="true" >${msg.text}</div>
            </div>
        `;
        chatArea.appendChild(chatMessage);
    });

    // Change the group icon to the user's profile picture for non-group chats
    msgProfileGroup.innerHTML = ''; 

    const userImg = document.createElement('img');
    userImg.src = 'images/default.avif'; 
    userImg.alt = userData.title;
    userImg.classList.add('msg-profile-img'); 
    msgProfileGroup.appendChild(userImg);
    // if (userData.profilePics.length > 0) {
    //     const userImg = document.createElement('img');
    //     userImg.src = userData.profilePics[0]; 
    //     userImg.alt = userData.title;
    //     userImg.classList.add('msg-profile-img'); 
    //     msgProfileGroup.appendChild(userImg);
    // }

    // Show the detail area when a message is clicked
    detailArea.style.display = 'block'; // Show the detail area
    chatAreaFooter.style.display = 'flex'; // Show the chat area footer
}

// Event listener for clicking a user in the conversation-area
document.querySelectorAll('.msg').forEach((msg) => {
    msg.addEventListener('click', function() {
        // Remove the active class from any currently active message
        document.querySelectorAll('.msg').forEach((el) => el.classList.remove('active'));

        // Add the active class to the clicked message
        this.classList.add('active');

        // Get the user ID from the clicked message
        const currTargetId = this.getAttribute('data-user-UID');
        targetId = currTargetId;
        targetUID = this.getAttribute('data-user-UID');

        // Call the function to change the chat area and header based on the clicked user
        changeChat(currTargetId);
    });
});


    
    const toggleButton = document.querySelector('.dark-light');
    const colors = document.querySelectorAll('.color');

    colors.forEach(color => {
      color.addEventListener('click', e => {
        colors.forEach(c => c.classList.remove('selected'));
        const theme = color.getAttribute('data-color');
        document.body.setAttribute('data-theme', theme);
        color.classList.add('selected');
      });
    });

    toggleButton.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
    });
//# sourceURL=pen.js