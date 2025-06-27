// Fake Backend Simulation for Gyutto Blackjack
// Simulates multiplayer game server with realistic delays

class FakeBackend {
    constructor() {
        this.gameState = {
            phase: 'waiting', // waiting, dealing, player-turns, dealer-turn, scoring, game-over
            currentRound: 1,
            totalRounds: 3,
            activePlayer: 1, // whose turn it is (1=main player, 2=player2, 3=player3, 0=dealer)
            players: {
                1: { name: 'You', cards: [], status: 'waiting', total: 0, roundsWon: 0 },
                2: { name: 'Player 2', cards: [], status: 'waiting', total: 0, roundsWon: 0 },
                3: { name: 'Player 3', cards: [], status: 'waiting', total: 0, roundsWon: 0 },
                dealer: { name: 'Dealer', cards: [], status: 'waiting', total: 0, holeCard: null }
            }
        };

        this.eventCallbacks = {};
        this.aiPersonalities = {
            2: { name: 'Conservative', standAt: 12, thinkTime: [1000, 2000] },
            3: { name: 'Aggressive', standAt: 14, thinkTime: [800, 1800] }
        };
    }

    // Event system for communicating with frontend
    on(event, callback) {
        if (!this.eventCallbacks[event]) {
            this.eventCallbacks[event] = [];
        }
        this.eventCallbacks[event].push(callback);
    }

    emit(event, data) {
        if (this.eventCallbacks[event]) {
            this.eventCallbacks[event].forEach(callback => callback(data));
        }
    }

