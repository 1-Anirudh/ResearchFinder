const https = require('https');

// Function to get the public IP address
function getPublicIp() {
    https.get('https://api.ipify.org?format=json', (resp) => {
        let data = '';

        // A chunk of data has been received
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result
        resp.on('end', () => {
            const ip = JSON.parse(data).ip;
            console.log(`Your public IP address is: ${ip}`);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

// Call the function to get the public IP
getPublicIp();

