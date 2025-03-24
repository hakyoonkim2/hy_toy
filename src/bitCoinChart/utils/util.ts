export const convertKrTime = (ms: number) => {
  return new Date(ms).toLocaleTimeString('ko-KR', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const fetchExchangeRate = async (): Promise<number> => {
  const res = await fetch('https://open.er-api.com/v6/latest/USD');

  if (!res.ok) {
    throw new Error('환율 데이터를 불러오는 데 실패했습니다.');
  }

  const data = await res.json();
  return data.rates.KRW; // USD → KRW 환율 반환
};

export const isSharedWorker = (worker: unknown): worker is SharedWorker => {
  return typeof SharedWorker !== 'undefined' && worker instanceof SharedWorker;
};
