// server.js
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 8080;

const crypto = require('crypto');

// Generate a 32-byte AES key
const encryptionKey = 'ThisIsA32ByteKeyForAES1234567890';
const iv = crypto.randomBytes(16);

// Create a Cipher object with the AES algorithm and CBC mode
const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);

// Create a Decipher object with the AES algorithm and CBC mode
const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);

// Handle incoming socket connections
io.on('connection', (socket) => {
    console.log('a user connected');

    // Handle incoming chat messages
    // socket.on('chat message', (message) => {
    //     // Encrypt the message using the AES key
    //     let aes_encrypted = cipher.update(message, 'utf8', 'base64');
    //     aes_encrypted += cipher.final('base64');

    //     console.log('encrypted message: ' + aes_encrypted);

    //     // Broadcast the encrypted message to all connected clients
    //     io.emit('chat message', aes_encrypted);
    // });

    // Handle incoming chat messages
    socket.on('chat message', (message) => {
        // Encrypt the message using the AES key
        let aes_encrypted = cipher.update(message, 'utf8', 'base64');
        aes_encrypted += cipher.final('base64');

        console.log('encrypted message: ' + aes_encrypted);

        // Decrypt the message using the AES key
        let aes_decrypted = decipher.update(aes_encrypted, 'base64', 'utf8');
        aes_decrypted += decipher.final('utf8');

        console.log('decrypted message: ' + aes_decrypted);

        // Broadcast both the encrypted and decrypted messages to all connected clients
        io.emit('chat message', { encrypted: aes_encrypted, decrypted: aes_decrypted });
    });

    // Handle socket disconnections
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
// Start the server
http.listen(port, () => {
    console.log(`listening on *:${port}`);
});