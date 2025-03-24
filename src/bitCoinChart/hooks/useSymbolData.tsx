import { useQuery } from '@tanstack/react-query';
import { CurrentPriceData } from '../types/CoinTypes';

const useSymbolData = (symbol: string) => {
  return useQuery<CurrentPriceData | null>({
    queryKey: ['symbol', symbol],
    queryFn: async () => null,
    initialData: null,
    staleTime: Infinity, // worker를 통해 수동으로 적재하므로 staleTime을 높게 설정
  });
};

export default useSymbolData;
