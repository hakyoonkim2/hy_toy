import { useState } from 'react';
import CoinWebSocketProvider from '../context/CoinWebSocketContext';
import style from '../style/CoinMobileTab.module.scss';
import TradingViewChart from './TradingViewChart';
import CoinChart from './CoinChart';
import { OrderBook } from './OrderBook';
import TradeHistory from './TradeHistory';
import CoinMobileSymbolInfo from './CoinMobileSymbolInfo';
import CoinSearch from './CoinSearch';

const TABS = ['차트', '호가', '시세'] as const;

type Tab = (typeof TABS)[number];

type CoinMobileTabProps = {
  symbol: string;
};

const CoinMobileTab: React.FC<CoinMobileTabProps> = ({ symbol }) => {
  const [activeTab, setActiveTab] = useState<Tab>('차트');

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
                <CoinChart symbol={symbol} />
              </div>
            )}
            {activeTab === '시세' && <TradeHistory symbol={symbol} />}
          </CoinWebSocketProvider>
        </div>
      </div>
    </div>
  );
};

export default CoinMobileTab;
