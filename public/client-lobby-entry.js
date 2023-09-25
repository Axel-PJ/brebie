const socket = io();

// Elements on the lobby entry page
const lobbyIdInput = document.getElementById('lobby-id-input');
const playerNameInput = document.getElementById('player-name-input');
const createLobbyButton = document.getElementById('create-lobby-button');
const joinLobbyButton = document.getElementById('join-lobby-button');
const lobbyListDiv = document.getElementById('lobby-list');

// Handle lobby creation
function createLobby() {
    const lobbyId = lobbyIdInput.value;
    const playerName = playerNameInput.value;
    if (lobbyId && playerName) {
        socket.emit('create-lobby', lobbyId);
        // Redirect to the lobby.html page
        window.location.href = `lobby.html?lobbyId=${lobbyId}&playerName=${playerName}`;
    }
}

// Handle joining a lobby
function joinLobby() {
    const lobbyId = lobbyIdInput.value;
    const playerName = playerNameInput.value;
    if (lobbyId && playerName) {
        // Redirect to the lobby.html page
        window.location.href = `lobby.html?lobbyId=${lobbyId}&playerName=${playerName}`;
    }
}

socket.on('update-lobby-list', (lobbyList) => {
    // Display the received chat message in the chat box
    console.log(`Received lobbyList`);
    console.log(lobbyList)
    for (lobby of lobbyList) {
        messageElement = document.createElement('li');
        messageElement.textContent = lobby;
        lobbyListDiv.appendChild(messageElement);
    }
});
// Handle lobby creation when the button is clicked
createLobbyButton.addEventListener('click', () => {
    createLobby();
});

// Handle joining a lobby when the button is clicked
joinLobbyButton.addEventListener('click', () => {
    joinLobby();
});

socket.emit('get-lobby-list');