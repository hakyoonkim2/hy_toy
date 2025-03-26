import style from '../style/chart.module.scss';
import { isMobile } from 'react-device-detect';
import CoinChartView from './CoinChartView';
import CoinSearch from './CoinSearch';
import CoinPriceList from './CoinPriceList';

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
