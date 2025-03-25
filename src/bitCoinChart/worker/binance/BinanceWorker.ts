import { BinanceTickerData } from './BinanceWorkerTypes';
import { fetchBinanceAllOpenPrices } from './BinanceWorkerUtils';
import { dataSetting, isUsCountry } from '../WorkerUtils';
import { BINANCE_WEBSOCKET_URL, BINANCE_WEBSOCKET_US_URL } from '../../types/CoinTypes';
import { WorkerMessageEnum } from '../enum/WorkerMessageEnum';

const priceMap = {};
let ws = null;

// websocket 실행 전에 호출해서 openPrice 세팅
fetchBinanceAllOpenPrices(priceMap);

const connectWebSocket = (url: string) => {
  ws = new WebSocket(url);

  ws.onmessage = (event) => {
    const json = JSON.parse(event.data) as BinanceTickerData[];
    const symbolFilterArr = Array.from(json).filter((x) => x.s.includes('USDT'));
    try {
      dataSetting(symbolFilterArr, priceMap);
    } catch (e) {
      self.postMessage(`데이터 정리 오류: ${e}`);
    }
    self.postMessage({ type: WorkerMessageEnum.BINANCE_SYMBOLS_DATA, data: priceMap });
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
