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
const uri = "mongodb://heroku_nft10gvf:822nen9r3b8inasjmj2bg8ks0h@ds049548.mlab.com:49548/heroku_nft10gvf";
const client = new MongoClient(uri, { useNewUrlParser: true });
let collection;

client.connect( err => {
  if (err) return console.error(err);
  collection = client.db('heroku_nft10gvf').collection("words");

  /* collection.insertOne({_id: 0, word: "library"}, (err, res) => {
    if (err) return console.log(err);
  }); */

  // Starts the server.
  server.listen(port, function() {
      console.log('Starting server on port ' + port);
  });
});

// number of words in database
let totalWords = 10;
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
  this.timeLeft = null;
  this.guessedPlayers = [];
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
    io.in(lobbies[0].lobbyId).emit('joinSound');
    playerLobbies[socket.id] = lobbies[0];

    if (lobbies[0].players.length == 1) {
      lobbies[0].drawingPlayer = socket.id;
      let rnd = Math.floor(Math.random() * totalWords);
      collection.findOne({_id: rnd}, (err, res) => {
        if (err) return console.error(err);
        io.to(lobbies[0].drawingPlayer).emit('letsDraw', res.word);
        lobbies[0].word = res.word;
        lobbies[0].guessedPlayers = [];
      });
      io.in(lobbies[0].lobbyId).emit('waiting');
    } else {
      if (lobbies[0].players.length == 2){
        next_turn(lobbies[0]);
      }
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
    if (socket.id != currLobby.drawingPlayer && word == currLobby.word && !currLobby.guessedPlayers.includes(socket.id)) {
      io.to(socket.id).emit('guessRes', "CORRECT!");
      let i = currLobby.players.map(function(e) { return e.id; }).indexOf(socket.id);
      currLobby.players[i].score += (60-Math.ceil((Date.now() - startTime - currLobby.timer._idleStart)/1000));
      let j = currLobby.players.map(function(e) { return e.id; }).indexOf(currLobby.drawingPlayer);
      currLobby.players[j].score += 20;
      io.in(currLobby.lobbyId).emit('updateSB', currLobby.players, currLobby.drawingPlayer);
      currLobby.guessedPlayers.push(socket.id);
    } else if (socket.id != currLobby.drawingPlayer && word != currLobby.word && !currLobby.guessedPlayers.includes(socket.id)) {
      io.to(socket.id).emit('guessRes', "TRY AGAIN!");
    }
  });

  socket.on('disconnect', function() {
    let currLobby = playerLobbies[socket.id];
    if (!currLobby) return;
    let i = currLobby.players.map(function(e) { return e.id; }).indexOf(socket.id);
    console.log("Player " + currLobby.players[i].username + " disconnected");
    currLobby.players.splice(i, 1);
    io.in(currLobby.lobbyId).emit('disconnectSound');

    if (socket.id == currLobby.drawingPlayer) {
      currLobby.lastDataUrl = null;
      if (currLobby.players.length > 0) {
        if (i < currLobby.players.length)
          currLobby.drawingPlayer = currLobby.players[i].id;
        else
          currLobby.drawingPlayer = currLobby.players[0].id;
        let rnd = Math.floor(Math.random() * totalWords);
        collection.findOne({_id: rnd}, (err, res) => {
          if (err) return console.error(err);
          io.to(currLobby.drawingPlayer).emit('letsDraw', res.word);
          currLobby.word = res.word;
          currLobby.guessedPlayers = [];
        });
        io.in(currLobby.lobbyId).emit('letsWatch', currLobby.drawingPlayer, currLobby.lastDataUrl);
      } else
        currLobby.drawingPlayer = null;
    }

    if (currLobby.players.length < 2) {
      clearInterval(currLobby.timer);
      clearInterval(currLobby.timeLeft);
      io.in(currLobby.lobbyId).emit('waiting');
    }

    io.in(currLobby.lobbyId).emit('updateSB', currLobby.players, currLobby.drawingPlayer);
  });
});

function next_turn(lobby) {
  lobby.timer = setInterval(function() {
    let i = lobby.players.map(function(e) { return e.id; }).indexOf(lobby.drawingPlayer);
    lobby.lastDataUrl = null;
    if (i < lobby.players.length - 1) {
      lobby.drawingPlayer = lobby.players[i+1].id;
    } else {
      lobby.drawingPlayer = lobby.players[0].id;
    }
    let rnd = Math.floor(Math.random() * totalWords);
    collection.findOne({_id: rnd}, (err, res) => {
      if (err) return console.error(err);
      io.to(lobby.drawingPlayer).emit('letsDraw', res.word);
      lobby.word = res.word;
      lobby.guessedPlayers = [];
    });
    io.in(lobby.lobbyId).emit('letsWatch', lobby.drawingPlayer, lobby.lastDataUrl);
    io.in(lobby.lobbyId).emit('updateSB', lobby.players, lobby.drawingPlayer);
    io.in(lobby.lobbyId).emit('nextTurn');
  }, 60000);

  lobby.timeLeft = setInterval(function() {
    let timeleft = (60-Math.ceil((Date.now() - startTime - lobby.timer._idleStart)/1000));
    io.in(lobby.lobbyId).emit('timer', timeleft.toString());
  }, 1000);
}
