const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isSpeaking = false;
let isInterrupted = false;

document.addEventListener('DOMContentLoaded', () => {
    fetch('/get-voice-nav-status')
    .then(response => response.json())
    .then(data => {
        console.log('Voice navigation status:', data);
        const enabled = data.voiceNavEnabled;
        if (enabled) {
            document.getElementById('startVoiceNav').click();
        }
    })
    .catch(error => {
        console.error("Error getting voice navigation status:", error);
    });
});


function readText(text, rate = 1, pitch = 1) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.pitch = pitch;
    speech.rate = rate;

    speech.addEventListener('start', () => {
        console.log("Speech started");
        isSpeaking = true;
        if (recognition) recognition.stop();
    });

    speech.addEventListener('end', () => {
        console.log("Speech ended");
        isSpeaking = false;
        setTimeout(() => {
            if (recognition) recognition.start();
        }, 500);
    });

    window.speechSynthesis.speak(speech);
}

document.addEventListener('keydown', function(event) {
    console.log("Key pressed:", event.key);
    if (event.altKey) 
        console.log("Alt key pressed");
    if (event.altKey && event.key === 's') {
        console.log("Stopping speech synthesis... 1");
        event.preventDefault();
        isInterrupted = true;
        stopReading();
    }
});

function readOpportunities() {
    console.log("Reading opportunities");
    isInterrupted = false; // Reset the interruption flag
    readText("Reading opportunities", 1.5, 2);
    
    let opportunities = document.querySelectorAll('.container');
    let i = 1;
    
    opportunities.forEach(opportunity => {
        if (isInterrupted) return; // Stop reading if interrupted

        readText(`Reading opportunity ${i}`, 1.5, 2);
        if (isInterrupted) {
            isInterrupted = false;
            return;
        } // Check again to avoid unnecessary reading
        readText(opportunity.innerText, 1.5, 2);
        i++;
    });
}

function stopReading() {
    console.log("Stopping speech synthesis...");
    window.speechSynthesis.cancel();
    isSpeaking = false;
    isInterrupted = false;
    if (recognition) recognition.start();
    console.log("Speech synthesis stopped and recognition restarted (if available).");
}

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    document.getElementById('startVoiceNav').addEventListener('click', () => {
        if (!isSpeaking) {
            recognition.start();
            console.log("Voice Navigation is enabled.");
            readText("Voice Navigation is enabled.", 1.5, 2);
        }

        fetch('/set-voice-nav-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ voiceNavEnabled: true })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Voice navigation status updated:", data);
        })
        .catch(error => {
            console.error("Error updating voice navigation status:", error);
        });

    });

    let searching = false;
    let applyFilters = false;
    let filter = "";

    recognition.onresult = (event) => {
        if (!isSpeaking) {
            const command = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
            console.log("Heard command:", command);
            const path = window.location.pathname;
            console.log("Current path:", path);

            if (path === '/add-opportunity') {
                if (command.includes('go to profile')) {
                    openProfile();
                } else if (command.includes('open conversations')) {
                    openChat();
                } else if (command.includes('open feedback')) {
                    openFeedback();
                } else if (command.includes('go to home')) {
                    window.location.href = '/home';
                }
            } else if (path === '/profile') {
                if (command.includes('open conversations')) {
                    openChat();
                } else if (command.includes('open feedback')) {
                    openFeedback();
                } else if (command.includes('go to home')) {
                    window.location.href = '/home';
                }
            } else if (path === '/chat') {
                if (command.includes('go to profile')) {
                    openProfile();
                } else if (command.includes('open feedback')) {
                    openFeedback();
                } else if (command.includes('go to home')) {
                    window.location.href = '/home';
                }
            } else if (path === '/feedback') {
                if (command.includes('go to profile')) {
                    openProfile();
                } else if (command.includes('open conversations')) {
                    openChat();
                } else if (command.includes('go to home')) {
                    window.location.href = '/home';
                }
            } else if (path === '/home') {
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
                    if (command.includes('go to profile')) {
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
                    } else if (command.includes('go to post opportunity')) {
                        window.location.href = '/add-opportunity';
                    } else if (command.includes('stop voice navigation')) {
                        console.log("Stopping voice navigation");
                        recognition.stop();
                        readText("Voice navigation stopped.", 1.5, 2);

                        fetch('/set-voice-nav-status', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ voiceNavEnabled: false })
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log("Voice navigation status updated:", data);
                        })
                        .catch(error => {
                            console.error("Error updating voice navigation status:", error);
                        });
                    } else if (command.includes('apply for opportunity')) {
                        applyForOpportunity(command);
                    } else if (command.includes('list sidebar options')) {
                        readSidebarOptions();
                    }
                    else {
                        console.log("Command not recognized");
                        readText("Command not recognized. Please try again or say 'guide for voice navigation' for a list of commands.", 1.5, 2);
                    }
                }
            } else if (path === '/index') {
                if (command.includes('open login')) {
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
                }
            }
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
        console.log("Voice navigation paused.");
        // Restart recognition automatically for continuous listening
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



function applyForOpportunity(command) {
    // command: apply for opportunity #<opportunity number>
    const opportunityNum = command.split('#')[1].trim();
    const opportunities = document.querySelectorAll('.container');
    const opportunityIndex = parseInt(opportunityNum) - 1;
    console.log("Applying for opportunity number", opportunityIndex);

    if (opportunityIndex >= 0 && opportunityIndex < opportunities.length) {
        readText(`Applying for opportunity number ${opportunityNum}`, 1.5, 2);
        const applyButton = opportunities[opportunityIndex].querySelector('.product-button-add');
        if (applyButton) {
            console.log("Applying for opportunity", opportunityIndex);
            applyButton.click();
        } else {
            readText("Apply button not found. Please try again.", 1.5, 2);
        }
    } else {
        readText("Invalid opportunity number. Please try again.", 1.5, 2);
    }
}

function readSidebarOptions() {
    if (window.role === 'admin') {
        const sidebarOptions = `Available sidebar options are: 'post opportunity', 'go to profile', 'open conversations', 'open feedback'`;
        readText(sidebarOptions, 1, 1.5);
    } else {
        const sidebarOptions = `Available sidebar options are: 'go to profile', 'open conversations', 'open feedback'`;
        readText(sidebarOptions, 1, 1.5);
    }
}
