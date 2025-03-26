import CoinWebSocketProvider from '../context/CoinWebSocketContext';
import TradingViewChart from './TradingViewChart';
import style from '../style/chart.module.scss';
import { useSymbol } from '../hooks/SymbolContextProvider';
import { OrderBook } from './OrderBook';
import { isMobile } from 'react-device-detect';
import CoinMobileTab from './CoinMobileTab';
import TradeHistory from './TradeHistory';
import CoinSearch from './CoinSearch';
import UpbitCoinChart from './UpbitCoinChart';
import { useMemo } from 'react';

/**
 * 차트 제공 UI
 * Advanced TradingView 차트, lightweight-chart(1s)
 * @deprecated 점검후 제거예정
 */
const CoinChartView = () => {
  const { symbol, upbitSymbolList } = useSymbol();

  const isInUpbit = useMemo(() => {
    const adjustSymbol = symbol.replace('USDT', '')
    return upbitSymbolList.some(x => x.market.replace('KRW-', '') === adjustSymbol);
  }, [symbol, upbitSymbolList]);

  return isMobile ? (
    <CoinMobileTab symbol={symbol} />
  ) : (
    <div
      className={`${style.chartviewContainer}`}
      style={{ paddingLeft: isMobile ? '0px' : '15px' }}
    >
      <CoinSearch />
      <div style={{ flexDirection: 'column' }}>
        
          <div className={style.chartwrapper}>
            <TradingViewChart symbol={symbol} />
            {/* <CoinChart symbol={symbol} /> */}
            {isInUpbit ? <UpbitCoinChart symbol={symbol} /> : <></>}
          </div>
          <div style={{ flexDirection: 'row', display: 'flex' }}>
            <div style={{ minWidth: '300px' }}>
              <OrderBook symbol={symbol} />
            </div>
              <div style={{ minWidth: '300px', marginLeft: '20px' }}>
                <CoinWebSocketProvider symbol={symbol}>
                    <TradeHistory symbol={symbol} />
                </CoinWebSocketProvider>
              </div>
          </div>
      </div>
    </div>
  );
};

export default CoinChartView;
