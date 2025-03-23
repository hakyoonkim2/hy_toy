/// <reference lib="webworker" />
import { v4 as uuidv4 } from 'uuid';
import { PriceMap } from "./CoinCommonTypes";
import { UpbitTickerData } from "./UpbitWorkerTypes";
import { fetchUpbitAllOpenPrices } from "./UpbitWorkerUtils";
import { dataSetting } from "./WorkerUtils";

const sharedWorkerGlobal = self as unknown as SharedWorkerGlobalScope;

const connections: MessagePort[] = [];
const priceMap: PriceMap = {};
let ws: WebSocket| null = null;
let initDone: boolean = false;
let symbolCount: number = 0;

const connectWebSocket = (isInit: boolean) => {
  ws = new WebSocket('wss://api.upbit.com/websocket/v1/ticker');

  ws.binaryType = 'arraybuffer';
  ws.onopen = () => {
    console.log('Connected');
    // websocket 실행 전에 호출해서 openPrice 세팅
    fetchUpbitAllOpenPrices(priceMap).then(() => {
      const msg = [
        { ticket: uuidv4() },
        {
          type: 'ticker',
          codes: Object.keys(priceMap),
          is_only_snapshot: isInit,
        },
      ];
      
      ws?.send(JSON.stringify(msg));
    });
  };

  ws.onmessage = (event) => { 
    const enc = new TextDecoder('utf-8');
    const jsonStr = enc.decode(event.data);
    const data = JSON.parse(jsonStr) as UpbitTickerData;
      try {
        dataSetting([data], priceMap);
      } catch (e) {
        connections.forEach((port) => {
          port.postMessage('upbit 데이터 정리 오류');
        });
      }

      connections.forEach((port) => {
        port.postMessage({type: 'UpbitsymbolData', data: {...priceMap[data.code], symbol: data.code}});
      });

      if (initDone === false) {
        symbolCount++;
        if (symbolCount === Object.keys(priceMap).length) {
          initDone = true;
          ws?.close();
          connectWebSocket(false);
        }
      }
  };

  ws.onclose = () => {
    connections.forEach((port) => {
      port.postMessage('연결 끊김');
    });
  };
}

sharedWorkerGlobal.onconnect = (event: MessageEvent) => {
  const port = event.ports[0]; // 새로 연결된 클라이언트의 포트
  connections.push(port);

  // 클라이언트에서 받은 메시지 처리
  port.onmessage = (e) => {
    console.log("Received from client:", e.data);
  };

  // 연결된 클라이언트에게 다른 클라이언트가 받아놓은 데이터가 있는 경우 priceMap을 바로 전송
    if (Object.keys(priceMap).length > 0) {
      port.postMessage({type: 'symbolData', data: priceMap});
    }

    connections.forEach((port) => {
      port.postMessage('유저가 추가됨');
    });

  port.start(); // 반드시 start() 호출해야 메시지 전송 가능
};

connectWebSocket(true);