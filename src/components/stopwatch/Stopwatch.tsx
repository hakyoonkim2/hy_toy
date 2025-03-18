import { Fragment, useEffect, useRef, useState } from "react";

const StopwatchController = () => {
    const [time, setTime] = useState<number>(0);
    const [laps, setLaps] = useState<number[]>([]);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const timerRef = useRef<number | null>(null);
  
    useEffect(() => {
      if (isRunning) {
        timerRef.current = setInterval(() => {
          setTime(prev => prev + 10);
        }, 10);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
      }
  
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, [isRunning]);
  
    const formatTime = (ms: number) => {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      const milliseconds = Math.floor((ms % 1000) / 10);
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(2, "0")}`
    }
  
    const lapList = (laps: number[]) => {
      return laps.map((value, index) => (
        <Fragment key={index} >
          <div className="item">{`랩 ${laps.length - index}`}</div>
          <div className="item" id="lapTimer">
            <span>
              {formatTime(value)}
            </span>
          </div>
        </Fragment>
      )); 
    }

    const handleStartStop = () => {
      setIsRunning(prev => !prev);
    };
  
    const handleLapRest = () => {
      if (isRunning) {
        setLaps(prev => [time, ...prev]);
      } else {
        setTime(0);
        setLaps([]);
      }
    }
  
    return (
      <div className="container">
        <div className="section">
          <div id="timer">
            <span>
              {formatTime(time)}
            </span>
          </div>
        </div>
        <div className="section">
        <div className="controller">
        <div className="btn">
          <button className="btn__left" onClick={handleLapRest} disabled={!isRunning && laps.length === 0}>
            {isRunning ? "랩" : "재설정"}
          </button>
        </div>
        <div className="btn">
          <button className="btn__right" onClick={handleStartStop}>
            {isRunning ? "중단" : "시작"}
          </button>
        </div>
      </div>
        </div>
        <div className="section" id="lapContainer">
          <div className="items">
            {lapList(laps)}
          </div>
        </div>
      </div>
    );
}

export default StopwatchController;