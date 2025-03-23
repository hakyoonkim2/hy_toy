import React, { useEffect, useRef } from "react";
import style from "../style/chart.module.scss"
import CoinPriceList from "./CoinPriceList";
import { useQueryClient } from "@tanstack/react-query";
import { isMobile } from "react-device-detect";
import CoinChartView from "./CoinChartView";
import { useSymbol } from "../hooks/SymbolContextProvider";
import LoadingFallback from "../../components/LoadingFallback";

const CoinApp: React.FC = () => {
    const {symbolList, setSymbolList, worker, upbitWorker} = useSymbol();
    
    const queryClient = useQueryClient();
    const isListInit = useRef(false);

    const test = async () => {
        try {
            const response = await fetch(`https://api.upbit.com/v1/market/all?isDetails=true`);
            const data = await response.json();
            console.log(data);
        } catch (e) {
            throw e;
        }
    }
    test();

    useEffect(() => {
        // server -> sharedWorker| worker -> client 로 전달된 데이터 핸들링
        const onMessageCallback = (event: MessageEvent) => {
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

              // server -> sharedWorker| worker -> client 로 전달된 데이터 핸들링
      const onUbitMessageCallback = (event: MessageEvent) => {
        const data = event.data;
        // data type이 'symbolData' 인 경우에만 react-query data로 적재
        if (data?.type === 'UpbitsymbolData') {
            console.log(event.data);
            queryClient.setQueryData(["symbol", data.data.symbol], data.data);
            console.log(event.data);
        } else {
            console.log(event.data);
        }
      };

      if (upbitWorker instanceof SharedWorker) {
        upbitWorker.port.onmessage = onUbitMessageCallback;
        } else {
            upbitWorker.onmessage = onUbitMessageCallback;
        }
        if (worker instanceof SharedWorker) {
            worker.port.onmessage = onMessageCallback;
        } else {
            worker.onmessage = onMessageCallback;
        }
    }, []);

    return (
        <div className={style.app}>
            <div className={style.listContainer}style={{ minWidth: isMobile ? '100%': "300px" }}>
                {/* symbolList가 있으면 react-query data는 항상 있으므로 suspense를 쓸수 없음, 따라서 fallback을 수동으로 설정*/}
                {symbolList.length > 0 ? symbolList.map((symbol) => <CoinPriceList key={symbol} symbol={symbol}/>) : <LoadingFallback/>}
            </div>
            {!isMobile ?  <CoinChartView />: <></>}
        </div>
    );
};

export default CoinApp;
