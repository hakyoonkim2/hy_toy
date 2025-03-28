import { useMemo, useState } from 'react';
import style from '@bitCoinChart/style/CoinMobileTab.module.scss';
import { useSymbol } from '@bitCoinChart/hooks/SymbolContextProvider';
import CoinSearch from '@bitCoinChart/components/pricelist/CoinSearch';
import CoinWebSocketProvider from '@bitCoinChart/context/CoinWebSocketContext';
import { OrderBook } from '@bitCoinChart/components/additional/OrderBook';
import TradeHistory from '@bitCoinChart/components/additional/TradeHistory';
import AveragePriceCalculator from '@bitCoinChart/components/additional/AveragePriceCalculator';
import CoinMobileSymbolInfo from '@bitCoinChart/components/mobile/CoinMobileSymbolInfo';
import TradingViewChart from '@bitCoinChart/components/chart/TradingViewChart';
import UpbitCoinChart from '@bitCoinChart/components/chart/UpbitCoinChart';

const TABS = ['차트', '호가', '시세', '평단'] as const;

type Tab = (typeof TABS)[number];

type CoinMobileTabProps = {
  symbol: string;
};

const CoinMobileTab: React.FC<CoinMobileTabProps> = ({ symbol }) => {
  const [activeTab, setActiveTab] = useState<Tab>('차트');
  const { upbitSymbolList } = useSymbol();
  const isInUpbit = useMemo(() => {
    const adjustSymbol = symbol.replace('USDT', '');
    return upbitSymbolList.some((x) => x.market.replace('KRW-', '') === adjustSymbol);
  }, [symbol, upbitSymbolList]);

  return (
    <div className={style.mobileTabContainer}>
      <CoinSearch />
      <CoinMobileSymbolInfo symbol={symbol} />
      <div style={{ display: 'flex' }}>
        {TABS.map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={style.tab}
            style={activeTab === tab ? { backgroundColor: 'rgb(0, 0, 0)' } : {}}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div style={{ display: 'flex', marginTop: '10px' }}>
        <div style={{ flex: '1' }}>
          <CoinWebSocketProvider symbol={symbol}>
            {activeTab === '호가' && <OrderBook symbol={symbol} />}
            {activeTab === '차트' && (
              <div className={style.chartwrapper}>
                <TradingViewChart symbol={symbol} />
                {isInUpbit ? <UpbitCoinChart symbol={symbol} /> : <></>}
              </div>
            )}
            {activeTab === '시세' && <TradeHistory symbol={symbol} />}
            {activeTab === '평단' && <AveragePriceCalculator symbol={symbol} />}
          </CoinWebSocketProvider>
        </div>
      </div>
    </div>
  );
};

export default CoinMobileTab;
