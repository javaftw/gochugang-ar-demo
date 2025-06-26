// Game State
let gameState = {
    currentRound: 1,
    totalRounds: 3,
    playerScore: 0,
    dealerCards: [],
    playerCards: [],
    otherPlayers: [
        { name: 'Player 2', cards: [], status: 'waiting' },
        { name: 'Player 3', cards: [], status: 'waiting' }
    ]
};

// DOM Elements
const hitBtn = document.getElementById('hit-btn');
const standBtn = document.getElementById('stand-btn');
const currentRoundEl = document.getElementById('current-round');
const playerScoreEl = document.getElementById('player-score');

// Card Rendering Functions
function createCardElement(value, faceUp = true) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card dealing';

    const svgEl = document.createElement('img');
    if (faceUp) {
        svgEl.src = `../assets/svg/game1/cards/${value}f.svg`;
        svgEl.alt = `Card ${value}`;
    } else {
        svgEl.src = `../assets/svg/game1/cards/1b.svg`;
        svgEl.alt = `Card back`;
    }

    cardEl.appendChild(svgEl);
    return cardEl;
}

function addCardToPlayer(playerType, value, faceUp = true) {
    let cardsContainer;
    let totalContainer;

    // Determine which container to use
    switch(playerType) {
        case 'dealer':
            cardsContainer = document.querySelector('.dealer-cards');
            totalContainer = document.querySelector('.dealer-total');
            gameState.dealerCards.push(value);
            break;
        case 'player':
            cardsContainer = document.querySelector('.main-player-cards');
            totalContainer = document.querySelector('.main-player-total');
            gameState.playerCards.push(value);
            break;
        case 'player2':
            cardsContainer = document.querySelector('.player-2 .player-cards');
            totalContainer = document.querySelector('.player-2 .player-status');
            gameState.otherPlayers[0].cards.push(value);
            break;
        case 'player3':
            cardsContainer = document.querySelector('.player-3 .player-cards');
            totalContainer = document.querySelector('.player-3 .player-status');
            gameState.otherPlayers[1].cards.push(value);
            break;
    }

    // Clear empty state styling
    cardsContainer.classList.remove('cards-empty');

    // Create and add card
    const cardEl = createCardElement(value, faceUp);
    cardsContainer.appendChild(cardEl);

    // Update total if face up
    if (faceUp) {
        updatePlayerTotal(playerType);
    }
}

function updatePlayerTotal(playerType) {
    let cards, totalContainer;

    switch(playerType) {
        case 'dealer':
            cards = gameState.dealerCards;
            totalContainer = document.querySelector('.dealer-total');
            break;
        case 'player':
            cards = gameState.playerCards;
            totalContainer = document.querySelector('.main-player-total');
            break;
        case 'player2':
            cards = gameState.otherPlayers[0].cards;
            totalContainer = document.querySelector('.player-2 .player-status');
            break;
        case 'player3':
            cards = gameState.otherPlayers[1].cards;
            totalContainer = document.querySelector('.player-3 .player-status');
            break;
    }

    const total = calculateHandTotal(cards);
    totalContainer.innerHTML = `<span class="card-total">${total}</span>`;
}

function clearAllHands() {
    // Clear game state
    gameState.dealerCards = [];
    gameState.playerCards = [];
    gameState.otherPlayers.forEach(player => player.cards = []);

    // Clear DOM
    document.querySelectorAll('.dealer-cards, .main-player-cards, .player-cards').forEach(container => {
        container.innerHTML = '';
        container.classList.add('cards-empty');
    });

    // Clear totals
    document.querySelectorAll('.dealer-total, .main-player-total, .player-status').forEach(container => {
        container.innerHTML = '';
    });
}

// Initialize Game
function initGame() {
    console.log('Gyutto Blackjack Demo - Initializing...');
    updateUI();
    addEventListeners();

    // Demo: Deal initial cards
    setTimeout(() => {
        dealInitialCards();
    }, 500);
}

function dealInitialCards() {
    console.log('Dealing initial cards...');

    // Clear any existing cards
    clearAllHands();

    // Deal 2 cards to each player
    setTimeout(() => addCardToPlayer('player', getRandomCard()), 100);
    setTimeout(() => addCardToPlayer('player2', getRandomCard()), 200);
    setTimeout(() => addCardToPlayer('player3', getRandomCard()), 300);
    setTimeout(() => addCardToPlayer('dealer', getRandomCard()), 400);

    setTimeout(() => addCardToPlayer('player', getRandomCard()), 600);
    setTimeout(() => addCardToPlayer('player2', getRandomCard()), 700);
    setTimeout(() => addCardToPlayer('player3', getRandomCard()), 800);
    setTimeout(() => addCardToPlayer('dealer', getRandomCard(), false), 900); // Face down
}

// Add Event Listeners
function addEventListeners() {
    hitBtn.addEventListener('click', handleHit);
    standBtn.addEventListener('click', handleStand);
}

// Button Handlers
function handleHit() {
    console.log('Hit button clicked');
    const newCard = getRandomCard();
    addCardToPlayer('player', newCard);

    // Check for bust
    const total = calculateHandTotal(gameState.playerCards);
    if (total > 15) {
        console.log('Player busts!');
        // TODO: Handle bust logic
    }
}

function handleStand() {
    console.log('Stand button clicked');
    // TODO: End player turn, start dealer turn
}

// Update UI Elements
function updateUI() {
    currentRoundEl.textContent = `Round ${gameState.currentRound}`;
    playerScoreEl.textContent = gameState.playerScore;
}

// Generate Random Card Value (1-6)
function getRandomCard() {
    return Math.floor(Math.random() * 6) + 1;
}

// Calculate Hand Total
function calculateHandTotal(cards) {
    return cards.reduce((total, card) => total + card, 0);
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', initGame);