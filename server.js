/*jshint esversion: 6 */ 

// Dependencies
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const app = express();
const server = http.Server(app);
const io = socketIO(server);
const port = process.env.PORT || 3000;
app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

// Starts the server.
server.listen(port, function() {
  console.log('Starting server on port ' + port);
});

let lobbies = [];

let Lobby = function () {
  let lobbyNum = lobbies.length;
  this.lobbyId = "lobby" + lobbyNum.toString();
  this.players = [];
  this.lastDataUrl = null;
  this.drawingPlayer = null;
}

let playerLobbies = {};

/*let players = [];

let lastDataUrl = null;

let drawingPlayer = null;*/

// Add the WebSocket handlers
io.on('connection', function(socket) {
  if (lobbies.length == 0)
    lobbies.push(new Lobby());
  else if (lobbies[0].players.length == 6)
    lobbies.splice(0, 0, new Lobby());

  socket.join(lobbies[0].lobbyId);

  socket.on('newPlayer', function() {
      console.log("A player on socket " + socket.id + " connected!");
      lobbies[0].players.push(socket.id);
      playerLobbies[socket.id] = lobbies[0];
      
      io.in(lobbies[0].lobbyId).emit('updateSB', lobbies[0].players);
      if (lobbies[0].players.length == 1){
        lobbies[0].drawingPlayer = socket.id;
        io.to(socket.id).emit('letsDraw');
      } else {
        io.in(lobbies[0].lobbyId).emit('letsWatch', lobbies[0].players[0], lobbies[0].lastDataUrl);
      }
  });

  socket.on('view', function(leaderSocket, dataURL) {
    let currLobby = playerLobbies[socket.id];
    currLobby.lastDataUrl = dataURL;
    io.in(currLobby.lobbyId).emit('letsWatch', leaderSocket, dataURL);
  });

  socket.on('disconnect', function(){
    console.log(socket.id + " disconnected");
    let currLobby = playerLobbies[socket.id];

    let i = currLobby.players.indexOf(socket.id);
    currLobby.players.splice(i, 1);

    io.in(currLobby.lobbyId).emit('updateSB', currLobby.players);
    if (socket.id == currLobby.drawingPlayer) {
      currLobby.lastDataUrl = null;
      if (currLobby.players.length > 0){
        currLobby.drawingPlayer = currLobby.players[0];
        io.to(currLobby.players[0]).emit('letsDraw');
        io.in(currLobby.lobbyId).emit('letsWatch', currLobby.drawingPlayer, currLobby.lastDataUrl);
      } else
      currLobby.drawingPlayer = null;
    }
  });
});
