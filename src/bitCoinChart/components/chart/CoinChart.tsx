import React, { useContext, useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, IChartApi, ISeriesApi } from 'lightweight-charts';
import style from '@bitCoinChart/style/chart.module.scss';
import { isMobile } from 'react-device-detect';
import { CoinWebSocketContext } from '@bitCoinChart/context/CoinWebSocketContext';

type CoinChartProps = {
  symbol: string;
};

/**
 * symbol을 전달받아 symbol기준으로 1초단위 차트를 생성하는 로직
 * @returns
 */
const CoinChart: React.FC<CoinChartProps> = ({ symbol }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const managerData = useContext(CoinWebSocketContext);
  const seriesRef = useRef<ISeriesApi<'Candlestick'>>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 차트 생성 lightweight-charts 를 사용
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: isMobile ? 250 : 500,
      layout: {
        background: { color: '#181818' },
        textColor: '#FFFFFF',
      },
      grid: {
        vertLines: { color: '#333' },
        horzLines: { color: '#333' },
      },
      timeScale: {
        timeVisible: true,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);

          return new Intl.DateTimeFormat('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'Asia/Seoul',
          }).format(date);
        },
      },
    });

    const series = chart.addSeries(CandlestickSeries);
    series.applyOptions({ priceFormat: { precision: 4, minMove: 0.0001 } });
    seriesRef.current = series;
    chartRef.current = chart;

    // chart에 width가 number만 가능하기때문에 100%를 줄수가 없음. 따라서 resize observer를 통해 chartSize를 가변적으로 핸들링하도록 처리
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          chart.applyOptions({
            width: entry.contentRect.width,
          });
        }
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    // cleanup chart, resizeObserver
    return () => {
      chart.remove();
      resizeObserver.disconnect();
    };
  }, [symbol]);

  useEffect(() => {
    seriesRef.current?.setData(managerData.candleData);
  }, [managerData]);

  return (
    <div className={style.chart}>
      <div ref={chartContainerRef} />
    </div>
  );
};

export default CoinChart;
