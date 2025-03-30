// hooks/useCharSpawner.ts
import { FallingChar } from '@typinggame/types/TypingGameTypes';
import { useEffect } from 'react';

type Props = {
  isGameOver: boolean;
  speedBonus: number;
  spawnInterval: number;
  setChars: React.Dispatch<React.SetStateAction<FallingChar[]>>;
  idRef: React.MutableRefObject<number>;
  containerWidth: number;
};

/**
 * 문자열 스폰 관리 custom hook
 */
const useCharSpawner = ({
  isGameOver,
  speedBonus,
  spawnInterval,
  setChars,
  idRef,
  containerWidth,
}: Props) => {
  const charWidth = 20;

  // 문자열 생성 로직
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
};

export default useCharSpawner;
