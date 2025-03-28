import { useSymbolImage } from '@bitCoinChart/hooks/BinanceHooks';

type Props = {
  symbol: string;
};

const CoinIcon = ({ symbol }: Props) => {
  const { data: iconMap } = useSymbolImage();
  const coinIcon = iconMap?.get(symbol.replace('USDT', '').toLowerCase());

  return coinIcon ? (
    <img
      src={iconMap?.get(symbol.replace('USDT', '').toLowerCase())}
      alt="Coin symbol icon"
      width={15}
      height={15}
    />
  ) : (
    <></>
  );
};

export default CoinIcon;
