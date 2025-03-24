import { ChangeEvent, useActionState, useEffect, useRef } from 'react';
import { useSymbol } from '../hooks/SymbolContextProvider';
import { searchCoinKeyword } from '../utils/util';
import style from '../style/SearchFrom.module.scss';
import { isMobile } from 'react-device-detect';

const CoinSearch = () => {
  const { symbolList, symbol, setSymbol, upbitSymbolList } = useSymbol();
  const selectRef = useRef<HTMLSelectElement>(null);

  // form controll useActionState: react19 버전에서 호환됨
  const [_, formAction] = useActionState((prevSymbol: string, formData: FormData) => {
    const inputSymbol = formData.get('symbol') as string;
    const searchResult = searchCoinKeyword(inputSymbol, upbitSymbolList);
    const newSymbol = searchResult.toUpperCase() + 'USDT';

    const isValid = symbolList.includes(newSymbol);

    if (isValid) {
      setSymbol(newSymbol);
      return newSymbol;
    } else {
      alert(`${inputSymbol} 은 유효하지 않습니다`);
      return prevSymbol;
    }
  }, 'ADAUSDT');

  const handleOptionSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    setSymbol(e.target.value);
  };

  useEffect(() => {
    if (selectRef.current) selectRef.current.value = symbol;
  }, [symbol]);

  return (
    <div className={style.seachContainer}>
      <form className={style.searchFrom} action={formAction}>
        <input name="symbol" type="text" placeholder="코인을 입력하세요" />
        <button type="submit">조회</button>
      </form>
      {isMobile ? <></> : <label>{'현재 선택된 심볼: '}</label>}
      <select
        className={style.searchSelect}
        ref={selectRef}
        value={symbol}
        onChange={handleOptionSelect}
      >
        {symbolList.map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </select>
    </div>
  );
};
export default CoinSearch;
