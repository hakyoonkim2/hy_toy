import { dataSetting, fetchAllOpenPrices, wsUrl } from "./WorkerUtils";

// shared-worker.js
const connections = [];
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
        connections.forEach((port) => {
          port.postMessage('데이터 정리 오류');
        });
      }

      connections.forEach((port) => {
        port.postMessage({type: 'symbolData', data: priceMap});
      });
  };

  ws.onclose = (event) => {
    connections.forEach((port) => {
      port.postMessage('연결 끊김');
    });
  };
}

self.onconnect = (event) => {
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

self.onclose = (event) => {
  connections.forEach((port) => {
    port.postMessage('연결 끊김');
  });
}

connectWebSocket();