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
  acc_ask_volume: number;
  acc_bid_volume: number;
  acc_trade_price: number;
  acc_trade_price_24h: number;
  acc_trade_volume: number;
  acc_trade_volume_24h: number;
  ask_bid: string;
  change: string;
  change_price: number;
  change_rate: number;
  code: string;
  delisting_date: string | null;
  high_price: number;
  highest_52_week_date: number;
  highest_52_week_price: number;
  is_trading_suspended: boolean;
  low_price: number;
  lowest_52_week_date: string;
  lowest_52_week_price: number;
  market_state: string;
  market_warning: string;
  opening_price: number;
  prev_closing_price: number;
  signed_change_price: number;
  signed_change_rate: number;
  stream_type: string;
  timestamp: number;
  trade_date: string;
  trade_price: number;
  trade_time: string;
  trade_timestamp: number;
  trade_volume: number;
  type: string;
}

export interface UpbitRestTicker {
  market: string; // 종목 코드 (예: KRW-BTC)
  trade_date: string; // 최근 거래 일자 (yyyyMMdd)
  trade_time: string; // 최근 거래 시각 (HHmmss)
  trade_date_kst: string; // 최근 거래 일자 KST
  trade_time_kst: string; // 최근 거래 시각 KST
  trade_timestamp: number; // 체결 타임스탬프 (ms)
  opening_price: number; // 시가
  high_price: number; // 고가
  low_price: number; // 저가
  trade_price: number; // 현재가 (최종 체결가)
  prev_closing_price: number; // 전일 종가
  change: 'RISE' | 'FALL' | 'EVEN'; // 전일 대비 (상승/하락/보합)
  change_price: number; // 전일 대비 절대값
  change_rate: number; // 전일 대비 변화율
  signed_change_price: number; // 전일 대비 부호 있는 변화액
  signed_change_rate: number; // 전일 대비 부호 있는 변화율
  trade_volume: number; // 최근 체결량
  acc_trade_price: number; // 누적 거래대금 (UTC 0시 기준)
  acc_trade_price_24h: number; // 24시간 누적 거래대금
  acc_trade_volume: number; // 누적 거래량 (UTC 0시 기준)
  acc_trade_volume_24h: number; // 24시간 누적 거래량
  highest_52_week_price: number; // 52주 최고가
  highest_52_week_date: string; // 52주 최고가 달성 일자 (yyyy-MM-dd)
  lowest_52_week_price: number; // 52주 최저가
  lowest_52_week_date: string; // 52주 최저가 달성 일자 (yyyy-MM-dd)
  timestamp: number; // 타임스탬프 (ms)
}
