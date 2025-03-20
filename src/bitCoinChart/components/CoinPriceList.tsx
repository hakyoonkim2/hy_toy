import { useRef } from "react";
import style from "../style/chart.module.scss";
import { useNavigate } from "react-router-dom";
import { isMobile } from "react-device-detect";
import { useSymbol } from "../hooks/SymbolContextProvider";
import useSymbolData from "../hooks/useSymbolData";

const CoinPriceList = ({symbol}: {symbol: string}) => {
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

    return (
        <div className={style.chartList} onClick={handleClick} ref={ref}>
            <div>
                <strong className={style.symbolListLabel}>{symbol.replace("USDT", "")}</strong>
            </div>
            <div style={{width: "100%", textAlign: "right"}}>
                <strong className={style.price} style={{color: color}}>{`${price}`}</strong>
                <strong className={style.price} style={{color: color, marginLeft: '10px'}}>{`${priceChange}% `}</strong>
                <strong className={style.price} style={{marginLeft: '10px'}}>{`USD`}</strong>
            </div>
        </div>
    );
}

export default CoinPriceList;