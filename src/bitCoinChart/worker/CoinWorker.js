import { dataSetting, fetchAllOpenPrices, wsUrl } from "./WorkerUtils";

// shared-worker.js
const priceMap = {};
let ws = null;

// websocket 실행 전에 호출해서 openPrice 세팅
fetchAllOpenPrices(priceMap);


const connectWebSocket = () => {
  ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => { 
      const json = JSON.parse(event.data);
      const symbolFilterArr = Array.from(json).filter(x => x.s.includes("USDT"));
      try {
        dataSetting(symbolFilterArr, priceMap);
      } catch (e) {
          self.postMessage('데이터 정리 오류');
      }
      self.postMessage({type: 'symbolData', data: priceMap});
  };

  ws.onclose = (event) => {
    self.postMessage('연결 끊김');
  };
}

self.onmessage = (event) => {
};

connectWebSocket();