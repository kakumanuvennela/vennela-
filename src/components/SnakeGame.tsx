import React, { useState, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]; // Start a bit longer
const INITIAL_DIRECTION = { x: 0, y: -1 };
const SPEED = 120; // Lower is faster

type Point = { x: number; y: number };

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [nextDirection, setNextDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 15, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Focus trap for keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (!isPlaying && hasStarted && !gameOver && e.key === ' ') {
        setIsPlaying(true);
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.y === 0) setNextDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.y === 0) setNextDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.x === 0) setNextDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.x === 0) setNextDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isPlaying, hasStarted, gameOver]);

  // Main game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = { x: head.x + nextDirection.x, y: head.y + nextDirection.y };

        // 1. Wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          handleGameOver();
          return prevSnake;
        }

        // 2. Self collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          handleGameOver();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // 3. Food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => {
            const newScore = s + 10;
            if (newScore > highScore) setHighScore(newScore);
            return newScore;
          });
          generateFood(newSnake);
        } else {
          newSnake.pop(); // Remove tail if no food eaten
        }

        setDirection(nextDirection); // commit the move direction
        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, SPEED);
    return () => clearInterval(intervalId);
  }, [isPlaying, gameOver, nextDirection, food, highScore]);

  const handleGameOver = useCallback(() => {
    setGameOver(true);
    setIsPlaying(false);
  }, []);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Check if food spawns on snake
      if (!currentSnake.some((s) => s.x === newFood.x && s.y === newFood.y)) {
        break;
      }
    }
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setHasStarted(true);
    setIsPlaying(true);
    generateFood(INITIAL_SNAKE);
  };

  const getGridCells = () => {
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isSnakeBody = snake.some((segment) => segment.x === x && segment.y === y);
        const isSnakeHead = snake[0].x === x && snake[0].y === y;
        const isFood = food.x === x && food.y === y;

        cells.push(
          <div
            key={`${x}-${y}`}
            className={`w-full h-full rounded-sm border border-white/5 transition-all duration-75 ${
              isSnakeHead
                ? 'bg-[#00ff41] shadow-[0_0_15px_#00ff41] z-10 scale-110'
                : isSnakeBody
                ? 'bg-[#00ff41] opacity-90'
                : isFood
                ? 'bg-[#ff00ff] shadow-[0_0_15px_#ff00ff] animate-pulse rounded-full scale-75'
                : 'bg-transparent'
            }`}
          />
        );
      }
    }
    return cells;
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-[600px] mx-auto">
      {/* HUD Header */}
      <div className="absolute top-4 left-6 sm:top-10 sm:left-10 flex gap-8 z-10 font-mono">
        <div>
          <span className="block text-[10px] text-white/40 uppercase tracking-widest mb-1">High Score</span>
          <span className="text-3xl font-bold text-white tabular-nums">
            {highScore.toLocaleString()}
          </span>
        </div>
        
        <div>
          <span className="block text-[10px] text-white/40 uppercase tracking-widest mb-1">Current Score</span>
          <span className="text-3xl font-bold text-[#00ff41] drop-shadow-[0_0_8px_#00ff41] tabular-nums">
            {score.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Game Board container */}
      <div className="relative group w-full aspect-square max-w-[500px] mx-auto mt-20 sm:mt-0">
        <div 
          className="relative w-full aspect-square bg-[#020202] border border-white/20 p-1 overflow-hidden shadow-2xl"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
            backgroundSize: `calc(100% / ${GRID_SIZE}) calc(100% / ${GRID_SIZE})`
          }}
        >
          {/* Main Grid */}
          <div 
            className="w-full h-full grid gap-[1px]"
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`
            }}
          >
            {getGridCells()}
          </div>

          {/* Overlays */}
          <AnimatePresence>
            {!hasStarted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-lg"
              >
                <div className="p-8 pb-10 bg-[#0a0a0a] border border-white/10 rounded flex flex-col items-center shadow-2xl text-center">
                   <h2 className="text-2xl font-bold text-[#00ff41] drop-shadow-[0_0_8px_#00ff41] mb-2 tracking-wide font-mono uppercase">Neon Snake</h2>
                   <p className="text-white/40 text-[10px] uppercase mb-8 font-mono">Press [W A S D] to Navigate</p>
                   
                   <button
                    onClick={resetGame}
                    className="px-8 py-3 border-2 border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41]/10 font-bold uppercase tracking-widest rounded transition-all duration-300 active:scale-95 text-xs"
                   >
                     Initiate Sequence
                   </button>
                </div>
              </motion.div>
            )}

            {gameOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 border border-[#ff00ff]/30 shadow-[inset_0_0_50px_rgba(255,0,255,0.1)]"
              >
                <h2 className="text-3xl font-black text-[#ff00ff] drop-shadow-[0_0_15px_#ff00ff] mb-2 uppercase tracking-tighter font-mono">
                  System Failure
                </h2>
                <div className="text-sm text-white/80 font-mono mb-8 space-x-2">
                  <span className="text-white/40 uppercase tracking-widest text-[10px]">Final Score:</span>
                  <span className="text-[#00ff41] drop-shadow-[0_0_5px_#00ff41] font-bold">{score.toLocaleString()}</span>
                </div>
                
                <button
                  onClick={resetGame}
                  className="group flex items-center gap-2 px-8 py-3 bg-transparent border-2 border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff]/10 font-bold uppercase tracking-widest rounded-sm transition-all duration-300 text-xs shadow-[0_0_10px_rgba(255,0,255,0.2)] font-mono"
                >
                  <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
                  Reboot System
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <p className="mt-8 text-[10px] text-white/30 uppercase tracking-widest text-center">Press [W A S D] to Navigate // [Space] to Start</p>
    </div>
  );
}
