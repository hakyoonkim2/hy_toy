import style from '../style/chart.module.scss';
import CoinPriceList from './CoinPriceList';
import { isMobile } from 'react-device-detect';
import CoinChartView from './CoinChartView';
import { useSymbol } from '../hooks/SymbolContextProvider';
import LoadingFallback from '../../components/LoadingFallback';
import CoinSearch from './CoinSearch';

const CoinApp: React.FC = () => {
  const { symbolList } = useSymbol();

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
        {/* symbolList가 있으면 react-query data는 항상 있으므로 suspense를 쓸수 없음, 따라서 fallback을 수동으로 설정*/}
        {symbolList.length > 0 ? (
          symbolList.map((symbol) => <CoinPriceList key={symbol} symbol={symbol} />)
        ) : (
          <LoadingFallback />
        )}
      </div>
      {!isMobile ? <CoinChartView /> : <></>}
    </div>
  );
};

export default CoinApp;
