import CoinTradeContainer from '@bitCoinChart/components/trade/CoinTradeContainer';
import SymbolContextProvider from '@bitCoinChart/hooks/SymbolContextProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet } from 'react-router-dom';

const queryClient = new QueryClient();

function CoinAppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <SymbolContextProvider>
        <CoinTradeContainer />
        <Outlet />
      </SymbolContextProvider>
    </QueryClientProvider>
  );
}

export default CoinAppWrapper;
