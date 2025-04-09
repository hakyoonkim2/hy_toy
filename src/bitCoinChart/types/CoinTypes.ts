import { Timestamp } from 'firebase/firestore';
import { CandlestickData, Time } from 'lightweight-charts';

export const BINANCE_WEBSOCKET_URL = 'wss://stream.binance.com:9443/ws/';
export const BINANCE_WEBSOCKET_US_URL = 'wss://stream.binance.us:9443/ws/';
export const UPBIT_WEBSOCKET_URL = 'wss://api.upbit.com/websocket/v1/';

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

export type UpbitCandleData = {
  candle_acc_trade_price: number;
  candle_acc_trade_volume: number;
  candle_date_time_kst: string;
  candle_date_time_utc: string;
  high_price: number;
  low_price: number;
  market: string;
  opening_price: number;
  timestamp: number;
  trade_price: number;
  unit: number;
};

export type UpbitCandleChartData = {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  customValues: {
    volume: number;
    color: string;
  };
};

export type CandleType = 'seconds' | 'minutes' | 'days' | 'weeks' | 'months' | 'years';

export type Order = {
  docId: string;
  symbol: string;
  price: string;
  amount: string;
  filledAmount: string;
  side: 'buy' | 'sell';
  timestamp: Timestamp;
};

export type Holding = {
  symbol: string;
  price: string;
  amount: string;
};

export type Wallet = {
  cash: string;
};
