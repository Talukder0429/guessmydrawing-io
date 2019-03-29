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

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://gmd:ha38ozSpdzPZkLMY@guessmydrawing-1lm76.mongodb.net/test?retryWrites=true";
const client = new MongoClient(uri, { useNewUrlParser: true });
let collection;

client.connect( err => {
  if (err) return console.error(err);
  collection = client.db('GuessMyDrawing').collection("words");

  /* collection.insertOne({_id: 0, word: "library"}, (err, res) => {
    if (err) return console.log(err);
  }); */

  // Starts the server.
  server.listen(port, function() {
      console.log('Starting server on port ' + port);
  });
});

// number of words in database
let totalWords = 2;
/* const client = new MongoClient(uri, { useNewUrlParser: true });
mongo.connect(url, function(err, db) {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Database created!");
  db.close();
}) */

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/static', 'index.html'));
});

let lobbies = [];

let Lobby = function () {
  let lobbyNum = lobbies.length;
  this.lobbyId = "lobby" + lobbyNum.toString();
  this.players = [];
  this.lastDataUrl = null;
  this.drawingPlayer = null;
  this.word = null;
}

let playerLobbies = {};

/*let players = [];

let lastDataUrl = null;

let drawingPlayer = null;*/

// Add the WebSocket handlers
io.on('connection', function(socket) {
  socket.on('newPlayer', function(username) {
    if (lobbies.length == 0) {
      lobbies.push(new Lobby());
    } else if (lobbies[0].players.length == 6) {
      lobbies.splice(0, 0, new Lobby());
    }
    socket.join(lobbies[0].lobbyId);

    console.log("A player on socket " + socket.id + " connected, with username: " + username);
    lobbies[0].players.push({ id: socket.id, username: username });
    playerLobbies[socket.id] = lobbies[0];

    io.in(lobbies[0].lobbyId).emit('updateSB', lobbies[0].players);
    if (lobbies[0].players.length == 1) {
      lobbies[0].drawingPlayer = socket.id;
      let rnd = Math.floor(Math.random() * totalWords);
      collection.findOne({_id: rnd}, (err, word) => {
        if (err) return console.error(err);
        console.log(rnd);
        console.log(word);
        io.to(lobbies[0].players[0].id).emit('letsDraw', word.word);
      });
    } else {
      io.in(lobbies[0].lobbyId).emit('letsWatch', lobbies[0].players[0].id, lobbies[0].lastDataUrl);
    }
  });

  socket.on('view', function(leaderSocket, dataURL) {
    let currLobby = playerLobbies[socket.id];
    currLobby.lastDataUrl = dataURL;
    io.in(currLobby.lobbyId).emit('letsWatch', leaderSocket, dataURL);
  });

  socket.on('disconnect', function() {
    let currLobby = playerLobbies[socket.id];
    let i = currLobby.players.map(function(e) { return e.id; }).indexOf(socket.id);
    console.log("Player " + currLobby.players[i].username + " disconnected");
    currLobby.players.splice(i, 1);

    io.in(currLobby.lobbyId).emit('updateSB', currLobby.players);
    if (socket.id == currLobby.drawingPlayer) {
      currLobby.lastDataUrl = null;
      if (currLobby.players.length > 0) {
        currLobby.drawingPlayer = currLobby.players[0].id;
        let rnd = Math.floor(Math.random() * totalWords);
        collection.findOne({_id: rnd}, (err, word) => {
          if (err) return console.error(err);
          io.to(currLobby.players[0].id).emit('letsDraw', word.word);
        });
        io.in(currLobby.lobbyId).emit('letsWatch', currLobby.drawingPlayer, currLobby.lastDataUrl);
      } else
        currLobby.drawingPlayer = null;
    }
  });
});
