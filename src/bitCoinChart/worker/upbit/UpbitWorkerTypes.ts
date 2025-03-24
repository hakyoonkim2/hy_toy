export interface UpbitSymbol {
    market: string;
    korean_name: string;
    english_name: string;
    market_warning: string;
    opening_price: string;
    trade_price: string;
    market_event: UpbitMarketEvent;
}

interface UpbitMarketEvent {
    caution: UpbitCaution;
    warning: string;
}

interface UpbitCaution {
    CONCENTRATION_OF_SMALL_ACCOUNTS: boolean;
    DEPOSIT_AMOUNT_SOARING: boolean;
    GLOBAL_PRICE_DIFFERENCES: boolean;
    PRICE_FLUCTUATIONS: boolean;
    TRADING_VOLUME_SOARING: boolean;
}

export interface UpbitTickerData {
    acc_ask_volume : number;
    acc_bid_volume : number;
    acc_trade_price : number;
    acc_trade_price_24h : number;
    acc_trade_volume : number;
    acc_trade_volume_24h: number;
    ask_bid: string;
    change : string;
    change_price : number;
    change_rate : number;
    code : string;
    delisting_date : string | null; 
    high_price : number;
    highest_52_week_date : number;
    highest_52_week_price : number;
    is_trading_suspended : boolean;
    low_price : number;
    lowest_52_week_date : string;
    lowest_52_week_price : number;
    market_state : string;
    market_warning : string;
    opening_price : number;
    prev_closing_price : number;
    signed_change_price : number;
    signed_change_rate : number;
    stream_type : string;
    timestamp : number;
    trade_date : string;
    trade_price : number;
    trade_time : string;
    trade_timestamp : number;
    trade_volume : number;
    type : string;
}