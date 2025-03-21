import React, { createContext, useEffect, useState, ReactNode, useRef } from "react";
import CoinWebSocketManager from '../api/CoinWebSocketManager'
import { CandlestickData } from "lightweight-charts";

// Context 생성
export const CoinWebSocketContext = createContext<CandlestickData[]>([]);

interface CoinWebSocketProviderProps {
    symbol: string;
    children: ReactNode;
}

const CoinWebSocketProvider: React.FC<CoinWebSocketProviderProps> = ({ symbol, children }) => {
    const [webSocketData, setWebSocketData] = useState<CandlestickData[]>([]);
    const managerRef = useRef<CoinWebSocketManager | null>(null);
    
    useEffect(() => {
        managerRef.current = new CoinWebSocketManager(symbol);
        // WebSocket 데이터 구독
        managerRef.current.subscribe(setWebSocketData);

        return () => {
            // 컴포넌트 unmount 시 WebSocket 연결 해제
            if (managerRef.current) {
                managerRef.current.unsubscribe(setWebSocketData);
                managerRef.current.closeAll();
            }
        };
    }, [symbol]);

    return (
        <CoinWebSocketContext.Provider value={webSocketData}>
            {children}
        </CoinWebSocketContext.Provider>
    );
};

export default CoinWebSocketProvider;
