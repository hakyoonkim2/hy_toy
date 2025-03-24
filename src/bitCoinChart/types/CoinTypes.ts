import { CandlestickData, Time } from 'lightweight-charts';

export const BINANCE_URL = 'wss://stream.binance.com:9443/ws/';
export const BINANCE_US_URL = 'wss://stream.binance.us:9443/ws/';

export type Subscriber = (data: CoinManagerData) => void;

export type TradingData = {
  price: number;
  time: Time;
};

export type CurrentPriceData = {
  price: number;
  color: string;
  openPrice: number;
};

export type TradeHistory = {
  id: number;
  price: number;
  mount: number;
  maker: boolean;
  time: number;
};

export type CoinManagerData = {
  candleData: CandlestickData[];
  tradeHistory: TradeHistory[];
};
