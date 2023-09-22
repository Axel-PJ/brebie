const socket = io();

// Elements on the lobby entry page
const lobbyIdInput = document.getElementById('lobby-id-input');
const playerNameInput = document.getElementById('player-name-input');
const createLobbyButton = document.getElementById('create-lobby-button');
const joinLobbyButton = document.getElementById('join-lobby-button');

// Handle lobby creation
function createLobby() {
    const lobbyId = lobbyIdInput.value;
    const playerName = playerNameInput.value;
    if (lobbyId && playerName) {
        socket.emit('create-lobby', lobbyId);
        socket.emit('join-lobby', lobbyId, playerName);
        // Redirect to the lobby.html page
        window.location.href = `lobby.html?lobbyId=${lobbyId}`;
    }
}

// Handle joining a lobby
function joinLobby() {
    const lobbyId = lobbyIdInput.value;
    const playerName = playerNameInput.value;
    if (lobbyId && playerName) {
        socket.emit('join-lobby', lobbyId, playerName);
        // Redirect to the lobby.html page
        window.location.href = `lobby.html?lobbyId=${lobbyId}`;
    }
}

// Handle lobby creation when the button is clicked
createLobbyButton.addEventListener('click', () => {
    createLobby();
});

// Handle joining a lobby when the button is clicked
joinLobbyButton.addEventListener('click', () => {
    joinLobby();
});