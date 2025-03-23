export type PriceData = {
    price: number,
    openPrice: number,
    color: string,
}

export type PriceMap = {
    [key: string] : PriceData; 
}