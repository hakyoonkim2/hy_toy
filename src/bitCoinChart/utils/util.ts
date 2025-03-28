import { CandleType } from '@bitCoinChart/types/CoinTypes';
import { UpbitSymbol } from '@bitCoinChart/worker/upbit/type/UpbitWorkerTypes';

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

export function findKoreanSymbol(
  symbol: string,
  upbitSymbolList: UpbitSymbol[]
): string | undefined {
  const upbitSymbolsMap = new Map();
  upbitSymbolList.forEach((upbitsymbol) => {
    upbitSymbolsMap.set(upbitsymbol.market.replace('KRW-', ''), upbitsymbol.korean_name);
  });
  const result = upbitSymbolsMap.get(symbol.replace('USDT', ''));
  return result;
}

/**
 * 단위와 간격을 기준으로 기준 시간에서 이전 시간 계산
 * @param currentTime 기준 시간 (timestamp in ms)
 * @param type 단위 ('seconds', 'minutes', 'days', 'weeks', 'months', 'years')
 * @param interval 간격 (예: 15분, 1일, 3개월 등)
 * @returns 이전 시각의 timestamp (ms)
 */
export function getPreviousTime(currentTime: number, type: CandleType, interval: number): number {
  const date = new Date(currentTime);

  switch (type) {
    case 'seconds':
      date.setSeconds(date.getSeconds() - interval);
      break;
    case 'minutes':
      date.setMinutes(date.getMinutes() - interval);
      break;
    case 'days':
      date.setDate(date.getDate() - interval);
      break;
    case 'weeks':
      date.setDate(date.getDate() - interval * 7);
      break;
    case 'months':
      date.setMonth(date.getMonth() - interval);
      break;
    case 'years':
      date.setFullYear(date.getFullYear() - interval);
      break;
    default:
      throw new Error(`Invalid candle type: ${type}`);
  }

  return date.getTime();
}

/**
 * 정해진 유효숫자 개수만큼 숫자만 뽑아서 string으로 만들어주는 method
 * @param value 숫자
 * @param significantDigits 유효숫자개수
 * @returns
 */
export function toSignificantString(value: number, significantDigits: number): string {
  if (value === 0) return '0';

  return value >= 1000
    ? Number.parseFloat(value.toPrecision(significantDigits)).toLocaleString()
    : Number.parseFloat(value.toPrecision(significantDigits)).toString();
}
