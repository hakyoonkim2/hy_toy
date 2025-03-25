import { useState } from 'react';
import LoadingFallback from '../../components/LoadingFallback';
import { bookmarkStorage } from '../utils/BookmarkStorageUtil';
import CoinPriceItem from './CoinPriceItem';

type Props = {
  symbolList: string[];
};

const CoinPriceList = ({ symbolList }: Props) => {
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

  return (
    <>
      {sortedSymbolList.length > 0 ? (
        sortedSymbolList.map((symbol) => (
          <CoinPriceItem key={symbol} symbol={symbol} toggleBookmark={toggleBookmark} />
        ))
      ) : (
        <LoadingFallback />
      )}
    </>
  );
};

export default CoinPriceList;
