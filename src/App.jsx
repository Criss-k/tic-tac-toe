import './App.css'

import React, { useState, useEffect } from 'react';
import { RotateCw, Trophy } from 'lucide-react';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(''));
  const [isPlayerNext, setIsPlayerNext] = useState(true);
  const [gameActive, setGameActive] = useState(true);
  const [scores, setScores] = useState({ player: 0, ai: 0, ties: 0 });
  const [winningCells, setWinningCells] = useState([]);
  const [gameStatus, setGameStatus] = useState('');
  const [gameFinished, setGameFinished] = useState(false);

  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const checkWinner = (squares) => {
    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line };
      }
    }
    return null;
  };

  const minimax = (squares, depth, isMaximizing) => {
    const result = checkWinner(squares);
    if (result?.winner === 'O') return 10 - depth;
    if (result?.winner === 'X') return depth - 10;
    if (!squares.includes('')) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
          squares[i] = 'O';
          const score = minimax(squares, depth + 1, false);
          squares[i] = '';
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
          squares[i] = 'X';
          const score = minimax(squares, depth + 1, true);
          squares[i] = '';
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getAIMove = (squares) => {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        squares[i] = 'O';
        const score = minimax(squares, 0, false);
        squares[i] = '';
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  };

  const handleClick = (index) => {
    if (!gameActive || board[index]) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsPlayerNext(false);

    const result = checkWinner(newBoard);
    if (result || !newBoard.includes('')) {
      handleGameEnd(result);
      return;
    }

    setTimeout(() => {
      const aiMove = getAIMove(newBoard);
      newBoard[aiMove] = 'O';
      setBoard(newBoard);
      setIsPlayerNext(true);

      const finalResult = checkWinner(newBoard);
      if (finalResult || !newBoard.includes('')) {
        handleGameEnd(finalResult);
      }
    }, 300);
  };

  const handleGameEnd = (result) => {
    setGameActive(false);
    setGameFinished(true);

    if (result) {
      setWinningCells(result.line);
      if (result.winner === 'X') {
        setScores(prev => ({ ...prev, player: prev.player + 1 }));
        setGameStatus('Player wins!');
      } else {
        setScores(prev => ({ ...prev, ai: prev.ai + 1 }));
        setGameStatus('AI wins!');
      }
    } else {
      setScores(prev => ({ ...prev, ties: prev.ties + 1 }));
      setGameStatus("It's a tie!");
    }
  };

  const restartGame = () => {
    setBoard(Array(9).fill(''));
    setIsPlayerNext(true);
    setGameActive(true);
    setWinningCells([]);
    setGameStatus('');
    setGameFinished(false);
  };

  const resetScores = () => {
    setScores({ player: 0, ai: 0, ties: 0 });
    restartGame();
  };

  const getCellStyle = (index) => {
    const baseStyle = "w-full h-24 bg-white rounded-lg shadow-sm border border-gray-200 text-3xl font-bold flex items-center justify-center hover:bg-gray-50 disabled:opacity-100";

    if (gameFinished && winningCells.includes(index)) {
      const winner = board[index];
      return `${baseStyle} ${winner === 'X' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`;
    }

    return baseStyle;
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">Tic Tac Toe vs AI</h1>

      <div className="flex justify-center gap-4 mb-6">
        <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
          <p className="text-sm font-medium">Player: {scores.player}</p>
        </div>
        <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
          <p className="text-sm font-medium">AI: {scores.ai}</p>
        </div>
        <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
          <p className="text-sm font-medium">Ties: {scores.ties}</p>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold">
          {gameStatus || `Next player: ${isPlayerNext ? 'Player (X)' : 'AI (O)'}`}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            disabled={!gameActive || !isPlayerNext || cell !== ''}
            className={getCellStyle(index)}
          >
            {cell}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={restartGame}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          <RotateCw size={18} />
          Restart Game
        </button>
        <button
          onClick={resetScores}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <Trophy size={18} />
          Reset Scores
        </button>
      </div>
    </div>
  );
};

export default TicTacToe;