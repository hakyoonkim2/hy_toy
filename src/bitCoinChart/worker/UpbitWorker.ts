/// <reference lib="webworker" />
import { v4 as uuidv4 } from 'uuid';
import { PriceMap } from "./CoinCommonTypes";
import { UpbitTickerData } from "./UpbitWorkerTypes";
import { fetchUpbitAllOpenPrices } from "./UpbitWorkerUtils";
import { dataSetting } from "./WorkerUtils";

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
          setTimeout(() => connectWebSocket(false), 1000);
        }
      }
  };

  ws.onclose = () => {
    connections.forEach((port) => {
      port.postMessage('연결 끊김');
    });
  };
}

connectWebSocket(true);