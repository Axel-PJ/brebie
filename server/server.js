const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve the static files in the 'public' directory
app.use(express.static('public'));

// Initialize a data structure to store player data by lobby ID
const lobbyPlayers = new Map();

io.on('connection', (socket) => {
    socket.on('create-lobby', (lobbyId) => {
        // Create a new lobby with the given ID
        lobbyPlayers.set(lobbyId, []);
        socket.join(lobbyId);
        // Emit the lobby ID back to the client
        socket.emit('lobby-id', lobbyId);
        // Log lobby creation
        console.log(`Lobby created: ${lobbyId}`);
    });

    socket.on('join-lobby', (lobbyId, playerName) => {
        // Add the player to the lobby
        const lobby = lobbyPlayers.get(lobbyId);
        if (lobby && lobby.length < 12) {
            lobby.push({ socketId: socket.id, playerName });
            socket.join(lobbyId);
            // Notify other players in the lobby about the new player
            socket.to(lobbyId).emit('player-joined', playerName);
            // Log player join
            console.log(`Player ${playerName} joined lobby ${lobbyId}`);
        }
        // Emit the lobby ID back to the client
        socket.emit('lobby-id', lobbyId);
        // Emit the player list to the client
        socket.emit('update-player-list', lobby.map(player => player.playerName));
    });

    socket.on('send-chat-message', (lobbyId, message) => {
        // Broadcast the chat message to all players in the lobby
        io.to(lobbyId).emit('chat-message', message); // Broadcast to everyone in the lobby
    });

    // Implement the 'get-player-list' event to retrieve the player list
    socket.on('get-player-list', (lobbyId) => {
        const playerList = lobbyPlayers.get(lobbyId) || [];
        const playerNameList = playerList.map(player => player.playerName);
        socket.emit('update-player-list', playerNameList);
    });

    // Implement logic for leaving the lobby, if needed

    // ...
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
