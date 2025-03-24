import { useQuery } from '@tanstack/react-query';
import { CurrentPriceData } from '../types/CoinTypes';

const useUpbitSymbolData = (symbol: string) => {
  const newSymbol = symbol.replace('USDT', '');
  return useQuery<CurrentPriceData | null>({
    queryKey: ['symbol', `KRW-${newSymbol}`],
    queryFn: async () => null,
    initialData: null,
    staleTime: Infinity, // worker를 통해 수동으로 적재하므로 staleTime을 높게 설정
  });
};

export default useUpbitSymbolData;
