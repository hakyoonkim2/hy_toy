import { firebaseDB } from '@/firebase/firebase.config';
import { Fill, Holding, Order, Wallet } from '@bitCoinChart/types/CoinTypes';
import {
  addDecimals,
  divideDecimals,
  isGreaterThen,
  minusDecimals,
  mulDecimals,
} from '@bitCoinChart/utils/DecimalUtils';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { create } from 'zustand';

interface TradeState {
  cash: string;
  holdings: Record<string, Holding>;
  orders: Order[];
  fills: Fill[];
  initFromServer: (uid?: string) => Promise<void>;
  buy: (symbol: string, price: string, amount: string, uid: string, total: string) => Promise<void>;
  sell: (symbol: string, price: string, amount: string, uid: string) => Promise<void>;
  cancelOrder: (docId: string, uid: string) => Promise<void>;
  loadFills: (uid: string) => Promise<void>;
  selectedPrice: number | null;
  setSelectedPrice: (price: number | null) => void;
  matchOrders: (orders: Order[], uid: string) => Promise<void>;
}

const useTradeStore = create<TradeState>((set, get) => ({
  cash: '0',
  holdings: {},
  orders: [],
  fills: [],

  selectedPrice: null,
  setSelectedPrice: (price) => set({ selectedPrice: price }),

  buy: async (symbol: string, price: string, amount: string, uid: string, totalPrice: string) => {
    // 잔고 검증을 Firebase 쓰기 이전에 수행
    const pendingBuyTotal = get()
      .orders.filter((o) => o.side === 'buy')
      .reduce((acc, o) => addDecimals(acc, mulDecimals(o.amount, o.price)), '0');
    const availableCash = minusDecimals(get().cash, pendingBuyTotal);

    if (isGreaterThen(totalPrice, availableCash)) {
      throw new Error('보유 현금이 부족합니다.');
    }

    await addDoc(collection(firebaseDB, 'coinwallet', uid, 'orders'), {
      side: 'buy',
      symbol,
      price,
      amount,
      filledAmount: '0',
      timestamp: serverTimestamp(),
    });

    await get().initFromServer(uid);
  },

  sell: async (symbol: string, price: string, amount: string, uid: string) => {
    // 미체결 매도 수량을 고려한 가용 매도 수량 검증
    const pendingSellAmount = get()
      .orders.filter((o) => o.symbol === symbol && o.side === 'sell')
      .reduce((acc, o) => addDecimals(acc, o.amount), '0');
    const holdingAmount = get().holdings[symbol]?.amount ?? '0';
    const availableToSell = minusDecimals(holdingAmount, pendingSellAmount);

    if (isGreaterThen(amount, availableToSell)) {
      throw new Error('보유 수량이 부족합니다.');
    }

    await addDoc(collection(firebaseDB, 'coinwallet', uid, 'orders'), {
      side: 'sell',
      symbol,
      price,
      amount,
      filledAmount: '0',
      timestamp: serverTimestamp(),
    });

    await get().initFromServer(uid);
  },

  cancelOrder: async (docId: string, uid: string) => {
    const orderDoc = doc(firebaseDB, 'coinwallet', uid, 'orders', docId);
    await deleteDoc(orderDoc);

    await get().initFromServer(uid);
  },

  loadFills: async (uid: string) => {
    const fillsQuery = query(
      collection(firebaseDB, 'coinwallet', uid, 'fills'),
      orderBy('filledAt', 'desc'),
      limit(50)
    );
    const fillsSnap = await getDocs(fillsQuery);
    const fills = fillsSnap.docs.map((d) => ({ docId: d.id, ...d.data() })) as Fill[];
    set({ fills });
  },

  initFromServer: async (uid?: string) => {
    if (!uid) {
      set({ cash: '0', holdings: {}, orders: [], fills: [] });
      return;
    }

    const walletRef = doc(firebaseDB, 'coinwallet', uid);
    const holdingsRef = collection(firebaseDB, `coinwallet/${uid}/holdings`);
    const ordersRef = collection(firebaseDB, `coinwallet/${uid}/orders`);

    const [walletSnap, holdingsSnap, ordersSnap] = await Promise.all([
      getDoc(walletRef),
      getDocs(holdingsRef),
      getDocs(ordersRef),
    ]);

    let cash = '100000'; // 기본값

    // 지갑 문서 없으면 새로 생성
    if (!walletSnap.exists()) {
      await setDoc(walletRef, {
        cash,
        uid,
      });
    } else {
      const data = walletSnap.data() as Wallet;
      cash = data.cash;
    }

    const holdings: Record<string, Holding> = holdingsSnap.docs.reduce(
      (acc, doc) => {
        const data = doc.data();
        acc[doc.id] = {
          symbol: doc.id,
          price: data.price,
          amount: data.amount,
        };
        return acc;
      },
      {} as Record<string, Holding>
    );

    const orders = ordersSnap.docs.map((doc) => ({ docId: doc.id, ...doc.data() })) as Order[];

    set({ cash, holdings, orders });
  },

  matchOrders: async (orders: Order[], uid: string) => {
    const batch = writeBatch(firebaseDB);

    const walletRef = doc(firebaseDB, 'coinwallet', uid);
    const walletSnap = await getDoc(walletRef);
    if (!walletSnap.exists()) {
      throw new Error('유저 지갑에 문제가 발생하였습니다.');
    }

    let cash = (walletSnap.data() as Wallet).cash;

    // 현금과 보유자산 계산을 외부에서 처리
    const holdingChanges: Record<string, Holding> = {};

    for (const order of orders) {
      const { symbol, amount, price, side, docId } = order;
      const holdingRef = doc(firebaseDB, 'coinwallet', uid, 'holdings', symbol);
      const holdingSnap = await getDoc(holdingRef);
      const prevHolding = holdingSnap.exists() ? (holdingSnap.data() as Holding) : null;

      const curTotal = mulDecimals(amount, price);

      if (side === 'buy') {
        if (prevHolding) {
          const prevTotal = mulDecimals(prevHolding.amount, prevHolding.price);
          const newAmount = addDecimals(prevHolding.amount, amount);
          const newPrice = divideDecimals(addDecimals(prevTotal, curTotal), newAmount);

          holdingChanges[symbol] = {
            symbol,
            amount: newAmount,
            price: newPrice,
          };
        } else {
          holdingChanges[symbol] = {
            symbol,
            amount,
            price,
          };
        }

        cash = minusDecimals(cash, curTotal); // 현금 차감
      }

      if (side === 'sell') {
        if (!prevHolding) {
          throw new Error('보유 자산이 존재하지 않습니다.');
        }

        holdingChanges[symbol] = {
          symbol,
          price: prevHolding.price,
          amount: minusDecimals(prevHolding.amount, amount),
        };

        cash = addDecimals(cash, curTotal); // 현금 증가
      }

      // 주문 삭제
      batch.delete(doc(firebaseDB, 'coinwallet', uid, 'orders', docId));

      // 체결 기록 추가
      const fillRef = doc(collection(firebaseDB, 'coinwallet', uid, 'fills'));
      batch.set(fillRef, {
        orderId: docId,
        symbol,
        price,
        amount,
        type: side,
        filledAt: serverTimestamp(),
      });
    }

    // holdings 일괄 update (수량 0이면 삭제)
    for (const symbol in holdingChanges) {
      const holding = holdingChanges[symbol];
      const holdingRef = doc(firebaseDB, 'coinwallet', uid, 'holdings', symbol);
      if (parseFloat(holding.amount) <= 0) {
        batch.delete(holdingRef);
      } else {
        batch.set(holdingRef, holding);
      }
    }

    // wallet update
    batch.update(walletRef, {
      cash,
    });

    await batch.commit();

    if (orders.length > 0) {
      await get().initFromServer(uid);
    }
  },
}));

export default useTradeStore;
