import { useEffect, useRef } from 'react';
import style from '../style/chart.module.scss';
import { useNavigate } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { useSymbol } from '../hooks/SymbolContextProvider';
import useSymbolData from '../hooks/useSymbolData';
import useUpbitSymbolData from '../hooks/useUpbitSymbolData';
import { useQuery } from '@tanstack/react-query';
import { fetchExchangeRate } from '../utils/util';

type CoinPriceListProps = {
  symbol: string;
};

/**
 * 여러 종목 리스트의 현재가격을 실시간으로 추적하는 UI
 */
const CoinPriceList: React.FC<CoinPriceListProps> = ({ symbol }) => {
  const { setSymbol } = useSymbol();
  const { data } = useSymbolData(symbol);
  const { data: krwData } = useUpbitSymbolData(symbol);
  const ref = useRef(null);
  const navigator = useNavigate();

  // 환율 정보 10분단위로 가져옴
  const { data: exchangeRatio } = useQuery({
    queryKey: ['exchange-rate', 'USD-KRW'],
    queryFn: fetchExchangeRate,
    staleTime: 1000 * 60 * 10, // 10분 동안은 fresh 상태
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  const handleClick = () => {
    setSymbol(symbol);
    if (isMobile) navigator('/chart/chartview');
  };
  // 기본값 처리
  const price = data?.price ?? 0;
  const openPrice = data?.openPrice ?? 1; // 0으로 두면 NaN 발생 가능하므로 1 사용
  const priceChange = price === 0 ? 0 : (((price - openPrice) / openPrice) * 100).toFixed(2);
  const color = data?.color ?? '#FFFFFF'; // 기본 색상 지정
  const kpPositive =
    krwData && exchangeRatio && price && krwData.price / exchangeRatio - price > 0 ? true : false;

  // state방식을 활용한 highlight구현시 react render rapid가 너무 빨라 오류가 생기므로 classList toggle방식 사용
  useEffect(() => {
    let timer: number | null = null;
    if (ref.current) {
      const target = ref.current as HTMLElement;
      target.classList.add(style.pricehighlight);
      timer = setTimeout(() => {
        target.classList.remove(style.pricehighlight);
      }, 300);
    }

    // cleanup에서 timer제거
    return () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };
  }, [data]);

  return (
    <div className={style.chartList} onClick={handleClick}>
      <div>
        <strong className={style.symbolListLabel}>{symbol.replace('USDT', '')}</strong>
      </div>
      <div className={style.priceWrpper}>
        <div>
          <strong ref={ref} className={style.price} style={{ color: color }}>{`${price}`}</strong>
          <strong
            className={style.price}
            style={{ color: color, marginLeft: '10px' }}
          >{`${priceChange}% `}</strong>
          <strong className={style.price} style={{ marginLeft: '10px' }}>{`USD`}</strong>
        </div>
        {price && krwData && exchangeRatio ? (
          <div className={style.krwPrice}>
            <strong>김프: </strong>
            <strong
              style={{ color: kpPositive ? '#f75467' : '#4386f9' }}
            >{`${(((krwData.price / exchangeRatio - price) / price) * 100).toFixed(2)}% `}</strong>
            <strong style={{ marginLeft: '10px' }}>KRW: </strong>
            <strong style={{ color: color }}>{`${krwData.price.toLocaleString()}`}</strong>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default CoinPriceList;
