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

export const useSymbolImage = () => {
  return useQuery({
    queryKey: ['symbol', 'images'],
    queryFn: async () => {
      const results: CoinImage[][] = [];
      let count = 1;

      while (count <= 3) {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=250&page=${count}`
        );
        count++;
        const data = await res.json();
        results.push(data);

        // 너무 빠르게 연속 호출되지 않도록 약간 딜레이 (coingecko too many request 회피 목적으로 의도적으로 딜레이)
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

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
