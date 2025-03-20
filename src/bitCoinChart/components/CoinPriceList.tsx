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

    return (
        <div className={style.chartList} onClick={handleClick} ref={ref}>
            <div>
                <strong className={style.symbolListLabel}>{symbol.replace("USDT", "")}</strong>
            </div>
            <div style={{width: "100%", textAlign: "right"}}>
                <strong className={style.price} style={{color: data?.color}}>{`${data?.price} `}</strong>
                <strong className={style.price} style={{marginLeft: '10px'}}>{`USD`}</strong>
            </div>
        </div>
    );
}

export default CoinPriceList;