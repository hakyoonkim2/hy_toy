import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickSeries,
  IChartApi,
  ISeriesApi,
  HistogramSeries,
  IRange,
  Time,
  MouseEventParams,
} from 'lightweight-charts';
import style from '../style/chart.module.scss';
import { isMobile } from 'react-device-detect';
import { fetchUpbitCandles, useUpbitCandle } from '../hooks/UpbitHooks';
import CandleSelector from './CandleSelector';
import { CandleType, UpbitCandleChartData } from '../types/CoinTypes';
import { getPreviousTime } from '../utils/util';

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
  const [candleType, setCandleType] = useState<CandleType>('days');
  const unit = ['seconds', 'days', 'weeks', 'months', 'years'].includes(candleType);
  const { data } = useUpbitCandle(symbol, candleType, unit ? undefined : candleInterval);
  const seriesRef = useRef<ISeriesApi<'Candlestick'>>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'>>(null);
  const candleTypeRef = useRef<CandleType>('days');
  const isFetchingOldData = useRef<boolean>(false);
  const hasMoreOldData = useRef<boolean>(true);
  const [oldData, setOldData] = useState<UpbitCandleChartData[]>([]);
  const requestOldParamSet = useRef<Set<string>>(new Set());

  // candle chart 는 초단위로 시간이 세팅되어있어 1000을 곱함 (ms 단위 X)
  const timeFormatCallback = (time: number) => {
    const date = new Date(time * 1000); // time이 ms 단위라면 그대로 사용

    const formatUTC = (options: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat('ko-KR', {
        ...options,
        timeZone: 'Asia/Seoul', // 브라우저 로컬 시간 말고 UTC 기준으로
      }).format(date);

    switch (candleTypeRef.current) {
      case 'seconds':
      case 'minutes':
        return formatUTC({
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
      case 'days':
      case 'weeks':
        return formatUTC({
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
        });
      case 'months':
      case 'years':
        return formatUTC({
          year: '2-digit',
          month: '2-digit',
        });
      default:
        return formatUTC({
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
    }
  };

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
      rightPriceScale: {
        autoScale: true,
      },
      timeScale: {
        secondsVisible: false,
        timeVisible: false,
        tickMarkFormatter: timeFormatCallback,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#d32634', // 양봉 바디 색상
      downColor: '#135ce7', // 음봉 바디 색상
      borderUpColor: '#d32634',
      borderDownColor: '#135ce7',
      wickUpColor: '#d32634', //  양봉 꼬리 색상
      wickDownColor: '#135ce7', //  음봉 꼬리 색상
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
    });
    series.applyOptions({ priceFormat: { precision: 0, minMove: 1 } });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.7, // 차트 아래 20% 공간 사용
        bottom: 0,
      },
    });
    seriesRef.current = series;
    chartRef.current = chart;
    volumeSeriesRef.current = volumeSeries;

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
      // symbol이 변한 경우에 clear해야하는것들
      chart.remove();
      resizeObserver.disconnect();
      requestOldParamSet.current.clear();
      seriesRef.current?.setData([]);
      volumeSeriesRef.current?.setData([]);
      setOldData([]);
      hasMoreOldData.current = true;
      isFetchingOldData.current = false;
    };
  }, [symbol]);

  useEffect(() => {
    if (!chartRef.current || !seriesRef.current) return;

    const chart = chartRef.current;

    const handleCrosshairMove = (param: MouseEventParams<Time>) => {
      if (!param.time || !param.seriesData) return;
      return timeFormatCallback(param.time as number);
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
    };
  }, [candleType]); // candleType이 바뀌면 다시 적용

  const fetchOldCandles = async (
    symbol: string,
    timerInterval: string,
    unit: number | undefined,
    toTime: number,
    signal: AbortSignal
  ) => {
    try {
      const oldCandles = await fetchUpbitCandles(symbol, timerInterval, unit, toTime, signal);
      if (oldCandles.length > 0) {
        oldCandles.pop();
        setOldData((prev) => [...oldCandles, ...prev]);
      } else {
        hasMoreOldData.current = false;
      }
    } catch (error) {
      console.error(error);
      requestOldParamSet.current.delete(toTime.toString());
    } finally {
      isFetchingOldData.current = false;
    }
  };

  useEffect(() => {
    if (data) {
      const mergeData = [...oldData, ...data];

      const uniqueSorted = Array.from(
        new Map(mergeData.map((item) => [item.time, item])).values()
      ).sort((a, b) => Number(a.time) - Number(b.time));

      seriesRef.current?.setData(uniqueSorted);
      volumeSeriesRef.current?.setData(
        uniqueSorted.map((x) => {
          return { value: x.customValues.volume, time: x.time, color: x.customValues.color };
        })
      );
    }
  }, [data, oldData]);

  useEffect(() => {
    let abortController: AbortController | null = null;

    const callback = (newRange: IRange<Time> | null) => {
      if (newRange && data && hasMoreOldData.current) {
        const firstData = data[0];
        if (newRange.from === firstData.time || (oldData[0] && newRange.from === oldData[0].time)) {
          if (
            !isFetchingOldData.current &&
            !requestOldParamSet.current.has(newRange.from.toString())
          ) {
            isFetchingOldData.current = true;
            abortController = new AbortController();
            const toTime = getPreviousTime(
              Number(newRange.from) * 1000,
              candleType,
              candleInterval
            );
            fetchOldCandles(
              symbol,
              candleType,
              unit ? undefined : candleInterval,
              toTime,
              abortController.signal
            );
            requestOldParamSet.current.add(toTime.toString());
          }
        }
      }
    };

    chartRef.current?.timeScale().subscribeVisibleTimeRangeChange(callback);

    return () => {
      if (abortController) abortController.abort();
      chartRef.current?.timeScale().unsubscribeVisibleTimeRangeChange(callback);
    };
  }, [candleType, candleInterval, data, oldData]);

  const onChange = (type: CandleType, unit: number) => {
    // 새로 데이터 주입
    setCandleType(type);
    setCandleInterval(unit);
    candleTypeRef.current = type;

    // 기존 데이터 처리
    setOldData([]);
    seriesRef.current?.setData([]);
    hasMoreOldData.current = true;
    isFetchingOldData.current = false;
    requestOldParamSet.current.clear();
    chartRef.current?.timeScale().resetTimeScale();
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div className={style.chart}>
        <div ref={chartContainerRef} />
        <CandleSelector onChange={onChange} />
      </div>
    </div>
  );
};

export default UpbitCoinChart;
