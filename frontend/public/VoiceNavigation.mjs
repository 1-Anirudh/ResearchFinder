// Check for browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isSpeaking = false;


function readText(text, rate = 1, pitch = 1) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.pitch = pitch;    // Adjust pitch if needed
    speech.rate = rate;     // Adjust rate if needed

    speech.addEventListener('start', () => {
        console.log("Speech started");
        isSpeaking = true;
        recognition.stop();
    });

    speech.addEventListener('end', () => {
        console.log("Speech ended");
        isSpeaking = false;
        recognition.start();
    });

    window.speechSynthesis.speak(speech);
}


if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true; // Keeps listening even after user pauses
    recognition.lang = 'en-US'; // Set language
    recognition.interimResults = false; // Only finalize results
    recognition.maxAlternatives = 1; // Only one recognition result
    

    // Start listening when the page loads or on a button click
    document.getElementById('startVoiceNav').addEventListener('click', () => {
        recognition.start();
        console.log("Voice Navigation is now enabled.");
        readText("Voice Navigation is now enabled.", 1.5, 2);
    });
    
    let searching = false;
    let applyFilters = false;
    let filter = "";
    // Listen for recognized speech and handle commands
    
    recognition.onresult = (event) => {

        if (!isSpeaking) {
            
            const command = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
            console.log("Heard command:", command);

            if (searching === true) {
                console.log("searching activated");
                if (command.includes('stop searching')) {
                    searching = false;
                } else {
                    // Search for the command
                    console.log("Searching for:", command);
                    const searchInput = command;
                    searchUsingCommand(searchInput);
                    searching = false;
                }
            } else if (applyFilters === true) {
                if (command.includes('clear filters')) {
                    console.log("Clearing filters");
                    filter = "";
                    clearFiltersByCommand();
                } else if (command.includes('stop filtering')) {
                    applyFilters = false;
                }

                if (filter === "workmode") {
                    const helpworkmode = `Filtering by work mode. Three options are available: 'remote', 'on site' and 'hybrid'.`;
                    if (command.includes('filter by remote')) {
                        console.log("Filtering by remote");
                        addMode('remote');
                        filter = "";
                    } else if (command.includes('filter by on site')) {
                        console.log("Filtering by on site");
                        addMode('on-site');
                        filter = "";
                    } else if (command.includes('filter by hybrid')) {
                        console.log("Filtering by hybrid");
                        addMode('hybrid');
                        filter = "";
                    } else if (command.includes('user guide for work mode')) {
                        readText(helpworkmode, 1, 1.5);
                    } else {
                        readText("Invalid work mode filter. Please try again or say 'user guide for work mode' for help.", 1.5, 2);
                    }
                } else if (filter === "worktype") {
                    const helpworktype = `Filtering by work type. Three options are available: 'internship', 'full time' and 'part time'.`;
                    if (command.includes('filter by internship')) {
                        console.log("Filtering by internship");
                        addType('internship');
                        filter = "";
                    } else if (command.includes('filter by full time')) {
                        console.log("Filtering by full time");
                        addType('full-time');
                        filter = "";
                    } else if (command.includes('filter by part time')) {
                        console.log("Filtering by part time");
                        addType('part-time');
                        filter = "";
                    } else if (command.includes('user guide for work type')) {
                        readText(helpworktype, 1, 1.5);
                    } else {
                        readText("Invalid work type filter. Please try again or say 'user guide for work type' for help.", 1.5, 2);
                    }
                } else if (filter === "duration") {
                    const helpduration = `Filtering by duration. Four options are available: '1 month', '3 months', '6 months' and '12 months'.`;
                    if (command.includes('filter by 1 month')) {
                        console.log("Filtering by 1 month");
                        addDuration('1-3 months');
                        filter = "";
                    } else if (command.includes('filter by 3 months')) {
                        console.log("Filtering by 3 months");
                        addDuration('3-6 months');
                        filter = "";
                    } else if (command.includes('filter by 6 months')) {
                        console.log("Filtering by 6 months");
                        addDuration('6-12 months');
                        filter = "";
                    } else if (command.includes('filter by 12 months')) {
                        console.log("Filtering by 12 months");
                        addDuration('12+ months');
                        filter = "";
                    } else if (command.includes('user guide for duration')) {
                        readText(helpduration, 1, 1.5);
                    } else {
                        readText("Invalid duration filter. Please try again or say 'user guide for duration' fro help.", 1.5, 2);
                    }
                } else if (filter === "stipend") {
                    const helpstipend = `Filtering by stipend. Four options are available: '1000', '2000', '3000' and '3000 plus'.`;
                    if (command.includes('filter by 1000')) {
                        console.log("Filtering by 1000 dollars");
                        addStipend('$0-1,000');
                        filter = "";
                    } else if (command.includes('filter by 2000')) {
                        console.log("Filtering by 2000");
                        addStipend('$1,000-2,000');
                        filter = "";
                    } else if (command.includes('filter by 3000')) {
                        console.log("Filtering by 3000");
                        addStipend('$2,000-3,000');
                        filter = "";
                    } else if (command.includes('filter by 3000 plus')) {
                        console.log("Filtering by 3000 plus");
                        addStipend('$3,000+');
                        filter = "";
                    } else if (command.includes('user guide for stipend')) {
                        readText(helpstipend, 1, 1.5);
                    } else {
                        readText("Invalid stipend filter. Please try again or say 'user guide for stipend' for help.", 1.5, 2);
                    }
                } else {
                    console.log("Applying filters activated");
                    const userGuideFiltering = `Filtering is done by saying the name of the filter followed by the value you want to filter by. Four Filter options are available: 'work mode', 'work type', 'duration' and 'stipend'.
                                                work mode has three options 'remote', 'on site' and 'hybrid'.
                                                work type has three options 'internship', 'full time' and 'part time'.
                                                duration has three options '1 month', '3 months', '6 months' and '12 months'.
                                                stipend has three options '1000', '2000', '3000' and '3000 plus.`;
                    if (command.includes('stop filtering')) {
                        applyFilters = false;
                    } else if (command.includes('filter by work mode')) {
                        console.log("Filtering by work mode");
                        filter = "workmode";
                    } else if (command.includes('filter by work type')) {
                        console.log("Filtering by work type");
                        filter = "worktype";
                    } else if (command.includes('filter by duration')) {
                        console.log("Filtering by duration");
                        filter = "duration";
                    } else if (command.includes('filter by stipend')) {
                        console.log("Filtering by stipend");
                        filter = "stipend";
                    } else if (command.includes('apply filters')) {
                        console.log("Applying filters");
                        applyFilters = false;
                        filter = "";
                    } else if (command.includes('user guide for filtering')) {
                        readText(userGuideFiltering, 1, 1.5);
                    } else if (command.includes('clear filters')) {
                        applyFilters = false;
                        console.log("Clearing filters");
                        filter = "";
                        clearFiltersByCommand();
                    } else {
                        readText("Invalid filter. Please try again or say 'user guide for filtering' for help.", 1.5, 2);
                    }
                }
            } else {
                // Map commands to navigation functions
                if (command.includes('go to home')) {
                    navigateToHome();
                } else if (command.includes('open login')) {
                    openLogin();
                } else if (command.includes('open sign up')) {
                    openSingUp();
                } else if (command.includes('login User')) {
                    loginUser();
                } else if (command.includes('signUp User')) {
                    signUpUser();
                } else if (command.includes('read content')) {
                    readText(document.getElementById('readContent').innerText);
                } else if (command.includes('stop voice navigation')) {
                    recognition.stop();
                } else if (command.includes('go to profile')) {
                    openProfile();
                } else if (command.includes('open conversations')) {
                    openChat();
                } else if (command.includes('open feedback')) {
                    openFeedback();
                } else if (command.includes('open sidebar')) {
                    opensidebar();
                } else if (command.includes('close sidebar')) {
                    closesidebar();
                } else if (command.includes('go back')) {
                    window.history.back();
                } else if (command.includes('go forward')) {
                    window.history.forward();
                } else if (command.includes('reload')) {
                    window.location.reload();
                } else if (command.includes('search opportunities')) {
                    console.log("Searching for opportunities");
                    searching = true;
                } else if (command.includes('start filters')) {
                    console.log("Applying filters");
                    applyFilters = true
                } else if (command.includes('next page')) {
                    document.querySelector('.btn.next').click();
                } else if (command.includes('previous page')) {
                    document.querySelector('.btn.prev').click();
                } else if (command.includes('log out')) {
                    logout();
                } else if (command.includes('user guide for voice navigation')) {
                    const userGuide = `Available commands are 'go to home', 'open login', 'open sign up', 'login user', 'sign up user', 'read content', 'stop', 'go to profile', 'open conversations', 'open feedback', 'open sidebar', 'close sidebar', 'go back', 'go forward', 'reload', 'search opportunities', 'start filters', 'next page', 'previous page', 'log out', 'user guide for voice navigation'.`;
                    readText(userGuide, 1, 1.5);
                } else if (command.includes('read opportunities')) {
                    readOpportunities();
                } else if (command.includes('clear filters')) {
                    console.log("Clearing filters");
                    clearFiltersByCommand();
                }
                else {
                    console.log("Command not recognized");
                    readText("Command not recognized. Please try again or say 'guide for voice navigation' for a list of commands.", 1.5, 2);
                }
            }
        }
        // Add more commands as needed
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
        console.log("Voice navigation paused.");
        // Restart if you want continuous listening
        // recognition.start();
    };

} else {
    alert("Sorry, your browser doesn't support voice navigation.");
}