    // Simulate network delay
    async delay(min = 200, max = 500) {
        const ms = Math.random() * (max - min) + min;
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Generate random card (1-6)
    drawCard() {
        return Math.floor(Math.random() * 6) + 1;
    }

    // Calculate hand total
    calculateTotal(cards) {
        return cards.reduce((sum, card) => sum + card, 0);
    }

    // Start a new game
    async startGame() {
        console.log('🎮 Starting new game...');
        this.gameState.phase = 'dealing';
        this.gameState.currentRound = 1;

        // Reset all players
        Object.values(this.gameState.players).forEach(player => {
            player.cards = [];
            player.status = 'waiting';
            player.total = 0;
            if (player.name === 'Dealer') {
                player.holeCard = null;
            }
        });

        await this.dealInitialCards();
    }

    // Deal initial 2 cards to everyone
    async dealInitialCards() {
        this.emit('gamePhase', { phase: 'dealing', message: 'Dealing cards...' });

        // Deal first card to each player
        for (let player of [1, 2, 3, 'dealer']) {
            await this.delay(300, 500);
            const card = this.drawCard();
            this.gameState.players[player].cards.push(card);

            this.emit('cardDealt', {
                player: player,
                card: card,
                faceUp: true,
                position: this.gameState.players[player].cards.length - 1
            });
        }

        // Deal second card to each player
        for (let player of [1, 2, 3, 'dealer']) {
            await this.delay(300, 500);
            const card = this.drawCard();

            if (player === 'dealer') {
                // Dealer's second card is face down (hole card)
                this.gameState.players.dealer.holeCard = card;
                this.emit('cardDealt', {
                    player: 'dealer',
                    card: null, // Don't reveal the value
                    faceUp: false,
                    position: 1
                });
            } else {
                this.gameState.players[player].cards.push(card);
                this.emit('cardDealt', {
                    player: player,
                    card: card,
                    faceUp: true,
                    position: this.gameState.players[player].cards.length - 1
                });
            }
        }

        // Update totals for visible cards
        this.updateAllTotals();

        // Start player turns
        await this.delay(500);
        this.startPlayerTurns();
    }

    // Start the player turn phase
    startPlayerTurns() {
        this.gameState.phase = 'player-turns';
        this.gameState.activePlayer = 1;

        this.emit('gamePhase', {
            phase: 'player-turns',
            activePlayer: 1,
            message: 'Your turn!'
        });
    }

    // Process a player action (hit or stand)
    async processPlayerAction(playerId, action) {
        if (this.gameState.activePlayer !== playerId || this.gameState.phase !== 'player-turns') {
            console.log('❌ Invalid action: not player\'s turn');
            return false;
        }

        const player = this.gameState.players[playerId];

        if (action === 'hit') {
            await this.delay(200, 400);
            const card = this.drawCard();
            player.cards.push(card);
            player.total = this.calculateTotal(player.cards);

            this.emit('cardDealt', {
                player: playerId,
                card: card,
                faceUp: true,
                position: player.cards.length - 1
            });

            // Check for bust
            if (player.total > 15) {
                player.status = 'bust';
                this.emit('playerAction', {
                    player: playerId,
                    action: 'bust',
                    total: player.total
                });
                this.nextPlayer();
                return true;
            }

            this.emit('playerAction', {
                player: playerId,
                action: 'hit',
                total: player.total
            });

        } else if (action === 'stand') {
            player.status = 'stand';
            player.total = this.calculateTotal(player.cards);

            this.emit('playerAction', {
                player: playerId,
                action: 'stand',
                total: player.total
            });

            this.nextPlayer();
        }

        return true;
    }

    // Move to next player or start dealer turn
    async nextPlayer() {
        await this.delay(500);

        if (this.gameState.activePlayer < 3) {
            this.gameState.activePlayer++;
            this.emit('gamePhase', {
                phase: 'player-turns',
                activePlayer: this.gameState.activePlayer,
                message: `Player ${this.gameState.activePlayer}'s turn`
            });

            // Simulate AI player action
            this.simulateAIPlayer(this.gameState.activePlayer);
        } else {
            // All players done, start dealer turn
            this.startDealerTurn();
        }
    }

    // Simulate AI player behavior
    async simulateAIPlayer(playerId) {
        const player = this.gameState.players[playerId];
        const personality = this.aiPersonalities[playerId];

        // AI thinking delay
        const thinkTime = Math.random() * (personality.thinkTime[1] - personality.thinkTime[0]) + personality.thinkTime[0];
        await this.delay(thinkTime, thinkTime + 200);

        let currentTotal = this.calculateTotal(player.cards);

        // AI decision logic
        while (currentTotal < personality.standAt && currentTotal <= 15) {
            // AI decides to hit
            await this.processPlayerAction(playerId, 'hit');

            if (player.status === 'bust') return;

            currentTotal = this.calculateTotal(player.cards);

            // Brief pause between hits
            if (currentTotal < personality.standAt) {
                await this.delay(800, 1200);
            }
        }

        // AI stands if not busted
        if (player.status !== 'bust') {
            await this.delay(400, 800);
            await this.processPlayerAction(playerId, 'stand');
        }
    }

    // Start dealer's turn
    async startDealerTurn() {
        this.gameState.phase = 'dealer-turn';
        this.gameState.activePlayer = 0;

        await this.delay(800);
        this.emit('gamePhase', {
            phase: 'dealer-turn',
            message: 'Dealer\'s turn...'
        });

        // Reveal hole card
        await this.delay(1000);
        const dealer = this.gameState.players.dealer;
        dealer.cards.push(dealer.holeCard);
        dealer.total = this.calculateTotal(dealer.cards);

        this.emit('dealerReveal', {
            holeCard: dealer.holeCard,
            total: dealer.total
        });

        // Dealer hits until 12 or higher
        while (dealer.total < 12 && dealer.total <= 15) {
            await this.delay(1200, 1800);
            const card = this.drawCard();
            dealer.cards.push(card);
            dealer.total = this.calculateTotal(dealer.cards);

            this.emit('cardDealt', {
                player: 'dealer',
                card: card,
                faceUp: true,
                position: dealer.cards.length - 1
            });

            if (dealer.total > 15) {
                dealer.status = 'bust';
                break;
            }
        }

        if (dealer.status !== 'bust') {
            dealer.status = 'stand';
        }

        await this.delay(1000);
        this.scoreRound();
    }

    // Determine round winner and update scores
    scoreRound() {
        this.gameState.phase = 'scoring';
        const dealer = this.gameState.players.dealer;
        const results = {};

        // Determine winners
        for (let playerId of [1, 2, 3]) {
            const player = this.gameState.players[playerId];
            let result = 'lose';

            if (player.status === 'bust') {
                result = 'bust';
            } else if (dealer.status === 'bust') {
                result = 'win';
            } else if (player.total > dealer.total) {
                result = 'win';
            } else if (player.total === dealer.total) {
                result = 'tie';
            }

            if (result === 'win') {
                player.roundsWon++;
            }

            results[playerId] = result;
        }

        this.emit('roundEnd', {
            round: this.gameState.currentRound,
            results: results,
            dealerTotal: dealer.total,
            dealerStatus: dealer.status
        });

        // Check if game is over
        setTimeout(() => {
            if (this.gameState.currentRound >= this.gameState.totalRounds) {
                this.endGame();
            } else {
                this.nextRound();
            }
        }, 3000);
    }

    // Start next round
    nextRound() {
        this.gameState.currentRound++;
        this.emit('gamePhase', {
            phase: 'next-round',
            round: this.gameState.currentRound,
            message: `Round ${this.gameState.currentRound} starting...`
        });

        setTimeout(() => {
            this.dealInitialCards();
        }, 2000);
    }

    // End the game
    endGame() {
        this.gameState.phase = 'game-over';

        const finalScores = {
            1: this.gameState.players[1].roundsWon,
            2: this.gameState.players[2].roundsWon,
            3: this.gameState.players[3].roundsWon
        };

        this.emit('gameEnd', {
            finalScores: finalScores,
            winner: this.determineGameWinner(finalScores)
        });
    }

    // Determine overall game winner
    determineGameWinner(scores) {
        let maxScore = Math.max(...Object.values(scores));
        let winners = Object.keys(scores).filter(player => scores[player] === maxScore);

        if (winners.length === 1) {
            return parseInt(winners[0]);
        } else {
            return 'tie';
        }
    }

    // Update all player totals
    updateAllTotals() {
        for (let playerId of [1, 2, 3]) {
            const player = this.gameState.players[playerId];
            player.total = this.calculateTotal(player.cards);
        }
        // Don't update dealer total yet (hole card hidden)
        const dealer = this.gameState.players.dealer;
        dealer.total = this.calculateTotal(dealer.cards); // Only visible cards
    }
}

// Export for use in main game
window.FakeBackend = FakeBackend;