import { BinanceTickerData } from './BinanceWorkerTypes';
import { fetchBinanceAllOpenPrices } from './BinanceWorkerUtils';
import { dataSetting, isUsCountry } from '../WorkerUtils';
import { BINANCE_WEBSOCKET_URL, BINANCE_WEBSOCKET_US_URL } from '../../types/CoinTypes';
import { WorkerMessageEnum } from '../enum/WorkerMessageEnum';
import { PriceMap } from '../CoinCommonTypes';

const priceMap: PriceMap = {};
let ws = null;
let timer: number | null = null;
// 쓰로틀링 처리 과정에서 priceMap 을 전체 client에서 할일이 많아지기 때문에 worker에서 변동 내역만 보내주기위함
let newMessageMap: PriceMap = {};

// websocket 실행 전에 호출해서 openPrice 세팅
fetchBinanceAllOpenPrices(priceMap);

const connectWebSocket = (url: string) => {
  ws = new WebSocket(url);

  ws.onmessage = (event) => {
    const json = JSON.parse(event.data) as BinanceTickerData[];
    const symbolFilterArr = Array.from(json).filter((x) => x.s.includes('USDT'));
    try {
      dataSetting(symbolFilterArr, priceMap, newMessageMap);
    } catch (e) {
      self.postMessage(`데이터 정리 오류: ${e}`);
    }
    if (!timer) {
      timer = setTimeout(() => {
        self.postMessage({ type: WorkerMessageEnum.BINANCE_SYMBOLS_DATA, data: newMessageMap });

        // messageMap 초기화하여 다음 쓰로틀 처리 이벤트까지 새로운 객체에 담음
        newMessageMap = {};
        timer = null;
      }, 300);
    }
  };

  ws.onclose = () => {
    self.postMessage('연결 끊김');
  };
};

self.onmessage = () => {};

const initWorker = async () => {
  const isUsIp = await isUsCountry();

  // 미국에서 websocket 접속이 차단되기 때문에 RestApi만 사용하여 우회
  if (isUsIp) {
    connectWebSocket(`${BINANCE_WEBSOCKET_US_URL}!ticker@arr`);
  } else {
    connectWebSocket(`${BINANCE_WEBSOCKET_URL}!ticker@arr`);
  }
};
initWorker();
