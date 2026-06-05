"use client";

import React, { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import { VALID_WORDS } from './words';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzc_J5FWm9-pKXfenwIyyvzdRJ3v1GPqsyr5VaAD1Fq54Ear4NVMrfcikHv6qxSVitWpg/exec";
const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

type Screen = 'login' | 'game' | 'end';

export default function WordlePage() {
  const [screen, setScreen] = useState<Screen>('login');
  const [teamName, setTeamName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Dynamic Target Word State
  const [targetWord, setTargetWord] = useState('MALTY');
  const [hintText, setHintText] = useState('Describes an ale with a sweet, biscuit-like flavor derived from barley.');

  // Game State
  const [guesses, setGuesses] = useState<string[]>(Array(MAX_GUESSES).fill(''));
  const [currentGuessIndex, setCurrentGuessIndex] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Keyboard state
  const [keyColors, setKeyColors] = useState<Record<string, string>>({});

  // Load word on mount
  useEffect(() => {
    fetch('/api/wordle')
      .then(res => res.json())
      .then(data => {
        if (data.word) setTargetWord(data.word.toUpperCase().trim());
        if (data.hint) setHintText(data.hint);
      })
      .catch(err => console.warn("Could not load word config from server", err));
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  const attemptLogin = () => {
    if (!teamName.trim()) {
      setErrorMsg("Please enter a team name.");
      return;
    }
    setErrorMsg('');
    setScreen('game');
  };

  const calculateScore = (attempts: number) => {
    const points = [100, 80, 60, 40, 20, 10];
    return points[attempts] || 0;
  };

  const submitGuess = useCallback((guess: string) => {
    // Update keyboard colors
    const newKeyColors = { ...keyColors };
    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = guess[i];
      if (targetWord[i] === letter) {
        newKeyColors[letter] = styles.keyCorrect;
      } else if (targetWord.includes(letter) && newKeyColors[letter] !== styles.keyCorrect) {
        newKeyColors[letter] = styles.keyPresent;
      } else if (!targetWord.includes(letter)) {
        newKeyColors[letter] = styles.keyAbsent;
      }
    }
    setKeyColors(newKeyColors);

    // Check Win/Loss
    if (guess === targetWord) {
      setGameStatus('won');
      endGame(true, currentGuessIndex);
    } else if (currentGuessIndex === MAX_GUESSES - 1) {
      setGameStatus('lost');
      endGame(false, currentGuessIndex);
    } else {
      setCurrentGuessIndex(prev => prev + 1);
    }
  }, [keyColors, targetWord, currentGuessIndex]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameStatus !== 'playing') return;

    if (key === 'BACKSPACE' || key === 'DELETE') {
      setGuesses(prev => {
        const newGuesses = [...prev];
        newGuesses[currentGuessIndex] = newGuesses[currentGuessIndex].slice(0, -1);
        return newGuesses;
      });
      return;
    }

    if (key === 'ENTER') {
      const currentGuess = guesses[currentGuessIndex];
      if (currentGuess.length !== WORD_LENGTH) {
        showToast("Not enough letters");
        setShakeRow(currentGuessIndex);
        setTimeout(() => setShakeRow(null), 500);
        return;
      }
      
      if (!VALID_WORDS.has(currentGuess.toLowerCase())) {
        showToast("Not in word list");
        setShakeRow(currentGuessIndex);
        setTimeout(() => setShakeRow(null), 500);
        return;
      }

      // Process valid guess
      submitGuess(currentGuess);
      return;
    }

    if (/^[A-Z]$/.test(key)) {
      setGuesses(prev => {
        const currentGuess = prev[currentGuessIndex];
        if (currentGuess.length < WORD_LENGTH) {
          const newGuesses = [...prev];
          newGuesses[currentGuessIndex] = currentGuess + key;
          return newGuesses;
        }
        return prev;
      });
    }
  }, [guesses, currentGuessIndex, gameStatus, submitGuess]);

  const endGame = async (won: boolean, attempts: number) => {
    const finalScore = won ? calculateScore(attempts) : 0;
    setScore(finalScore);
    setScreen('end');
    
    setIsSaving(true);
    try {
      // 1. Google Sheets sync (legacy support)
      fetch(`${SCRIPT_URL}?action=saveScore&teamName=${encodeURIComponent(teamName)}&score=${finalScore}&t=${Date.now()}`, { mode: 'no-cors' });
      
      // 2. Local Database sync (instant scores rendering)
      await fetch('/api/wordle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName, score: finalScore })
      });

      setIsSaving(false);
    } catch (err) {
      console.error(err);
      setIsSaving(false); // Fails gracefully
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleKeyPress(e.key.toUpperCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  // Render Grid
  const renderGrid = () => {
    return guesses.map((guess, rowIndex) => {
      const isCurrentRow = rowIndex === currentGuessIndex;
      const isSubmitted = rowIndex < currentGuessIndex || gameStatus !== 'playing';
      
      const tiles = Array(WORD_LENGTH).fill('').map((_, colIndex) => {
        const letter = guess[colIndex] || '';
        let tileClass = styles.tile;
        
        if (letter && isCurrentRow) {
          tileClass = `${styles.tile} ${styles.tileActive}`;
        }

        if (isSubmitted && letter) {
          if (targetWord[colIndex] === letter) tileClass = `${styles.tile} ${styles.tileCorrect}`;
          else if (targetWord.includes(letter)) tileClass = `${styles.tile} ${styles.tilePresent}`;
          else tileClass = `${styles.tile} ${styles.tileAbsent}`;
        }

        return (
          <div key={colIndex} className={tileClass}>
            {letter}
          </div>
        );
      });

      return (
        <div key={rowIndex} className={`${styles.row} ${shakeRow === rowIndex ? styles.shake : ''}`}>
          {tiles}
        </div>
      );
    });
  };

  const renderKeyboard = () => {
    const rows = [
      ['Q','W','E','R','T','Y','U','I','O','P'],
      ['A','S','D','F','G','H','J','K','L'],
      ['ENTER','Z','X','C','V','B','N','M','BACKSPACE']
    ];

    return rows.map((row, i) => (
      <div key={i} className={styles.keyRow}>
        {row.map(key => {
          const isLarge = key === 'ENTER' || key === 'BACKSPACE';
          const colorClass = keyColors[key] || '';
          return (
            <button
              key={key}
              className={`${styles.key} ${isLarge ? styles.keyLarge : ''} ${colorClass}`}
              onClick={() => handleKeyPress(key)}
            >
              {key === 'BACKSPACE' ? '⌫' : key}
            </button>
          );
        })}
      </div>
    ));
  };

  return (
    <div className={`page-container animate-fade-in ${styles.container}`}>
      {toastMsg && <div className={styles.toast}>{toastMsg}</div>}

      {screen === 'login' && (
        <div className="section-card" style={{ maxWidth: '400px', margin: '40px auto', width: '100%' }}>
          <h1 className="section-card__title" style={{ textAlign: 'center', borderBottom: 'none' }}>🍻 Pub Wordle</h1>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px' }}>Daily cask ale anagram challenge.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Team Name</label>
              <input 
                type="text" 
                value={teamName} 
                onChange={e => setTeamName(e.target.value)} 
                placeholder="THE BREWERS"
                onKeyDown={(e) => e.key === 'Enter' && attemptLogin()}
                style={{ textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}
              />
            </div>
            {errorMsg && <div className="notice notice--error" style={{ padding: '8px' }}>{errorMsg}</div>}
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>⚠️ One entry per team.</p>
            <button className="btn btn--primary btn--full" onClick={attemptLogin}>Start Game</button>
          </div>
        </div>
      )}

      {screen === 'game' && (
        <div className="section-card" style={{ maxWidth: '500px', margin: '20px auto', padding: '32px 20px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '16px' }}>WORDLE</h1>
          <div className="notice notice--warning" style={{ marginBottom: '24px', textAlign: 'center', width: '100%' }}>
            <strong>Hint:</strong> {hintText}
          </div>
          <div className={styles.grid}>{renderGrid()}</div>
          <div className={styles.keyboard}>{renderKeyboard()}</div>
        </div>
      )}

      {screen === 'end' && (
        <div className="section-card" style={{ maxWidth: '400px', margin: '40px auto', width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: gameStatus === 'won' ? 'var(--success-text)' : 'var(--error-text)', marginBottom: '12px' }}>
            {gameStatus === 'won' ? 'FINISHED!' : 'GAME OVER'}
          </h1>
          {gameStatus === 'lost' && <p style={{ color: 'var(--text-color)', marginBottom: '20px', fontSize: '1.1rem' }}>The word was <strong>{targetWord}</strong></p>}
          
          <div className="stat-box" style={{ margin: '24px 0' }}>
            <div className="stat-label">Points Scored</div>
            <div className="stat-value">{score}</div>
          </div>
          
          <p style={{ color: isSaving ? 'var(--text-muted)' : 'var(--success-text)', fontWeight: 'bold' }}>
            {isSaving ? 'Saving result...' : 'Result saved! ✅'}
          </p>
        </div>
      )}
    </div>
  );
}
