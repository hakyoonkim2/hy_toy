import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

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

const createWorker = () => {
  try {
    if (typeof SharedWorker !== 'undefined') {
      return new SharedWorker(
        new URL(/* @vite-ignore */ '../worker/binance/BinanceSharedWorker.ts', import.meta.url),
        {
          type: 'module',
        }
      );
    } else {
      return new Worker(new URL('../worker/binance/BinanceWorker.ts', import.meta.url), {
        type: 'module',
      });
    }
  } catch {
    return new Worker(new URL('../worker/binance/BinanceWorker.ts', import.meta.url), {
      type: 'module',
    });
  }
};

const createUpbitWorker = () => {
  try {
    if (typeof SharedWorker !== 'undefined') {
      return new SharedWorker(
        new URL(/* @vite-ignore */ '../worker/upbit/UpbitSharedWorker.ts', import.meta.url),
        {
          type: 'module',
        }
      );
    } else {
      return new Worker(new URL('../worker/upbit/UpbitWorker.ts', import.meta.url), {
        type: 'module',
      });
    }
  } catch {
    return new Worker(new URL('../worker/upbit/UpbitWorker.ts', import.meta.url), {
      type: 'module',
    });
  }
};

const SymbolContextProvider = ({ children }: { children: ReactNode }) => {
  const [symbol, setSymbol] = useState<string>('ADAUSDT');
  const [symbolList, setSymbolList] = useState<string[]>([]);
  const [worker] = useState(() => createWorker());
  const [upbitWorker] = useState(() => createUpbitWorker());

  useEffect(() => {
    return () => {
      if (worker instanceof SharedWorker) {
        worker.port.close();
      } else {
        worker.terminate();
      }
      if (upbitWorker instanceof SharedWorker) {
        upbitWorker.port.close();
      } else {
        upbitWorker.terminate();
      }
    };
  }, []);

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
