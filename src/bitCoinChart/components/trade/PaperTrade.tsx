import styles from '@bitCoinChart/style/PaperTrade.module.scss';
import { useAuth } from '@/hooks/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import useTradeStore from '@bitCoinChart/store/useTradeStore';
import {
  addDecimals,
  divideDecimals,
  isGreaterThen,
  minusDecimals,
  mulDecimals,
  safeDivide,
  safeMul,
  sdDecimals,
} from '@bitCoinChart/utils/DecimalUtils';
import { CurrentPriceData, Holding } from '@bitCoinChart/types/CoinTypes';
import { isMobile } from 'react-device-detect';
import { useQueryClient } from '@tanstack/react-query';

const TABS = ['매수', '매도', '미체결', '체결내역', '보유자산'] as const;
const PERCENTS = [10, 25, 50, 100] as const;

type Tab = (typeof TABS)[number];
type Props = {
  symbol: string;
};

const PaperTrade = ({ symbol }: Props) => {
  const { user, setShowingLogin } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('매수');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [price, setPrice] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const queryClient = useQueryClient();

  // method 는 함께 구독
  const { setSelectedPrice, buy, sell, initFromServer, loadFills } = useTradeStore();

  // state 는 개별 구독
  const cash = useTradeStore((state) => state.cash);
  const orders = useTradeStore((state) => state.orders);
  const selectedPrice = useTradeStore((state) => state.selectedPrice);
  const cancelOrder = useTradeStore((state) => state.cancelOrder);
  const holding: Holding | undefined = useTradeStore((state) => state.holdings[symbol]);
  const allHoldings = useTradeStore((state) => state.holdings);
  const fills = useTradeStore((state) => state.fills);

  const pendingSymbolAmount = orders.reduce((acc, order) => {
    if (order.symbol === symbol && order.side === 'sell') {
      return addDecimals(acc, order.amount);
    }
    return addDecimals(acc, '0');
  }, '0');

  const pendingBuyCash = orders.reduce((acc, order) => {
    if (order.side === 'buy') {
      return addDecimals(acc, mulDecimals(order.amount, order.price));
    }
    return addDecimals(acc, '0');
  }, '0');

  const availableCash = minusDecimals(cash, pendingBuyCash);

  // 에러 메시지 자동 소멸
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (selectedPrice !== null && user) {
      setPrice(selectedPrice.toString());
    }
  }, [selectedPrice, user]);

  useEffect(() => {
    initFromServer(user?.uid);
  }, [user]);

  useEffect(() => {
    return () => {
      setSelectedPrice(null);
      setPrice('');
      setAmount('');
    };
  }, [symbol, activeTab]);

  // 체결내역 탭 활성화 시 fills 로드
  useEffect(() => {
    if (activeTab === '체결내역' && user) {
      loadFills(user.uid);
    }
  }, [activeTab, user]);

  const handleBtnClick = () => {
    setShowingLogin(true);
  };

  const formatInputNumber = (value: string) => {
    const num = value.replace(/[^\d.]/g, '');
    const parts = num.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const formatNumber = (value: string) => {
    const num = sdDecimals(value);
    const parts = num.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const handleNumberInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void
  ) => {
    const val = e.target.value;
    if (val === '.') {
      setter('0.');
      return;
    }

    const validPattern = /^[\d,.]*$/;
    const dotCount = (val.match(/\./g) || []).length;

    if (validPattern.test(val) && dotCount <= 1) {
      setter(val.replace(/,/g, ''));
    }
  };

  const getColor = (tabType: string) => {
    if (tabType === '매수') return 'rgb(247, 84, 103)';
    if (tabType === '매도') return 'rgb(67, 134, 249)';
    return '#ccc';
  };

  const total = mulDecimals(price, amount);

  const handlePercentClick = (percent: number) => {
    if (activeTab === '매수') {
      if (price === '0' || !price) return;
      const useCash = divideDecimals(mulDecimals(availableCash, percent), 100);

      setAmount(safeDivide(useCash, price));
    } else {
      const amount = holding?.amount ?? '0';
      if (amount !== '0') {
        setAmount(safeMul(amount, divideDecimals(percent, 100)));
      }
    }
  };

  const handleOrderClick = async () => {
    if (!user) return;

    const orderTotalMoney = safeMul(price, amount);

    if (activeTab === '매수') {
      if (isGreaterThen(5, orderTotalMoney)) {
        setErrorMessage('최소 주문금액은 $5 입니다.');
        return;
      }
      if (isGreaterThen(orderTotalMoney, availableCash)) {
        setErrorMessage('보유 현금이 부족합니다.');
        return;
      }
      try {
        await buy(symbol, price, amount, user.uid, total);
      } catch {
        setErrorMessage('주문 오류, 다시 시도해주세요.');
        return;
      }
    } else {
      const holdingAmount = holding?.amount ?? '0';
      try {
        if (isGreaterThen(amount, holdingAmount)) {
          setErrorMessage('보유 수량이 부족합니다.');
          return;
        }

        if (isGreaterThen(5, orderTotalMoney)) {
          setErrorMessage('최소 주문금액은 $5 입니다.');
          return;
        }

        await sell(symbol, price, amount, user.uid);
      } catch {
        setErrorMessage('주문이 잘못되었습니다.');
        return;
      }
    }
    setAmount('');
    setPrice('');
  };

  const handleCancelClick = async (docId: string) => {
    if (user) await cancelOrder(docId, user.uid);
  };

  const formatTimeLineBreak = (time: number) => {
    const rawText = new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date(time));

    const lastDotIndex = rawText.lastIndexOf('.');
    const datePart = rawText.slice(0, lastDotIndex + 1).trim();
    const timePart = rawText.slice(lastDotIndex + 1).trim();

    return (
      <span style={{ whiteSpace: 'nowrap' }}>
        {datePart}
        <br />
        {timePart}
      </span>
    );
  };

  // 보유자산 탭 데이터 계산
  const holdingRows = useMemo(() => {
    return Object.values(allHoldings)
      .filter((h) => parseFloat(h.amount) > 0)
      .map((h) => {
        const currentPriceData = queryClient.getQueryData([
          'symbol',
          h.symbol + 'USDT',
        ]) as CurrentPriceData | null;

        const currentPrice = currentPriceData?.price?.toString() ?? '0';
        const hasPrice = currentPriceData !== null && currentPriceData !== undefined;
        const marketValue = hasPrice ? mulDecimals(h.amount, currentPrice) : '0';
        const costBasis = mulDecimals(h.amount, h.price);
        const pnl = hasPrice ? minusDecimals(marketValue, costBasis) : '0';
        const pnlPercent =
          hasPrice && parseFloat(costBasis) > 0
            ? sdDecimals(mulDecimals(divideDecimals(pnl, costBasis), '100'))
            : '0';
        const pnlNum = parseFloat(pnl);

        return {
          symbol: h.symbol,
          amount: h.amount,
          avgPrice: h.price,
          currentPrice,
          hasPrice,
          marketValue,
          pnl,
          pnlPercent,
          pnlColor: pnlNum >= 0 ? 'rgb(247, 84, 103)' : 'rgb(67, 134, 249)',
          pnlSign: pnlNum >= 0 ? '+' : '-',
          pnlNum,
        };
      });
  }, [allHoldings, queryClient]);

  const totalPortfolioValue = useMemo(() => {
    const holdingsValue = holdingRows.reduce(
      (acc, row) => (row.hasPrice ? addDecimals(acc, row.marketValue) : acc),
      '0'
    );
    return addDecimals(cash, holdingsValue);
  }, [holdingRows, cash]);

  const totalPnl = useMemo(() => {
    const totalCost = holdingRows.reduce(
      (acc, row) => addDecimals(acc, mulDecimals(row.amount, row.avgPrice)),
      '0'
    );
    const totalMarket = holdingRows.reduce(
      (acc, row) => (row.hasPrice ? addDecimals(acc, row.marketValue) : acc),
      '0'
    );
    return minusDecimals(totalMarket, totalCost);
  }, [holdingRows]);

  const totalPnlNum = parseFloat(totalPnl);

  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        <label className={styles.title}>모의투자</label>
        <span className={styles.betaWrapper}>
          <span className={styles.betaBadge}>Beta</span>
          <div className={styles.tooltip} style={isMobile ? { left: '-100px' } : {}}>
            현재 모의 투자는 사이트에 접속한 상태일때만 주문체결이 가능합니다.
            <br />
            보유자산, 체결내역 탭에서 거래 현황을 확인할 수 있습니다.
          </div>
        </span>
      </div>
      <div style={{ display: 'flex', width: '100%' }}>
        {TABS.map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={styles.tab}
            style={activeTab === tab ? { color: getColor(tab), borderBottom: '2px solid' } : {}}
          >
            {tab}
          </div>
        ))}
      </div>

      {errorMessage && (
        <div className={styles.errorBanner} onClick={() => setErrorMessage(null)}>
          {errorMessage}
        </div>
      )}

      <div className={styles.contentContainer}>
        {(activeTab === '매수' || activeTab === '매도') && (
          <>
            <div className={styles.rowContent}>
              <div>주문가능</div>
              {activeTab === '매수' ? (
                <div>
                  {formatNumber(availableCash)}
                  <span> USD</span>
                </div>
              ) : (
                <div>
                  {formatNumber(minusDecimals(holding?.amount ?? '0', pendingSymbolAmount))}
                  <span> {symbol}</span>
                </div>
              )}
            </div>
            <div className={styles.rowContent}>
              <div>
                {`${activeTab} 가격`} <span>(USD)</span>
              </div>
              <div>
                <input
                  type="text"
                  value={formatInputNumber(price)}
                  onChange={(e) => handleNumberInput(e, setPrice)}
                  disabled={!user}
                  placeholder="0"
                />
              </div>
            </div>
            <div className={styles.rowContent}>
              <div>
                주문 수량 <span>({symbol})</span>
              </div>
              <div>
                <input
                  type="text"
                  value={formatInputNumber(amount)}
                  onChange={(e) => handleNumberInput(e, setAmount)}
                  disabled={!user}
                  placeholder="0"
                />
              </div>
            </div>
            <div className={styles.rowContent} style={{ justifyContent: 'right', gap: '0.2rem' }}>
              {PERCENTS.map((value) => (
                <button
                  key={value}
                  disabled={!user}
                  onClick={() => {
                    handlePercentClick(value);
                  }}
                >
                  {`${value}%`}
                </button>
              ))}
            </div>
            <div className={styles.rowContent}>
              <div>
                주문 총액 <span>(USD)</span>
              </div>
              <div>
                <input type="text" value={formatNumber(total)} disabled />
              </div>
            </div>
          </>
        )}

        {activeTab === '미체결' && (
          <div className={styles.orderList}>
            <table className={styles.orderTable}>
              <thead>
                <tr>
                  <th rowSpan={2}>주문시간</th>
                  <th>마켓명</th>
                  <th rowSpan={2}>주문가격</th>
                  <th>주문수량</th>
                  <th rowSpan={2}>주문취소</th>
                </tr>
                <tr>
                  <th>구분</th>
                  <th>미체결량</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr key={i}>
                    <td>{formatTimeLineBreak(order.timestamp.seconds * 1000)}</td>
                    <td>
                      {order.symbol}
                      <br />
                      <span style={{ color: getColor(order.side === 'buy' ? '매수' : '매도') }}>
                        {order.side === 'buy' ? '매수' : '매도'}
                      </span>
                    </td>
                    <td>{formatNumber(order.price)} USD</td>
                    <td>
                      {formatNumber(order.amount)}
                      <br />
                      {formatNumber(minusDecimals(order.amount, order.filledAmount))}
                    </td>
                    <td>
                      <button onClick={() => handleCancelClick(order.docId)}>주문취소</button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '1rem' }}>
                      미체결 주문이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === '체결내역' && (
          <div className={styles.orderList}>
            <table className={styles.orderTable}>
              <thead>
                <tr>
                  <th>체결시간</th>
                  <th>마켓명</th>
                  <th>구분</th>
                  <th>체결가격</th>
                  <th>체결수량</th>
                  <th>체결금액</th>
                </tr>
              </thead>
              <tbody>
                {fills.map((fill, i) => (
                  <tr key={fill.docId || i}>
                    <td>{formatTimeLineBreak(fill.filledAt.seconds * 1000)}</td>
                    <td>{fill.symbol}</td>
                    <td style={{ color: getColor(fill.type === 'buy' ? '매수' : '매도') }}>
                      {fill.type === 'buy' ? '매수' : '매도'}
                    </td>
                    <td>{formatNumber(fill.price)} USD</td>
                    <td>{formatNumber(fill.amount)}</td>
                    <td>{formatNumber(mulDecimals(fill.price, fill.amount))} USD</td>
                  </tr>
                ))}
                {fills.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '1rem' }}>
                      체결 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === '보유자산' && (
          <div className={styles.orderList}>
            <div className={styles.portfolioSummary}>
              <div className={styles.rowContent}>
                <div>보유 현금</div>
                <div>{formatNumber(cash)} USD</div>
              </div>
              <div className={styles.rowContent}>
                <div>총 평가금액</div>
                <div>{formatNumber(totalPortfolioValue)} USD</div>
              </div>
              <div className={styles.rowContent}>
                <div>총 평가손익</div>
                <div
                  style={{ color: totalPnlNum >= 0 ? 'rgb(247, 84, 103)' : 'rgb(67, 134, 249)' }}
                >
                  {totalPnlNum >= 0 ? '+' : ''}
                  {formatNumber(totalPnl)} USD
                </div>
              </div>
            </div>
            <table className={styles.orderTable}>
              <thead>
                <tr>
                  <th>코인</th>
                  <th>보유수량</th>
                  <th>매수평균가</th>
                  <th>현재가</th>
                  <th>평가손익</th>
                </tr>
              </thead>
              <tbody>
                {holdingRows.map((row) => (
                  <tr key={row.symbol}>
                    <td>{row.symbol}</td>
                    <td>{formatNumber(row.amount)}</td>
                    <td>{formatNumber(row.avgPrice)} USD</td>
                    <td>{row.hasPrice ? `${formatNumber(row.currentPrice)} USD` : '---'}</td>
                    <td style={{ color: row.pnlColor }}>
                      {row.hasPrice ? (
                        <>
                          {row.pnlSign}
                          {formatNumber(
                            row.pnlNum >= 0 ? row.pnl : minusDecimals('0', row.pnl)
                          )}{' '}
                          USD
                          <br />({row.pnlPercent}%)
                        </>
                      ) : (
                        '---'
                      )}
                    </td>
                  </tr>
                ))}
                {holdingRows.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '1rem' }}>
                      보유 자산이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        {!user && (
          <button onClick={handleBtnClick} className={styles.bottomButton}>
            Please Login
          </button>
        )}
        {(activeTab === '매수' || activeTab === '매도') && user !== null && (
          <button onClick={handleOrderClick} className={styles.bottomButton}>
            주문하기
          </button>
        )}
      </div>
    </div>
  );
};

export default PaperTrade;
