import { CandlestickData, Time } from "lightweight-charts";
import { Subscriber, TradingData } from "../types/CoinTypes";

/**
 * @symbol 코인 거래 종목
 * @subscriber CoinWebSocketContext의 state를 처리
 */
class CoinWebSocketManager {
    private symbol: string;
    private subscribers: Set<Subscriber>;
    private data: CandlestickData[];
    private ws: WebSocket | null;

    constructor(symbol: string = "BTCUSDT") {
        this.symbol = symbol;
        this.subscribers = new Set();
        this.data = [];
        this.ws = null;
        this.init();
    }

    // WebSocket 초기화
    private init(): void {
        // kline 정보 가져오는 url
        // const wsUrl = `wss://stream.binance.com:9443/ws/${this.symbol.toLowerCase()}@kline_${this.interval}`;
        // 실시간 trading 정보가져오는 url
        const wsUrl = `wss://stream.binance.com:9443/ws/${this.symbol.toLowerCase()}@trade`;
        // const wsUrl = `wss://stream.binance.com:9443/ws/!ticker@arr`;

        // init 상황에서 이전 웹소켓이 있는경우 close
        if (this.ws) this.closeAll();

        const ws = new WebSocket(wsUrl);
        this.ws = ws;

        ws.onmessage = (event: MessageEvent) => {
            const json = JSON.parse(event.data);

            const tradingData: TradingData = {
                time: Math.floor(Number(json.T)/1000) as Time,
                price: parseFloat(json.p)
            }
            
            // 마지막 저장되어있는 정보를 가져와서 시간을 분석한뒤 같은 경우 데이터 업데이트, 다를경우 push
            const lastData = this.data[this.data.length - 1];
            if (lastData?.time === tradingData.time) {
                // close: 현재 거래 가격 (다음 시간대 일경우 마지막 거래 금액으로 표기됨)
                lastData.close = tradingData.price;
            
                // 현재 가격이 이전 고가보다 높으면 갱신
                if (lastData.high < tradingData.price) {
                    lastData.high = tradingData.price;
                }

                // 현재가격이 이전 저가보다 낮으면 갱신
                if (lastData.low > tradingData.price) {
                    lastData.low = tradingData.price;
                }
            } else {
                // 데이터 저장
                // 시작데이터이므로 시가, 고가, 저가, 종가를 모두 현재가격으로 세팅
                const newCandle: CandlestickData = {
                    time: tradingData.time,
                    open: tradingData.price,
                    high: tradingData.price,
                    low: tradingData.price,
                    close: tradingData.price,
                };

                this.data.push(newCandle);
            }

            // 구독자들에게 데이터 업데이트 알림
            this.notifySubscribers();
        };

        // 웹소켓 종료시 재연결 로직, 1초이하 간격으로 데이터를 받아오므로 ping/pong message 는 필요없음
        ws.onclose = () => {
            console.log(`${this.symbol} WebSocket 종료됨. 3초 후 재연결...`);
            setTimeout(() => {
                this.closeAll();
                this.init();
            }, 3000);
        };
    }

    // 데이터 변경 시 구독자들에게 알림
    private notifySubscribers(): void {
        this.subscribers.forEach((callback) => callback([...this.data]));
    }

    // 구독 함수 (차트에서 데이터 가져올 때 사용)
    public subscribe(callback: Subscriber): void {
        this.subscribers.add(callback);
        callback(this.data); // 초기 데이터 제공
    }

    // 구독 취소 함수
    public unsubscribe(callback: Subscriber): void {
        this.subscribers.delete(callback);
    }

    // WebSocket 연결 해제 (컴포넌트 unmount 시)
    public closeAll(): void {
        this.ws?.close();
        this.ws = null;
    }
}

export default CoinWebSocketManager;
