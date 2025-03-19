import React, { useActionState } from "react";
import CoinWebSocketProvider from "../context/CoinWebSocketContext";
import CoinChart from "./CoinChart";
import style from "../style/chart.module.scss"
import TradingViewChart from "./TradingViewChart";

const CoinApp: React.FC = () => {
    const [symbol, formAction] = useActionState(async (prevSymbol: string, formData: FormData) => {
        const inputSymbol = formData.get("symbol") as string;
        const newSymbol = inputSymbol.toUpperCase() + "USDT";

        const response = await fetch("https://api.binance.com/api/v3/exchangeInfo");
        const data = await response.json();
        const isValid = data.symbols.some((s: any) => s.symbol === newSymbol.replace("BINANCE:", ""));

        if (isValid) {
            return newSymbol;
        } else {
            alert(`${newSymbol} 은 유효하지 않습니다`);
            return prevSymbol;
        }
    }, "XRPUSDT");

    return (
        <div>
            <form action={formAction}>
                <input name="symbol" type="text" placeholder="영어로 입력해라 ㅡㅡ"/>
                <button type="submit">조회</button>
            </form>
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
