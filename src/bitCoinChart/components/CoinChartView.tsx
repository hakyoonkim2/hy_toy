import CoinWebSocketProvider from '../context/CoinWebSocketContext';
import TradingViewChart from './TradingViewChart';
import style from '../style/chart.module.scss';
import { useSymbol } from '../hooks/SymbolContextProvider';
import CoinChart from './CoinChart';
import { OrderBook } from './OrderBook';
import { isMobile } from 'react-device-detect';
import CoinMobileTab from './CoinMobileTab';
import TradeHistory from './TradeHistory';
import CoinSearch from './CoinSearch';

/**
 * 차트 제공 UI
 * Advanced TradingView 차트, lightweight-chart(1s)
 */
const CoinChartView = () => {
  const { symbol } = useSymbol();

  return isMobile ? (
    <CoinMobileTab symbol={symbol} />
  ) : (
    <div
      className={`${style.chartviewContainer}`}
      style={{ paddingLeft: isMobile ? '0px' : '15px' }}
    >
      <CoinSearch />
      <div style={{ flexDirection: 'column' }}>
        <CoinWebSocketProvider symbol={symbol}>
          <div className={style.chartwrapper}>
            <TradingViewChart symbol={symbol} />
            <CoinChart symbol={symbol} />
          </div>
          <div style={{ flexDirection: 'row', display: 'flex' }}>
            <div style={{ minWidth: '300px' }}>
              <OrderBook symbol={symbol} />
            </div>
            <div style={{ minWidth: '300px', marginLeft: '20px' }}>
              <TradeHistory symbol={symbol} />
            </div>
          </div>
        </CoinWebSocketProvider>
      </div>
    </div>
  );
};

export default CoinChartView;
