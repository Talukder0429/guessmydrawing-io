/*jshint esversion: 6 */

let startTime = Date.now();

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
  this.timer = null;
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
    lobbies[0].players.push({ id: socket.id, username: username, score: 0 });
    playerLobbies[socket.id] = lobbies[0];

    if (lobbies[0].players.length == 1) {
      lobbies[0].drawingPlayer = socket.id;
      let rnd = Math.floor(Math.random() * totalWords);
      collection.findOne({_id: rnd}, (err, res) => {
        if (err) return console.error(err);
        io.to(lobbies[0].drawingPlayer).emit('letsDraw', res.word);
        lobbies[0].word = res.word;
        next_turn(lobbies[0]);
      });
    } else {
      io.in(lobbies[0].lobbyId).emit('letsWatch', lobbies[0].drawingPlayer, lobbies[0].lastDataUrl);
    }
    io.in(lobbies[0].lobbyId).emit('updateSB', lobbies[0].players, lobbies[0].drawingPlayer);
  });

  socket.on('view', function(dataURL) {
    let currLobby = playerLobbies[socket.id];
    if (currLobby) {
      currLobby.lastDataUrl = dataURL;
      io.in(currLobby.lobbyId).emit('letsWatch', socket.id, dataURL);
    }
  });

  socket.on('guess', function(word) {
    let currLobby = playerLobbies[socket.id];
    if (socket.id != currLobby.drawingPlayer && word == currLobby.word) {
      console.log("correct guess");
      let i = currLobby.players.map(function(e) { return e.id; }).indexOf(socket.id);
      currLobby.players[i].score += (60-Math.ceil((Date.now() - startTime - currLobby.timer._idleStart)/1000));
      io.in(currLobby.lobbyId).emit('updateSB', currLobby.players, currLobby.drawingPlayer);
    }
  });

  socket.on('disconnect', function() {
    let currLobby = playerLobbies[socket.id];
    if (!currLobby) return;
    let i = currLobby.players.map(function(e) { return e.id; }).indexOf(socket.id);
    console.log("Player " + currLobby.players[i].username + " disconnected");
    currLobby.players.splice(i, 1);

    if (socket.id == currLobby.drawingPlayer) {
      currLobby.lastDataUrl = null;
      if (currLobby.players.length > 0) {
        if (i < currLobby.players.length)
          currLobby.drawingPlayer = currLobby.players[i].id
        else
          currLobby.drawingPlayer = currLobby.players[0].id
        let rnd = Math.floor(Math.random() * totalWords);
        collection.findOne({_id: rnd}, (err, res) => {
          if (err) return console.error(err);
          io.to(currLobby.drawingPlayer).emit('letsDraw', res.word);
          currLobby.word = res.word;
        });
        io.in(currLobby.lobbyId).emit('letsWatch', currLobby.drawingPlayer, currLobby.lastDataUrl);
      } else
        currLobby.drawingPlayer = null;
    }
    io.in(currLobby.lobbyId).emit('updateSB', currLobby.players, currLobby.drawingPlayer);
  });
});

function next_turn(lobby) {
  lobby.timer = setInterval(function() {
    let i = lobby.players.map(function(e) { return e.id; }).indexOf(lobby.drawingPlayer);
    if (i < lobby.players.length - 1) {
      console.log("playerchange from " + i);
      lobby.lastDataUrl = null;
      lobby.drawingPlayer = lobby.players[i+1].id;
      let rnd = Math.floor(Math.random() * totalWords);
      collection.findOne({_id: rnd}, (err, res) => {
        if (err) return console.error(err);
        io.to(lobby.drawingPlayer).emit('letsDraw', res.word);
        lobby.word = res.word;
      });
      io.in(lobby.lobbyId).emit('letsWatch', lobby.drawingPlayer, lobby.lastDataUrl);
    }
  }, 10000);
}