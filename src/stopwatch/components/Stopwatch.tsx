import { useEffect, useRef, useState } from 'react';
import style from '@stopwatch/style/Stopwatch.module.scss';

/**
 * 스탑워치 구현
 */
const StopWatch = () => {
  const [time, setTime] = useState<number>(0);
  const [laps, setLaps] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // running 상황이면 interval 실행
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    // cleanup
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // time format 변환 (단위 : 밀리초)
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
  };

  // 랩 설정될때마다 추가
  const lapList = (laps: number[]) => {
    return laps.map((value, index) => (
      // key값은 value로 처리 (타이머는 시간순으로 올라가므로 중복이 될 수 없음)
      <div key={value} className={style.item}>
        <div>{`랩 ${laps.length - index}`}</div>
        <div id="lapTimer">
          <span>{formatTime(value)}</span>
        </div>
      </div>
    ));
  };

  // 시작 혹은 종료
  const handleStartStop = () => {
    setIsRunning((prev) => !prev);
  };

  // 리셋 버튼 핸들링
  const handleLapReset = () => {
    if (isRunning) {
      setLaps((prev) => [time, ...prev]);
    } else {
      setTime(0);
      setLaps([]);
    }
  };

  return (
    <div className={style.stopwatch}>
      <div id="timer">{formatTime(time)}</div>
      <div className={style.buttonGroup}>
        <button
          className={style.btn}
          onClick={handleLapReset}
          disabled={!isRunning && laps.length === 0}
        >
          {isRunning ? '랩' : '재설정'}
        </button>
        <button className={style.btn} onClick={handleStartStop}>
          {isRunning ? '중단' : '시작'}
        </button>
      </div>
      <div className={style.section}>
        <div className={style.items}>{lapList(laps)}</div>
      </div>
    </div>
  );
};

export default StopWatch;
