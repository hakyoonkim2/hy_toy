import { useEffect, useState } from 'react';
import style from '../style/AveragePriceCalculator.module.scss';

type Props = {
  symbol: string;
};

type AveragePriceHistory = {
  amount: number;
  price: number;
};

const STORAGE_KEY = 'coinAverage';

const AveragePriceCalculator = ({ symbol }: Props) => {
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [currentAvgPrice, setCurrentAvgPrice] = useState<number>(0);
  const [additionalAmount, setAdditionalAmount] = useState<number>(0);
  const [additionalTotalCost, setAdditionalTotalCost] = useState<number>(0);
  const [additionalPrice, setAdditionalPrice] = useState<number>(0);
  const [useTotalCost, setUseTotalCost] = useState<boolean>(false);

  const getNewAveragePrice = () => {
    const currentTotalCost = currentAmount * currentAvgPrice;
    let newTotalAmount = currentAmount;
    let newTotalCost = currentTotalCost;

    if (useTotalCost) {
      if (additionalPrice > 0) {
        const calculatedAmount = additionalTotalCost / additionalPrice;
        newTotalAmount += calculatedAmount;
        newTotalCost += additionalTotalCost;
      }
    } else {
      newTotalAmount += additionalAmount;
      newTotalCost += additionalAmount * additionalPrice;
    }

    return newTotalAmount > 0
      ? Number((newTotalCost / newTotalAmount).toFixed(2)).toLocaleString()
      : '0';
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleBtnClick = () => {
    localStorage.setItem(
      `${STORAGE_KEY}_${symbol}`,
      JSON.stringify({ amount: currentAmount, price: currentAvgPrice } as AveragePriceHistory)
    );
  };

  useEffect(() => {
    const storagePrevInfo = localStorage.getItem(`${STORAGE_KEY}_${symbol}`);
    const prevInfo: AveragePriceHistory | null = storagePrevInfo
      ? JSON.parse(storagePrevInfo)
      : null;
    if (prevInfo) {
      setCurrentAmount(prevInfo.amount);
      setCurrentAvgPrice(prevInfo.price);
    }

    return () => {
      setCurrentAmount(0);
      setCurrentAvgPrice(0);
    };
  }, [symbol]);

  return (
    <div className={style.container}>
      <h2 className={style.title}>{`평균단가 계산기 (${symbol.replace('USDT', '')})`}</h2>

      <div className={style.inputGroup}>
        <label className={style.label}>현재 보유 수량</label>
        <input
          className={style.input}
          type="number"
          value={currentAmount}
          onFocus={handleFocus}
          onChange={(e) => setCurrentAmount(parseFloat(e.target.value))}
        />
      </div>

      <div className={style.inputGroup}>
        <label className={style.label}>현재 평균 단가</label>
        <input
          className={style.input}
          type="number"
          value={currentAvgPrice}
          onFocus={handleFocus}
          onChange={(e) => setCurrentAvgPrice(parseFloat(e.target.value))}
        />
      </div>
      <button
        className={style.saveBtn}
        onClick={handleBtnClick}
        disabled={currentAmount === 0 && currentAvgPrice === 0}
      >
        저장
      </button>
      <label className={style.checkboxLabel}>
        <input
          type="checkbox"
          checked={useTotalCost}
          onChange={() => setUseTotalCost((prev) => !prev)}
        />
        수량 대신 총 금액으로 계산할게요
      </label>

      {useTotalCost ? (
        <div className={style.inputGroup}>
          <label className={style.label}>추가 매수 총 금액</label>
          <input
            className={style.input}
            type="number"
            value={additionalTotalCost}
            onFocus={handleFocus}
            onChange={(e) => setAdditionalTotalCost(parseFloat(e.target.value))}
          />
        </div>
      ) : (
        <div className={style.inputGroup}>
          <label className={style.label}>추가 매수 수량</label>
          <input
            className={style.input}
            type="number"
            value={additionalAmount}
            onFocus={handleFocus}
            onChange={(e) => setAdditionalAmount(parseFloat(e.target.value))}
          />
        </div>
      )}

      <div className={style.inputGroup}>
        <label className={style.label}>추가 매수 단가</label>
        <input
          className={style.input}
          type="number"
          value={additionalPrice}
          onFocus={handleFocus}
          onChange={(e) => setAdditionalPrice(parseFloat(e.target.value))}
        />
      </div>

      <div className={style.result}>새로운 평균 단가: {getNewAveragePrice()}</div>
    </div>
  );
};

export default AveragePriceCalculator;
