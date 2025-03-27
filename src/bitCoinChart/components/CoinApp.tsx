import style from '@bitCoinChart/style/chart.module.scss';
import { isMobile } from 'react-device-detect';
import CoinSearch from '@bitCoinChart/components/pricelist/CoinSearch';
import CoinChartView from '@bitCoinChart/components/chart/CoinChartView';
import CoinPriceList from '@bitCoinChart/components/pricelist/CoinPriceList';

const CoinApp: React.FC = () => {
  return (
    <div className={style.app} style={isMobile ? { flexDirection: 'column' } : {}}>
      {isMobile ? (
        <div className={style.mobildSearchWrapper}>
          <CoinSearch />
        </div>
      ) : (
        <></>
      )}
      <div className={style.listContainer} style={{ minWidth: isMobile ? '100%' : '300px' }}>
        <CoinPriceList />
      </div>
      {!isMobile ? <CoinChartView /> : <></>}
    </div>
  );
};

export default CoinApp;
