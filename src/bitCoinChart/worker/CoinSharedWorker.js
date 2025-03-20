// shared-worker.js
const connections = [];
const priceMap = {};
const wsUrl = `wss://stream.binance.com:9443/ws/!ticker@arr`;
let ws = null;
let resultData = null;
let fillOpenPrice = false;

const BINANCE_API_URL = "https://api.binance.com/api/v3";

// 1. 모든 종목 리스트 가져오기 (USDT 페어만 필터링)
async function getAllSymbols() {
    try {
        const response = await fetch(`${BINANCE_API_URL}/exchangeInfo`);
        const data = await response.json();

        if (!data.symbols) {
            throw new Error("Failed to fetch symbols list");
        }

        // USDT 마켓에 해당하는 종목만 필터링
        const symbols = data.symbols
            .filter((s) => s.symbol.endsWith("USDT")) // USDT 페어만 가져오기
            .map((s) => s.symbol);

        return symbols;
    } catch (error) {
        console.error("Error fetching symbols list:", error);
        return [];
    }
}

// 2. 특정 종목의 한국시간 9시 시가(open price) 가져오기
async function getOpenPrice(symbol) {
    const url = `${BINANCE_API_URL}/klines?symbol=${symbol}&interval=1d&limit=2`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!Array.isArray(data) || data.length < 2) {
            throw new Error(`No sufficient data for ${symbol}`);
        }

        // 어제의 open price (1d 캔들의 시작가)
        const openPrice = data[0][1];

        return { symbol, openPrice };
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return { symbol, openPrice: null };
    }
}

// 3. 모든 종목의 9시 시가 가져오기
async function fetchAllOpenPrices() {
    const symbols = await getAllSymbols();
    
    if (symbols.length === 0) {
        console.error("No symbols available.");
        return;
    }

    console.log(`Fetching open prices for ${symbols.length} symbols...`);

    const results = await Promise.all(symbols.map(getOpenPrice));
    results.forEach(x => {
      priceMap[x.symbol] = {price: parseFloat(x.openPrice).toString(), color: '#FFFFFF', openPrice: parseFloat(x.openPrice).toString()}
    });
}

// websocket 실행 전에 호출해서 openPrice 세팅
fetchAllOpenPrices();


const connectWebSocket = () => {
  console.log('실행완료');
  ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => { 
      const json = JSON.parse(event.data);
      const symbolFilterArr = Array.from(json).filter(x => x.s.includes("USDT"));
      connections.forEach((port) => {
        port.postMessage({type: 'data', data: priceMap});
      });
      // 변경이 있는 데이터만 전송해주므로 따로 효율화 할 필요 없음
      symbolFilterArr.forEach(x => {
        let color = '#FFFFFF';
          if (parseFloat(priceMap[x.s].openPrice) < parseFloat(x.c)) {
            color = "#f75467";
          } else if (parseFloat(priceMap[x.s].openPrice) > parseFloat(x.c)) {
            color = "#4386f9";
          }
          priceMap[x.s].price = parseFloat(x.c).toString();
          priceMap[x.s].color = color;
      });

      connections.forEach((port) => {
        port.postMessage({type: 'data', data: priceMap});
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