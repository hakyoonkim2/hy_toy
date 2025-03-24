/// <reference lib="webworker" />
import { v4 as uuidv4 } from 'uuid';
import { PriceMap } from '../CoinCommonTypes';
import { UpbitSymbol, UpbitTickerData } from './UpbitWorkerTypes';
import { fetchUpbitAllOpenPrices, getUpbitAllSymbols } from './UpbitWorkerUtils';
import { dataSetting, fetchAllTickers, getPriceColor, isUsCountry } from '../WorkerUtils';

const sharedWorkerGlobal = self as unknown as SharedWorkerGlobalScope;

const connections: MessagePort[] = [];
const priceMap: PriceMap = {};
let symbolList: UpbitSymbol[] = [];
let ws: WebSocket | null = null;

const connectWebSocket = () => {
  ws = new WebSocket('wss://api.upbit.com/websocket/v1/ticker');

  ws.binaryType = 'arraybuffer';
  ws.onopen = () => {
    console.log('Connected');
    // websocket 실행 전에 호출해서 openPrice 세팅
    const initSocket = async () => {
      const symbols = await getUpbitAllSymbols();
      symbolList = symbols;
      connections.forEach((port) => {
        port.postMessage({ type: 'upbit_symbol_list', data: symbols });
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
      dataSetting([data], priceMap);
    } catch (e) {
      connections.forEach((port) => {
        port.postMessage(`upbit 데이터 정리 오류: ${e}`);
      });
    }

    connections.forEach((port) => {
      port.postMessage({
        type: 'UpbitsymbolData',
        data: { ...priceMap[data.code], symbol: data.code },
      });
    });
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
    port.postMessage({ type: 'upbit_symbol_list', data: symbolList });
  }
  if (Object.keys(priceMap).length > 0) {
    port.postMessage({ type: 'UpbitsymbolData', data: priceMap });
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
      type: 'UpbitRestsymbolData',
      data: priceMap,
    });
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
    connections.forEach((port) => {
      port.postMessage({ type: 'upbit_symbol_list', data: symbols });
    });
    await fetchUpbitAllOpenPrices(priceMap, symbols);
    const allMarkets = Object.keys(priceMap);
    startPolling(allMarkets);
  }
};

initWorker();
