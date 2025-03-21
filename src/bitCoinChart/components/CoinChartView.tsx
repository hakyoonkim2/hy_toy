import { ChangeEvent, useActionState, useEffect, useRef } from "react";
import CoinWebSocketProvider from "../context/CoinWebSocketContext";
import TradingViewChart from "./TradingViewChart";
import style from "../style/chart.module.scss";
import { useSymbol } from "../hooks/SymbolContextProvider";
import CoinChart from "./CoinChart";
import { OrderBook } from "./OrderBook";
import { isMobile } from "react-device-detect";
import CoinMobileTab from "./CoinMobileTab";
import TradeHitory from "./TradeHitory";

/**
 * 차트 제공 UI
 * Advanced TradingView 차트, lightweight-chart(1s)
 */
const CoinChartView = () => {
    const { symbolList, symbol, setSymbol} = useSymbol();
    const selectRef = useRef<HTMLSelectElement>(null);

    // form controll useActionState: react19 버전에서 호환됨
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
        isMobile ? <CoinMobileTab symbol={symbol}/> : <div className={`${style.chartviewContainer}`} style={{paddingLeft: isMobile ? '0px' : '15px'}}>
                <form action={formAction}>
                    <input name="symbol" type="text" placeholder="영어로 입력 (ex: BTC)"/>
                    <button type="submit">조회</button>
                </form>
                <label>{'현재 선택된 심볼: '}</label>
                <select ref={selectRef} value={symbol} onChange={handleOptionSelect}>
                    {symbolList.map(x => <option key={x} value={x}>{x}</option>)}
                </select>
                    <div style={{flexDirection: 'column'}}>
                        <CoinWebSocketProvider symbol={symbol}>
                            <div className={style.chartwrapper}>
                                <TradingViewChart symbol={symbol}/>
                                <CoinChart symbol={symbol}/>
                            </div>
                            <div style={{flexDirection: 'row', display: 'flex'}}>
                                <div style={{minWidth: '300px'}}>
                                    <OrderBook symbol={symbol}/>
                                </div>
                                <div style={{minWidth: '300px', marginLeft: '20px'}}>
                                    <TradeHitory symbol={symbol}/>
                                </div>
                            </div>
                        </CoinWebSocketProvider>
                    </div>
            </div>
    )
}

export default CoinChartView;