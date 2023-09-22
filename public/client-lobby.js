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

if (lobbyId) {
    lobbyIdDisplay.textContent = lobbyId; // Display the lobby ID    
    // Fetch the player list from the server based on the lobby ID
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
        const message = chatInput.value; // Get the chat message from the input field
        if (message) {
            socket.emit('send-chat-message', lobbyId, message);
            chatInput.value = ''; // Clear the input field
        }
    }
});

// Listen for chat messages from other players
socket.on('chat-message', (message) => {
    // Display the received chat message in the chat box
    const messageElement = document.createElement('li');
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
});

// Listen for new players joining the lobby
socket.on('player-joined', (playerName) => {
    // Update the player list with the new player
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
        players.forEach((playerName) => {
            const playerElement = document.createElement('li');
            playerElement.textContent = playerName;
            playerList.appendChild(playerElement);
        });
    }
});
