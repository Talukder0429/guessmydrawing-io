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
      
      io.in(lobbies[0].lobbyId).emit('updateSB', lobbies[0].players);
      if (lobbies[0].players.length == 1){
        lobbies[0].drawingPlayer = socket.id;
        io.to(socket.id).emit('letsDraw');
      } else {
        io.sockets.emit('letsWatch', lobbies[0].players[0], lobbies[0].lastDataUrl);
      }
  });

  socket.on('view', function(leaderSocket, dataURL) {
    lobbies[0].lastDataUrl = dataURL;
    io.sockets.emit('letsWatch', leaderSocket, dataURL);
  });

  socket.on('disconnect', function(){
    console.log(socket.id + " disconnected");
    let i = lobbies[0].players.indexOf(socket.id);
    lobbies[0].players.splice(i, 1);

    io.sockets.emit('updateSB', lobbies[0].players);
    if (socket.id == lobbies[0].drawingPlayer) {
      lobbies[0].lastDataUrl = null;
      if (lobbies[0].players.length > 0){
        lobbies[0].drawingPlayer = lobbies[0].players[0];
        io.to(lobbies[0].players[0]).emit('letsDraw');
        io.sockets.emit('letsWatch', lobbies[0].drawingPlayer, lobbies[0].lastDataUrl);
      } else
      lobbies[0].drawingPlayer = null;
    }
  });
});
