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

interface CoinImage {
  id: string;
  symbol: string;
  name: string;
  image: string;
}

export const useSymbolImage = (symbolList: string[]) => {
  const symbolListParam = symbolList.join(',');
  return useQuery({
    queryKey: ['symbol', 'images', symbolListParam],
    enabled: symbolList.length > 0,
    queryFn: async () => {
      const results: CoinImage[][] = [];

      const res = await fetch(
        `https://proxy-server-flax-rho.vercel.app/api/proxy?icon=${symbolListParam}`
      );
      const data = await res.json();
      results.push(data);
      const map = new Map();

      results.forEach((symbolDataArr: CoinImage[]) => {
        symbolDataArr.forEach((symbolData: CoinImage) => {
          map.set(symbolData.symbol, symbolData.image);
        });
      });

      return map;
    },
    staleTime: Infinity, // worker를 통해 수동으로 적재하므로 staleTime을 높게 설정
    gcTime: Infinity,
  });
};
