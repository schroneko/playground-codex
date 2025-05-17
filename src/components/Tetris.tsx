import React, { useState, useEffect, useRef } from 'react';
import './Tetris.css';

type Cell = { color: string | null };

type PieceState = {
  matrix: number[][];
  color: string;
  row: number;
  col: number;
};

const ROWS = 20;
const COLS = 10;

const PIECES: { matrix: number[][]; color: string }[] = [
  { matrix: [[1, 1, 1, 1]], color: 'cyan' }, // I
  { matrix: [
      [1, 1],
      [1, 1]
    ], color: 'yellow' }, // O
  { matrix: [
      [0, 1, 0],
      [1, 1, 1]
    ], color: 'purple' }, // T
  { matrix: [
      [0, 1, 1],
      [1, 1, 0]
    ], color: 'green' }, // S
  { matrix: [
      [1, 1, 0],
      [0, 1, 1]
    ], color: 'red' }, // Z
  { matrix: [
      [1, 0, 0],
      [1, 1, 1]
    ], color: 'blue' }, // J
  { matrix: [
      [0, 0, 1],
      [1, 1, 1]
    ], color: 'orange' } // L
];

const rotate = (matrix: number[][]): number[][] =>
  matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());

const createBoard = (): Cell[][] =>
  Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ color: null }))
  );

const Tetris: React.FC = () => {
  const [board, setBoard] = useState<Cell[][]>(createBoard);
  const [piece, setPiece] = useState<PieceState | null>(null);
  const [running, setRunning] = useState(false);
  const loop = useRef<number>();

  const hasCollision = (brd: Cell[][], pc: PieceState): boolean => {
    for (let r = 0; r < pc.matrix.length; r++) {
      for (let c = 0; c < pc.matrix[r].length; c++) {
        if (pc.matrix[r][c]) {
          const row = pc.row + r;
          const col = pc.col + c;
          if (
            row >= ROWS ||
            col < 0 ||
            col >= COLS ||
            (row >= 0 && brd[row][col].color)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const merge = (brd: Cell[][], pc: PieceState): Cell[][] => {
    const newBoard = brd.map(row => row.slice());
    pc.matrix.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val) {
          const rowIndex = pc.row + r;
          const colIndex = pc.col + c;
          if (rowIndex >= 0) {
            newBoard[rowIndex][colIndex].color = pc.color;
          }
        }
      });
    });
    return newBoard;
  };

  const clearLines = (brd: Cell[][]) => {
    const newBoard = brd.filter(row => row.some(cell => !cell.color));
    const cleared = ROWS - newBoard.length;
    while (newBoard.length < ROWS) {
      newBoard.unshift(Array.from({ length: COLS }, () => ({ color: null })));
    }
    return { board: newBoard, cleared };
  };

  const spawnPiece = () => {
    const p = PIECES[Math.floor(Math.random() * PIECES.length)];
    const col = Math.floor((COLS - p.matrix[0].length) / 2);
    const newPiece: PieceState = { ...p, row: 0, col };
    if (hasCollision(board, newPiece)) {
      setRunning(false);
      setPiece(null);
      return;
    }
    setPiece(newPiece);
  };

  useEffect(() => {
    if (!running) return;
    loop.current = window.setInterval(() => {
      setPiece(prev => {
        if (!prev) return prev;
        const moved = { ...prev, row: prev.row + 1 };
        if (!hasCollision(board, moved)) {
          return moved;
        }
        const merged = merge(board, prev);
        const { board: cleared } = clearLines(merged);
        setBoard(cleared);
        spawnPiece();
        return null;
      });
    }, 500);
    return () => {
      if (loop.current) window.clearInterval(loop.current);
    };
  }, [running, board]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!piece) return;
      if (e.key === 'ArrowLeft') {
        const moved = { ...piece, col: piece.col - 1 };
        if (!hasCollision(board, moved)) setPiece(moved);
      } else if (e.key === 'ArrowRight') {
        const moved = { ...piece, col: piece.col + 1 };
        if (!hasCollision(board, moved)) setPiece(moved);
      } else if (e.key === 'ArrowDown') {
        const moved = { ...piece, row: piece.row + 1 };
        if (!hasCollision(board, moved)) setPiece(moved);
      } else if (e.key === 'ArrowUp') {
        const rotated = { ...piece, matrix: rotate(piece.matrix) };
        if (!hasCollision(board, rotated)) setPiece(rotated);
      } else if (e.key === ' ') {
        let moved = { ...piece };
        while (!hasCollision(board, { ...moved, row: moved.row + 1 })) {
          moved.row++;
        }
        setPiece(moved);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [piece, board]);

  useEffect(() => {
    spawnPiece();
  }, []);

  const startGame = () => {
    if (!running) {
      setBoard(createBoard());
      spawnPiece();
      setRunning(true);
    }
  };

  const displayBoard = () => {
    const display = board.map(row => row.slice());
    if (piece) {
      piece.matrix.forEach((row, r) => {
        row.forEach((val, c) => {
          if (val) {
            const rowIndex = piece.row + r;
            const colIndex = piece.col + c;
            if (
              rowIndex >= 0 &&
              rowIndex < ROWS &&
              colIndex >= 0 &&
              colIndex < COLS
            ) {
              display[rowIndex][colIndex] = { color: piece.color };
            }
          }
        });
      });
    }
    return display;
  };

  const display = displayBoard();

  return (
    <div className="tetris">
      {!running && (
        <button className="start" onClick={startGame}>
          Start
        </button>
      )}
      <div
        className="board"
        style={{
          gridTemplateRows: `repeat(${ROWS}, 20px)`,
          gridTemplateColumns: `repeat(${COLS}, 20px)`
        }}
      >
        {display.flat().map((cell, idx) => (
          <div
            key={idx}
            className="cell"
            style={{ backgroundColor: cell.color || '#222' }}
          />
        ))}
      </div>
    </div>
  );
};

export default Tetris;
