import { BinanceTickerData } from '@bitCoinChart/worker/binance/type/BinanceWorkerTypes';
import { PriceMap } from '@bitCoinChart/worker/type/CoinCommonTypes';
import { UpbitRestTicker, UpbitTickerData } from '@bitCoinChart/worker/upbit/type/UpbitWorkerTypes';

let region = '';

export function dataSetting<T extends BinanceTickerData | UpbitTickerData>(
  symbolFilterArr: T[],
  priceMap: PriceMap,
  newMessageMap: PriceMap
) {
  symbolFilterArr.forEach((x) => {
    const { symbol, price: curPrice, openPrice } = getSymbolAndPrice(x);

    if (priceMap[symbol]) {
      const color = getPriceColor(priceMap[symbol].openPrice, curPrice);
      priceMap[symbol].price = curPrice;
      priceMap[symbol].color = color;
      if (openPrice) {
        priceMap[symbol].openPrice = openPrice;
      }

      // 쓰로틀링 단위 시간동안 같은 symbol데이터가 여러번 들어왔을때 반복 처리하지않고 없는 경우 포인터만 한번 연결함으로써 자동추적되도록 처리
      if (!newMessageMap[symbol]) {
        newMessageMap[symbol] = priceMap[symbol];
      }
    }
  });
}

function getSymbolAndPrice(item: BinanceTickerData | UpbitTickerData): {
  symbol: string;
  price: number;
  openPrice?: number;
} {
  if ('s' in item && 'c' in item) {
    return { symbol: item.s, price: parseFloat(item.c) }; // Binance
  } else if ('code' in item && 'trade_price' in item) {
    return {
      symbol: item.code,
      price: item.trade_price,
      openPrice: item.opening_price,
    }; // Upbit
  } else {
    throw new Error('Unknown data type');
  }
}

export function getPriceColor(openPrice: number, curPrice: number): string {
  let color = '#FFFFFF';
  if (openPrice < curPrice) {
    color = '#f75467';
  } else if (openPrice > curPrice) {
    color = '#4386f9';
  }
  return color;
}

export async function isUsCountry(): Promise<boolean> {
  if (region.length === 0) {
    try {
      const res = await fetch('https://proxy-server-flax-rho.vercel.app/api/proxy?locale=find');
      const { country } = await res.json();
      region = country;
      return country === 'US';
    } catch (error) {
      console.error('Failed to detect country from IP:', error);
      return false; // 에러 발생 시 기본적으로 차단 처리
    }
  } else {
    return region === 'US';
  }
}

function chunkMarkets(markets: string[], size: number): string[][] {
  const chunks = [];
  for (let i = 0; i < markets.length; i += size) {
    chunks.push(markets.slice(i, i + size));
  }
  return chunks;
}

async function fetchTickerChunk(markets: string[]) {
  const query = markets.join(',');
  const apiUrl = encodeURIComponent(`https://api.upbit.com/v1/ticker?markets=${query}`);

  const res = await fetch(`https://proxy-server-flax-rho.vercel.app/api/proxy?url=${apiUrl}`);
  return res.json();
}

export async function fetchAllTickers(allMarkets: string[]): Promise<UpbitRestTicker[]> {
  const chunks = chunkMarkets(allMarkets, 100);

  const allResults = await Promise.all(chunks.map(fetchTickerChunk));

  return allResults.flat();
}
