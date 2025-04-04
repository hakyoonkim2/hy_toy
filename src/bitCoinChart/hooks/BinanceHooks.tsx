import { CurrentPriceData } from '@bitCoinChart/types/CoinTypes';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

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

export const useSymbolImages = (symbolList: string[]) => {
  const queryClient = useQueryClient();
  const symbolListParam = symbolList.map((symbol) => symbol.replace('USDT', '')).join(',');

  useEffect(() => {
    const fetchImages = async () => {
      if (symbolList.length === 0) return;

      const results: CoinImage[] = [];

      const res = await fetch(
        `https://proxy-server-flax-rho.vercel.app/api/proxy?icon=${symbolListParam}`
      );
      const data = await res.json();
      results.push(...data);
      const map = new Map<string, string>();

      results.forEach((symbolData: CoinImage) => {
        map.set(symbolData.symbol, symbolData.image);
        // react-query에 캐시로 저장 (key: ['symbolImage', symbol])
        queryClient.setQueryData(
          ['symbolImage', symbolData.symbol.toLowerCase()],
          symbolData.image
        );
      });

      queryClient.setQueryData(['symbolImages'], map);
    };

    fetchImages();
  }, [symbolList, queryClient]);

  const imageMap = queryClient.getQueryData<Map<string, string>>(['symbolImages']) || new Map();

  return { data: imageMap };
};
