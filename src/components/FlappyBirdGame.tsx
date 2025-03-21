import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type FlappyBirdGameApi = {
  flapUp: () => void; // prepares to fly
  flapDown: () => void; // does the flap and flies
};

const FlappyBirdGame = forwardRef<FlappyBirdGameApi>((_props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const bird = useRef({ x: 150, y: 150, vy: 0, width: 20, height: 20 });
  const pipes = useRef<{ x: number; y: number; passed: boolean }[]>([]);
  const pipeWidth = 50;
  const pipeGap = 200;
  const gravity = 0.2;
  const flapStrength = -6;
  const pipeInterval = 1500;
  const gameSpeed = 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 400;
    canvas.height = 600;

    const update = () => {
      bird.current.vy += gravity;
      bird.current.y += bird.current.vy;

      // Generate pipes
      if (
        pipes.current.length === 0 ||
        pipes.current[pipes.current.length - 1].x < canvas.width - pipeInterval
      ) {
        const pipeHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
        pipes.current.push({ x: canvas.width, y: pipeHeight, passed: false });
      }

      // Move pipes
      pipes.current.forEach((pipe) => {
        pipe.x -= gameSpeed;
      });

      // Remove off-screen pipes
      if (pipes.current.length > 0 && pipes.current[0].x + pipeWidth < 0) {
        pipes.current.shift();
      }

      // Collision detection
      pipes.current.forEach((pipe) => {
        if (
          bird.current.x < pipe.x + pipeWidth &&
          bird.current.x + bird.current.width > pipe.x &&
          (bird.current.y < pipe.y ||
            bird.current.y + bird.current.height > pipe.y + pipeGap)
        ) {
          // Collision detected, reset the game
          bird.current.y = 150;
          bird.current.vy = 0;
          pipes.current = [];
        }
      });

      // Draw everything
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pipes.current.forEach((pipe) => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.y);
        ctx.fillRect(
          pipe.x,
          pipe.y + pipeGap,
          pipeWidth,
          canvas.height - pipe.y - pipeGap
        );
      });
      ctx.fillRect(
        bird.current.x,
        bird.current.y,
        bird.current.width,
        bird.current.height
      );
    };

    const gameLoop = () => {
      update();
      requestAnimationFrame(gameLoop);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        bird.current.vy = flapStrength;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    gameLoop();

    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  const flappedUpRef = useRef(false);
  const flappedUpTimeoutRef = useRef<number>();

  useImperativeHandle(ref, () => ({
    flapDown: () => {
      if (flappedUpRef.current) {
        clearTimeout(flappedUpTimeoutRef.current);
        bird.current.vy = flapStrength;
        flappedUpRef.current = false;
      }
    },
    flapUp: () => {
      flappedUpRef.current = true;
      flappedUpTimeoutRef.current = +setTimeout(() => {
        flappedUpRef.current = false;
      }, 1000);
    },
  }));

  return <canvas ref={canvasRef}></canvas>;
});

export default FlappyBirdGame;
