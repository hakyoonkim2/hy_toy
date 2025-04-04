import { UpbitCandleChartData, UpbitCandleData } from '@bitCoinChart/types/CoinTypes';
import { Time } from 'lightweight-charts';

export const fetchUpbitCandles = async (
  symbol: string,
  timerInterval: string,
  unit?: number,
  toTime?: number,
  signal?: AbortSignal
): Promise<UpbitCandleChartData[]> => {
  const krwSymbol = 'KRW-' + symbol.replace('USDT', '');

  let toTimePram = '';

  if (toTime) {
    const iso = new Date(toTime).toISOString();
    toTimePram = `&to=${iso}`;
  }

  const apiUrl = encodeURIComponent(
    `https://api.upbit.com/v1/candles/${timerInterval}${unit ? '/' + unit : ''}?market=${krwSymbol}&count=200${toTimePram}`
  );

  const res = await fetch(`https://proxy-server-flax-rho.vercel.app/api/proxy?url=${apiUrl}`, {
    signal: signal,
  });

  if (!res.ok) {
    throw new Error('Failed to fetch candle data');
  }
  const data: UpbitCandleData[] = await res.json();

  const getVolumeColor = (open: number, close: number) => {
    if (open >= close) {
      return 'rgba(211, 38, 52, 0.6)';
    } else {
      return 'rgba(10, 73, 215, 0.6)';
    }
  };

  const candleStickData = data.map((candleData) => {
    return {
      // 초단위로 사용
      time: Math.floor(candleData.timestamp / 1000) as Time,
      open: candleData.opening_price,
      high: candleData.high_price,
      low: candleData.low_price,
      close: candleData.trade_price,
      customValues: {
        volume: candleData.candle_acc_trade_volume,
        color: getVolumeColor(candleData.opening_price, candleData.trade_price),
      },
    };
  });
  return candleStickData.reverse();
};
