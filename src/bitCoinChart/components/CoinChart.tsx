import React, { useContext, useEffect, useRef } from "react";
import { createChart, CandlestickSeries, IChartApi } from "lightweight-charts";
import { CoinWebSocketContext } from "../context/CoinWebSocketContext";
import style from "../style/chart.module.scss";
import { isMobile } from "../../utils/utils";

const CoinChart: React.FC<{symbol: string}> = ({symbol}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const candleData = useContext(CoinWebSocketContext);
  const seriesRef = useRef<any>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: isMobile() ? 250 : 500,
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

    // chart에 width가 number만 가능하기때문에 100%를 줄수가 없음. 따라서 resize observer를 통해 chartSize를 가변적으로 핸들링하도록 처리
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
    seriesRef.current.setData(candleData);
  }, [candleData]);

  return (
    <div className={style.chart}>
      <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }} />
    </div>
);
};

export default CoinChart;
