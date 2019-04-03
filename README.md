# Guess-My-Drawing.io

### Update: Demo
Demoed at https://youtu.be/X4hzNpL7ZQw

### Update: Deployment
Deployed at https://guessmydrawingio.herokuapp.com/

### Developers
* Riaz Charania
* ~~Vilen Milner~~
* Arnob Talukder

## Description of Web App
> The web app will be an image guessing game wherein one person at a time will be drawing an image and the other people will be able to guess what it is the person is drawing. The person drawing will have some tools to help them draw (brush thickness, color) and the people guessing will be able to see the drawings happening in real-time. Users get points for guessing correctly and quickly, and must guess before time runs out to get any points. Everybody gets a turn to draw.

## Description of Technology Used
* **Node:** The backend web api will be run on Node with express module as well as a number of middlewares. The backend is responsible for providing a connection to other peoples through lobbies, accessing the database to get a word, and tracking players scores/usernames.
* **Socket.io:** This will be used for p2p connections, it is how users will see what the drawing player is drawing in real-time.
* **Mongodb:** The database we will be using to store words is mongodb, hosted online on mlab.com

## Top 5 Technical Challenges
**Joining/leaving active game lobbies**

 * Players can join lobbies already in progress
 * Lobbies can have up to 6 players
 * If a player leaves mid-game the game should progress normally
 * If the drawing player leaves, the next person will get their turn to draw as normal

**Drawing and coloring a picture during your turn**

 * The turn player can draw with different sized brushes
 * The turn player can draw with different color brushes
 * The turn player can clear the drawing
 * Players can undo their last non-undo change (including clear). The button can be held to speed up the process.

**Sharing the turn players drawing process**

 * All other players in the lobby can see the turn player's draw in real-time

**Deployment**
 
 * The application can be found online at https://guessmydrawingio.herokuapp.com/

## Key Features (for Beta Release)
By the release of the Beta version of our web application, we plan to have the following key features implemented:

* A canvas where users can draw pictures using various tools and coloring options.
* A live feed of the canvas being used by the painter, so that all other players can guess the word.
* If players disconnect from the lobby, the game will continue as normal. If the drawer disconnects, the next person gets to draw and the canvas is reset

## Additional Features (for Final Release)
By the final release of our web application, we plan to have the following additional  features implemented:

* Users can enter a username to display to the other players in the lobby
* The drawing player is given a random word from the database to guess (will always be a single English word)
* The lobby wont start unless there are 2 players and pauses if there is only one until a new player joins
* Non-drawing players can guess the word and get points equal to the remaining time if they guess it correctly (one correct guess per drawing)
* The drawing player gets 20 points for each other player who correctly guesses their drawing
* A sound effect will play when a player joins/disconnects, the timer ticks down from 5s left, and when the drawing player changes.
