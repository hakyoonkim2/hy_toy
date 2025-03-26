import { ChangeEvent, useActionState, useRef, useState, useMemo } from 'react';
import { useSymbol } from '../hooks/SymbolContextProvider';
import { findKoreanSymbol, searchCoinKeyword } from '../utils/util';
import style from '../style/SearchFrom.module.scss';
import { isMobile } from 'react-device-detect';
import ClearIcon from '../assets/ClearIcon.svg?react';
import SearchIcon from '../assets/SearchIcon.svg?react';

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
    [upbitSymbolList, symbolList]
  );

  const seachSuggestionList = [...ubitSymbols, ...binanceSymbols];

  const filteredList = seachSuggestionList.filter((sym) =>
    sym.toLowerCase().includes(inputValue.toLowerCase())
  );

  const scrollToSearchTarget = (symbol: string): void => {
    const target = document.getElementById(`${symbol}-pricelist`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const searchQuery = (inputSymbol: string) => {
    const searchResult = searchCoinKeyword(inputSymbol, upbitSymbolList, binanceSymbols);
    const newSymbol = searchResult.toUpperCase() + 'USDT';

    const isValid = symbolList.includes(newSymbol);
    if (isValid) {
      scrollToSearchTarget(newSymbol);
      setSymbol(newSymbol);
      inputRef.current?.blur();
    } else {
      if (inputRef.current) inputRef.current.focus();
      alert(`${inputSymbol} 은 유효하지 않습니다`);
    }
  };

  const [_, formAction] = useActionState((prevSymbol: string, formData: FormData) => {
    const inputSymbol = formData.get('symbol') as string;

    // conpomision 동작으로 인해 input value를 ajudst 하기위해 dropdown을 이용
    const targetSymbol = activeIndex >= 0 ? filteredList[activeIndex] : filteredList[0];
    if (targetSymbol) setInputValue(targetSymbol);

    const adjustSymbol = targetSymbol ?? inputSymbol;

    const searchResult = searchCoinKeyword(adjustSymbol, upbitSymbolList, binanceSymbols);
    const newSymbol = searchResult.toUpperCase() + 'USDT';

    const isValid = symbolList.includes(newSymbol);

    if (isValid) {
      scrollToSearchTarget(newSymbol);
      setSymbol(newSymbol);
      // 찾았을때만 dropdown 제거
      setShowDropdown(false);
      inputRef.current?.blur();
      return newSymbol;
    } else {
      if (inputRef.current) inputRef.current.focus();
      alert(`${adjustSymbol} 은 유효하지 않습니다`);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // ESC키를 눌렀을때 input값이 삭제되고 input blur 처리
    if (e.key === 'Escape') {
      e.preventDefault();
      setInputValue('');
      setShowDropdown(false);
      if (inputRef.current) inputRef.current.blur();
    }
    if (!showDropdown || filteredList.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredList.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? filteredList.length - 1 : prev - 1));
    }
  };

  const koreanSymbol = findKoreanSymbol(symbol, upbitSymbolList);

  return (
    <div className={style.seachContainer}>
      <form className={style.searchFrom} action={formAction}>
        <div className={style.inputWrapper}>
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
          {inputValue && (
            <button
              type="button"
              className={style.clearButton}
              onClick={() => setInputValue('')}
              aria-label="입력 삭제"
            >
              <ClearIcon width={22} height={22} />
            </button>
          )}
        </div>
        <button className={style.searchBtn} type="submit">
          <SearchIcon width={15} height={15} />
        </button>
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
          {koreanSymbol && (
            <span
              className={style.selectedUnit}
              style={{ marginLeft: '6px' }}
            >{`${koreanSymbol}`}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default CoinSearch;
