import { CandlestickData, Time } from "lightweight-charts";

export const BINANCE_URL = 'wss://stream.binance.com:9443/ws/';

export type Subscriber = (data: CandlestickData[]) => void;

export type TradingData = {
    price: number,
    time: Time,
}

export type CurrentPriceData = {
    price: number,
    color: string,
    openPrice: number,
}