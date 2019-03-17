// Dependencies
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const app = express();
const server = http.Server(app);
const io = socketIO(server);
app.set('port', 3000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

// Starts the server.
server.listen(3000, function() {
  console.log('Starting server on port 3000');
});

// Add the WebSocket handlers
io.on('connection', function(socket) {});

let players = [];

let lastDataUrl = null;

let drawingPlayer = null;

io.on('connection', function(socket) {
    socket.on('newPlayer', function() {
        console.log("A player on socket " + socket.id + " connected!");
        players.push(socket.id);
        if (players.length == 1){
          drawingPlayer = socket.id;
          io.to(players[0]).emit('letsDraw');
        } else {
          io.sockets.emit('letsWatch', players[0], lastDataUrl);
        }
    });

    socket.on('view', function(leaderSocket, dataURL) {
        //console.log(fromPlayerSocket + " is leader!");
        lastDataUrl = dataURL;
        io.sockets.emit('letsWatch', leaderSocket, dataURL);
    });

    socket.on('disconnect', function(){
      console.log(socket.id + " disconnected");
      let i = players.indexOf(socket.id);
      players.splice(i, 1);

      if (socket.id == drawingPlayer) {
        console.log("he was the leader");
        if (players.length > 0){
          drawingPlayer = players[0];
          io.to(players[0]).emit('letsDraw');
        } else
          drawingPlayer = null;
      }
    })
});
