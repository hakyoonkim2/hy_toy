import { UpbitSymbol } from '../worker/upbit/UpbitWorkerTypes';

export function convertKrTime(ms: number) {
  return new Date(ms).toLocaleTimeString('ko-KR', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export async function fetchExchangeRate(): Promise<number> {
  const res = await fetch('https://open.er-api.com/v6/latest/USD');

  if (!res.ok) {
    throw new Error('환율 데이터를 불러오는 데 실패했습니다.');
  }

  const data = await res.json();
  return data.rates.KRW; // USD → KRW 환율 반환
}

function getFirstCharType(str: string): 'korean' | 'english' | 'other' {
  if (!str) return 'other';

  const firstChar = str.trim().charAt(0);

  if (/[\uAC00-\uD7A3]/.test(firstChar)) {
    return 'korean';
  }

  if (/[a-zA-Z]/.test(firstChar)) {
    return 'english';
  }

  return 'other';
}

function splitKoreanName(name: string): string[] {
  const match = name.match(/^(.+)\((.+)\)$/);
  if (match) {
    return [match[1], match[2]];
  }
  return [name];
}

export function searchCoinKeyword(
  query: string,
  symbolList: UpbitSymbol[],
  binanceSymbolList: string[]
): string {
  const charType = getFirstCharType(query);
  const lowerQuery = query.toLowerCase();
  if (charType === 'english') {
    if (binanceSymbolList.includes(query.toUpperCase())) {
      return query;
    }
  }
  for (let i = 0; i < symbolList.length; i++) {
    const { korean_name, english_name, market } = symbolList[i];
    const lowerEnglishName = english_name.toLowerCase();
    const symbol = market.replace('KRW-', '').toLowerCase();
    if (charType === 'korean') {
      const koreanNames = splitKoreanName(korean_name).map((name) => name.toLowerCase());
      if (koreanNames.includes(lowerQuery)) {
        return symbol;
      }
    } else if (charType === 'english') {
      if (lowerEnglishName === lowerQuery || symbol === lowerQuery) {
        return symbol;
      }
    }
  }
  return '';
}

export function isSharedWorker(worker: unknown): worker is SharedWorker {
  return typeof SharedWorker !== 'undefined' && worker instanceof SharedWorker;
}
