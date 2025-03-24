import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { isSharedWorker } from '../utils/util';

export const SymbolContext = createContext<{
  symbol: string;
  setSymbol: (value: string) => void;
  symbolList: string[];
  setSymbolList: (value: string[]) => void;
  worker: SharedWorker | Worker;
  upbitWorker: SharedWorker | Worker;
} | null>(null);

export const useSymbol = () => {
  const context = useContext(SymbolContext);
  if (!context) {
    throw new Error('useCount must be used within a CountProvider');
  }
  return context;
};

const SymbolContextProvider = ({ children }: { children: ReactNode }) => {
  const [symbol, setSymbol] = useState<string>('ADAUSDT');
  const [symbolList, setSymbolList] = useState<string[]>([]);
  const [worker, setWorker] = useState<Worker | SharedWorker | null>(null);
  const [upbitWorker, setUpbitWorker] = useState<Worker | SharedWorker | null>(null);

  useEffect(() => {
    const createWorker = () => {
      if (typeof SharedWorker !== 'undefined') {
        return new SharedWorker(
          new URL('../worker/binance/BinanceSharedWorker.ts', import.meta.url),
          { type: 'module' }
        );
      } else {
        return new Worker(new URL('../worker/binance/BinanceWorker.ts', import.meta.url), {
          type: 'module',
        });
      }
    };

    const createUpbitWorker = () => {
      if (typeof SharedWorker !== 'undefined') {
        return new SharedWorker(new URL('../worker/upbit/UpbitSharedWorker.ts', import.meta.url), {
          type: 'module',
        });
      } else {
        return new Worker(new URL('../worker/upbit/UpbitWorker.ts', import.meta.url), {
          type: 'module',
        });
      }
    };

    const webWorker = createWorker();
    const upbitWebWorker = createUpbitWorker();
    setWorker(webWorker);
    setUpbitWorker(upbitWebWorker);

    return () => {
      if (webWorker) {
        if (isSharedWorker(webWorker)) {
          webWorker.port.close();
        } else {
          webWorker.terminate();
        }
      }

      if (upbitWebWorker) {
        if (isSharedWorker(upbitWebWorker)) {
          upbitWebWorker.port.close();
        } else {
          upbitWebWorker.terminate();
        }
      }
    };
  }, []);

  if (!worker || !upbitWorker) return null; // 로딩 중 처리

  return (
    <SymbolContext
      value={{
        symbol,
        setSymbol,
        symbolList,
        setSymbolList,
        worker,
        upbitWorker,
      }}
    >
      {children}
    </SymbolContext>
  );
};

export default SymbolContextProvider;
