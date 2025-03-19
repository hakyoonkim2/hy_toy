import React, { useEffect, useRef } from "react";

/**
 * tradingView 차트 위젯을 통해 차트 구성
 */
const TradingViewChart: React.FC<{symbol: string}> = ({symbol}) => {
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
          height: "500px",
          symbol: `BINANCE:${symbol}`,
          interval: "1",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: true,
          save_image: false,
        });
      }
    };

    containerRef.current.appendChild(script);
  }, [symbol]);

  return (
    <div style={{ width: "50%", height: "100%" }}>
      <div id="tradingview_chart" ref={containerRef} style={{ width: "100%", height: "500px" }}></div>
    </div>
  );
};

export default TradingViewChart;
