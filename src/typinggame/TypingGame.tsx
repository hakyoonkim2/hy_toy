import { useEffect, useRef, useState } from 'react';
import style from '@typinggame/TypingGame.module.scss';
import { isMobile } from 'react-device-detect';

type FallingChar = {
  id: number;
  text: string;
  top: number;
  left: number;
  speed: number;
  isRemoving?: boolean;
};

const containerWidth = 300;
const containerHeight = isMobile ? 400 : 500;
const charWidth = 20;
const initialHealth = 100;
const baseScorePerHit = 20;

export default function TypingGame() {
  const [chars, setChars] = useState<FallingChar[]>([]);
  const [health, setHealth] = useState(initialHealth);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);
  const idRef = useRef(0);
  const [spawnInterval, setSpawnInterval] = useState(1000);
  const [shake, setShake] = useState(false);
  const [scoreBump, setScoreBump] = useState(false);
  const [lastCombo, setLastCombo] = useState(0);

  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      setChars((prev) => {
        const updated = prev.map((c) => ({ ...c, top: c.top + c.speed }));
        const stillFalling = updated.filter((c) => {
          if (c.top >= containerHeight - 24 && !c.isRemoving) {
            setHealth((prevHealth) => {
              const newHealth = prevHealth - 5;
              setShake(true);
              setTimeout(() => setShake(false), 300);
              if (newHealth <= 0) setIsGameOver(true);
              return newHealth;
            });
            setCombo(0);
            return false;
          }
          return true;
        });
        return stillFalling;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isGameOver]);

  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      const additional: FallingChar[] = [];
      for (let i = 0; i < Math.floor((speedBonus * 15 + 3) / 3); i++) {
        additional.push({
          id: idRef.current++,
          text: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
          top: 0,
          left: Math.random() * (containerWidth - charWidth),
          speed: 2 + Math.random() * 2 + speedBonus,
        });
      }
      setChars((prev) => [...prev, ...additional]);
    }, spawnInterval);

    return () => clearInterval(interval);
  }, [isGameOver, speedBonus, spawnInterval]);

  const handleCorrectKey = (key: string) => {
    setChars((prev) => {
      const index = prev.findIndex((c) => c.text === key && !c.isRemoving);
      if (index !== -1) {
        const newList = [...prev];
        newList[index] = { ...newList[index], isRemoving: true };
        setCombo((prevCombo) => {
          const newCombo = prevCombo + 1;
          const bonus = Math.floor(newCombo / 10);
          const scoreToAdd = baseScorePerHit + bonus;

          setScore((prevScore) => {
            const newScore = prevScore + scoreToAdd;

            setScoreBump(true);
            setTimeout(() => setScoreBump(false), 200);

            if (Math.floor(newScore / 500) > Math.floor(prevScore / 500)) {
              setSpeedBonus((prev) => prev + 0.1);
              setSpawnInterval((prev) => Math.max(prev - 20, 200));
            }

            return newScore;
          });

          setLastCombo(newCombo);
          return newCombo;
        });
        return newList;
      } else {
        setHealth((prevHealth) => {
          const newHealth = prevHealth - 3;
          if (newHealth <= 0) setIsGameOver(true);
          return newHealth;
        });
        setCombo(0);
        setShake(true);
        setTimeout(() => setShake(false), 300);
        return prev;
      }
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      const code = e.code;
      if (!/^Key[A-Z]$/.test(code)) return;

      const key = code.replace('Key', '');
      handleCorrectKey(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver]);

  useEffect(() => {
    const timeout = setInterval(() => {
      setChars((prev) => prev.filter((c) => !c.isRemoving || c.top < containerHeight));
    }, 500);
    return () => clearInterval(timeout);
  }, []);

  const handleVirtualKeyPress = (key: string) => {
    if (isGameOver) return;
    handleCorrectKey(key);
  };

  const restartGame = () => {
    setChars([]);
    setHealth(initialHealth);
    setIsGameOver(false);
    setScore(0);
    setCombo(0);
    setSpeedBonus(0);
    setSpawnInterval(1000);
    setLastCombo(0);
  };

  return (
    <div className={`${style.wrapper} ${shake ? style.shake : ''}`}>
      <div
        className={style.gameScreen}
        style={{
          width: `${containerWidth}px`,
          height: `${containerHeight}px`,
          position: 'relative',
        }}
      >
        <div className={style.scoreBox}>
          <p className={scoreBump ? style.bump : ''}>Score: {score}</p>
          <p>Combo: {combo}</p>
        </div>

        {combo > 0 && combo % 10 === 0 && combo !== lastCombo && (
          <div key={combo} className={style.comboPop}>
            {combo} Combo!
          </div>
        )}

        {chars.map((c) => (
          <div
            key={c.id}
            className={`${style.char} ${c.isRemoving ? style.explode : ''}`}
            style={{
              top: c.top,
              left: c.left,
              position: 'absolute',
            }}
          >
            {c.text}
          </div>
        ))}

        <div className={style.healthBarContainer}>
          <div className={style.healthBar} style={{ width: `${(health / 100) * 100}%` }}></div>
        </div>

        {isGameOver && (
          <div className={style.gameOverOverlay}>
            <p>Game Over</p>
            <button onClick={restartGame} className={style.restartButton}>
              Restart
            </button>
          </div>
        )}
      </div>

      <div className={style.keyboard}>
        {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, rowIndex) => (
          <div key={rowIndex} className={style.keyboardRow}>
            {row.split('').map((char) => (
              <button
                key={char}
                className={style.keyButton}
                onClick={() => handleVirtualKeyPress(char)}
              >
                {char}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
