import { ChangeEvent, useActionState, useRef, useState, KeyboardEvent, useMemo } from 'react';
import { useSymbol } from '../hooks/SymbolContextProvider';
import { searchCoinKeyword } from '../utils/util';
import style from '../style/SearchFrom.module.scss';
import { isMobile } from 'react-device-detect';

const CoinSearch = () => {
  const { symbolList, symbol, setSymbol, upbitSymbolList } = useSymbol();
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // 키보드 이동용
  const inputRef = useRef<HTMLInputElement>(null);

  const binanceSymbols = useMemo(() => symbolList.map((x) => x.replace('USDT', '')), [symbolList]);

  const ubitSymbols = useMemo(
    () =>
      upbitSymbolList
        .filter((sym) => {
          const upbitSym = sym.market.replace('KRW-', '');
          return binanceSymbols.includes(upbitSym);
        })
        .map((sym) => sym.korean_name),
    [upbitSymbolList]
  );

  const seachSuggestionList = [...ubitSymbols, ...binanceSymbols];

  const filteredList = seachSuggestionList.filter((sym) =>
    sym.toLowerCase().includes(inputValue.toLowerCase())
  );

  const searchQuery = (inputSymbol: string) => {
    const searchResult = searchCoinKeyword(inputSymbol, upbitSymbolList);
    const newSymbol = searchResult.toUpperCase() + 'USDT';

    const isValid = symbolList.includes(newSymbol);
    if (isValid) {
      setSymbol(newSymbol);
    } else {
      alert(`${inputSymbol} 은 유효하지 않습니다`);
    }
  };

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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowDropdown(true);
    setActiveIndex(-1); // 초기화
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 100);
  };

  const handleSelect = (selected: string) => {
    setInputValue(selected);
    searchQuery(selected);
    setShowDropdown(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || filteredList.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredList.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? filteredList.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredList[activeIndex]);
    }
  };

  return (
    <div className={style.seachContainer}>
      <form className={style.searchFrom} action={formAction}>
        <input
          ref={inputRef}
          name="symbol"
          type="text"
          placeholder="코인을 입력하세요"
          autoComplete="off"
          value={inputValue}
          onFocus={() => setShowDropdown(true)}
          onBlur={handleBlur}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <button type="submit">조회</button>
      </form>

      {showDropdown && filteredList.length > 0 && (
        <ul className={style.dropdown}>
          {filteredList.map((sym, index) => (
            <li
              key={sym}
              onMouseDown={() => handleSelect(sym)}
              className={`${style.dropdownItem} ${index === activeIndex ? style.active : ''}`}
            >
              {sym}
            </li>
          ))}
        </ul>
      )}

      {!isMobile && (
        <div className={style.selectedSymbolBox}>
          <span className={style.selectedValue}>{symbol.replace('USDT', '')}</span>
          <span className={style.selectedUnit}>/ USD</span>
        </div>
      )}
    </div>
  );
};

export default CoinSearch;
