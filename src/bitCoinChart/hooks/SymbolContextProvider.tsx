import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export const SymbolContext = createContext<{ symbol: string; setSymbol: (value: string) => void; symbolList: string[]; setSymbolList: (value: string[]) => void; worker: SharedWorker  } | null>(null);

export const useSymbol = () => {
  const context = useContext(SymbolContext);
  if (!context) {
    throw new Error("useCount must be used within a CountProvider");
  }
  return context;
};

const worker = new SharedWorker(new URL('../worker/CoinSharedWorker.js', import.meta.url), {type: "module"});

const SymbolContextProvider = ({ children }: { children: ReactNode }) => {
    const [symbol, setSymbol] = useState<string>("ADAUSDT");
    const [symbolList, setSymbolList] = useState<string[]>([]);

    useEffect(() => {
      return () => {
        worker.port.close();
      }
    }, []);
  
    return (
      <SymbolContext value={{ symbol, setSymbol, symbolList, setSymbolList, worker}}>
        {children}
      </SymbolContext>
    );
  };

export default SymbolContextProvider;