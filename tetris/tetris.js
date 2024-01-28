const boardWidth = 10;
const boardHeight = 20;
const board = [];
const tetrisBoard = document.getElementById('tetris-board');

// Initialize the board
for (let y = 0; y < boardHeight; y++) {
    let row = [];
    for (let x = 0; x < boardWidth; x++) {
        const cell = document.createElement('div');
        cell.className = 'tetris-cell';
        tetrisBoard.appendChild(cell);
        row.push(cell);
    }
    board.push(row);
}

// Tetromino shapes
const tetrominoes = {
    'I': [[1, 1, 1, 1]],
    'O': [[1, 1], [1, 1]],
    'T': [[0, 1, 0], [1, 1, 1]],
    'S': [[0, 1, 1], [1, 1, 0]],
    'Z': [[1, 1, 0], [0, 1, 1]],
    'J': [[1, 0, 0], [1, 1, 1]],
    'L': [[0, 0, 1], [1, 1, 1]]
};

let currentTetromino = null;
let currentPosition = { x: 0, y: 0 };

// Function to draw a tetromino on the board
function drawTetromino() {
    if (!currentTetromino) return;
    currentTetromino.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                board[currentPosition.y + dy][currentPosition.x + dx].classList.add('tetromino');
            }
        });
    });
}

// Function to clear the tetromino from the board
function clearTetromino() {
    if (!currentTetromino) return;
    currentTetromino.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                board[currentPosition.y + dy][currentPosition.x + dx].classList.remove('tetromino');
            }
        });
    });
}

// Function to spawn a new tetromino
function spawnTetromino() {
    const keys = Object.keys(tetrominoes);
    const randomTetrominoKey = keys[Math.floor(Math.random() * keys.length)];
    currentTetromino = {
        shape: tetrominoes[randomTetrominoKey],
        color: 'tetromino'
    };
    currentPosition = { x: Math.floor(boardWidth / 2) - 1, y: 0 };
    drawTetromino();
}

spawnTetromino();

// Listen for keyboard events
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        clearTetromino();
        currentPosition.x--;
        drawTetromino();
    } else if (e.key === 'ArrowRight') {
        clearTetromino();
        currentPosition.x++;
        drawTetromino();
    } else if (e.key === 'ArrowDown') {
        clearTetromino();
        currentPosition.y++;
        drawTetromino();
    }
});
