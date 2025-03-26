import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { UpbitSymbol } from '../worker/upbit/UpbitWorkerTypes';
import { useQueryClient } from '@tanstack/react-query';
import { isSharedWorker } from '../utils/util';
import { WorkerMessageEnum } from '../worker/enum/WorkerMessageEnum';

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

const SymbolContextProvider = ({ children }: { children: ReactNode }) => {
  const [symbol, setSymbol] = useState<string>('ADAUSDT');
  const [symbolList, setSymbolList] = useState<string[]>([]);
  const [worker, setWorker] = useState<Worker | SharedWorker | null>(null);
  const [upbitWorker, setUpbitWorker] = useState<Worker | SharedWorker | null>(null);
  const [upbitSymbolList, setUpbitSymbolList] = useState<UpbitSymbol[]>([]);
  const queryClient = useQueryClient();
  const isListInit = useRef(false);
  const isUpbitListInit = useRef(false);

  useEffect(() => {
    // server -> sharedWorker| worker -> client 로 전달된 데이터 핸들링
    const onMessageCallback = (event: MessageEvent) => {
      const data = event.data;
      // data type이 'symbolData' 인 경우에만 react-query data로 적재
      if (data?.type === WorkerMessageEnum.BINANCE_SYMBOLS_DATA) {
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
      if (data?.type === WorkerMessageEnum.UPBIT_SYMBOL_TRADE_DATA) {
        Object.entries(data.data).forEach(([symbol, data]) => {
          queryClient.setQueryData(['symbol', symbol], data);
        });
      } else if (data?.type === WorkerMessageEnum.UPBIT_SYMBOLS_RESTAPI_TRADE_DATA) {
        Object.entries(data.data).forEach(([symbol, data]) => {
          queryClient.setQueryData(['symbol', symbol], data);
        });
        console.log(event.data);
      } else if (data?.type === WorkerMessageEnum.UPBIT_SYMBOL_LIST) {
        if (isUpbitListInit.current === false) {
          setUpbitSymbolList([...data.data]);
          isUpbitListInit.current = true;
        }
      } else {
        console.log(event.data);
      }
    };

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

    if (upbitWebWorker) {
      if (isSharedWorker(upbitWebWorker)) {
        upbitWebWorker.port.onmessage = onUbitMessageCallback;
      } else {
        upbitWebWorker.onmessage = onUbitMessageCallback;
      }
    }

    if (webWorker) {
      if (isSharedWorker(webWorker)) {
        webWorker.port.onmessage = onMessageCallback;
      } else {
        webWorker.onmessage = onMessageCallback;
      }
    }
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
