const socket = io();

// Elements on the inside lobby page
const lobbyIdDisplay = document.getElementById('lobby-id-display');
const playerList = document.getElementById('players');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const leaveLobbyButton = document.getElementById('leave-lobby-button');

// Function to get URL parameters by name
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Retrieve lobby ID from URL parameters
const lobbyId = getUrlParam('lobbyId');
const playerName = getUrlParam('playerName');

// Variables to keep track of player readiness
let isPlayerReady = false;
let areAllPlayersReady = false;
let isMaster = false

if (lobbyId) {
    lobbyIdDisplay.textContent = lobbyId; // Display the lobby ID    
    // Fetch the player list from the server based on the lobby ID
    socket.emit('join-lobby', lobbyId, playerName);
    socket.emit('get-player-list', lobbyId);
} else {
    // Handle invalid URL or missing parameters
    console.error('Invalid URL or missing parameters');
}

// Handle leaving the lobby
leaveLobbyButton.addEventListener('click', () => {
    // Perform any necessary cleanup and leave the lobby
    socket.emit('leave-lobby', lobbyId);
    // Redirect to the lobby entry page
    window.location.href = 'lobby-entry.html';
});

// Handle sending chat messages
chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const message = playerName + ": "+chatInput.value; // Get the chat message from the input field
        if (message) {
            socket.emit('send-chat-message', lobbyId, message);
            chatInput.value = ''; // Clear the input field
        }
    }
});

// Listen for chat messages from other players
socket.on('chat-message', (message) => {
    // Display the received chat message in the chat box
    console.log(`Received message`);
    const messageElement = document.createElement('li');
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
});

// Listen for new players joining the lobby
socket.on('player-joined', (playerName) => {
    // Update the player list with the new player
    console.log(`Player joined`);
    const playerElement = document.createElement('li');
    playerElement.textContent = playerName;
    playerList.appendChild(playerElement);
});

// Listen for the player list from the server
socket.on('update-player-list', (players) => {
    // Ensure that 'players' is an array before mapping over it
    if (Array.isArray(players)) {
        // Update the player list with the players received from the server
        playerList.innerHTML = '';
        if (players.length === 1){
            isMaster = true
        }
        console.log(isMaster)
        players.forEach((playerName) => {
            const playerElement = document.createElement('li');
            playerElement.textContent = playerName;
            playerList.appendChild(playerElement);
        });
    }
});

function updatePlayerReadiness() {
    isPlayerReady = !isPlayerReady; // Toggle player's readiness
    socket.emit('update-readiness', lobbyId, playerName, isPlayerReady);

    // Check if all players are ready
    socket.emit('check-all-players-ready', lobbyId);
}

// Function to handle the "Ready" button click
function onReadyButtonClick() {
    updatePlayerReadiness();
}

// Listen for "player-readiness-updated" event
socket.on('player-readiness-updated', (playerName, readiness) => {
    // Handle updates to player readiness (e.g., display a "Ready" status for each player)
    // You can update the UI to indicate player readiness as needed.
    console.log(`${playerName} is ${readiness}`);
});

// Listen for "all-players-ready" event
socket.on('all-players-ready', () => {
    // Handle the event when all players are ready
    // For example, you can initiate the game by sending a "start-game" event here.
    console.log("All players are ready");
    if (isMaster === true) {
        console.log("starting game")
        socket.emit('start-game', lobbyId);
    }
});

socket.on('all-players-not-ready', () => {
    // Handle the event when all players are ready
    // For example, you can initiate the game by sending a "start-game" event here.
    console.log("All players are not ready");
    socket.emit('do-not-start-game', lobbyId);
});

// Handle "Ready" button click
const readyButton = document.getElementById('ready-button');
readyButton.addEventListener('click', onReadyButtonClick);



