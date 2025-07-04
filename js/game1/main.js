// Game State (now managed by backend)
let gameState = {
    currentRound: 1,
    totalRounds: 3,
    playerScore: 0,
    dealerCards: [],
    playerCards: [],
    otherPlayers: [
        { name: 'Player 2', cards: [], status: 'waiting' },
        { name: 'Player 3', cards: [], status: 'waiting' }
    ],
    currentPhase: 'waiting',
    isMyTurn: false
};

// Backend instance
let backend;

// DOM Elements
const hitBtn = document.getElementById('hit-btn');
const standBtn = document.getElementById('stand-btn');
const currentRoundEl = document.getElementById('current-round');
const playerScoreEl = document.getElementById('player-score');

// Overlay Management System
const overlaySystem = {
    activeOverlays: new Set(),

    // Create overlay element
    createOverlay(type, svgPath, isFullscreen = false) {
        const overlay = document.createElement('div');
        overlay.className = `overlay-container ${isFullscreen ? 'overlay-fullscreen' : 'overlay-section'}`;

        const img = document.createElement('img');
        img.src = svgPath;
        img.alt = type;

        overlay.appendChild(img);
        return overlay;
    },

    // Show overlay with animation
    showOverlay(type, target = 'fullscreen', duration = 2500, svgName = null) {
        const svgPath = `../assets/svg/game1/${svgName || type}.svg`;
        const isFullscreen = target === 'fullscreen';
        const overlay = this.createOverlay(type, svgPath, isFullscreen);

        // Position overlay based on target
        if (isFullscreen) {
            document.body.appendChild(overlay);
        } else {
            const targetElement = this.getTargetElement(target);
            if (!targetElement) return null;

            targetElement.style.position = 'relative';
            overlay.classList.add(`overlay-${target}`);
            targetElement.appendChild(overlay);
        }

        // Track active overlay
        this.activeOverlays.add(overlay);

        // Trigger show animation
        requestAnimationFrame(() => {
            overlay.classList.add('show');
            if (duration > 3000) {
                overlay.classList.add('pulse');
            }
        });

        // Auto-hide after duration
        setTimeout(() => {
            this.hideOverlay(overlay);
        }, duration);

        return overlay;
    },

    // Hide overlay with animation
    hideOverlay(overlay) {
        if (!overlay || !this.activeOverlays.has(overlay)) return;

        overlay.classList.remove('show', 'pulse');
        overlay.classList.add('hide');

        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            this.activeOverlays.delete(overlay);
        }, 300);
    },

    // Get target element for section overlays
    getTargetElement(target) {
        switch(target) {
            case 'main-player':
                return document.querySelector('.main-player-section');
            case 'player-2':
                return document.querySelector('.player-2');
            case 'player-3':
                return document.querySelector('.player-3');
            case 'dealer':
                return document.querySelector('.dealer-section');
            default:
                return null;
        }
    },

    // Clear all overlays
    clearAll() {
        this.activeOverlays.forEach(overlay => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        });
        this.activeOverlays.clear();
    }
};

// Card Rendering Functions
function createCardElement(value, faceUp = true) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card dealing';

    const svgEl = document.createElement('img');
    if (faceUp && value) {
        svgEl.src = `../assets/svg/game1/cards/${value}f.svg`;
        svgEl.alt = `Card ${value}`;
    } else {
        svgEl.src = `../assets/svg/game1/cards/1b.svg`;
        svgEl.alt = `Card back`;
    }

    cardEl.appendChild(svgEl);
    return cardEl;
}

function getCardContainer(playerType) {
    switch(playerType) {
        case 'dealer':
            return document.querySelector('.dealer-cards');
        case 1:
        case 'player':
            return document.querySelector('.main-player-cards');
        case 2:
        case 'player2':
            return document.querySelector('.player-2 .player-cards');
        case 3:
        case 'player3':
            return document.querySelector('.player-3 .player-cards');
        default:
            return null;
    }
}

