import { useQuery } from '@tanstack/react-query';
import { CurrentPriceData, UpbitCandleData } from '../types/CoinTypes';
import { Time } from 'lightweight-charts';

export const useUpbitSymbolData = (symbol: string) => {
  const newSymbol = symbol.replace('USDT', '');
  return useQuery<CurrentPriceData | null>({
    queryKey: ['symbol', `KRW-${newSymbol}`],
    queryFn: async () => null,
    initialData: null,
    staleTime: Infinity, // worker를 통해 수동으로 적재하므로 staleTime을 높게 설정
  });
};

const fetchCandle = async (symbol: string, timerInterval: string, unit?: number) => {
  const krwSymbol = 'KRW-'+ symbol.replace('USDT', '');
  const apiUrl = encodeURIComponent(`https://api.upbit.com/v1/candles/${timerInterval}${unit ? '/'+ unit : ''}?market=${krwSymbol}&count=200`);
  const res = await fetch(`https://proxy-server-flax-rho.vercel.app/api/proxy?url=${apiUrl}`);

  if (!res.ok) {
    throw new Error("Failed to fetch candle data");
  }
  const data: UpbitCandleData[] = await res.json();

  const getVolumeColor = (open: number, close: number) => {
    if (open >= close) {
      return 'rgba(211, 38, 52, 0.6)';
    } else {
      return 'rgba(10, 73, 215, 0.6)';
    }
  }

  const candleStickData = data.map(candleData => {
    
    return {
      time: candleData.timestamp as Time,
      open: candleData.opening_price,
      high: candleData.high_price,
      low: candleData.low_price,
      close: candleData.trade_price,
      customValues: {
        volume: candleData.candle_acc_trade_volume,
        color: getVolumeColor(candleData.opening_price, candleData.trade_price),
      }
    }
  });
  return candleStickData.reverse();
};

export const useUpbitCandle = (symbol: string, timerInterval: string, unit?: number) => {
  return useQuery({
    queryKey: ["upbit", "candle", symbol, timerInterval, unit],
    queryFn: () => fetchCandle(symbol, timerInterval, unit),
    refetchInterval: 300,
    staleTime: 0,
  });
};