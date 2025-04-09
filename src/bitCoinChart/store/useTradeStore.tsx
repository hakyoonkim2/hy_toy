import { firebaseDB } from '@/firebase/firebase.config';
import { Holding, Order } from '@bitCoinChart/types/CoinTypes';
import { minusDecimals } from '@bitCoinChart/utils/DecimalUtils';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
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
}

const useTradeStore = create<TradeState>((set, get) => ({
  cash: '100000',
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

    // 👇 병렬 요청
    const [walletSnap, holdingsSnap, ordersSnap] = await Promise.all([
      getDoc(walletRef),
      getDocs(holdingsRef),
      getDocs(ordersRef),
    ]);

    if (walletSnap.exists()) {
      const data = walletSnap.data();

      const cash: string = data.cash ?? '0';

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
    }
  },
}));

export default useTradeStore;
