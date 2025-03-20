import { CandlestickData, Time } from "lightweight-charts";

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