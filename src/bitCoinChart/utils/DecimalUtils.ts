// utils/decimalUtils.ts
import Decimal from 'decimal.js';

Decimal.set({ toExpNeg: -20, toExpPos: 20 });

// 문자열 또는 숫자를 안전하게 Decimal로 변환
export const toDecimal = (value: string | number): Decimal => new Decimal(value || 0);

export const toFixedDecimals = (value: string | number): string => toDecimal(value || 0).toFixed(8);

// 덧셈
export const addDecimals = (a: string | number, b: string | number): string =>
  toDecimal(a).add(toDecimal(b)).toFixed(8);

export const minusDecimals = (a: string | number, b: string | number): string =>
  toDecimal(a).minus(toDecimal(b)).toFixed(8);

// 곱셈
export const mulDecimals = (a: string | number, b: string | number): string =>
  toDecimal(a).mul(toDecimal(b)).toFixed(8);

export const divideDecimals = (a: string | number, b: string | number): string =>
  toDecimal(a).div(toDecimal(b)).toFixed(8);

// 고정 소수점으로 결과 반환
export const mulFixed = (a: string | number, b: string | number, digits = 8): string =>
  toDecimal(a).mul(toDecimal(b)).toFixed(digits);

export const sdDecimals = (value: string | number): string =>
  toDecimal(value).toSignificantDigits(8).toString();

export const safeDivide = (a: string | number, b: string | number): string => {
  return new Decimal(a).div(b).toDecimalPlaces(8, Decimal.ROUND_DOWN).toString();
};

export const safeMul = (a: string | number, b: string | number): string => {
  return new Decimal(a).mul(b).toDecimalPlaces(8, Decimal.ROUND_DOWN).toString();
};

export const isGreaterThen = (a: string | number, b: string | number): boolean => {
  return new Decimal(a).gte(b);
};
