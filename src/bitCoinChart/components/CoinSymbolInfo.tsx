import Decimal from 'decimal.js';
import ArrowLeft from '@assets/ArrowLeft.svg?react';
import style from '@bitCoinChart/style/CoinSymbolInfo.module.scss';
import coinsearchStyle from '@bitCoinChart/style/SearchFrom.module.scss';
import { useBinanceSymbolData } from '@bitCoinChart/hooks/BinanceHooks';
import CoinIcon from '@bitCoinChart/components/CoinIcon';
import { useSymbol } from '@bitCoinChart/hooks/SymbolContextProvider';
import { fetchExchangeRate, findKoreanSymbol } from '@bitCoinChart/utils/util';
import { useQuery } from '@tanstack/react-query';
import { useUpbitSymbolData } from '@bitCoinChart/hooks/UpbitHooks';
import { isMobile } from 'react-device-detect';

type CoinMSymbolInfoProps = {
  symbol: string;
};

const CoinSymbolInfo: React.FC<CoinMSymbolInfoProps> = ({ symbol }) => {
  const { data } = useBinanceSymbolData(symbol);
  const { upbitSymbolList } = useSymbol();
  const { data: krwData } = useUpbitSymbolData(symbol);

  const handleBack = () => {
    window.history.back();
  };

  const price = data?.price ?? 0;
  const openPrice = data?.openPrice ?? 1; // 0으로 두면 NaN 발생 가능하므로 1 사용
  const priceChange = price === 0 ? '0' : (((price - openPrice) / openPrice) * 100).toFixed(2);
  const diff = new Decimal(price).minus(openPrice);

  const koreanSymbol = findKoreanSymbol(symbol, upbitSymbolList);

  // 환율 정보 10분단위로 가져옴
  const { data: exchangeRatio } = useQuery({
    queryKey: ['exchange-rate', 'USD-KRW'],
    queryFn: fetchExchangeRate,
    refetchInterval: 1000 * 60 * 10, // 10분단위로 refetch 하도록 처리
    staleTime: 1000 * 60 * 10, // 10분 동안은 fresh 상태
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  const kpPositive =
    krwData && krwData.price && exchangeRatio && price && krwData.price / exchangeRatio - price > 0
      ? true
      : false;

  return (
    <div className={style.container} style={isMobile ? {} : { flexDirection: 'row' }}>
      <div className={style.topRow}>
        {isMobile && <ArrowLeft className={style.backIcon} onClick={handleBack} />}
        <CoinIcon symbol={symbol} />
        <span className={coinsearchStyle.selectedValue}>{symbol.replace('USDT', '')}</span>
        {koreanSymbol && (
          <span
            className={style.selectedUnit}
            style={{ marginLeft: '6px', fontSize: '0.8rem', color: '#aaa' }}
          >{`${koreanSymbol}`}</span>
        )}
      </div>
      <div
        className={style.priceBox}
        style={
          isMobile
            ? { color: data?.color }
            : {
                flexDirection: 'row',
                color: data?.color,
                display: 'flex',
                placeItems: 'baseline',
                gap: '1rem',
              }
        }
      >
        <div className={style.price}>{data?.price}</div>
        <div className={style.changeInfo} style={{ color: data?.color }}>
          <span>{`${priceChange} %`}</span>
          <span>{parseFloat(priceChange) > 0 ? '▲' : '▼'}</span>
          <span>{diff.toString()}</span>
        </div>
        {price && krwData && krwData.price && exchangeRatio ? (
          <div className={style.changeInfo}>
            <span>김프: &nbsp;</span>
            <span
              style={{ color: kpPositive ? '#f75467' : '#4386f9' }}
            >{`${(((krwData.price / exchangeRatio - price) / price) * 100).toFixed(2)}% `}</span>
            <span style={{ marginLeft: '10px' }}>KRW: &nbsp;</span>
            <span style={{ color: data?.color }}>{`${krwData.price.toLocaleString()}`}</span>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default CoinSymbolInfo;
