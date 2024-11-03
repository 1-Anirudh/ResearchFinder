
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';
import { firebaseConfig } from './firebaseConfigFile.js';

const app = initializeApp(firebaseConfig);
const analyticsInstance = getAnalytics(app);

async function logUserEvent(eventName, eventParams) {
    try {
      await logEvent(analyticsInstance, eventName, eventParams);
    } catch (error) {
      console.error("Error logging event:", error);
      throw error;
    }
}

async function logPageViewEvent(pageName) {
    try {
        await logEvent(analyticsInstance, 'pageViewEvent', {
            pageTitle: pageName,
            page: `/${pageName}`
        });
        console.log(`Page view event logged for ${pageName}`);
    } catch (error) {
        console.error("Error logging page view event:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const applyButtons = document.querySelectorAll(".product-button-add");
    applyButtons.forEach(button => {
        button.addEventListener("click", async () => {
            console.log("apply Opportunity clicked");
            try {
                const parentContainer = this.closest('.container');
                const opportunityId = parentContainer.getAttribute('Opportunity-ID');
                const opportunity = window.opportunityData[opportunityId];

                if (parentContainer) {
                    const opportunityTopic = opportunity.topic;
                    const opportunityLocation = opportunity.location;
                    const opportunityType = opportunity.type;
                    const opportunityStipend = opportunity.stipend;
                    const opportunityDuration = opportunity.duration;
                    const opportunityMode = opportunity.mode;
                    
                    await logUserEvent('applyOpportunityEvent', {
                        name: 'applyOpportunity',
                        opportunityTopic: opportunityTopic,
                        opportunityLocation: opportunityLocation,
                        opportunityType: opportunityType,
                        opportunityMode: opportunityMode,
                        opportunityStipend: opportunityStipend,
                        opportunityDuration: opportunityDuration
                    });
                    console.log('Event logged successfully');
                }
                console.log('Event logged successfully');
            } catch (error) {
                console.error("Error logging event:", error);
            }
        });
    });

    const feedbackPage = document.getElementById('feedbackPage');
    const chatPage = document.getElementById('chatPage');
    const profilePage = document.getElementById('profilePage');
    const addOpportunityPage = document.getElementById('addOpportunityPage');


    if (feedbackPage) {
        feedbackPage.addEventListener('click', async (event) => {
            logPageViewEvent('feedbackPage');
        });
    }

    if (chatPage) {
        chatPage.addEventListener('click', async (event) => {
            logPageViewEvent('chatPage');
        });
    }

    if (profilePage) {
        profilePage.addEventListener('click', async (event) => {
            logPageViewEvent('profilePage');
        });
    }

    if (addOpportunityPage) {
        addOpportunityPage.addEventListener('click', async (event) => {
            logPageViewEvent('addOpportunityPage');
        });
    }

    document.getElementById('startVoiceNav').addEventListener('click', () => {
        logUserEvent('voiceNavEvent', {
            name: 'voiceNavigation'
        });
    });

});