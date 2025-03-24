import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { UpbitSymbol } from '../worker/upbit/UpbitWorkerTypes';
import { useQueryClient } from '@tanstack/react-query';

export const SymbolContext = createContext<{
  symbol: string;
  setSymbol: (value: string) => void;
  symbolList: string[];
  setSymbolList: (value: string[]) => void;
  upbitSymbolList: UpbitSymbol[];
  setUpbitSymbolList: (value: UpbitSymbol[]) => void;
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

  const url = new URL(/* @vite-ignore */ workerPath, import.meta.url);
  return new WorkerClass(url, { type: 'module' });
};

const createUpbitWorker = () => {
  const WorkerClass = typeof SharedWorker !== 'undefined' ? SharedWorker : Worker;
  const workerPath =
    typeof SharedWorker !== 'undefined'
      ? '../worker/upbit/UpbitSharedWorker.ts'
      : '../worker/upbit/UpbitWorker.ts';

  const url = new URL(/* @vite-ignore */ workerPath, import.meta.url);
  return new WorkerClass(url, { type: 'module' });
};

const SymbolContextProvider = ({ children }: { children: ReactNode }) => {
  const [symbol, setSymbol] = useState<string>('ADAUSDT');
  const [symbolList, setSymbolList] = useState<string[]>([]);
  const [worker] = useState(() => createWorker());
  const [upbitWorker] = useState(() => createUpbitWorker());
  const [upbitSymbolList, setUpbitSymbolList] = useState<UpbitSymbol[]>([]);
  const queryClient = useQueryClient();
  const isListInit = useRef(false);
  const isUpbitListInit = useRef(false);

  useEffect(() => {
    // server -> sharedWorker| worker -> client 로 전달된 데이터 핸들링
    const onMessageCallback = (event: MessageEvent) => {
      const data = event.data;
      // data type이 'symbolData' 인 경우에만 react-query data로 적재
      if (data?.type === 'symbolData') {
        Object.entries(data.data).forEach(([symbol, data]) => {
          queryClient.setQueryData(['symbol', symbol], data);
        });

        // symbolList가 구성되어있지 않았을때만 setting
        if (isListInit.current === false) {
          const symbols = Object.keys(data.data);
          if (symbols.length > 0) {
            setSymbolList(Object.keys(data.data));
            isListInit.current = true;
          }
        }
      } else {
        console.log(event.data);
      }
    };

    // server -> sharedWorker| worker -> client 로 전달된 데이터 핸들링
    const onUbitMessageCallback = (event: MessageEvent) => {
      const data = event.data;
      // data type이 'symbolData' 인 경우에만 react-query data로 적재
      if (data?.type === 'UpbitsymbolData') {
        console.log(event.data);
        queryClient.setQueryData(['symbol', data.data.symbol], data.data);
        console.log(event.data);
      } else if (data?.type === 'UpbitRestsymbolData') {
        Object.entries(data.data).forEach(([symbol, data]) => {
          queryClient.setQueryData(['symbol', symbol], data);
        });
        console.log(event.data);
      } else if (data?.type === 'upbit_symbol_list') {
        if (isUpbitListInit.current === false) {
          setUpbitSymbolList(data.data);
          isUpbitListInit.current = true;
        }
      } else {
        console.log(event.data);
      }
    };

    if (upbitWorker instanceof SharedWorker) {
      upbitWorker.port.onmessage = onUbitMessageCallback;
    } else {
      upbitWorker.onmessage = onUbitMessageCallback;
    }
    if (worker instanceof SharedWorker) {
      worker.port.onmessage = onMessageCallback;
    } else {
      worker.onmessage = onMessageCallback;
    }
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
        upbitSymbolList,
        setUpbitSymbolList,
        worker,
        upbitWorker,
      }}
    >
      {children}
    </SymbolContext>
  );
};

export default SymbolContextProvider;
