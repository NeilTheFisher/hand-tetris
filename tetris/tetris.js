// // const boardWidth = 10;
// // const boardHeight = 20;
// // const board = [];
// // const tetrisBoard = document.getElementById('tetris-board');

// // // Initialize the board
// // for (let y = 0; y < boardHeight; y++) {
// //     let row = [];
// //     for (let x = 0; x < boardWidth; x++) {
// //         const cell = document.createElement('div');
// //         cell.className = 'tetris-cell';
// //         tetrisBoard.appendChild(cell);
// //         row.push(cell);
// //     }
// //     board.push(row);
// // }

// // // Tetromino shapes
// // const tetrominoes = {
// //     'I': [[1, 1, 1, 1]],
// //     'O': [[1, 1], [1, 1]],
// //     'T': [[0, 1, 0], [1, 1, 1]],
// //     'S': [[0, 1, 1], [1, 1, 0]],
// //     'Z': [[1, 1, 0], [0, 1, 1]],
// //     'J': [[1, 0, 0], [1, 1, 1]],
// //     'L': [[0, 0, 1], [1, 1, 1]]
// // };

// // let currentTetromino = null;
// // let currentPosition = { x: 0, y: 0 };

// // // Function to draw a tetromino on the board
// // function drawTetromino() {
// //     if (!currentTetromino) return;
// //     currentTetromino.shape.forEach((row, dy) => {
// //         row.forEach((value, dx) => {
// //             if (value) {
// //                 board[currentPosition.y + dy][currentPosition.x + dx].classList.add('tetromino');
// //             }
// //         });
// //     });
// // }

// // // Function to clear the tetromino from the board
// // function clearTetromino() {
// //     if (!currentTetromino) return;
// //     currentTetromino.shape.forEach((row, dy) => {
// //         row.forEach((value, dx) => {
// //             if (value) {
// //                 board[currentPosition.y + dy][currentPosition.x + dx].classList.remove('tetromino');
// //             }
// //         });
// //     });
// // }

// // // Function to spawn a new tetromino
// // function spawnTetromino() {
// //     const keys = Object.keys(tetrominoes);
// //     const randomTetrominoKey = keys[Math.floor(Math.random() * keys.length)];
// //     currentTetromino = {
// //         shape: tetrominoes[randomTetrominoKey],
// //         color: 'tetromino'
// //     };
// //     currentPosition = { x: Math.floor(boardWidth / 2) - 1, y: 0 };
// //     drawTetromino();
// // }

// // spawnTetromino();

// // // Listen for keyboard events
// // document.addEventListener('keydown', (e) => {
// //     if (e.key === 'ArrowLeft') {
// //         clearTetromino();
// //         currentPosition.x--;
// //         drawTetromino();
// //     } else if (e.key === 'ArrowRight') {
// //         clearTetromino();
// //         currentPosition.x++;
// //         drawTetromino();
// //     } else if (e.key === 'ArrowDown') {
// //         clearTetromino();
// //         currentPosition.y++;
// //         drawTetromino();
// //     }
// // });
// const boardWidth = 10;
// const boardHeight = 20;
// const board = [];
// const tetrisBoard = document.getElementById('tetris-board');

// // Initialize the board with nulls representing empty cells
// for (let y = 0; y < boardHeight; y++) {
//     let row = [];
//     for (let x = 0; x < boardWidth; x++) {
//         const cell = document.createElement('div');
//         cell.className = 'tetris-cell';
//         tetrisBoard.appendChild(cell);
//         row.push(null);
//     }
//     board.push(row);
// }

// const tetrominoes = {
//     'I': { shape: [[1, 1, 1, 1]], color: 'cyan' },
//     'O': { shape: [[1, 1], [1, 1]], color: 'yellow' },
//     // Add other tetrominoes here
// };

// let currentTetromino = null;
// let currentPosition = { x: 0, y: 0 };
// let gameRunning = true;

