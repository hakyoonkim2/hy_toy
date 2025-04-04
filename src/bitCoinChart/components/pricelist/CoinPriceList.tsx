import CoinPriceItem from '@bitCoinChart/components/pricelist/CoinPriceItem';
import { useSymbolImage } from '@bitCoinChart/hooks/BinanceHooks';
import { useSymbol } from '@bitCoinChart/hooks/SymbolContextProvider';
import { bookmarkStorage } from '@bitCoinChart/utils/BookmarkStorageUtil';
import { findKoreanSymbol } from '@bitCoinChart/utils/util';
import LoadingFallback from '@components/LoadingFallback';
import { useState } from 'react';

const CoinPriceList = () => {
  const { symbolList, upbitSymbolList } = useSymbol();
  const [bookmarkList, setBookmarkList] = useState<string[]>(bookmarkStorage.get());

  const toggleBookmark = (symbol: string): void => {
    bookmarkStorage.toggle(symbol);
    setBookmarkList(bookmarkStorage.get()); // 갱신!
  };

  const sortWithBookmarkFirst = (): string[] => {
    const bookmarkSet = new Set(bookmarkList);

    const bookmarked: string[] = [];
    const others: string[] = [];

    for (const symbol of symbolList) {
      if (bookmarkSet.has(symbol)) {
        bookmarked.push(symbol);
      } else {
        others.push(symbol);
      }
    }

    const sortedBookmarked = bookmarkList.filter((symbol) => bookmarked.includes(symbol));

    return [...sortedBookmarked, ...others];
  };

  const sortedSymbolList = bookmarkList.length === 0 ? symbolList : sortWithBookmarkFirst();

  const { data: iconMap } = useSymbolImage(
    sortedSymbolList.map((symbol) => symbol.replace('USDT', ''))
  );

  return (
    <>
      {/* symbolList가 있으면 react-query data는 항상 있으므로 suspense를 쓸수 없음, 따라서 fallback을 수동으로 설정*/}
      {sortedSymbolList.length > 0 ? (
        sortedSymbolList.map((symbol) => (
          <CoinPriceItem
            key={symbol}
            symbol={symbol}
            koreanSymbol={findKoreanSymbol(symbol, upbitSymbolList)}
            toggleBookmark={toggleBookmark}
            imgSrc={iconMap?.get(symbol.replace('USDT', '').toLowerCase())}
          />
        ))
      ) : (
        <LoadingFallback />
      )}
    </>
  );
};

export default CoinPriceList;
