# Guess-My-Drawing.io

### Developers
* Riaz Charania
* Vilen Milner
* Arnob Talukder

## Description of Web App
> The web app will be an image guessing game wherein one person at a time will be drawing an image and the other people will be able to guess what it is the person is drawing. The person drawing will have some tools to help them draw (brush thickness, color) and the people guessing will be able to see the drawings happening in real-time. Users get points for guessing correctly and quickly, and must guess before time runs out to get any points. Everybody gets a turn to draw.

## Description of Technology Used
* **Node:** the backend web api will be run on Node with express module as well as a number of middlewares (session, body-parser, any others that help). The backend will be responsible for storing user credentials. Furthermore, the server might be used as a signalling server for the WebRTC connections (unless we find another available signalling server already out there). 
* **WebRTC:** this will be used for p2p connections, it is how users will be able to see in realtime what the artist is drawing, and how users can communicate.
* **Bootstrap:** this will be used for the frontend as it is much easier and quicker to develop good looking UI with it, furthermore most elements of Bootstrap are responsive, so we get that for free.
* **JQuery:** won't be used as much except where necessary or might save time, Bootstrap requires it so it is included anyways.

## Top 5 Technical Challenges
**Joining/leaving active game lobbies**

 * Players can join/re-join lobbies already in progress
 * If a player leaves mid-game (including on their turn) the game should progress normally

**Drawing and coloring a picture during your turn**

 * The turn player can draw with different sized brushes
 * The turn player can draw with different color brushes
 * The turn player can reset the drawing
 * Other

**Sharing the turn players drawing process**

 * All other players in the lobby can see the turn player's draw in real-time

**Voice Chat**

 * All players in the lobby can talk to each other

**Leaderboards**

 * In-game leaderboard to show player rankings
 * Overall leaderboard to show highest total scoring players (by username)

## Key Features (for Beta Release)
By the release of the Beta version of our web application, we plan to have the following key features implemented:

* A canvas where users can draw pictures using various tools and coloring options.
* A live feed of the canvas being used by the painter, so that all other players can guess the word.
* An account management system, where users can signup/login and see their individual scores, and high-scores.

## Additional Features (for Final Release)
By the final release of our web application, we plan to have the following additional  features implemented:

* Full voice chat functionality, where players can all communicate with each other.
* The ability to drop in/out of games in progress, while still maintaining the current turn order and score hierarchy.
