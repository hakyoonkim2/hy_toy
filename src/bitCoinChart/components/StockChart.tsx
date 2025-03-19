import React, { useContext, useEffect, useRef } from "react";
import { createChart, CandlestickSeries, IChartApi } from "lightweight-charts";
import { CoinWebSocketContext } from "../context/CoinWebSocketContext";

const StockChart: React.FC<{symbol: string}> = ({symbol}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const candleData = useContext(CoinWebSocketContext);
  const seriesRef = useRef<any>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: "#181818" },
        textColor: "#FFFFFF",
      },
      grid: {
        vertLines: { color: "#333" },
        horzLines: { color: "#333" },
      },
      timeScale: {
        timeVisible: true,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          
          return new Intl.DateTimeFormat("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            timeZone: "Asia/Seoul",
          }).format(date);
        }
      }
    });

    const series = chart.addSeries(CandlestickSeries);
    series.applyOptions({priceFormat:{precision: 4, minMove:0.0001}});
    seriesRef.current = series;
    chartRef.current = chart;

    // chart에 width가 number만 가능하기때문에 100%를 줄수가 없음. 까라서 resize observer를 통해 chartSize를 가변적으로 핸들링하도록 처리
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect) {
          chart.applyOptions({
            width: entry.contentRect.width,
          });
        }
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      chart.remove();
    };
  }, [symbol]);

  useEffect(() => {
    // ✅ 5.x 버전에서는 addSeries() 사용
    seriesRef.current.setData(candleData);
  }, [candleData]);

  return (
    <div style={{ width: "50%", height: "100%" }}>
      <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }} />
    </div>
);
};

export default StockChart;
