import React, { useEffect, useRef } from "react";
import style from "../style/chart.module.scss"
import { isMobile } from "react-device-detect";

/**
 * tradingView 차트 위젯을 통해 차트 구성
 */
type TradingViewChartProps = {
  symbol: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          container_id: "tradingview_chart",
          width: "100%",
          height: isMobile ? "250px" :"500px",
          symbol: `BINANCE:${symbol}`,
          interval: "1",
          timezone: "Asia/Seoul",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          save_image: false,
        });
      }
    };
    
    containerRef.current.appendChild(script);
  }, [symbol]);

  return (
    <div className={style.chart}>
      <div id="tradingview_chart" ref={containerRef}></div>
    </div>
  );
};

export default TradingViewChart;