// function drawBoard() {
//     for (let y = 0; y < boardHeight; y++) {
//         for (let x = 0; x < boardWidth; x++) {
//             let cell = tetrisBoard.children[y * boardWidth + x];
//             cell.style.backgroundColor = board[y][x] ? board[y][x] : 'transparent';
//         }
//     }
// }

// function drawTetromino() {
//     if (!currentTetromino) return;
//     currentTetromino.shape.forEach((row, dy) => {
//         row.forEach((value, dx) => {
//             if (value) {
//                 let x = currentPosition.x + dx;
//                 let y = currentPosition.y + dy;
//                 tetrisBoard.children[y * boardWidth + x].style.backgroundColor = currentTetromino.color;
//             }
//         });
//     });
// }

// function clearTetromino() {
//     if (!currentTetromino) return;
//     currentTetromino.shape.forEach((row, dy) => {
//         row.forEach((value, dx) => {
//             if (value) {
//                 let x = currentPosition.x + dx;
//                 let y = currentPosition.y + dy;
//                 tetrisBoard.children[y * boardWidth + x].style.backgroundColor = 'transparent';
//             }
//         });
//     });
// }

// function checkCollision(x, y, candidate = null) {
//     const shape = candidate || currentTetromino.shape;
//     for (let dy = 0; dy < shape.length; dy++) {
//         for (let dx = 0; dx < shape[dy].length; dx++) {
//             if (shape[dy][dx]) {
//                 let newX = x + dx;
//                 let newY = y + dy;
//                 if (newX < 0 || newX >= boardWidth || newY >= boardHeight) return true; // Wall and floor collision
//                 if (newY < 0) continue; // Ignore above board (spawning area)
//                 if (board[newY][newX]) return true; // Stack collision
//             }
//         }
//     }
//     return false;
// }

// function lockTetromino() {
//     currentTetromino.shape.forEach((row, dy) => {
//         row.forEach((value, dx) => {
//             if (value) {
//                 let x = currentPosition.x + dx;
//                 let y = currentPosition.y + dy;
//                 board[y][x] = currentTetromino.color;
//             }
//         });
//     });
//     clearLines();
//     spawnTetromino();
// }

// function clearLines() {
//     for (let y = boardHeight - 1; y >= 0; y--) {
//         if (board[y].every(cell => cell !== null)) {
//             board.splice(y, 1);
//             board.unshift(Array(boardWidth).fill(null));
//             drawBoard();
//             y++; // Check the new line at the same position
//         }
//     }
// }

// function spawnTetromino() {
//     const keys = Object.keys(tetrominoes);
//     const randomTetrominoKey = keys[Math.floor(Math.random() * keys.length)];
//     currentTetromino = JSON.parse(JSON.stringify(tetrominoes[randomTetrominoKey]));
//     currentPosition = { x: Math.floor(boardWidth / 2) - 1, y: 0 };

//     if (checkCollision(currentPosition.x, currentPosition.y)) {
//         // Game over
//         gameRunning = false;
//         alert('Game Over');
//         return;
//     }

//     drawTetromino();
// }

// function dropTetromino() {
//     if (!gameRunning) return;
//     clearTetromino();
//     currentPosition.y++;
//     if (checkCollision(currentPosition.x, currentPosition.y)) {
//         currentPosition.y--;
//         lockTetromino();
//     }
//     drawTetromino();
// }

// function control(event) {
//     if (!gameRunning) return;
//     clearTetromino();
//     if (event.key === 'ArrowLeft' && !checkCollision(currentPosition.x - 1, currentPosition.y)) {
//         currentPosition.x--;
//     } else if (event.key === 'ArrowRight' && !checkCollision(currentPosition.x + 1, currentPosition.y)) {
//         currentPosition.x++;
//     } else if (event.key === 'ArrowDown') {
//         currentPosition.y++;
//         if (checkCollision(currentPosition.x, currentPosition.y)) {
//             currentPosition.y--;
//             lockTetromino();
//         }
//     } else if (event.key === 'ArrowUp') {
//         // Rotate tetromino
//         const rotatedShape = currentTetromino.shape[0].map((val, index) =>
//             currentTetromino.shape.map(row => row[index]).reverse()
//         );
//         if (!checkCollision(currentPosition.x, currentPosition.y, rotatedShape)) {
//             currentTetromino.shape = rotatedShape;
//         }
//     }
//     drawTetromino();
// }

