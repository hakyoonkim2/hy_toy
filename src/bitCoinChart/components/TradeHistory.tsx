import { CoinWebSocketContext } from '../context/CoinWebSocketContext';
import { useContext } from 'react';
import useSymbolData from '../hooks/useSymbolData';
import style from '../style/TradingHistory.module.scss';
import { convertKrTime } from '../utils/util';

type TradeHistoryProps = {
  symbol: string;
};

const TradeHistory: React.FC<TradeHistoryProps> = ({ symbol }) => {
  const { tradeHistory } = useContext(CoinWebSocketContext);
  const { data } = useSymbolData(symbol);
  const red = '#f75467';
  const blue = '#4386f9';
  const openPrice = data?.openPrice ?? 0;

  return (
    <div className={style.table}>
      <table>
        <thead>
          <tr>
            <td>체결시간</td>
            <td>{'체결가격(USD)'}</td>
            <td>{'체결량(AUCTION)'}</td>
          </tr>
        </thead>
        <tbody>
          {tradeHistory?.map((trade) => (
            <tr key={trade.id}>
              <td>{convertKrTime(trade.time)}</td>
              <td style={trade.price > openPrice ? { color: red } : { color: blue }}>
                {trade.price.toLocaleString()}
              </td>
              <td style={trade.maker ? { color: red } : { color: blue }}>{trade.mount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradeHistory;
