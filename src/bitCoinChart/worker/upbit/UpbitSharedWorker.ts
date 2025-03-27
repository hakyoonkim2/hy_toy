/// <reference lib="webworker" />
import { UPBIT_WEBSOCKET_URL } from '@bitCoinChart/types/CoinTypes';
import { PriceMap } from '@bitCoinChart/worker/type/CoinCommonTypes';
import { WorkerMessageEnum } from '@bitCoinChart/worker/enum/WorkerMessageEnum';
import { UpbitSymbol, UpbitTickerData } from '@bitCoinChart/worker/upbit/type/UpbitWorkerTypes';
import {
  fetchUpbitAllOpenPrices,
  getUpbitAllSymbols,
} from '@bitCoinChart/worker/upbit/util/UpbitWorkerUtils';
import {
  dataSetting,
  fetchAllTickers,
  getPriceColor,
  isUsCountry,
} from '@bitCoinChart/worker/util/WorkerUtils';
import { v4 as uuidv4 } from 'uuid';

const sharedWorkerGlobal = self as unknown as SharedWorkerGlobalScope;

const connections: MessagePort[] = [];
const priceMap: PriceMap = {};
let symbolList: UpbitSymbol[] = [];
let ws: WebSocket | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
// 쓰로틀링 처리 과정에서 priceMap 을 전체 client에서 할일이 많아지기 때문에 worker에서 변동 내역만 보내주기위함
let newMessageMap: PriceMap = {};

const connectWebSocket = () => {
  ws = new WebSocket(`${UPBIT_WEBSOCKET_URL}ticker`);

  ws.binaryType = 'arraybuffer';
  ws.onopen = () => {
    console.log('Connected');
    // websocket 실행 전에 호출해서 openPrice 세팅
    const initSocket = async () => {
      const symbols = await getUpbitAllSymbols();
      symbolList = symbols;
      connections.forEach((port) => {
        port.postMessage({ type: WorkerMessageEnum.UPBIT_SYMBOL_LIST, data: symbols });
      });
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
      dataSetting([data], priceMap, newMessageMap);
    } catch (e) {
      connections.forEach((port) => {
        port.postMessage(`upbit 데이터 정리 오류: ${e}`);
      });
    }

    if (!timer) {
      timer = setTimeout(() => {
        connections.forEach((port) => {
          port.postMessage({
            type: WorkerMessageEnum.UPBIT_SYMBOL_TRADE_DATA,
            data: newMessageMap,
          });
        });

        // messageMap 초기화하여 다음 쓰로틀 처리 이벤트까지 새로운 객체에 담음
        newMessageMap = {};
        timer = null;
      }, 300);
    }
  };

  ws.onclose = () => {
    connections.forEach((port) => {
      port.postMessage('연결 끊김');
    });
  };
};

sharedWorkerGlobal.onconnect = (event: MessageEvent) => {
  const port = event.ports[0]; // 새로 연결된 클라이언트의 포트
  connections.push(port);

  // 클라이언트에서 받은 메시지 처리
  port.onmessage = (e) => {
    console.log('Received from client:', e.data);
  };

  // 연결된 클라이언트에게 다른 클라이언트가 받아놓은 데이터가 있는 경우 priceMap을 바로 전송
  if (symbolList.length > 0) {
    port.postMessage({ type: WorkerMessageEnum.UPBIT_SYMBOL_LIST, data: symbolList });
  }
  if (Object.keys(priceMap).length > 0) {
    port.postMessage({ type: WorkerMessageEnum.UPBIT_SYMBOL_TRADE_DATA, data: priceMap });
  }

  connections.forEach((port) => {
    port.postMessage('유저가 추가됨');
  });

  port.start(); // 반드시 start() 호출해야 메시지 전송 가능
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

  connections.forEach((port) => {
    port.postMessage({
      type: WorkerMessageEnum.UPBIT_SYMBOLS_RESTAPI_TRADE_DATA,
      data: priceMap,
    });
  });
};

const startPolling = (markets: string[], intervalMs: number = 300) => {
  // 초기 1회 설정
  fetchAndBroadCast(markets);

  setInterval(() => {
    fetchAndBroadCast(markets);
  }, intervalMs);
};

const initWorker = async () => {
  const isUsIp = await isUsCountry();

  // 미국에서 websocket 접속이 차단되기 때문에 RestApi만 사용하여 우회
  if (!isUsIp) {
    connectWebSocket();
  } else {
    const symbols = await getUpbitAllSymbols();
    connections.forEach((port) => {
      port.postMessage({ type: WorkerMessageEnum.UPBIT_SYMBOL_LIST, data: symbols });
    });
    await fetchUpbitAllOpenPrices(priceMap, symbols);
    const allMarkets = Object.keys(priceMap);
    startPolling(allMarkets);
  }
};

initWorker();
