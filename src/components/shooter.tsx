import React, { useEffect, useRef, useState } from 'react';

const ShooterGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [players, setPlayers] = useState([{ x: 50, y: 50, bullets: [] }]);
  const playerSpeed = 5;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    const drawPlayer = (player) => {
      ctx.fillStyle = 'blue';
      ctx.fillRect(player.x, player.y, 50, 50); // Draw player as a 50x50 square
    };

    const drawBullet = (bullet) => {
      ctx.fillStyle = 'red';
      ctx.fillRect(bullet.x, bullet.y, 5, 5); // Draw bullet as a 5x5 square
    };

    const updateGame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

      players.forEach((player) => {
        drawPlayer(player);
        player.bullets.forEach((bullet) => {
          bullet.x += 10; // Move bullet
          drawBullet(bullet);
        });

        // Remove off-screen bullets
        player.bullets = player.bullets.filter(bullet => bullet.x < canvas.width);
      });

      requestAnimationFrame(updateGame);
    };

    updateGame();
  }, []);

  const handleKeyDown = (e) => {
    const newPlayers = [...players];
    const player = newPlayers[0]; // Assuming single player for simplicity

    switch (e.key) {
      case 'ArrowLeft':
        player.x -= playerSpeed;
        break;
      case 'ArrowRight':
        player.x += playerSpeed;
        break;
      case 'ArrowUp':
        player.y -= playerSpeed;
        break;
      case 'ArrowDown':
        player.y += playerSpeed;
        break;
      case ' ':
        player.bullets.push({ x: player.x + 25, y: player.y }); // Shoot bullet from player center
        break;
      default:
        break;
    }

    setPlayers(newPlayers);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [players]);

  return <canvas ref={canvasRef}></canvas>;
};

export default ShooterGame;
