const fs = require('fs');
const path = require('path');
const { addOpportunity } = require('./backend/opportunity');

// Define the path to the JSON file
const jsonFilePath = './sample-opportunties.json';

// Read the JSON file asynchronously
fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the JSON file:', err);
        return;
    }

    try {
        // Parse the JSON data
        const jsonData = JSON.parse(data);
        // Use the parsed data as needed
        // For example, you can iterate over the data and log each item
        Object.keys(jsonData).forEach(key => {
            const item = jsonData[key];
            // console.log('Opportunity ID:', key);
            // console.log('Item:', item);

            // Add the opportunity to the database
            addOpportunity(item);
        });
    } catch (parseErr) {
        console.error('Error parsing the JSON data:', parseErr);
    }
});