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

// Initialize Game
function initGame() {
    console.log('Gyutto Blackjack Demo - Initializing...');
    updateUI();
    addEventListeners();
}

// Add Event Listeners
function addEventListeners() {
    hitBtn.addEventListener('click', handleHit);
    standBtn.addEventListener('click', handleStand);
}

// Button Handlers (placeholders for now)
function handleHit() {
    console.log('Hit button clicked');
    // TODO: Add card to player hand
}

function handleStand() {
    console.log('Stand button clicked');
    // TODO: End player turn
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
document.addEventListener('DOMContentLoaded', initGame);// Game State
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

// Initialize Game
function initGame() {
    console.log('Gyutto Blackjack Demo - Initializing...');
    updateUI();
    addEventListeners();
}

// Add Event Listeners
function addEventListeners() {
    hitBtn.addEventListener('click', handleHit);
    standBtn.addEventListener('click', handleStand);
}

// Button Handlers (placeholders for now)
function handleHit() {
    console.log('Hit button clicked');
    // TODO: Add card to player hand
}

function handleStand() {
    console.log('Stand button clicked');
    // TODO: End player turn
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