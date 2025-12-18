/***********************
 * LOCAL STORAGE HELPERS
 ***********************/
const STORAGE_KEY = "tic_tac_toe_state";

function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
}

/***********************
 * GAME ENGINE
 ***********************/
class GameEngine {
    constructor() {
        this.wins = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        this.reset();
    }

    // Reset the board, set starting player
    reset(start = "X") {
        this.board = Array(9).fill("");
        this.currentPlayer = start;
        this.active = true;
    }

    // Make a move at index i
    move(i) {
        if (!this.active || this.board[i]) return false;
        this.board[i] = this.currentPlayer;
        return true;
    }

    // Check for winner or tie
    winner() {
        for (const [a,b,c] of this.wins) {
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return { player: this.board[a], combo: [a,b,c] };
            }
        }
        if (!this.board.includes("")) return { player: "Tie" };
        return null;
    }

    // Switch the current player
    switch() {
        this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    }
}

/***********************
 * AI PLAYER (MINIMAX)
 ***********************/
class AIPlayer {
    constructor(ai = "O", human = "X") {
        this.ai = ai;
        this.human = human;
    }

    bestMove(board) {
        let best = -Infinity, move = null;
        board.forEach((c,i) => {
            if (!c) {
                board[i] = this.ai;
                const score = this.minimax(board, false);
                board[i] = "";
                if (score > best) {
                    best = score;
                    move = i;
                }
            }
        });
        return move;
    }

    minimax(board, isMaximizing) {
        const result = this.eval(board);
        if (result !== null) return result;

        let best = isMaximizing ? -Infinity : Infinity;
        const player = isMaximizing ? this.ai : this.human;

        board.forEach((c,i) => {
            if (!c) {
                board[i] = player;
                best = isMaximizing
                    ? Math.max(best, this.minimax(board, !isMaximizing))
                    : Math.min(best, this.minimax(board, !isMaximizing));
                board[i] = "";
            }
        });

        return best;
    }

    // Evaluate board for minimax
    eval(board) {
        const wins = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        for (const [a,b,c] of wins) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                if (board[a] === this.ai) return 10;
                if (board[a] === this.human) return -10;
            }
        }
        return board.includes("") ? null : 0;
    }
}

/***********************
 * USER INTERFACE
 ***********************/
class UI {
    constructor(onCell) {
        this.cells = document.querySelectorAll(".cell");
        this.status = document.getElementById("status");
        this.modeBtn = document.getElementById("modeBtn");

        // Score elements
        this.scoreX = document.getElementById("scoreX");
        this.scoreO = document.getElementById("scoreO");
        this.scoreTie = document.getElementById("scoreTie");

        // Attach click events to cells
        this.cells.forEach((c,i) => c.onclick = () => onCell(i));
    }

    draw(board) {
        board.forEach((v,i) => this.cells[i].textContent = v);
    }

    text(t) {
        this.status.textContent = t;
    }

    highlight(combo) {
        combo.forEach(i => this.cells[i].classList.add("winner"));
    }

    clear() {
        this.cells.forEach(c => {
            c.textContent = "";
            c.classList.remove("winner");
        });
    }

    setMode(ai) {
        // Show current mode clearly
        this.modeBtn.textContent = ai ? "Mode: Single Player 🤖" : "Mode: Two Player 👥";
    }

    updateScores(scores) {
        this.scoreX.textContent = `Player X: ${scores.X}`;
        this.scoreO.textContent = `Player O: ${scores.O}`;
        this.scoreTie.textContent = `Tie: ${scores.Tie}`;
    }
}

/***********************
 * CONTROLLER
 ***********************/
