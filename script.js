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

    reset(start = "X") {
        this.board = Array(9).fill("");
        this.currentPlayer = start;
        this.active = true;
    }

    move(i) {
        if (!this.active || this.board[i]) return false;
        this.board[i] = this.currentPlayer;
        return true;
    }

    winner() {
        for (const [a,b,c] of this.wins) {
            if (this.board[a] &&
                this.board[a] === this.board[b] &&
                this.board[a] === this.board[c]) {
                return { player: this.board[a], combo: [a,b,c] };
            }
        }
        if (!this.board.includes("")) return { player: "Tie" };
        return null;
    }

    switch() {
        this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    }
}

/***********************
 * AI (MINIMAX)
 ***********************/
class AIPlayer {
    constructor(ai = "O", human = "X") {
        this.ai = ai;
        this.human = human;
    }

    bestMove(board) {
        let best = -Infinity, move = null;
        board.forEach((c, i) => {
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

    minimax(board, max) {
        const res = this.eval(board);
        if (res !== null) return res;

        let best = max ? -Infinity : Infinity;
        const player = max ? this.ai : this.human;

        board.forEach((c, i) => {
            if (!c) {
                board[i] = player;
                best = max
                    ? Math.max(best, this.minimax(board, !max))
                    : Math.min(best, this.minimax(board, !max));
                board[i] = "";
            }
        });
        return best;
    }

    eval(board) {
        const w = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        for (const [a,b,c] of w) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                if (board[a] === this.ai) return 10;
                if (board[a] === this.human) return -10;
            }
        }
        return board.includes("") ? null : 0;
    }
}

/***********************
 * UI
 ***********************/
class UI {
    constructor(onCell) {
        this.cells = document.querySelectorAll(".cell");
        this.status = document.getElementById("status");
        this.modeBtn = document.getElementById("modeBtn");

        // score elements
        this.scoreX = document.getElementById("scoreX");
        this.scoreO = document.getElementById("scoreO");
        this.scoreTie = document.getElementById("scoreTie");

        this.cells.forEach((c, i) =>
            c.onclick = () => onCell(i)
        );
    }

    draw(board) {
        board.forEach((v, i) => this.cells[i].textContent = v);
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
        this.modeBtn.textContent = ai
            ? "Mode: Single Player 🤖"
            : "Mode: Two Player 👥";
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
        const saved = loadState();

        this.engine = new GameEngine();
        this.ai = new AIPlayer();
        this.ui = new UI(this.play.bind(this));

        this.aiMode = saved?.aiMode ?? true;
        this.scores = saved?.scores ?? { X: 0, O: 0, Tie: 0 };
        this.lastWinner = saved?.lastWinner ?? null;
        this.gameResult = saved?.gameResult ?? null;
        this.statusText = saved?.statusText ?? "";

        // RESTORE ENGINE STATE
        if (saved) {
            this.engine.board = saved.board;
            this.engine.currentPlayer = saved.currentPlayer;
            this.engine.active = saved.gameActive;
        }

        // BUTTONS
        this.ui.modeBtn.onclick = this.toggleMode.bind(this);
        document.getElementById("resetBtn").onclick = () => this.reset();

        // DRAW EVERYTHING
        this.ui.setMode(this.aiMode);
        this.ui.draw(this.engine.board);
        this.ui.updateScores(this.scores);

        // SHOW STATUS
        if (!this.engine.active && this.statusText) {
            this.ui.text(this.statusText);   // win/tie message restored
        } else {
            this.update();
        }
    }

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

    syncUI() {
        this.ui.draw(this.engine.board);
        this.ui.text(
            this.engine.active
                ? `Player ${this.engine.currentPlayer}'s Turn`
                : "Game Over"
        );

        document.getElementById("scoreX").textContent = `PlayerX: ${this.scores.X}`;
        document.getElementById("scoreO").textContent = `PlayerO: ${this.scores.O}`;
        document.getElementById("scoreTie").textContent = `Tie: ${this.scores.Tie}`;
    }

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

        this.engine.switch();
        this.update();
        this.persist();

        if (this.aiMode && this.engine.currentPlayer === "O") {
            setTimeout(() => {
                const move = this.ai.bestMove([...this.engine.board]);
                this.play(move);
            }, 300);
        }
    }

    toggleMode() {
        this.aiMode = !this.aiMode;
        this.ui.setMode(this.aiMode); 

        const modeName = this.aiMode ? "Single Player 🤖" : "Two Player 👥";
        this.ui.text(`Mode switched: ${modeName}. Player X starts`);

        this.resetScores();
        this.engine.reset("X");
        this.ui.clear();

        // Auto AI move if AI starts
        if (this.aiMode && this.engine.currentPlayer === "O") {
            setTimeout(() => {
                const move = this.ai.bestMove([...this.engine.board]);
                this.play(move);
            }, 300);
        }

        this.persist();
    }

    update() {
        this.ui.text(`Player ${this.engine.currentPlayer}'s Turn`);
    }

    resetScores() {
        this.scores = { X: 0, O: 0, Tie: 0 };
        this.lastWinner = null;
        this.ui.updateScores(this.scores);

        this.persist();
    }

    reset() {
        const startPlayer = this.lastWinner || "X";
        this.engine.reset(startPlayer);
        this.ui.clear();

        this.statusText = ""; // reset status text

        if (this.lastWinner) {
            this.ui.text(`Winner ${startPlayer} starts`);
        } else {
            this.ui.text(`Player ${startPlayer}'s Turn`);
        }

        this.persist();

        // Auto AI move if AI starts
        if (this.aiMode && this.engine.currentPlayer === "O") {
            setTimeout(() => {
                const move = this.ai.bestMove([...this.engine.board]);
                this.play(move);
            }, 300);
        }
    }

}

/***********************
 * START
 ***********************/
new Controller();