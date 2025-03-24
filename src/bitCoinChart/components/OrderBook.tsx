import React, { useEffect, useState, useRef, useContext } from 'react';
import { CoinWebSocketContext } from '../context/CoinWebSocketContext';
import style from '../style/chart.module.scss';
import { BINANCE_URL } from '../types/CoinTypes';
import LoadingFallback from '../../components/LoadingFallback';

type Order = [string, string];

type OrderBookProps = {
  symbol: string;
};

const BAR_WIDTH = 100;

export const OrderBook: React.FC<OrderBookProps> = ({ symbol }) => {
  const [bids, setBids] = useState<Order[]>([]);
  const [asks, setAsks] = useState<Order[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const red = '#f75467';
  const blue = '#4386f9';
  const { candleData } = useContext(CoinWebSocketContext);
  const lastPrice = candleData.at(-1)?.close;

  // 최대 수량 계산 (비율 바를 위해)
  const getMaxAmount = () => {
    const all = [...bids, ...asks].map(([, amount]) => parseFloat(amount));
    return Math.max(...all, 1); // 0 방지
  };

  useEffect(() => {
    const wsUrl = `${BINANCE_URL}${symbol.toLowerCase()}@depth10@100ms`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.asks && data.bids) {
        setBids(data.bids.slice(0, 10));
        setAsks(data.asks.slice(0, 10).reverse());
      }
    };

    return () => {
      socket.close();
    };
  }, [symbol]);

  const maxAmount = getMaxAmount();

  const renderRow = (type: 'ask' | 'bid', [price, amount]: Order) => {
    const parsedAmount = parseFloat(amount);
    const ratio = (parsedAmount / maxAmount) * BAR_WIDTH;

    const barStyle = {
      width: `${ratio}%`,
      backgroundColor: type === 'ask' ? 'rgba(0, 0, 255, 0.1)' : 'rgba(255, 0, 0, 0.1)',
    };

    const rowStyle = {
      border: lastPrice?.toString() === parseFloat(price).toString() ? '1px solid #FFFFFF' : 'none',
    };

    return (
      <div key={price} className={style.rowStyle} style={rowStyle}>
        <div className={style.barstyle} style={barStyle}></div>
        <span style={{ color: type === 'ask' ? blue : red, fontWeight: 600 }}>
          {parseFloat(price)}
        </span>{' '}
        <span style={{ float: 'right' }}>{parseFloat(amount)}</span>
      </div>
    );
  };

  return bids.length === 0 ? (
    <LoadingFallback />
  ) : (
    <div className={style.orderbook}>
      <div style={{ flex: 1 }}>
        <div style={{ color: blue, marginBottom: '8px' }}>
          {asks.map((order) => renderRow('ask', order))}
        </div>
        <div style={{ color: red, marginBottom: '8px' }}>
          {bids.map((order) => renderRow('bid', order))}
        </div>
      </div>
    </div>
  );
};
