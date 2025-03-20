// shared-worker.js
const connections = [];
const priceMap = {};
const wsUrl = `wss://stream.binance.com:9443/ws/!ticker@arr`;
let ws = null;
let resultData = null;

const connectWebSocket = () => {
  console.log('실행완료');
    ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
        const json = JSON.parse(event.data);
        connections.forEach((port) => {
          port.postMessage(json);
        });
        const symbolFilterArr = Array.from(json).filter(x => x.s.includes("USDT"));
        
        // 변경이 있는 데이터만 전송해주므로 따로 효율화 할 필요 없음
        symbolFilterArr.forEach(x => {
          let color = '#FFFFFF';
            if (priceMap[x.s] > x.o) {
              color = "#f75467";
            } else if (priceMap[x.s] < x.o) {
              color = "#4386f9";
            }
            priceMap[x.s] = {price: parseFloat(x.c).toString(), color: color};
        });

        connections.forEach((port) => {
          port.postMessage(priceMap);
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

  console.log("새로운 클라이언트 연결됨. 총 클라이언트 수:", connections.length);

  // 클라이언트에서 받은 메시지 처리
  port.onmessage = (e) => {
    console.log("Received from client:", e.data);

    // 모든 연결된 클라이언트에게 메시지 브로드캐스트
    connections.forEach((clientPort) => {
      clientPort.postMessage(`서버에서 받은 메시지: ${e.data}`);
    });
  };

  // 연결된 클라이언트에게 초기 메시지 전송
    port.postMessage(JSON.stringify(resultData));

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