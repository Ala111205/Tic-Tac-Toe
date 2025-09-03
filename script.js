const board = document.getElementById("board");
const statusText = document.getElementById("status");
const cells = document.querySelectorAll(".cell");
const resetBtn = document.getElementById("resetBtn");

const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreTie = document.getElementById("scoreTie");

const scores = {X:0, O:0, Tie:0};
let lastWinner

let gameActive = true;
let currentPlayer = "X"
let gameState = ["","","","","","","","",""]
const winningConditions = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

function handleCellClick(e){
    const cell = e.target;
    const index = cell.getAttribute("data-index");

    if(!gameActive || gameState[index] !== "") return;

    gameState[index] = currentPlayer;
    cell.textContent = currentPlayer;

    checkResult();
};

function checkResult(){
    let roundWon = false;
    let winningCombo = [];

    for(let condition of winningConditions){
        const [a,b,c] = condition;
        if(gameState[a] && gameState[b] === gameState[a] && gameState[a] === gameState[c]){
            roundWon = true;
            winningCombo = [a,b,c];
            break;
        }
    }

    if(roundWon){
        statusText.textContent = `Player ${currentPlayer} Win! 🎉`;
        highlightWinner(winningCombo);
        updateScore(currentPlayer);

        lastWinner = currentPlayer;
        board.classList.add("disabled")
        gameActive = false;
        return;
    }

    if(!gameState.includes("")){
        statusText.textContent = `It's a Tie 🤝`;
        updateScore("Tie");

        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === "X"? "O": "X";
    statusText.textContent = `Player ${currentPlayer}'s Turn`;
};

function highlightWinner(combo){
    combo.forEach(index=>{
        cells[index].classList.add("winner")
    });
};

function updateScore(winner){
    if(winner === "X"){
        scores.X++;
        scoreX.textContent = `PlayerX: ${scores.X}`;
    }
    else if(winner === "O"){
        scores.O++;
        scoreO.textContent = `PlayerO: ${scores.O}`;
    }
    else{
        scores.Tie++;
        scoreTie.textContent = `Tie: ${scores.Tie}`;
    }
};

function reset(){
    gameState = ["","","","","","","","",""];

    board.classList.remove("disabled");
    cells.forEach(cell=>{
        cell.innerHTML="";
        cell.classList.remove("winner");
    });

   
    if(!gameActive){
        currentPlayer = lastWinner;
        statusText.textContent = `Start with Winner${lastWinner}`;
    }
    else if(gameActive && scoreTie){
        statusText.textContent = `Start with Player${currentPlayer}`;
        if(lastWinner){
            currentPlayer = lastWinner;
            statusText.textContent = `Winner ${currentPlayer}'s Turn`;
        }
    }

    gameActive = true;
};

cells.forEach(cell=>cell.addEventListener("click",handleCellClick));
resetBtn.addEventListener("click",reset);