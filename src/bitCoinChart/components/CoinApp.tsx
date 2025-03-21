import React, { useEffect, useRef } from "react";
import style from "../style/chart.module.scss"
import CoinPriceList from "./CoinPriceList";
import { useQueryClient } from "@tanstack/react-query";
import { isMobile } from "react-device-detect";
import CoinChartView from "./CoinChartView";
import { useSymbol } from "../hooks/SymbolContextProvider";

const CoinApp: React.FC = () => {
    const {symbolList, setSymbolList, worker} = useSymbol();
    
    const queryClient = useQueryClient();
    const isListInit = useRef(false);

    useEffect(() => {
        // server -> sharedWorker -> client 로 전달된 데이터 핸들링
        worker.port.onmessage = (event: MessageEvent) => {
            const data = event.data;
            // data type이 'symbolData' 인 경우에만 react-query data로 적재
            if (data?.type === 'symbolData') {
              Object.entries(data.data).forEach(([symbol, data]) => {
                  queryClient.setQueryData(["symbol", symbol], data);
              });
              
              // symbolList가 구성되어있지 않았을때만 setting
              if (isListInit.current === false) {
                const symbols = Object.keys(data.data);
                if (symbols.length > 0) {
                    setSymbolList(Object.keys(data.data));
                    isListInit.current = true;
                }
              }
            } else {
                console.log(event.data);
            }
        };
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
