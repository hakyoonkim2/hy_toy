import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, IChartApi, ISeriesApi, HistogramSeries } from 'lightweight-charts';
import style from '../style/chart.module.scss';
import { isMobile } from 'react-device-detect';
import { useUpbitCandle } from '../hooks/UpbitHooks';
import CandleSelector, { CandleType } from './CandleSelector';

type CoinChartProps = {
  symbol: string;
};

/**
 * symbol을 전달받아 symbol기준으로 1초단위 차트를 생성하는 로직
 * @returns
 */
const UpbitCoinChart: React.FC<CoinChartProps> = ({ symbol }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [candleInterval, setCandleInterval] = useState<number>(1);
  const [candleType, setCandleType] = useState<CandleType>('minutes');
  const unit = ['seconds', 'days', 'weeks', 'months', 'years'].includes(candleType);
  const { data } = useUpbitCandle(symbol, candleType, unit ? undefined : candleInterval);
  const seriesRef = useRef<ISeriesApi<'Candlestick'>>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'>>(null);
  const candleTypeRef = useRef<CandleType>('minutes');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 차트 생성 lightweight-charts 를 사용
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: isMobile ? 250 : 500,
      layout: {
        background: { color: 'rgb(13, 13, 13)' },
        textColor: 'rgb(190, 190, 190)',
      },
      grid: {
        vertLines: { color: 'rgb(15, 20 , 27)' },
        horzLines: { color: 'rgb(15, 20 , 27)' },
      },
      timeScale: {
        timeVisible: true,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time);
          switch (candleTypeRef.current) {
            case 'seconds':
            case 'minutes':
              return new Intl.DateTimeFormat('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              }).format(date);
            case 'days':
            case 'weeks':
              return new Intl.DateTimeFormat('ko-KR', {
                month: '2-digit',
                day: '2-digit',
              }).format(date);
            case 'months':
            case 'years':
              return new Intl.DateTimeFormat('ko-KR', {
                year: 'numeric',
                month: '2-digit',
              }).format(date);
            default:
              return date.toLocaleString();
          }
        },
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#d32634',           // 양봉 바디 색상
      downColor: '#135ce7',         // 음봉 바디 색상
      borderUpColor: '#d32634',
      borderDownColor: '#135ce7',
      wickUpColor: '#d32634',       //  양봉 꼬리 색상
      wickDownColor: '#135ce7',     //  음봉 꼬리 색상
    });
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
          type: 'volume',
      },
      priceScaleId: '',
  });
    series.priceScale().applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0.15,
    },
    })
    series.applyOptions({ priceFormat: { precision: 0, minMove: 1 } });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.7, // 차트 아래 20% 공간 사용
        bottom: 0,
      }
    })
    seriesRef.current = series;
    chartRef.current = chart;
    volumeSeriesRef.current = volumeSeries;
    chart.timeScale().fitContent();

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
    if (data) {
      seriesRef.current?.setData(data);
      volumeSeriesRef.current?.setData(data.map(x => {
        return {value: x.customValues.volume, time: x.time, color: x.customValues.color};
      }));
    }
  }, [data]);

  const onChange = (type: CandleType, unit: number) => {
    setCandleType(type);
    setCandleInterval(unit);
    candleTypeRef.current = type;
  }

  return (
    <div style={{width: '100%', height: '100%'}}>
        <div className={style.chart}>
            <div ref={chartContainerRef} />
            <CandleSelector  onChange={onChange}/>
        </div>
    </div>
  );
};

export default UpbitCoinChart;
