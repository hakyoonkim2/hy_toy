import { fetchUpbitCandles } from '@bitCoinChart/api/UpbitApi';
import { CurrentPriceData } from '@bitCoinChart/types/CoinTypes';
import { useQuery } from '@tanstack/react-query';

export const useUpbitSymbolData = (symbol: string) => {
  const newSymbol = symbol.replace('USDT', '');
  return useQuery<CurrentPriceData | null>({
    queryKey: ['symbol', `KRW-${newSymbol}`],
    queryFn: async () => null,
    initialData: null,
    staleTime: Infinity, // worker를 통해 수동으로 적재하므로 staleTime을 높게 설정
  });
};

/**
 *
 * @param symbol 종목정보
 * @param timerInterval 캔들 종류 초, 분, 일, 주, 월, 년
 * @param unit 종류 별 시간 구분 없는 캔들 종류별 없는 경우도 있음
 * @returns
 */
export const useUpbitCandle = (symbol: string, timerInterval: string, unit?: number) => {
  return useQuery({
    queryKey: ['upbit', 'candle', symbol, timerInterval, unit],
    queryFn: () => fetchUpbitCandles(symbol, timerInterval, unit),
    refetchInterval: 300,
    staleTime: 0,
  });
};
