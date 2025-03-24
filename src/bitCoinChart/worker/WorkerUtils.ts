import { BINANCE_URL, BINANCE_US_URL } from '../types/CoinTypes';
import { BinanceTickerData } from './binance/BinanceWorkerTypes';
import { PriceMap } from './CoinCommonTypes';
import { UpbitRestTicker, UpbitTickerData } from './upbit/UpbitWorkerTypes';

export function dataSetting<T extends BinanceTickerData | UpbitTickerData>(
  symbolFilterArr: T[],
  priceMap: PriceMap
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

export async function findIpContry(): Promise<boolean> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const { country_code } = await res.json();
    return country_code !== 'US';
  } catch (error) {
    console.error('Failed to detect country from IP:', error);
    return false; // 에러 발생 시 기본적으로 차단 처리
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

export async function getBinanaceUrlFromRegion() {
  const isNotUsIp = await findIpContry();
  return isNotUsIp ? BINANCE_URL : BINANCE_US_URL;
}
