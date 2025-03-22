import Decimal from "decimal.js";
import useSymbolData from "../hooks/useSymbolData";
import ArrowLeft from '../../assets/ArrowLeft.svg?react';

type CoinMobileSymbolInfoProps = {
    symbol: string;
  }

const CoinMobileSymbolInfo: React.FC<CoinMobileSymbolInfoProps> = ({symbol}) => {
    const { data } = useSymbolData(symbol);

    const handleBack = () => {
      window.history.back();
    };
  
    const price = data?.price ?? 0;
    const openPrice = data?.openPrice ?? 1; // 0으로 두면 NaN 발생 가능하므로 1 사용
    const priceChange = price === 0 ? '0' : ((price - openPrice) / openPrice * 100).toFixed(2);
    const diff = new Decimal(price).minus(openPrice);

    return (
        <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <ArrowLeft width={'30px'} height={'30px'} onClick={handleBack} style={{paddingLeft: '10px'}}/>
          <strong style={{fontSize: '20px'}}>
            {symbol.replace('USDT', ' / USD')}
          </strong>
        </div>
        <div style={{marginLeft: '20px', marginTop: '10px', color: data?.color}}>
          <div>
            <strong style={{width: '100px'}}>
              {data?.price}
            </strong>
          </div>
          <span  style={{fontSize: '13px'}}>
            {`${priceChange} %`}
          </span>
          <span style={{marginLeft: '10px'}}>
            {parseFloat(priceChange) > 0 ? '▲' : '▼'}
          </span>
          <span>
            {` ${diff.toString()}`}
          </span>
        </div>
      </div>
    )
}

export default CoinMobileSymbolInfo;