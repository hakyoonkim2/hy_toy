const STORAGE_KEY = 'coinBookmarks';

const getBookmarks = (): string[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Invalid JSON in localStorage:', e);
    return [];
  }
};

const setBookmarks = (symbols: string[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols));
};

export const bookmarkStorage = {
  // 현재 저장된 심볼 리스트 가져오기
  get: getBookmarks,

  // 특정 심볼이 북마크 되어 있는지 확인
  has: (symbol: string): boolean => {
    return getBookmarks().includes(symbol);
  },

  // 심볼 추가 (중복 방지)
  add: (symbol: string) => {
    const current = getBookmarks();
    if (!current.includes(symbol)) {
      setBookmarks([...current, symbol]);
    }
  },

  // 심볼 제거
  remove: (symbol: string) => {
    const current = getBookmarks();
    const updated = current.filter((s) => s !== symbol);
    setBookmarks(updated);
  },

  // 토글 (북마크 상태 반전)
  // this를 사용해야하므로 화살표함수 사용하지않았음.
  toggle(symbol: string) {
    if (this.has(symbol)) {
      this.remove(symbol);
    } else {
      this.add(symbol);
    }
  },
};
