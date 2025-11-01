'use client';

import React, { useState, useEffect } from 'react';

const WORDS = [
  'REACT', 'WORLD', 'CRANE', 'SLATE', 'AUDIO', 'TRAIN', 'STONE', 'HOUSE',
  'BREAD', 'PLANT', 'GREAT', 'BEACH', 'CLOUD', 'FLAME', 'GRACE', 'SPACE'
];

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

export default function WordleGame() {
  const [solution, setSolution] = useState('');
  const [guesses, setGuesses] = useState(Array(MAX_GUESSES).fill(''));
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    setSolution(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    if (gameOver) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Backspace') {
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess(prev => prev + e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, gameOver]);

  const handleSubmit = () => {
    if (currentGuess.length !== WORD_LENGTH) {
      setMessage('Not enough letters');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    const newGuesses = [...guesses];
    newGuesses[currentRow] = currentGuess;
    setGuesses(newGuesses);

    if (currentGuess === solution) {
      const timeElapsed = (Date.now() - startTime) / 1000; // seconds
      const calculatedScore = calculateScore(currentRow + 1, timeElapsed);
      setScore(calculatedScore);
      setTotalScore(totalScore + calculatedScore);
      setGameOver(true);
      setMessage(`🎉 You won! Score: ${calculatedScore}`);
      return;
    }

    if (currentRow === MAX_GUESSES - 1) {
      setGameOver(true);
      setMessage(`Game over! The word was ${solution}`);
      return;
    }

    setCurrentRow(currentRow + 1);
    setCurrentGuess('');
  };

  const calculateScore = (guessCount, timeSeconds) => {
    // Base score based on guess count (600 points max)
    // 1 guess: 600, 2 guesses: 500, 3: 400, 4: 300, 5: 200, 6: 100
    const guessScore = Math.max(0, 700 - (guessCount * 100));
    
    // Time bonus (300 points max)
    // Under 10s: 300, 10-20s: 250, 20-30s: 200, 30-45s: 150, 45-60s: 100, 60-90s: 50, 90+s: 0
    let timeBonus = 0;
    if (timeSeconds < 10) timeBonus = 300;
    else if (timeSeconds < 20) timeBonus = 250;
    else if (timeSeconds < 30) timeBonus = 200;
    else if (timeSeconds < 45) timeBonus = 150;
    else if (timeSeconds < 60) timeBonus = 100;
    else if (timeSeconds < 90) timeBonus = 50;
    
    return guessScore + timeBonus;
  };

  const getCellColor = (guess, index) => {
    if (!guess) return 'bg-white border-2 border-gray-300';
    
    const letter = guess[index];
    const solutionLetter = solution[index];

    if (letter === solutionLetter) {
      return 'bg-green-500 border-2 border-green-600 text-white';
    } else if (solution.includes(letter)) {
      return 'bg-yellow-500 border-2 border-yellow-600 text-white';
    } else {
      return 'bg-gray-400 border-2 border-gray-500 text-white';
    }
  };

  const getDisplayLetter = (rowIndex, colIndex) => {
    if (rowIndex === currentRow) {
      return currentGuess[colIndex] || '';
    }
    return guesses[rowIndex][colIndex] || '';
  };

  const resetGame = () => {
    setSolution(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setGuesses(Array(MAX_GUESSES).fill(''));
    setCurrentGuess('');
    setCurrentRow(0);
    setGameOver(false);
    setMessage('');
    setScore(0);
    setStartTime(Date.now());
  };

  const handleKeyboardClick = (key) => {
    if (gameOver) return;

    if (key === 'ENTER') {
      handleSubmit();
    } else if (key === 'BACK') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + key);
    }
  };

  const getKeyColor = (key) => {
    let color = 'bg-gray-300';
    
    for (let i = 0; i < currentRow; i++) {
      const guess = guesses[i];
      if (!guess) continue;
      
      for (let j = 0; j < guess.length; j++) {
        if (guess[j] === key) {
          if (solution[j] === key) {
            return 'bg-green-500 text-white';
          } else if (solution.includes(key)) {
            color = 'bg-yellow-500 text-white';
          } else {
            color = 'bg-gray-500 text-white';
          }
        }
      }
    }
    
    return color;
  };

  const keyboard = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">Wordle Clone</h1>
        
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-sm text-gray-600">Current Score</div>
            <div className="text-2xl font-bold text-blue-600">{score}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Total Score</div>
            <div className="text-2xl font-bold text-green-600">{totalScore}</div>
          </div>
        </div>
        
        {message && (
          <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg text-center text-blue-800 font-semibold">
            {message}
          </div>
        )}

        <div className="mb-8 flex flex-col items-center gap-2">
          {Array(MAX_GUESSES).fill(0).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {Array(WORD_LENGTH).fill(0).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className={`w-14 h-14 flex items-center justify-center text-2xl font-bold rounded ${
                    rowIndex < currentRow
                      ? getCellColor(guesses[rowIndex], colIndex)
                      : rowIndex === currentRow
                      ? currentGuess[colIndex]
                        ? 'bg-white border-2 border-gray-500'
                        : 'bg-white border-2 border-gray-300'
                      : 'bg-white border-2 border-gray-300'
                  }`}
                >
                  {getDisplayLetter(rowIndex, colIndex)}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mb-6 flex flex-col gap-2">
          {keyboard.map((row, i) => (
            <div key={i} className="flex justify-center gap-1">
              {row.map(key => (
                <button
                  key={key}
                  onClick={() => handleKeyboardClick(key)}
                  className={`${
                    key === 'ENTER' || key === 'BACK' ? 'px-4' : 'w-10'
                  } h-12 rounded font-semibold ${getKeyColor(key)} hover:opacity-80 transition-opacity`}
                  disabled={gameOver}
                >
                  {key === 'BACK' ? '⌫' : key}
                </button>
              ))}
            </div>
          ))}
        </div>

        {gameOver && (
          <button
            onClick={resetGame}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Play Again
          </button>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Guess the 5-letter word in {MAX_GUESSES} tries</p>
          <p className="mt-2">🟩 Correct letter & position | 🟨 Correct letter, wrong position | ⬜ Wrong letter</p>
        </div>
      </div>
    </div>
  );
}