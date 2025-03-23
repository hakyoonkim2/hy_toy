import { BinanceTickerData } from "./BinanceWorkerTypes";
import { PriceMap } from "./CoinCommonTypes";
import { UpbitTickerData } from "./UpbitWorkerTypes";

export function dataSetting<T extends BinanceTickerData | UpbitTickerData>(symbolFilterArr: T[], priceMap: PriceMap) {
    symbolFilterArr.forEach(x => {
      const { symbol, price: curPrice, openPrice } = getSymbolAndPrice(x);

      if (priceMap[symbol]) {
        let color = '#FFFFFF';
        if (priceMap[symbol].openPrice < curPrice) {
          color = "#f75467";
        } else if (priceMap[symbol].openPrice > curPrice) {
          color = "#4386f9";
        }
        priceMap[symbol].price = curPrice;
        priceMap[symbol].color = color;
        if (openPrice) {
          priceMap[symbol].openPrice = openPrice;
        }
      }
    });
}

function getSymbolAndPrice(item: BinanceTickerData | UpbitTickerData): { symbol: string, price: number, openPrice?: number } {
  if ('s' in item && 'c' in item) {
    return { symbol: item.s, price: parseFloat(item.c) }; // Binance
  } else if ('code' in item && 'trade_price' in item) {
    return { symbol: item.code, price: item.trade_price, openPrice: item.opening_price }; // Upbit
  } else {
    throw new Error('Unknown data type');
  }
}