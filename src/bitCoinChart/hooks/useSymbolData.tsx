import { useQuery } from "@tanstack/react-query"
import { CurrentPriceData } from "../types/CoinTypes";

const useSymbolData = (symbol: string) => {
    return useQuery<CurrentPriceData | null>({
        queryKey: ["symbol", symbol],
        queryFn: async () => null,
        initialData: null,
    })
}

export default useSymbolData;