import styles from '@bitCoinChart/style/PaperTrade.module.scss';
import { useAuth } from '@/hooks/AuthContext';
import { useEffect, useState } from 'react';
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
import { Holding } from '@bitCoinChart/types/CoinTypes';

const TABS = ['매수', '매도', '거래내역'] as const;
const PERCENTS = [10, 25, 50, 100] as const;

type Tab = (typeof TABS)[number];
type Props = {
  symbol: string;
};

const PaperTrade = ({ symbol }: Props) => {
  const { user, setShowingLogin } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('매수');

  const [price, setPrice] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  // method 는 함께 구독
  const { setSelectedPrice, buy, sell, initFromServer } = useTradeStore();

  // state 는 개별 구독
  const cash = useTradeStore((state) => state.cash);
  const orders = useTradeStore((state) => state.orders);
  const selectedPrice = useTradeStore((state) => state.selectedPrice);
  const cancelOrder = useTradeStore((state) => state.cancelOrder);
  const holding: Holding | undefined = useTradeStore((state) => state.holdings[symbol]);

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
    // user가 없는 경우 주문 불가
    if (!user) return;

    const orderTotalMoney = safeMul(price, amount);

    if (activeTab === '매수') {
      // $5 미만 인 경우 주문 불가
      if (isGreaterThen(5, orderTotalMoney)) {
        alert('최소 주문금액은 $5 입니다.');
        return;
      }
      if (isGreaterThen(orderTotalMoney, availableCash)) {
        alert('보유 현금이 부족합니다.');
        return;
      }
      try {
        await buy(symbol, price, amount, user.uid, total);
      } catch (e) {
        alert('주문이 오류, 다시 시도해주세요');
        return;
      }
    } else {
      const holdingAmount = holding?.amount ?? '0';
      try {
        if (isGreaterThen(amount, holdingAmount)) {
          alert('보유 수량이 부족합니다.');
          return;
        }

        if (isGreaterThen(5, orderTotalMoney)) {
          alert('최소 주문금액은 $5 입니다.');
          return;
        }

        await sell(symbol, price, amount, user.uid);
      } catch (e) {
        alert('주문이 잘못되었습니다');
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

  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        <label className={styles.title}>모의투자</label>
        <span className={styles.betaWrapper}>
          <span className={styles.betaBadge}>Beta</span>
          <div className={styles.tooltip}>
            현재 모의 투자는 현재 사이트에 접속한 상태일때만 주문체결이 가능합니다.
            <br />
            웹사이트에 접속하지 않은 경우 체결에대한 기능은 조만간 도입예정입니다.
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

        {activeTab === '거래내역' && (
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
        {activeTab !== '거래내역' && user !== null && (
          <button onClick={handleOrderClick} className={styles.bottomButton}>
            주문하기
          </button>
        )}
      </div>
    </div>
  );
};

export default PaperTrade;