function getTotalContainer(playerType) {
    switch(playerType) {
        case 'dealer':
            return document.querySelector('.dealer-total');
        case 1:
        case 'player':
            return document.querySelector('.main-player-total');
        case 2:
        case 'player2':
            return document.querySelector('.player-2 .player-status');
        case 3:
        case 'player3':
            return document.querySelector('.player-3 .player-status');
        default:
            return null;
    }
}

function addCardToUI(playerType, value, faceUp = true) {
    const cardsContainer = getCardContainer(playerType);
    if (!cardsContainer) return;

    // Clear empty state styling
    cardsContainer.classList.remove('cards-empty');

    // Create and add card
    const cardEl = createCardElement(value, faceUp);
    cardsContainer.appendChild(cardEl);
}

function updatePlayerTotalUI(playerType, total) {
    const totalContainer = getTotalContainer(playerType);
    if (!totalContainer) return;

    totalContainer.innerHTML = `<span class="card-total">${total}</span>`;
}

function clearAllHands() {
    // Clear DOM
    document.querySelectorAll('.dealer-cards, .main-player-cards, .player-cards').forEach(container => {
        container.innerHTML = '';
        container.classList.add('cards-empty');
    });

    // Clear totals
    document.querySelectorAll('.dealer-total, .main-player-total, .player-status').forEach(container => {
        container.innerHTML = '';
    });

    // Clear any overlays
    overlaySystem.clearAll();
}

function updateButtonStates() {
    const canAct = gameState.isMyTurn && gameState.currentPhase === 'player-turns';
    hitBtn.disabled = !canAct;
    standBtn.disabled = !canAct;

    // Visual feedback
    if (canAct) {
        hitBtn.style.opacity = '1';
        standBtn.style.opacity = '1';
    } else {
        hitBtn.style.opacity = '0.5';
        standBtn.style.opacity = '0.5';
    }
}

function showMessage(message, duration = 3000) {
    // Simple message display - could be enhanced with better UI
    console.log(`📢 ${message}`);

    // Update dealer section temporarily with message
    const dealerSection = document.querySelector('.dealer-section h3');
    const originalText = dealerSection.textContent;
    dealerSection.textContent = message;

    setTimeout(() => {
        dealerSection.textContent = originalText;
    }, duration);
}

