import { useQuery } from '@tanstack/react-query';

type Props = {
  symbol: string;
};

const CoinIcon = ({ symbol }: Props) => {
  const { data: coinIcon } = useQuery<string | null>({
    queryKey: ['symbolImage', symbol.replace('USDT', '').toLowerCase()],
    queryFn: async () => null,
    initialData: null,
    staleTime: Infinity,
  });

  return coinIcon ? <img src={coinIcon} alt="Coin symbol icon" width={15} height={15} /> : <></>;
};

export default CoinIcon;