// document.addEventListener('keydown', control);
// spawnTetromino();

// // Game loop
// function gameLoop() {
//     dropTetromino();
//     if (gameRunning) {
//         setTimeout(gameLoop, 1000);
//     }
// }

// gameLoop();

// // 
// let score = 0;

// function updateScore(clearedLines) {
//     // Update score logic, e.g., score += clearedLines * 100;
//     score += clearedLines * 100;
//     document.getElementById('score').innerText = `Score: ${score}`;
// }


// document.getElementById('startButton').addEventListener('click', startGame);
// document.getElementById('pauseButton').addEventListener('click', pauseGame);

// function startGame() {
//     if (!gameRunning) {
//         gameRunning = true;
//         spawnTetromino();
//         gameLoop();
//     }
// }

// function pauseGame() {
//     gameRunning = !gameRunning;
//     if (gameRunning) {
//         gameLoop();
//     }
// }


// function gameOver() {
//     gameRunning = false;
//     document.getElementById('gameOverMessage').style.display = 'block';
// }

// document.getElementById('restartButton').addEventListener('click', function() {
//     document.getElementById('gameOverMessage').style.display = 'none';
//     for (let y = 0; y < boardHeight; y++) {
//         for (let x = 0; x < boardWidth; x++) {
//             board[y][x] = null;
//         }
//     }
//     score = 0;
//     updateScore(0); // Reset score display
//     startGame();
// });


