document.addEventListener("DOMContentLoaded", () => {
  // Ensures the DOM is fully loaded before running the script
  const boardWidth = 10;
  const boardHeight = 20;
  const board = [];
  const tetrisBoard = document.getElementById("tetris-board");
  let score = 0;
  let gameRunning = true;
  let currentTetromino, currentPosition, currentRotation;

  // Initialize the board
  for (let y = 0; y < boardHeight; y++) {
    let row = [];
    for (let x = 0; x < boardWidth; x++) {
      const cell = document.createElement("div");
      cell.className = "tetris-cell";
      tetrisBoard.appendChild(cell);
      row.push("");
    }
    board.push(row);
  }

  const tetrominoes = [
    { shape: [[1, 1, 1, 1]], color: "cyan" }, // I
    {
      shape: [
        [1, 1],
        [1, 1],
      ],
      color: "yellow",
    }, // O
    {
      shape: [
        [0, 1, 0],
        [1, 1, 1],
      ],
      color: "purple",
    }, // T
    {
      shape: [
        [1, 1, 0],
        [0, 1, 1],
      ],
      color: "green",
    },
    {
      shape: [
        [0, 1, 1],
        [1, 1, 0],
      ],
      color: "red",
    },
    {
      shape: [
        [1, 1, 1],
        [0, 0, 1],
      ],
      color: "blue",
    },
    {
      shape: [
        [1, 1, 1],
        [1, 0, 0],
      ],
      color: "orange",
    },
  ];

  function drawBoard() {
    for (let y = 0; y < boardHeight; y++) {
      for (let x = 0; x < boardWidth; x++) {
        const cellIndex = y * boardWidth + x; // Calculate the cell's index
        const cell = tetrisBoard.children[cellIndex];
        cell.style.backgroundColor = board[y][x] || "transparent"; // Set color if cell is filled
      }
    }
  }

  function reset() {
    // Reset the game state
    gameRunning = true;
    score = 0;
    document.getElementById("score").innerText = `Score: ${score}`;
    board.forEach((row) => row.fill(""));
    drawBoard();
  }

  function drawTetromino() {
    currentTetromino.shape.forEach((row, dy) => {
      row.forEach((value, dx) => {
        if (value) {
          const x = currentPosition.x + dx;
          const y = currentPosition.y + dy;
          const index = x + y * boardWidth;
          if (tetrisBoard.childNodes[index]) {
            tetrisBoard.childNodes[index].style.backgroundColor =
              currentTetromino.color;
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
            tetrisBoard.childNodes[index].style.backgroundColor = "transparent";
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
    currentTetromino = JSON.parse(
      JSON.stringify(
        tetrominoes[Math.floor(Math.random() * tetrominoes.length)]
      )
    );
    currentPosition = { x: Math.floor(boardWidth / 2) - 1, y: 0 };
    currentRotation = 0;
    if (checkCollision()) {
      gameRunning = false;

      // show game over
      // const gameOver = document.getElementById("game-over");
      const score = document.getElementById("score");
      score.innerText = `Game Over! Score: ${score}`;

      setTimeout(reset, 2000);
    }
  }

  function checkCollision(xOffset = 0, yOffset = 0) {
    for (let y = 0; y < currentTetromino.shape.length; y++) {
      for (let x = 0; x < currentTetromino.shape[y].length; x++) {
        if (currentTetromino.shape[y][x]) {
          const newX = currentPosition.x + x + xOffset;
          const newY = currentPosition.y + y + yOffset;
          if (
            newX < 0 ||
            newX >= boardWidth ||
            newY >= boardHeight ||
            board[newY][newX]
          ) {
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
      if (board[y].every((cell) => cell)) {
        linesCleared++;
        board.splice(y, 1);
        board.unshift(Array(boardWidth).fill(""));
      }
    }
    if (linesCleared > 0) {
      updateScore(linesCleared);
    }
  }

  function updateScore(linesCleared) {
    score += linesCleared * 100; // Simple score calculation, adjust as needed
    document.getElementById("score").innerText = `Score: ${score}`;
  }

  function moveTetrominoDown() {
    if (!gameRunning) return;
    clearTetromino(); // Clear the current tetromino's position
    currentPosition.y++; // Move the tetromino down

    if (checkCollision(0, 0)) {
      // Check for collision at the new position
      currentPosition.y--; // Revert the move if there's a collision
      lockTetromino(); // Lock the tetromino in place
      drawBoard(); // <-- Make sure to call drawBoard here to render locked pieces
    } else {
      drawTetromino(); // Draw the tetromino at its new position if no collision
    }
  }

  function control(e) {
    if (!gameRunning) return;
    if (e.keyCode === 37) {
      // Left arrow
      if (!checkCollision(-1, 0)) {
        clearTetromino();
        currentPosition.x--;
        drawTetromino();
      }
    } else if (e.keyCode === 39) {
      // Right arrow
      if (!checkCollision(1, 0)) {
        clearTetromino();
        currentPosition.x++;
        drawTetromino();
      }
    } else if (e.keyCode === 40) {
      // Down arrow
      moveTetrominoDown();
    } else if (e.keyCode === 38) {
      // Up arrow for rotation
      rotateTetromino();
    }
  }

  document.addEventListener("keydown", control);

  function gameLoop() {
    moveTetrominoDown();
    if (gameRunning) {
      setTimeout(gameLoop, 1000); // Adjust the speed as needed
    }
  }

  spawnTetromino();
  gameLoop();
});
