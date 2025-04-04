type Props = {
  imgSrc?: string;
};

const CoinIcon = ({ imgSrc }: Props) => {
  const coinIcon = imgSrc;

  return coinIcon ? <img src={coinIcon} alt="Coin symbol icon" width={15} height={15} /> : <></>;
};

export default CoinIcon;
