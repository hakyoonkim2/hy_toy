import { PriceMap } from "./CoinCommonTypes";
import { UpbitSymbol } from "./UpbitWorkerTypes";

// 1. 모든 종목 리스트 가져오기 (KRW 페어만 필터링)
async function getUpbitAllSymbols(): Promise<UpbitSymbol[]> {
    try {
        const response = await fetch(`https://api.upbit.com/v1/market/all?isDetails=true`);
        const data = await response.json();

        if (response.status !== 200) {
            throw new Error("Failed to fetch symbols list");
        }

        // KRW 마켓에 해당하는 종목만 필터링
        const symbols = (data as UpbitSymbol[])
            .filter((symbol) => symbol.market.startsWith("KRW-")) // KRW 페어만 가져오기

        return symbols;
    } catch (error) {
        console.error("Error fetching symbols list:", error);
        return [];
    }
}

// 3. 모든 종목의 9시 시가 가져오기
export async function fetchUpbitAllOpenPrices(priceMap: PriceMap) {
    const symbols: UpbitSymbol[] = await getUpbitAllSymbols();
    
    if (symbols.length === 0) {
        console.error("No symbols available.");
        return;
    }

    console.log(`Fetching open prices for ${symbols.length} symbols...`);

    symbols.forEach(x => {
      priceMap[x.market] = {price: 0, color: '#FFFFFF', openPrice: 0}
    });
}