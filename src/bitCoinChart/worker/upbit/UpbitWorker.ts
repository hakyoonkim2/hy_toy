import { v4 as uuidv4 } from 'uuid';
import { PriceMap } from '../CoinCommonTypes';
import { UpbitTickerData } from './UpbitWorkerTypes';
import { fetchUpbitAllOpenPrices, getUpbitAllSymbols } from './UpbitWorkerUtils';
import { dataSetting, fetchAllTickers, isUsCountry, getPriceColor } from '../WorkerUtils';
import { UPBIT_WEBSOCKET_URL } from '../../types/CoinTypes';
import { WorkerMessageEnum } from '../enum/WorkerMessageEnum';

const priceMap: PriceMap = {};
let ws: WebSocket | null = null;

const connectWebSocket = () => {
  ws = new WebSocket(`${UPBIT_WEBSOCKET_URL}ticker`);

  ws.binaryType = 'arraybuffer';
  ws.onopen = () => {
    console.log('Connected');
    // websocket 실행 전에 호출해서 openPrice 세팅
    const initSocket = async () => {
      const symbols = await getUpbitAllSymbols();
      self.postMessage({ type: WorkerMessageEnum.UPBIT_SYMBOL_LIST, data: symbols });
      fetchUpbitAllOpenPrices(priceMap, symbols).then(() => {
        const msg = [
          { ticket: uuidv4() },
          {
            type: 'ticker',
            codes: Object.keys(priceMap),
          },
        ];

        ws?.send(JSON.stringify(msg));
      });
    };
    initSocket();
  };

  ws.onmessage = (event) => {
    const enc = new TextDecoder('utf-8');
    const jsonStr = enc.decode(event.data);
    const data = JSON.parse(jsonStr) as UpbitTickerData;
    try {
      dataSetting([data], priceMap);
    } catch (e) {
      self.postMessage(`upbit 데이터 정리 오류: ${e}`);
    }

    self.postMessage({
      type: WorkerMessageEnum.UPBIT_SYMBOL_TRADE_DATA,
      data: { ...priceMap[data.code], symbol: data.code },
    });
  };

  ws.onclose = () => {
    self.postMessage('연결 끊김');
  };
};

const fetchAndBroadCast = (markets: string[]) => {
  fetchAllTickers(markets).then((res) => {
    res.forEach((data) => {
      const target = priceMap[data.market];
      target.openPrice = data.opening_price;
      target.price = data.trade_price;
      target.color = getPriceColor(data.opening_price, data.trade_price);
    });
  }); // 초기 1회

  self.postMessage({
    type: WorkerMessageEnum.UPBIT_SYMBOLS_RESTAPI_TRADE_DATA,
    data: priceMap,
  });
};

const startPolling = (markets: string[], intervalMs: number = 1000) => {
  // 초기 1회 설정
  fetchAndBroadCast(markets);

  setInterval(() => {
    fetchAndBroadCast(markets);
  }, intervalMs);
};

const initWorker = async () => {
  const isUsIp = await isUsCountry();

  // 미국에서 websocket 접속이 차단되기 때문에 RestApi만 사용하여 우회
  if (isUsIp) {
    connectWebSocket();
  } else {
    const symbols = await getUpbitAllSymbols();
    self.postMessage({ type: WorkerMessageEnum.UPBIT_SYMBOL_LIST, data: symbols });
    await fetchUpbitAllOpenPrices(priceMap, symbols);
    const allMarkets = Object.keys(priceMap);
    startPolling(allMarkets);
  }
};

initWorker();
