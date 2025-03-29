import style from '@bitCoinChart/style/chart.module.scss';
import { isMobile } from 'react-device-detect';
import { useMemo } from 'react';
import { useSymbol } from '@bitCoinChart/hooks/SymbolContextProvider';
import CoinSearch from '@bitCoinChart/components/pricelist/CoinSearch';
import { OrderBook } from '@bitCoinChart/components/additional/OrderBook';
import CoinWebSocketProvider from '@bitCoinChart/context/CoinWebSocketContext';
import TradeHistory from '@bitCoinChart/components/additional/TradeHistory';
import AveragePriceCalculator from '@bitCoinChart/components/additional/AveragePriceCalculator';
import CoinMobileTab from '@bitCoinChart/components/mobile/CoinMobileTab';
import TradingViewChart from '@bitCoinChart/components/chart/TradingViewChart';
import UpbitCoinChart from '@bitCoinChart/components/chart/UpbitCoinChart';

/**
 * 차트 제공 UI
 * Advanced TradingView 차트, lightweight-chart(1s)
 */
const CoinChartView = () => {
  const { symbol, upbitSymbolList } = useSymbol();

  const isInUpbit = useMemo(() => {
    const adjustSymbol = symbol.replace('USDT', '');
    return upbitSymbolList.some((x) => x.market.replace('KRW-', '') === adjustSymbol);
  }, [symbol, upbitSymbolList]);

  return isMobile ? (
    <CoinMobileTab symbol={symbol} />
  ) : (
    <div
      className={`${style.chartviewContainer}`}
      style={{ paddingLeft: isMobile ? '0px' : '15px' }}
    >
      <CoinSearch />
      <div style={{ flexDirection: 'column', marginTop: '10px' }}>
        <div className={style.chartwrapper}>
          <TradingViewChart symbol={symbol} />
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
          <div style={{ minWidth: '300px', marginLeft: '20px' }}>
            <AveragePriceCalculator symbol={symbol} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinChartView;
