import React, { useEffect } from "react";
import style from "../style/chart.module.scss"
import CoinPriceList from "./CoinPriceList";
import { useQueryClient } from "@tanstack/react-query";
import { isMobile } from "react-device-detect";
import CoinChartView from "./CoinChartView";
import { useSymbol } from "../hooks/SymbolContextProvider";

const CoinApp: React.FC = () => {
    const {symbolList, setSymbolList, worker} = useSymbol();
    
    const queryClient = useQueryClient();

    useEffect(() => {
        worker.port.onmessage = (event: MessageEvent) => {
            const symbolsData = event.data;
            Object.entries(symbolsData).forEach(([symbol, data]) => {
                queryClient.setQueryData(["symbol", symbol], data);
            });
        };

        const fetchSymbols = async () => {
            try {
              const response = await fetch("https://api.binance.com/api/v3/exchangeInfo");
              const data = await response.json();
              if (data.symbols) {
                const symbolList = data.symbols.filter(({symbol, status}: { symbol: string, status: string }) => symbol.includes("USDT") && status === "TRADING").map((symbol: { symbol: string }) => symbol.symbol);
                setSymbolList(symbolList);
              }
            } catch (error) {
              console.error("Error fetching Binance symbols:", error);
            }
          };

          fetchSymbols();
    }, []);



    return (
        <div className={style.app}>
            <div className={style.listContainer}style={{ width: isMobile ? '100%': "300px" }}>
                {symbolList.length > 0 ? symbolList.map((symbol) => <CoinPriceList key={symbol} symbol={symbol}/>) : <></>}
            </div>
            {!isMobile ?  <CoinChartView />: <></>}
        </div>
    );
};

export default CoinApp;