// Backend Event Handlers
function setupBackendEvents() {
    backend.on('gamePhase', (data) => {
        console.log('Phase change:', data);
        gameState.currentPhase = data.phase;
        gameState.isMyTurn = data.activePlayer === 1;

        updateButtonStates();

        if (data.message) {
            showMessage(data.message);
        }
    });

    backend.on('cardDealt', (data) => {
        console.log('Card dealt:', data);
        addCardToUI(data.player, data.card, data.faceUp);

        // Update totals if card is face up
        if (data.faceUp && data.card) {
            const player = backend.gameState.players[data.player];
            if (player) {
                updatePlayerTotalUI(data.player, player.total);
            }
        }
    });

    backend.on('playerAction', (data) => {
        console.log('Player action:', data);
        const playerName = data.player === 1 ? 'You' : `Player ${data.player}`;

        if (data.action === 'bust') {
            showMessage(`${playerName} busted with ${data.total}!`, 2000);

            // Show bust overlay
            const target = data.player === 1 ? 'main-player' : `player-${data.player}`;
            overlaySystem.showOverlay('bust', target, 2000);

        } else if (data.action === 'stand') {
            showMessage(`${playerName} stands with ${data.total}`, 1500);
        }

        updatePlayerTotalUI(data.player, data.total);
    });

    backend.on('playerTotal', (data) => {
        console.log('Player total update:', data);
        updatePlayerTotalUI(data.player, data.total);
    });

    backend.on('dealerReveal', (data) => {
        console.log('Dealer reveals:', data);
        showMessage(`Dealer reveals ${data.holeCard}`, 2000);

        // Add the hole card to UI
        addCardToUI('dealer', data.holeCard, true);
        updatePlayerTotalUI('dealer', data.total);
    });

    backend.on('roundEnd', (data) => {
        console.log('Round end:', data);
        gameState.currentRound = data.round;

        // Update player score if they won
        if (data.results[1] === 'win') {
            gameState.playerScore++;
        }

        // Show round results
        let message = `Round ${data.round} complete! `;
        let overlayDelay = 1500; // Delay before showing overlay

        switch (data.results[1]) {
            case 'win':
                message += 'You win! 🎉';
                // Show round win overlay after message
                setTimeout(() => {
                    overlaySystem.showOverlay('win_round', 'fullscreen', 3000);
                }, overlayDelay);
                break;
            case 'lose':
                message += 'You lose 😔';
                break;
            case 'tie':
                message += 'Tie game!';
                break;
            case 'bust':
                message += 'You busted!';
                break;
        }

        // Check for other player wins and show overlays
        for (let playerId of [2, 3]) {
            if (data.results[playerId] === 'win') {
                setTimeout(() => {
                    overlaySystem.showOverlay('winner', `player-${playerId}`, 2500);
                }, overlayDelay + 500);
            }
        }

        showMessage(message, 4000);
        updateUI();
    });

    backend.on('gamePhase', (data) => {
        console.log('Phase change:', data);
        gameState.currentPhase = data.phase;
        gameState.isMyTurn = data.activePlayer === 1;

        // Clear cards when starting a new round
        if (data.phase === 'next-round') {
            clearAllHands();
            gameState.currentRound = data.round;
            updateUI();
        }

        updateButtonStates();

        if (data.message) {
            showMessage(data.message);
        }
    });

    backend.on('gameEnd', (data) => {
        console.log('Game end:', data);
        let message = 'Game Over! ';
        let overlayDelay = 2000;

        if (data.winner === 1) {
            message += 'You are the champion! 🏆';
            // Show game win overlay
            setTimeout(() => {
                overlaySystem.showOverlay('win_game', 'fullscreen', 4000);
            }, overlayDelay);
        } else if (data.winner === 'tie') {
            message += 'It\'s a tie!';
        } else {
            message += `Player ${data.winner} wins!`;
            // Show winner overlay for the winning player
            if (data.winner !== 'tie') {
                setTimeout(() => {
                    overlaySystem.showOverlay('winner', `player-${data.winner}`, 3000);
                }, overlayDelay);
            }
        }

        showMessage(message, 5000);

        // Enable restart after delay (accounting for overlays)
        const restartDelay = data.winner === 1 ? 6500 : 5500;
        setTimeout(() => {
            showMessage('Tap HIT to start new game', 0);
            hitBtn.disabled = false;
            hitBtn.style.opacity = '1';
            hitBtn.textContent = 'NEW GAME';
        }, restartDelay);
    });
}

// Initialize Game
function initGame() {
    console.log('🎮 Gyutto Blackjack Demo - Initializing...');

    // Create backend instance
    backend = new FakeBackend();
    setupBackendEvents();

    updateUI();
    addEventListeners();

    // Auto-start first game after brief delay
    setTimeout(() => {
        startNewGame();
    }, 1000);
}

function startNewGame() {
    console.log('Starting new game...');
    clearAllHands();
    gameState.currentRound = 1;
    gameState.playerScore = 0;
    updateUI();
    backend.startGame();
}

// Add Event Listeners
function addEventListeners() {
    hitBtn.addEventListener('click', handleHit);
    standBtn.addEventListener('click', handleStand);
}

// Button Handlers
async function handleHit() {
    if (hitBtn.textContent === 'NEW GAME') {
        startNewGame();
        hitBtn.textContent = 'HIT';
        return;
    }

    if (!gameState.isMyTurn || gameState.currentPhase !== 'player-turns') {
        console.log('Not your turn!');
        return;
    }

    console.log('Player hits');
    await backend.processPlayerAction(1, 'hit');
}

async function handleStand() {
    if (!gameState.isMyTurn || gameState.currentPhase !== 'player-turns') {
        console.log('Not your turn!');
        return;
    }

    console.log('Player stands');
    await backend.processPlayerAction(1, 'stand');
}

// Update UI Elements
function updateUI() {
    currentRoundEl.textContent = `Round ${gameState.currentRound}`;
    playerScoreEl.textContent = gameState.playerScore;
    updateButtonStates();
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', initGame);