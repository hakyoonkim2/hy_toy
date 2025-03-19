import React, { ChangeEvent, useActionState, useEffect, useRef, useState } from "react";
import CoinWebSocketProvider from "../context/CoinWebSocketContext";
import CoinChart from "./CoinChart";
import style from "../style/chart.module.scss"
import TradingViewChart from "./TradingViewChart";

const CoinApp: React.FC = () => {
    const [symbolList, setSymbolList] = useState<string[]>([]);
    const [symbol, setSymbol] = useState<string>('ADAUSDT');
    const selectRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
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

    useEffect(() => {
        if (selectRef.current) selectRef.current.value = symbol;
    }, [symbol]);

    const [_, formAction] = useActionState(async (prevSymbol: string, formData: FormData) => {
        const inputSymbol = formData.get("symbol") as string;
        const newSymbol = inputSymbol.toUpperCase() + "USDT";

        const isValid = symbolList.includes(newSymbol);

        if (isValid) {
            setSymbol(newSymbol);
            return newSymbol;
        } else {
            alert(`${newSymbol} 은 유효하지 않습니다`);
            return prevSymbol;
        }
    }, "ADAUSDT");

    const handleOptionSelect = (e: ChangeEvent<HTMLSelectElement>) => {
        setSymbol(e.target.value);
    }

    return (
        <div>
            <form action={formAction}>
                <input name="symbol" type="text" placeholder="영어로 입력해라 ㅡㅡ"/>
                <button type="submit">조회</button>
                <label>{`현재 선택된 심볼: ${symbol}`}</label>
            </form>
            <select ref={selectRef} value={symbol} onChange={handleOptionSelect}>
                {symbolList.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
        <CoinWebSocketProvider symbol={symbol}>
            <div className={style.chartwrapper}>
                <TradingViewChart symbol={symbol}/>
                <CoinChart symbol={symbol}/>
            </div>
        </CoinWebSocketProvider>
        </div>
    );
};

export default CoinApp;
