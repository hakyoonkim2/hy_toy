/// <reference lib="webworker" />

import { BinanceTickerData } from './BinanceWorkerTypes';
import { fetchBinanceAllOpenPrices, wsUrl } from './BinanceWorkerUtils';
import { dataSetting, isUsCountry } from '../WorkerUtils';

const sharedWorkerGlobal = self as unknown as SharedWorkerGlobalScope;

const connections: MessagePort[] = [];
const priceMap = {};
let ws = null;

// websocket 실행 전에 호출해서 openPrice 세팅
fetchBinanceAllOpenPrices(priceMap);

const connectWebSocket = (url?: string) => {
  ws = new WebSocket(url ?? wsUrl);

  ws.onmessage = (event) => {
    const json = JSON.parse(event.data) as BinanceTickerData[];
    const symbolFilterArr: BinanceTickerData[] = Array.from(json).filter((x: BinanceTickerData) =>
      x.s.includes('USDT')
    );
    try {
      dataSetting(symbolFilterArr, priceMap);
    } catch (e) {
      connections.forEach((port) => {
        port.postMessage(`데이터 정리 오류: ${e}`);
      });
    }

    connections.forEach((port) => {
      port.postMessage({ type: 'symbolData', data: priceMap });
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
  if (Object.keys(priceMap).length > 0) {
    port.postMessage({ type: 'symbolData', data: priceMap });
  }

  connections.forEach((port) => {
    port.postMessage('유저가 추가됨');
  });

  port.start(); // 반드시 start() 호출해야 메시지 전송 가능
};

const initWorker = async () => {
  const isUsIp = await isUsCountry();

  // 미국에서 websocket 접속이 차단되기 때문에 RestApi만 사용하여 우회
  if (isUsIp) {
    connectWebSocket('wss://stream.binance.us:9443/ws/!ticker@arr');
  } else {
    connectWebSocket();
  }
};
initWorker();
