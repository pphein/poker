// Define a player object
class Player {
    constructor(name, chips) {
        this.name = name;
        this.chips = chips;
        this.bet = 0;
        this.cards = [];
        this.active = true;
    }

    // Method to place a bet
    placeBet(amount) {
        if (amount <= this.chips) {
            this.bet = amount;
            this.chips -= amount;
        }
    }

    // Method to receive cards
    receiveCards(cards) {
        this.cards = cards;
    }

    // Method to fold
    fold() {
        this.active = false;
    }
}

// Define the game state object
let gameState = {
    players: [
        new Player("Player 1", 1000),
        new Player("Player 2", 1000),
        new Player("Player 3", 1000),
        new Player("Player 4", 1000),
    ],
    activePlayers: [],
    pot: 0,
    currentTurn: 0,
};

// Initialize the game state object
gameState.activePlayers = [...gameState.players];

// Implement game logic
function evaluateWinner() {
    // Evaluate the winner based on the game logic
    // ...

    // Distribute the pot to the winner(s)
    let winnerChips = gameState.pot / winnerCount;
    for (let i = 0; i < gameState.activePlayers.length; i++) {
        if (gameState.activePlayers[i].active) {
            gameState.activePlayers[i].chips += winnerChips;
        }
    }
    gameState.pot = 0;
    gameState.activePlayers = [...gameState.players];
    gameState.currentTurn = 0;
}

// Handle user input
function handleFold() {
    gameState.activePlayers[0].fold();
    gameState.activePlayers.shift();
    if (gameState.activePlayers.length === 1) {
        evaluateWinner();
    } else {
        gameState.currentTurn = (gameState.currentTurn + 1) % gameState.activePlayers.length;
    }
    io.emit("game-state", gameState);
}

function handleBet(amount) {
    gameState.activePlayers[0].placeBet(amount);
    gameState.pot += amount;
    gameState.activePlayers.push(gameState.activePlayers.shift());
    gameState.currentTurn = (gameState.currentTurn + 1) % gameState.activePlayers.length;
    io.emit("game-state", gameState);
}

// Initialize the socket connection
const io = require("socket.io")(3000);

// Handle socket events
io.on("connection", (socket) => {
    // Send the initial game state to the player
    socket.emit("game-state", gameState);

    // Handle fold events
    socket.on("fold", () => {
        handleFold();
    });

    // Handle bet events
    socket.on("bet", (amount) => {
        handleBet(amount);
    });
});


// class Player {
//     constructor(name, chips) {
//         this.name = name;
//         this.chips = chips;
//         this.bet = 0;
//         this.cards = [];
//         this.active = true;
//     }

//     // Method to place a bet
//     placeBet(amount) {
//         if (amount <= this.chips) {
//             this.bet = amount;
//             this.chips -= amount;
//         }
//     }

//     // Method to receive cards
//     receiveCards(cards) {
//         this.cards = cards;
//     }

//     // Method to fold
//     fold() {
//         this.active = false;
//     }
// }

// // Initialize the game
// let players = [
//     new Player("Player 1", 1000),
//     new Player("Player 2", 1000),
//     new Player("Player 3", 1000),
//     new Player("Player 4", 1000),
// ];
// let activePlayers = [...players];
// let pot = 0;

// // Implement game logic
// function evaluateWinner() {
//     // Evaluate the winner based on the game logic
//     // ...

//     // Distribute the pot to the winner(s)
//     let winnerChips = pot / winnerCount;
//     for (let i = 0; i < activePlayers.length; i++) {
//         if (activePlayers[i].active) {
//             activePlayers[i].chips += winnerChips;
//         }
//     }
//     pot = 0;
//     activePlayers = [...players];
// }

// // Handle user input
// function handleFold() {
//     activePlayers[0].fold();
//     activePlayers.shift();
//     if (activePlayers.length === 1) {
//         evaluateWinner();
//     }
// }

// function handleBet() {
//     let betAmount = parseInt(document.getElementById("bet-input").value);
//     activePlayers[0].placeBet(betAmount);
//     pot += betAmount;
//     activePlayers.push(activePlayers.shift());
// }

// // Update the game interface
// function updatePlayerState() {
//     for (let i = 0; i < players.length; i++) {
//         let playerElem = document.getElementById("player-" + i);
//         playerElem.querySelector(".player-name").textContent = players[i].name;
//         playerElem.querySelector(".player-chips").textContent = players[i].chips;
//         playerElem.querySelector(".player-bet").textContent = players[i].bet;
//         playerElem.querySelector(".player-cards").textContent = players[i].cards.join(", ");
//         playerElem.querySelector(".player-status").textContent = players[i].active ? "Active" : "Folded";
//     }
// }

// // Example usage
// players[0].receiveCards(["Ace of Hearts", "King of Hearts"]);
// players[1].receiveCards(["King of Spades", "Queen of Spades"]);
// players[2].receiveCards(["Ace of Clubs", "Queen of Clubs"]);
// players[3].receiveCards(["Jack of Diamonds", "Ten of Diamonds"]);

// updatePlayerState();

// handleFold();

// updatePlayerState();

// handleBet();

// updatePlayerState();