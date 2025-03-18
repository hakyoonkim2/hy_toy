import { Fragment, useEffect, useRef, useState } from "react";

/**
 * 스탑워치 구현
 */
const StopwatchController = () => {
    const [time, setTime] = useState<number>(0);
    const [laps, setLaps] = useState<number[]>([]);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const timerRef = useRef<number | null>(null);
  
    // running 상황이면 interval 실행
    useEffect(() => {
      if (isRunning) {
        timerRef.current = setInterval(() => {
          setTime(prev => prev + 10);
        }, 10);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
      }
  
      // cleanup
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, [isRunning]);
  
    // time format 변환 (단위 : 밀리초)
    const formatTime = (ms: number) => {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      const milliseconds = Math.floor((ms % 1000) / 10);
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(2, "0")}`
    }
  
    // 랩 설정될때마다 추가
    const lapList = (laps: number[]) => {
      return laps.map((value, index) => (
        // key값은 value로 처리 (타이머는 시간순으로 올라가므로 중복이 될 수 없음)
        <Fragment key={value} >
          <div className="item">{`랩 ${laps.length - index}`}</div>
          <div className="item" id="lapTimer">
            <span>
              {formatTime(value)}
            </span>
          </div>
        </Fragment>
      )); 
    }

    // 시작 혹은 종료
    const handleStartStop = () => {
      setIsRunning(prev => !prev);
    };
  
    // 리셋 버튼 핸들링
    const handleLapRest = () => {
      if (isRunning) {
        setLaps(prev => [time, ...prev]);
      } else {
        setTime(0);
        setLaps([]);
      }
    }
  
    return (
      <div className="stopwatch">
        <div id="timer">
          <span>
            {formatTime(time)}
          </span>
        </div>
        <button className="btn__left" onClick={handleLapRest} disabled={!isRunning && laps.length === 0}>
          {isRunning ? "랩" : "재설정"}
        </button>
        <button className="btn__right" onClick={handleStartStop}>
          {isRunning ? "중단" : "시작"}
        </button>
        <div className="section" id="lapContainer">
          <div className="items">
            {lapList(laps)}
          </div>
        </div>
      </div>
    );
}

export default StopwatchController;