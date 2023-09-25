module.exports = {

startGame: function (gameStates,lobbyId,playerList) {
    gameStates[lobbyId] = new Object();
    var obj = new Object()
    obj.Players = new Object()
    obj.startDate=Date()
    obj.maxRounds=Object.keys(playerList).length
    for (const [key, value] of Object.entries(playerList)){
        obj.Players[value.playerName] = new Object()
        obj.Players[value.playerName]["score"] = 0
        obj.Players[value.playerName]["hasBeenGatherer"] = false
    }
    gameStates[lobbyId]['info'] = obj
},

endGame: function() {

},

startRound: function(gameStates,lobbyId) {

    var gatherer=selectGatherer(gameStates[lobbyId]['info'].Players)
    console.log(`Gatherer is ${gatherer}`)
    gameStates[lobbyId]['info']['Players'][gatherer].hasBeenGatherer = true;
    var thief=selectThief(gameStates[lobbyId]['info'].Players,gatherer)
    var obj = new Object()
    obj.Gatherer=gatherer
    obj.Thief=thief
    gameStates[lobbyId]['rounds'] = new Array()
    // gameStates[lobbyId]['rounds'].append(obj)
},

endRound: function() {

},

addTurn: function() {

}}

function selectGatherer(players) {
for (const [player, values] of Object.entries(players)){
    console.log(values.hasBeenGatherer)
    if (values.hasBeenGatherer === false){
        console.log("Player has been found")
        return player
    }
}
return null
}

function selectThief(players,gatherer) {
for (var player in players){
}
}