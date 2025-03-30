import useCharSpawner from '@typinggame/hooks/useCharSpawner';
import { FallingChar } from '@typinggame/types/TypingGameTypes';
import { useEffect, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';

/**
 * TypingGame의 전체적인 데이터를 관리하는 custom hook
 */
const useTypingGame = () => {
  const [chars, setChars] = useState<FallingChar[]>([]); // 떨어지는 문자열들
  const [health, setHealth] = useState(100); // 체력
  const [isGameOver, setIsGameOver] = useState(false); // 게임오버
  const [score, setScore] = useState(0); // 점수
  const [combo, setCombo] = useState(0); // 콤보
  const [speedBonus, setSpeedBonus] = useState(0); // 스피드 난이도
  const idRef = useRef(0); // id 를 중복없이 주기위한 ref
  const [spawnInterval, setSpawnInterval] = useState(1000); // 문자열 생성 주기 난이도
  const [shake, setShake] = useState(false); // 흔들리는 효과
  const [scoreBump, setScoreBump] = useState(false); // 점수 효과
  const containerHeight = isMobile ? 400 : 500; // 게임창 화면 높이
  const containerWidth = 300; // 게임 화면 너비
  const initialHealth = 100; // 초기 체력
  const baseScorePerHit = 20; // 기본 점수
  const [currentKey, setcurrentKey] = useState<string>('');

  // 문자열 스폰 관리 hook 호출
  useCharSpawner({ isGameOver, speedBonus, spawnInterval, setChars, idRef, containerWidth });

  // 키 입력 처리 함수
  const processKeyPress = (key: string) => {
    setcurrentKey(key);
    setChars((prev) => {
      const index = prev.findIndex((c) => c.text === key && !c.isRemoving);
      if (index !== -1) {
        const idToRemove = prev[index].id;
        const newList = [...prev];
        newList[index] = { ...newList[index], isRemoving: true };

        // 제거 예약 (애니메이션 후 제거)
        setTimeout(() => {
          setChars((curr) => curr.filter((c) => c.id !== idToRemove));
        }, 400);

        // 콤보처리 로직
        setCombo((prevCombo) => {
          const newCombo = prevCombo + 1;
          const bonus = Math.floor(newCombo / 10);
          const scoreToAdd = baseScorePerHit + bonus;

          setScore((prevScore) => {
            const newScore = prevScore + scoreToAdd;

            setScoreBump(true);
            setTimeout(() => setScoreBump(false), 200);

            // 난이도 설정 로직
            if (Math.floor(newScore / 500) > Math.floor(prevScore / 500)) {
              setSpeedBonus((prev) => prev + 0.1);
              setSpawnInterval((prev) => Math.max(prev - 20, 200));
            }

            return newScore;
          });

          return newCombo;
        });
        return newList;
      } else {
        // 잘못 입력된 경우 처리
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

  // 문자열 떨어지는 모션 관리
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

  // 이벤트 핸들러 추가 focus안되도 처리할수있도록 window에 핸들러 추가
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      const code = e.code;
      if (!/^Key[A-Z]$/.test(code)) return;

      const key = code.replace('Key', '');
      processKeyPress(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver]);

  // 끝까지 이동한 대상 제거
  useEffect(() => {
    if (isGameOver) return;
    const timeout = setInterval(() => {
      setChars((prev) => prev.filter((c) => c.top < containerHeight));
    }, 500);
    return () => clearInterval(timeout);
  }, [isGameOver]);

  // 게임초기화
  const restartGame = () => {
    setChars([]);
    setHealth(initialHealth);
    setIsGameOver(false);
    setScore(0);
    setCombo(0);
    setSpeedBonus(0);
    setSpawnInterval(1000);
    setcurrentKey('');
  };

  // 가상 키보드 입력 핸들러
  const handleVirtualKeyPress = (key: string) => {
    if (isGameOver) return;
    processKeyPress(key);
  };

  return {
    chars,
    health,
    isGameOver,
    score,
    combo,
    scoreBump,
    spawnInterval,
    shake,
    handleVirtualKeyPress,
    restartGame,
    containerHeight,
    containerWidth,
    currentKey,
  };
};

export default useTypingGame;
