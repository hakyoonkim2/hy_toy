import { CoinWebSocketContext } from '../context/CoinWebSocketContext';
import { useContext } from 'react';
import useSymbolData from '../hooks/useSymbolData';
import style from '../style/Tradinghitory.module.scss';
import { convertKrTime } from '../utils/util';

type TradeHitoryProps = {
    symbol: string;
}

const TradeHitory: React.FC<TradeHitoryProps> = ({ symbol }) => {
    const { tradeHistory } = useContext(CoinWebSocketContext);
    const { data } = useSymbolData(symbol);
    const red = '#f75467';
    const blue = '#4386f9';
    const openPrice = data?.openPrice ?? 0;

    return (
        <div className={style.table}>
            <table style={{width: "100%", textAlign: "center", border: '1px solid #eee', borderCollapse: 'collapse'}}>
                <thead>
                    <tr>
                        <td>
                            체결시간
                        </td>
                        <td>
                            {'체결가격(USD)'}
                        </td>
                        <td>
                            {'체결량(AUCTION)'}
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {tradeHistory?.map(trade => 
                        <tr key={trade.id}>
                            <td>{convertKrTime(trade.time)}</td>
                            <td style={trade.price > openPrice ? {color: red} : {color: blue}}>{trade.price}</td>
                            <td style={trade.maker ? {color: red} : {color: blue}}>{trade.mount}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default TradeHitory;