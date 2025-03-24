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
  const WorkerClass = typeof SharedWorker !== 'undefined' ? SharedWorker : Worker;
  const workerPath =
    typeof SharedWorker !== 'undefined'
      ? '../worker/binance/BinanceSharedWorker.ts'
      : '../worker/binance/BinanceWorker.ts';

  const url = new URL(workerPath, import.meta.url);
  return new WorkerClass(url, { type: 'module' });
};

const createUpbitWorker = () => {
  const WorkerClass = typeof SharedWorker !== 'undefined' ? SharedWorker : Worker;
  const workerPath =
    typeof SharedWorker !== 'undefined'
      ? '../worker/upbit/UpbitSharedWorker.ts'
      : '../worker/upbit/UpbitWorker.ts';

  const url = new URL(workerPath, import.meta.url);
  return new WorkerClass(url, { type: 'module' });
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
