export const wsUrl = `wss://stream.binance.com:9443/ws/!ticker@arr`;

export const BINANCE_API_URL = "https://api.binance.com/api/v3";

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
            .filter((s) => s.symbol.endsWith("USDT") && s.status === 'TRADING') // USDT 페어만 가져오기
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
        const openPrice = data.length >= 2 ? data[1][1] : data[0][1];
        const curPrice = data.length >= 2 ? data[1][4] : data[0][4];

        return { symbol, openPrice, curPrice };
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return { symbol, openPrice: null , curPrice: null };
    }
}

// 3. 모든 종목의 9시 시가 가져오기
export async function fetchAllOpenPrices(priceMap) {
    const symbols = await getAllSymbols();
    
    if (symbols.length === 0) {
        console.error("No symbols available.");
        return;
    }

    console.log(`Fetching open prices for ${symbols.length} symbols...`);

    const results = await Promise.all(symbols.map(getOpenPrice));
    results.forEach(x => {
      let color = '#FFFFFF';
      const curPrice = parseFloat(x.curPrice);
      const openPrice = parseFloat(x.openPrice);
      if (openPrice < curPrice) {
        color = "#f75467";
      } else if (openPrice > curPrice) {
        color = "#4386f9";
      }
      priceMap[x.symbol] = {price: curPrice, color: color, openPrice: openPrice}
    });
}

export function dataSetting(symbolFilterArr, priceMap) {
    symbolFilterArr.forEach(x => {
        if (priceMap[x.s]) {
          let color = '#FFFFFF';
          const curPrice = parseFloat(x.c);
          if (priceMap[x.s].openPrice < curPrice) {
            color = "#f75467";
          } else if (priceMap[x.s].openPrice > curPrice) {
            color = "#4386f9";
          }
          priceMap[x.s].price = curPrice;
          priceMap[x.s].color = color;
        }
    });
}