document.addEventListener('DOMContentLoaded', () => {  // Ensures the DOM is fully loaded before running the script
    const boardWidth = 10;
    const boardHeight = 20;
    const board = [];
    const tetrisBoard = document.getElementById('tetris-board');
    let score = 0;
    let gameRunning = true;
    let currentTetromino, currentPosition, currentRotation;

    // Initialize the board
    for (let y = 0; y < boardHeight; y++) {
        let row = [];
        for (let x = 0; x < boardWidth; x++) {
            const cell = document.createElement('div');
            cell.className = 'tetris-cell';
            tetrisBoard.appendChild(cell);
            row.push('');
        }
        board.push(row);
    }

    const tetrominoes = [
        { shape: [[1, 1, 1, 1]], color: 'cyan' },    // I
        { shape: [[1, 1], [1, 1]], color: 'yellow' },// O
        { shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' }, // T
        // Add other Tetrominoes here
    ];

    function drawBoard() {
        for (let y = 0; y < boardHeight; y++) {
            for (let x = 0; x < boardWidth; x++) {
                const cellIndex = y * boardWidth + x; // Calculate the cell's index
                const cell = tetrisBoard.children[cellIndex];
                cell.style.backgroundColor = board[y][x] || 'transparent'; // Set color if cell is filled
            }
        }
    }
    
    

    function drawTetromino() {
        currentTetromino.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    const x = currentPosition.x + dx;
                    const y = currentPosition.y + dy;
                    const index = x + y * boardWidth;
                    if (tetrisBoard.childNodes[index]) {
                        tetrisBoard.childNodes[index].style.backgroundColor = currentTetromino.color;
                    }
                }
            });
        });
    }

    function clearTetromino() {
        currentTetromino.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    const x = currentPosition.x + dx;
                    const y = currentPosition.y + dy;
                    const index = x + y * boardWidth;
                    if (tetrisBoard.childNodes[index]) {
                        tetrisBoard.childNodes[index].style.backgroundColor = 'transparent';
                    }
                }
            });
        });
    }

    function rotateTetromino() {
        const originalShape = currentTetromino.shape;
        const N = originalShape.length;
        const M = originalShape[0].length; // Assuming rectangular shapes
        const rotatedShape = [];
    
        // Create a new rotated shape matrix
        for (let x = 0; x < M; x++) {
            rotatedShape.push([]);
            for (let y = N - 1; y >= 0; y--) {
                rotatedShape[x].push(originalShape[y][x]);
            }
        }
    
        // Save the original position to revert if needed
        const originalPosition = { ...currentPosition };
    
        // Apply the rotated shape and check for collisions
        clearTetromino();
        currentTetromino.shape = rotatedShape;
        if (checkCollision(0, 0) || checkCollision(-1, 0) || checkCollision(1, 0)) {
            // Revert to original shape and position if there's a collision
            currentTetromino.shape = originalShape;
            currentPosition = originalPosition;
        }
        drawTetromino();
    }
        
    function spawnTetromino() {
        currentTetromino = JSON.parse(JSON.stringify(tetrominoes[Math.floor(Math.random() * tetrominoes.length)]));
        currentPosition = { x: Math.floor(boardWidth / 2) - 1, y: 0 };
        currentRotation = 0;
        if (checkCollision()) {
            gameRunning = false;
            alert('Game Over');
            // Optionally, implement game reset or high score logic here
        }
    }

    function checkCollision(xOffset = 0, yOffset = 0) {
        for (let y = 0; y < currentTetromino.shape.length; y++) {
            for (let x = 0; x < currentTetromino.shape[y].length; x++) {
                if (currentTetromino.shape[y][x]) {
                    const newX = currentPosition.x + x + xOffset;
                    const newY = currentPosition.y + y + yOffset;
                    if (newX < 0 || newX >= boardWidth || newY >= boardHeight || board[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function lockTetromino() {
        currentTetromino.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    const x = currentPosition.x + dx; // Calculate the absolute X position on the board
                    const y = currentPosition.y + dy; // Calculate the absolute Y position on the board
    
                    // Check if the position is within the board's bounds
                    if (x >= 0 && x < boardWidth && y >= 0 && y < boardHeight) {
                        board[y][x] = currentTetromino.color; // Update the board with the tetromino's color
                    }
                }
            });
        });
    
        clearLines(); // Check for and clear any completed lines
        spawnTetromino(); // Spawn a new tetromino for the next turn
    }
    
    
    
    

    function clearLines() {
        let linesCleared = 0;
        for (let y = 0; y < boardHeight; y++) {
            if (board[y].every(cell => cell)) {
                linesCleared++;
                board.splice(y, 1);
                board.unshift(Array(boardWidth).fill(''));
            }
        }
        if (linesCleared > 0) {
            updateScore(linesCleared);
        }
    }

    function updateScore(linesCleared) {
        score += linesCleared * 100; // Simple score calculation, adjust as needed
        document.getElementById('score').innerText = `Score: ${score}`;
    }

    function moveTetrominoDown() {
        if (!gameRunning) return;
        clearTetromino(); // Clear the current tetromino's position
        currentPosition.y++; // Move the tetromino down
    
        if (checkCollision(0, 0)) { // Check for collision at the new position
            currentPosition.y--; // Revert the move if there's a collision
            lockTetromino(); // Lock the tetromino in place
            drawBoard(); // <-- Make sure to call drawBoard here to render locked pieces
        } else {
            drawTetromino(); // Draw the tetromino at its new position if no collision
        }
    }
    
    function control(e) {
        if (!gameRunning) return;
        if (e.keyCode === 37) { // Left arrow
            if (!checkCollision(-1, 0)) {
                clearTetromino();
                currentPosition.x--;
                drawTetromino();
            }
        } else if (e.keyCode === 39) { // Right arrow
            if (!checkCollision(1, 0)) {
                clearTetromino();
                currentPosition.x++;
                drawTetromino();
            }
        } else if (e.keyCode === 40) { // Down arrow
            moveTetrominoDown();
        } else if (e.keyCode === 38) { // Up arrow for rotation
            rotateTetromino();
        }
    }

    document.addEventListener('keydown', control);

    function gameLoop() {
        moveTetrominoDown();
        if (gameRunning) {
            setTimeout(gameLoop, 1000); // Adjust the speed as needed
        }
    }

    spawnTetromino();
    gameLoop();
});
