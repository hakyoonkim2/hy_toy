import { useEffect, useRef, useState } from "react";
import style from "../style/chart.module.scss";
import { useNavigate } from "react-router-dom";
import { isMobile } from "react-device-detect";
import { useSymbol } from "../hooks/SymbolContextProvider";
import useSymbolData from "../hooks/useSymbolData";

type CoinPriceListProps = {
    symbol: string;
}

/**
 * 여러 종목 리스트의 현재가격을 실시간으로 추적하는 UI
 */
const CoinPriceList: React.FC<CoinPriceListProps> = ({ symbol }) => {
    const { setSymbol } = useSymbol();
    const { data } = useSymbolData(symbol);
    const ref = useRef(null);
    const navigator = useNavigate();


    const handleClick = () => {
        setSymbol(symbol);
        if (isMobile) navigator('/chart/chartview');
    }
    // 기본값 처리
    const price = data?.price ?? 0;
    const openPrice = data?.openPrice ?? 1; // 0으로 두면 NaN 발생 가능하므로 1 사용
    const priceChange = price === 0 ? 0 : ((price - openPrice) / openPrice * 100).toFixed(2);
    const color = data?.color ?? "#FFFFFF"; // 기본 색상 지정

    // state방식을 활용한 highlight구현시 react render rapid가 너무 빨라 오류가 생기므로 classList toggle방식 사용
    useEffect(() => {
        let timer: number | null = null;
        if (ref.current) {
            const target = ref.current as HTMLElement;
            target.classList.add(style.pricehighlight);
            timer = setTimeout(() => {
                target.classList.remove(style.pricehighlight);
            }, 300);
        }

        // cleanup에서 timer제거
        return () => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        }
    }, [data]);

    return (
        <div className={style.chartList} onClick={handleClick}>
            <div>
                <strong className={style.symbolListLabel}>{symbol.replace("USDT", "")}</strong>
            </div>
            <div style={{width: "100%", textAlign: "right"}}>
                <strong ref={ref} className={style.price} style={{color: color}}>{`${price}`}</strong>
                <strong className={style.price} style={{color: color, marginLeft: '10px'}}>{`${priceChange}% `}</strong>
                <strong className={style.price} style={{marginLeft: '10px'}}>{`USD`}</strong>
            </div>
        </div>
    );
}

export default CoinPriceList;