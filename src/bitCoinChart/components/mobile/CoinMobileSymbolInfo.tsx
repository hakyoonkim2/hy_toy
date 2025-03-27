import Decimal from 'decimal.js';
import ArrowLeft from '@assets/ArrowLeft.svg?react';
import style from '@bitCoinChart/style/CoinMobileSymbolInfo.module.scss';
import coinsearchStyle from '@bitCoinChart/style/SearchFrom.module.scss';
import { useBinanceSymbolData } from '@bitCoinChart/hooks/BinanceHooks';

type CoinMobileSymbolInfoProps = {
  symbol: string;
};

const CoinMobileSymbolInfo: React.FC<CoinMobileSymbolInfoProps> = ({ symbol }) => {
  const { data } = useBinanceSymbolData(symbol);

  const handleBack = () => {
    window.history.back();
  };

  const price = data?.price ?? 0;
  const openPrice = data?.openPrice ?? 1; // 0으로 두면 NaN 발생 가능하므로 1 사용
  const priceChange = price === 0 ? '0' : (((price - openPrice) / openPrice) * 100).toFixed(2);
  const diff = new Decimal(price).minus(openPrice);

  return (
    <div className={style.container}>
      <div className={style.topRow}>
        <ArrowLeft className={style.backIcon} onClick={handleBack} />
        <span className={coinsearchStyle.selectedValue}>{symbol.replace('USDT', '')}</span>
        <span className={coinsearchStyle.selectedUnit}>/ USD</span>
      </div>
      <div className={style.priceBox} style={{ color: data?.color }}>
        <div className={style.price}>{data?.price}</div>
        <div className={style.changeInfo} style={{ color: data?.color }}>
          <span>{`${priceChange} %`}</span>
          <span>{parseFloat(priceChange) > 0 ? '▲' : '▼'}</span>
          <span>{diff.toString()}</span>
        </div>
      </div>
    </div>
  );
};

export default CoinMobileSymbolInfo;