class Controller {
    constructor() {
        // Load saved state from localStorage
        const saved = loadState();

        // Initialize engine, AI, UI
        this.engine = new GameEngine();
        this.ai = new AIPlayer();
        this.ui = new UI(this.play.bind(this));

        // Restore state or default
        this.aiMode = saved?.aiMode ?? true;
        this.scores = saved?.scores ?? { X:0, O:0, Tie:0 };
        this.lastWinner = saved?.lastWinner ?? null;
        this.gameResult = saved?.gameResult ?? null;
        this.statusText = saved?.statusText ?? "";

        if (saved) {
            this.engine.board = saved.board;
            this.engine.currentPlayer = saved.currentPlayer;
            this.engine.active = saved.gameActive;
        }

        // Buttons
        this.ui.modeBtn.onclick = this.toggleMode.bind(this);
        document.getElementById("resetBtn").onclick = () => this.reset();

        // Draw everything
        this.ui.setMode(this.aiMode);
        this.ui.draw(this.engine.board);
        this.ui.updateScores(this.scores);

        // Show status message correctly
        if (!this.engine.active && this.statusText) {
            this.ui.text(this.statusText);
        } else {
            this.update();
        }

        // Auto AI move if AI starts after reload
        if (this.aiMode && this.engine.active && this.engine.currentPlayer === "O") {
            setTimeout(() => {
                const move = this.ai.bestMove([...this.engine.board]);
                this.play(move);
            }, 300);
        }
    }

    // Save current state
    persist() {
        saveState({
            board: this.engine.board,
            currentPlayer: this.engine.currentPlayer,
            gameActive: this.engine.active,
            scores: this.scores,
            aiMode: this.aiMode,
            lastWinner: this.lastWinner,
            gameResult: this.gameResult,
            statusText: this.statusText
        });
    }

    // Update status text for current player
    update() {
        this.ui.text(`Player ${this.engine.currentPlayer}'s Turn`);
    }

    // Handle a move
    play(i) {
        if (!this.engine.move(i)) return;

        this.ui.draw(this.engine.board);

        const win = this.engine.winner();
        if (win) {
            this.engine.active = false;

            if (win.player === "Tie") {
                this.scores.Tie++;
                this.statusText = "It's a Tie 🤝";
            } else {
                this.scores[win.player]++;
                this.lastWinner = win.player;
                this.statusText = `Player ${win.player} Wins 🎉`;
                this.ui.highlight(win.combo);
            }

            this.ui.text(this.statusText);
            this.ui.updateScores(this.scores);
            this.gameResult = win.player;
            this.persist();
            return;
        }

        // Switch turn and persist
        this.engine.switch();
        this.update();
        this.persist();

        // If AI turn, play automatically
        if (this.aiMode && this.engine.currentPlayer === "O") {
            setTimeout(() => {
                const move = this.ai.bestMove([...this.engine.board]);
                this.play(move);
            }, 300);
        }
    }

    // Toggle between single and two-player mode
    toggleMode() {
        this.aiMode = !this.aiMode;
        this.ui.setMode(this.aiMode);

        // Full reset when switching mode
        this.resetScores();
        this.engine.reset("X");
        this.ui.clear();
        this.ui.text(`Mode switched: ${this.aiMode ? "Single Player 🤖" : "Two Player 👥"}. Player X starts`);

        // AI auto-start if needed
        if (this.aiMode && this.engine.currentPlayer === "O") {
            setTimeout(() => {
                const move = this.ai.bestMove([...this.engine.board]);
                this.play(move);
            }, 300);
        }

        this.persist();
    }

    // Reset only the board (keep scores)
    reset() {
        const startPlayer = this.lastWinner || "X";
        this.engine.reset(startPlayer);
        this.ui.clear();

        if (this.lastWinner) {
            this.ui.text(`Winner ${startPlayer} starts`);
        } else {
            this.ui.text(`Player ${startPlayer}'s Turn`);
        }

        this.statusText = "";
        this.persist();

        // AI auto-start if AI is first
        if (this.aiMode && this.engine.currentPlayer === "O") {
            setTimeout(() => {
                const move = this.ai.bestMove([...this.engine.board]);
                this.play(move);
            }, 300);
        }
    }

    // Reset scores as well
    resetScores() {
        this.scores = { X:0, O:0, Tie:0 };
        this.lastWinner = null;
        this.ui.updateScores(this.scores);
        this.persist();
    }
}

/***********************
 * START
 ***********************/
new Controller();