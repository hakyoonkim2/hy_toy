import { ChangeEvent, useActionState, useEffect, useRef } from "react";
import CoinWebSocketProvider from "../context/CoinWebSocketContext";
import TradingViewChart from "./TradingViewChart";
import style from "../style/chart.module.scss"
import { useSymbol } from "../hooks/SymbolContextProvider";
import CoinChart from "./CoinChart";

const CoinChartView = () => {
    const { symbolList, symbol, setSymbol} = useSymbol();
    const selectRef = useRef<HTMLSelectElement>(null);

    const [_, formAction] = useActionState((prevSymbol: string, formData: FormData) => {
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

    useEffect(() => {
        if (selectRef.current) selectRef.current.value = symbol;
    }, [symbol]);

    return (
        <div className={style.chartviewContainer}>
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
    )
}

export default CoinChartView;