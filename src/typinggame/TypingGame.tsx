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

export default function TypingGame() {
  const [chars, setChars] = useState<FallingChar[]>([]);
  const idRef = useRef(0);

  // 글자 떨어뜨리는 루프
  useEffect(() => {
    const interval = setInterval(() => {
      setChars((prev) =>
        prev
          .map((c) => ({ ...c, top: c.top + c.speed }))
          .filter((c) => c.top < containerHeight - 24 || c.isRemoving)
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // 랜덤 글자 생성
  useEffect(() => {
    const interval = setInterval(() => {
      const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
      setChars((prev) => [
        ...prev,
        {
          id: idRef.current++,
          text: letter,
          top: 0,
          left: Math.random() * (containerWidth - charWidth), // container 내부 기준 위치
          speed: 2 + Math.random() * 2,
        },
      ]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 키 입력 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;

      // KeyA ~ KeyZ 만 처리
      if (!/^Key[A-Z]$/.test(code)) return;

      const key = code.replace('Key', '');

      setChars((prev) => {
        const index = prev.findIndex((c) => c.text === key && !c.isRemoving);
        if (index !== -1) {
          const newList = [...prev];
          newList[index] = { ...newList[index], isRemoving: true };
          return newList;
        }
        return prev;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 애니메이션 후 제거
  useEffect(() => {
    const timeout = setInterval(() => {
      setChars((prev) => prev.filter((c) => !c.isRemoving || c.top < containerHeight));
    }, 500);
    return () => clearInterval(timeout);
  }, []);

  // 가상 키보드에서 클릭한 문자 처리 함수
  const handleVirtualKeyPress = (key: string) => {
    setChars((prev) => {
      const index = prev.findIndex((c) => c.text === key && !c.isRemoving);
      if (index !== -1) {
        const newList = [...prev];
        newList[index] = { ...newList[index], isRemoving: true };
        return newList;
      }
      return prev;
    });
  };

  return (
    <div className={style.wrapper}>
      <div
        className={style.gameScreen}
        style={{
          width: `${containerWidth}px`,
          height: `${containerHeight}px`,
        }}
      >
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
      </div>
      {/* QWERTY 키보드 하단 UI */}
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
