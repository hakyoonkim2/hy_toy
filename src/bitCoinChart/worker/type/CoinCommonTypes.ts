export type PriceData = {
  price: number;
  openPrice: number;
  color: string;
  asset: number;
};

export type PriceMap = {
  [key: string]: PriceData;
};