function openLogin() {
    console.log("opening login");
    document.getElementById('chk').checked = true;
}

function openSingUp() {
    console.log("opening signup");
    document.getElementById('chk').checked = false;
}

function loginUser() {
    console.log("logging in");
}

function signUpUser() {
    console.log("signing up");
}

function openProfile() {
    console.log("opening profile");
    window.location.href = '/profile';
}

function openChat() {
    console.log("going to conversations");
    window.location.href = '/chat';
}

function openFeedback() {
    console.log("going to feedback");
    window.location.href = '/feedback';
}

function logout() {
    console.log("logging out");
    window.location.href = '/logout';
}

function opensidebar() {
    let sidebar = document.querySelector(".sidebar");
    sidebar.classList.toggle("close");
}

function closesidebar() {
    let sidebar = document.querySelector(".sidebar");
    sidebar.classList.toggle("close");
}

function searchUsingCommand(searchInput) {
    console.log("Searching for:", searchInput);
    readText("Searching for " + searchInput);
    // remove '.' from end of searchInput if present
    if (searchInput[searchInput.length - 1] === '.') {
        searchInput = searchInput.slice(0, -1);
    }
    searchOpportunitiesINP(searchInput, true);
    // Add search functionality here
}

function clearFiltersByCommand() {
    console.log("Clearing filters");
    readText("Clearing filters", 1, 1.5);
    clearFilters();
}

function readOpportunities() {
    console.log("Reading opportunities");
    readText("Reading opportunities", 1.5, 2);
    let opportunities = document.querySelectorAll('.container');
    let i = 1;
    opportunities.forEach(opportunity => {
        readText(`Reading opportunity ${i}`, 1.5, 2);
        readText(opportunity.innerText, 1.5, 2);
        i++;
    });
}

