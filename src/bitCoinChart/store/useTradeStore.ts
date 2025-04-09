import { firebaseDB } from '@/firebase/firebase.config';
import { Holding, Order, Wallet } from '@bitCoinChart/types/CoinTypes';
import {
  addDecimals,
  divideDecimals,
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
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { create } from 'zustand';

interface TradeState {
  cash: string;
  holdings: Record<string, Holding>;
  orders: Order[];
  initFromServer: (uid?: string) => Promise<void>;
  buy: (symbol: string, price: string, amount: string, uid: string, total: string) => Promise<void>;
  sell: (symbol: string, price: string, amount: string, uid: string) => Promise<void>;
  cancelOrder: (docId: string, uid: string) => Promise<void>;
  // 추가
  selectedPrice: number | null;
  setSelectedPrice: (price: number | null) => void;
  matchOrders: (orders: Order[], uid: string) => Promise<void>;
}

const useTradeStore = create<TradeState>((set, get) => ({
  cash: '0',
  holdings: {},
  orders: [],

  selectedPrice: null,
  setSelectedPrice: (price) => set({ selectedPrice: price }),

  buy: async (symbol: string, price: string, amount: string, uid: string, totalPrice: string) => {
    await addDoc(collection(firebaseDB, 'coinwallet', uid, 'orders'), {
      side: 'buy',
      symbol,
      price,
      amount,
      filledAmount: '0',
      timestamp: serverTimestamp(),
    });
    const newCash = minusDecimals(get().cash, totalPrice);
    if (parseFloat(newCash) < 0) throw new Error('Not Enough money');

    await get().initFromServer(uid);
  },

  sell: async (symbol: string, price: string, amount: string, uid: string) => {
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

  initFromServer: async (uid?: string) => {
    if (!uid) {
      set({ cash: '0', holdings: {}, orders: [] });
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
      alert('유저 지갑에 문제가 발생하였습니다. 관리자에게 문의하세요');
      throw new Error('지갑 없음');
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
          alert('보유 자산이 존재하지 않습니다.');
          throw new Error('보유 자산 없음');
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

    // holdings 일괄 update
    for (const symbol in holdingChanges) {
      const holding = holdingChanges[symbol];
      const holdingRef = doc(firebaseDB, 'coinwallet', uid, 'holdings', symbol);
      batch.set(holdingRef, holding); // set으로 통일: 존재 유무 상관없이 덮어쓰기
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
