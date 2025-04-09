import { useAuth } from '@/hooks/AuthContext';
import useTradeStore from '@bitCoinChart/store/useTradeStore';
import { CurrentPriceData, Order } from '@bitCoinChart/types/CoinTypes';
import { isGreaterThen } from '@bitCoinChart/utils/DecimalUtils';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

const CoinTradeContainer = () => {
  const orders = useTradeStore((state) => state.orders);
  const { matchOrders } = useTradeStore.getState();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    const ordersSymbols = new Set(orders.map((order) => order.symbol));
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        const matchList: Order[] = [];

        ordersSymbols.forEach((value) => {
          const data = queryClient.getQueryData([
            'symbol',
            value + 'USDT',
          ]) as CurrentPriceData | null;
          if (data) {
            const curPrice = data.price;
            const curSymbolOrder = orders.filter((order) => order.symbol === value);

            curSymbolOrder.forEach((order) => {
              if (order.side === 'buy') {
                if (isGreaterThen(order.price, curPrice)) {
                  matchList.push(order);
                }
                return;
              }

              if (isGreaterThen(curPrice, order.price)) {
                matchList.push(order);
              }
            });
          }
        });
        if (matchList.length > 0 && user) {
          matchOrders(matchList, user.uid);
        }
      }, 500);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [orders, user]);

  return null;
};

export default CoinTradeContainer;
