import { CurrentPriceData } from '@bitCoinChart/types/CoinTypes';
import { useQuery } from '@tanstack/react-query';

export const useBinanceSymbolData = (symbol: string) => {
  return useQuery<CurrentPriceData | null>({
    queryKey: ['symbol', symbol],
    queryFn: async () => null,
    initialData: null,
    staleTime: Infinity, // worker를 통해 수동으로 적재하므로 staleTime을 높게 설정
  });
};
