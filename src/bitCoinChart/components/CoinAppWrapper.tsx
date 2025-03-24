import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet } from 'react-router-dom';
import SymbolContextProvider from '../hooks/SymbolContextProvider';

const queryClient = new QueryClient();

function CoinAppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <SymbolContextProvider>
        <Outlet />
      </SymbolContextProvider>
    </QueryClientProvider>
  );
}

export default CoinAppWrapper;
