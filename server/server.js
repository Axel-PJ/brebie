const game = require('./game-logic')
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
// Initialize a data structure to store player readiness by lobby ID
const lobbyReadiness = new Map();
// Initialize and array to store the list of Lobbies
const lobbyList = new Array();

var gameStates = new Object();

io.on('connection', (socket) => {
    socket.on('create-lobby', (lobbyId) => {
        // Create a new lobby with the given ID and join the room
        socket.join(lobbyId);
        lobbyPlayers.set(lobbyId, []);
        lobbyList.push(lobbyId)
        console.log(lobbyList)
        // Emit the lobby ID back to the client
        socket.emit('lobby-id', lobbyId);
        // Log lobby creation
        console.log(`Lobby created: ${lobbyId}`);
    });

    socket.on('join-lobby', (lobbyId, playerName) => {
        // Join the room corresponding to the lobby ID
        socket.join(lobbyId);
        // Add the player to the lobby
        const lobby = lobbyPlayers.get(lobbyId);
        if (lobby && lobby.length < 12) {
            lobby.push({ socketId: socket.id, playerName });
            // Notify all players in the room about the new player
            io.to(lobbyId).emit('player-joined', playerName);
            // Log player join
            console.log(`Player ${playerName} joined lobby ${lobbyId}`);
        }
        // Emit the lobby ID back to the client
        socket.emit('lobby-id', lobbyId);
        // Emit the player list to the client
        socket.emit('update-player-list', lobby.map(player => player.playerName));
    });

    socket.on('send-chat-message', (lobbyId, message) => {
        // Broadcast the chat message to all players in the room (lobby)
        io.to(lobbyId).emit('chat-message', message);
    });

    // Implement the 'get-player-list' event to retrieve the player list
    socket.on('get-player-list', (lobbyId) => {
        const playerList = lobbyPlayers.get(lobbyId) || [];
        const playerNameList = playerList.map(player => player.playerName);
        socket.emit('update-player-list', playerNameList);
    });

    socket.on('get-lobby-list', () => {
        console.log("getting lobby list")
        console.log(lobbyList)
        socket.emit('update-lobby-list', lobbyList);
    });

    // Handle player readiness updates
    socket.on('update-readiness', (lobbyId, playerName, isReady) => {
        const playerSocketId = socket.id;
        lobbyReadiness.set(playerSocketId, isReady);
        // Emit an event to inform all clients about the updated readiness
        io.to(lobbyId).emit('player-readiness-updated', playerName, isReady);
    });

    // Check if all players are ready
    socket.on('check-all-players-ready', (lobbyId) => {
        const lobby = lobbyPlayers.get(lobbyId);
        const allPlayersReady = lobby.every((player) => lobbyReadiness.get(player.socketId));
        if (allPlayersReady) {
            // Emit an event to inform all clients that all players are ready
            io.to(lobbyId).emit('all-players-ready');
        }
        else {
            io.to(lobbyId).emit('all-players-not-ready');
        }
    });

    // Start the game when all players are ready
    socket.on('start-game', (lobbyId) => {
        const playerList = lobbyPlayers.get(lobbyId) || []
        game.startGame(gameStates,lobbyId,playerList);
        game.startRound(gameStates,lobbyId)
        game.startRound(gameStates,lobbyId)
        io.to(lobbyId).emit('game-started');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
