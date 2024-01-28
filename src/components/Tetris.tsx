import React, { useState, useEffect, useRef, useMemo } from "react";
import "./Tetris.style.css";

type Tetrominoe = {
  shape: number[][];
  color: string;
};

const tetrominoes: Tetrominoe[] = [
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
  // Add other Tetrominoes here
];

const Tetris = () => {
  const boardWidth = 10;
  const boardHeight = 20;
  const [board, setBoard] = useState(
    Array.from({ length: boardHeight }, () => Array(boardWidth).fill(""))
  );
  const [score, setScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(true);
  const [currentTetromino, setCurrentTetromino] = useState<Tetrominoe>(
    useMemo(
      () => tetrominoes[Math.floor(Math.random() * tetrominoes.length)],
      []
    )
  );
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [currentRotation, setCurrentRotation] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: any) => control(e);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (gameRunning) {
        moveTetrominoDown();
      }
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [gameRunning, currentTetromino, currentPosition]);

  const updateBoard = (newBoard: any[][]) => {
    setBoard((prev) =>
      newBoard.map((row, y) => row.map((cell, x) => cell || prev[y][x]))
    );
  };

  const drawTetromino = () => {
    const newBoard = board.map((row) => [...row]);
    currentTetromino!.shape.forEach((row, dy) => {
      row.forEach((value, dx) => {
        if (value) {
          const x = currentPosition.x + dx;
          const y = currentPosition.y + dy;
          if (newBoard[y] && newBoard[y][x] !== undefined) {
            newBoard[y][x] = currentTetromino!.color;
          }
        }
      });
    });
    updateBoard(newBoard);
  };

  const clearTetromino = () => {
    const newBoard = board.map((row) =>
      row.map((cell) => (cell === currentTetromino!.color ? "" : cell))
    );
    updateBoard(newBoard);
  };

  function rotateTetromino() {
    const originalShape = currentTetromino!.shape;
    const N = originalShape.length;
    const M = originalShape[0].length; // Assuming rectangular shapes
    const rotatedShape: number[][] = [];

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
    currentTetromino!.shape = rotatedShape;
    if (checkCollision(0, 0) || checkCollision(-1, 0) || checkCollision(1, 0)) {
      // Revert to original shape and position if there's a collision
      currentTetromino!.shape = originalShape;
      setCurrentPosition(originalPosition);
    }
    drawTetromino();
  }

  const spawnTetromino = () => {
    setCurrentTetromino(
      tetrominoes[Math.floor(Math.random() * tetrominoes.length)]
    );
    setCurrentPosition({ x: Math.floor(boardWidth / 2) - 2, y: 0 });
    setCurrentRotation(0);
  };

  const moveTetrominoDown = () => {
    clearTetromino();
    setCurrentPosition((prev) => ({ ...prev, y: prev.y + 1 }));
    if (checkCollision(0, 1)) {
      setCurrentPosition((prev) => ({ ...prev, y: prev.y - 1 }));
      lockTetromino();
      spawnTetromino();
    } else {
      drawTetromino();
    }
  };

  const checkCollision = (xOffset = 0, yOffset = 0) => {
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
  };

  const lockTetromino = () => {
    const newBoard = board.map((row) => [...row]);
    currentTetromino.shape.forEach((row, dy) => {
      row.forEach((value, dx) => {
        if (value) {
          const x = currentPosition.x + dx;
          const y = currentPosition.y + dy;
          if (newBoard[y] && newBoard[y][x] !== undefined) {
            newBoard[y][x] = currentTetromino.color;
          }
        }
      });
    });
    setBoard(newBoard);
    clearLines();
  };

  const clearLines = () => {
    const newBoard = board.filter((row) => row.some((cell) => cell === ""));
    const linesCleared = boardHeight - newBoard.length;
    if (linesCleared > 0) {
      setBoard([
        ...Array.from({ length: linesCleared }, () =>
          Array(boardWidth).fill("")
        ),
        ...newBoard,
      ]);
      setScore((prev) => prev + linesCleared * 100);
    }
  };

  const control = (e: any) => {
    if (!gameRunning) return;
    if (e.keyCode === 37) {
      // Left arrow
      if (!checkCollision(-1, 0)) {
        clearTetromino();
        setCurrentPosition((prev) => ({ ...prev, x: prev.x - 1 }));
        drawTetromino();
      }
    } else if (e.keyCode === 39) {
      // Right arrow
      if (!checkCollision(1, 0)) {
        clearTetromino();
        setCurrentPosition((prev) => ({ ...prev, x: prev.x + 1 }));
        drawTetromino();
      }
    } else if (e.keyCode === 40) {
      // Down arrow
      moveTetrominoDown();
    } else if (e.keyCode === 38) {
      // Up arrow for rotation
      // Implement rotation logic here

      rotateTetromino();
    }
  };

  return (
    <div className="tetris-root">
      <div className="tetris-board">
        {board.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className="tetris-cell"
              style={{ backgroundColor: cell || "transparent" }}
            ></div>
          ))
        )}
      </div>
      <div className="score">Score: {score}</div>
      <div id="gameOverMessage">
        Game Over! <button id="restartButton">Restart</button>
      </div>
    </div>
  );
};

export default Tetris;
