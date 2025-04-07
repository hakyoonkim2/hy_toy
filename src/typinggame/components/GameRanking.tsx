import { auth, firebaseDB } from '@/firebase/firebase.config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import styles from '@typinggame/styles/GameRanking.module.scss';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '@/hooks/AuthContext';

type Ranking = {
  id: string;
  userId: string;
  nickname: string;
  score: number;
};

type Props = {
  score: number;
};

/**
 * 랭킹 출력, 조회, 등록 해주는 컴포넌트
 * @returns
 */
const GameRanking = ({ score }: Props) => {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const { user, setShowingLogin } = useAuth();
  const [userId, setUserId] = useState<string | null>(user?.uid ?? null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isRecoreded, setIsRecoreded] = useState<boolean>(false);

  const handleLoginClick = () => {
    setShowingLogin(true);
  };

  // 랭킹 조회, 등록 해주는 effect hook
  useEffect(() => {
    const calCurRanking = async () => {
      // 내 순위 계산
      const higherQuery = query(
        collection(firebaseDB, 'typinggamerankings'),
        where('score', '>', score)
      );
      const higherSnap = await getDocs(higherQuery);
      setUserRank(higherSnap.size + 1);
    };

    const unsubscribe = onAuthStateChanged(auth, async (curUser) => {
      setUserId(null);
      if (!curUser) return;
      if (isRecoreded) return;

      const uid = curUser.uid;
      const name = curUser.displayName || curUser.email?.split('@')[0] || `user_${uid.slice(0, 6)}`;
      setUserId(uid);

      const docRef = doc(firebaseDB, 'typinggamerankings', uid);
      const existing = await getDoc(docRef);

      // 기존 점수보다 높으면 갱신
      if (!existing.exists() || (existing.data().score ?? 0) < score) {
        await setDoc(docRef, {
          userId: uid,
          nickname: name,
          score,
          timestamp: Date.now(),
        });
      }
      setIsRecoreded(true);
    });

    calCurRanking();
    return () => unsubscribe();
  }, [score]);

  // top 5 랭킹 데이터 fetch
  // score가 변경될 경우, 점수가 서버에 기록된 경우에 조회함.
  useEffect(() => {
    const fetchTopRankings = async () => {
      const topQuery = query(
        collection(firebaseDB, 'typinggamerankings'),
        orderBy('score', 'desc'),
        orderBy('timestamp', 'asc'),
        limit(5)
      );
      const topSnap = await getDocs(topQuery);
      const topList = topSnap.docs.map((doc) => ({
        ...(doc.data() as Ranking),
      }));
      setRankings(topList);
    };

    fetchTopRankings();
  }, [score, isRecoreded]);

  const isUserInTop = rankings.some((r) => r.userId === userId);

  const getRankingStr = (rank: number): string => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank.toString()}`;
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>🏆 Top 5 Rankings</h2>
      <ol className={styles.rankList}>
        {rankings.map((rank, idx) => (
          <li
            key={rank.id}
            className={`${styles.rankItem} ${rank.userId === userId ? styles.myRankHighlight : ''}`}
          >
            <span className={styles.rankIndex}>{getRankingStr(idx + 1)}</span>
            <span className={styles.nickname}>{rank.nickname}</span>
            <span className={styles.score}>{rank.score}</span>
          </li>
        ))}
      </ol>

      {!isUserInTop && userRank !== null && (
        <div className={styles.myRankAlone}>
          내 순위: {userRank}위 / {score}점
        </div>
      )}
      {!userId && (
        <div className={styles.saveMyRankAlone}>
          <button onClick={handleLoginClick}>랭킹 등록</button>
        </div>
      )}
    </div>
  );
};

export default GameRanking;
