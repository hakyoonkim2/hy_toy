import { firebaseDB } from '@/firebase/firebase.config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import styles from '@typinggame/styles/GameRanking.module.scss';
import { User } from 'firebase/auth';
import { useAuth } from '@/hooks/AuthContext';

type Ranking = {
  id: string;
  userId: string;
  nickName: string;
  score: number;
};

type Props = {
  score: number;
};

type UserBest = {
  score: number;
  rank: number;
};

/**
 * 랭킹 출력, 조회, 등록 해주는 컴포넌트
 * @returns
 */
const GameRanking = ({ score }: Props) => {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const { user, setShowingLogin } = useAuth();
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isRecoreded, setIsRecoreded] = useState<boolean>(false);
  const [userBest, setUserBest] = useState<UserBest | null>(null);

  const handleLoginClick = () => {
    setShowingLogin(true);
  };

  const calCurRanking = async (score: number) => {
    // 내 순위 계산
    const higherQuery = query(
      collection(firebaseDB, 'typinggamerankings'),
      where('score', '>', score)
    );
    const higherSnap = await getDocs(higherQuery);
    return higherSnap.size + 1;
  };

  const fetchMyBestScore = async (user: User | null) => {
    if (!user) return;
    const q = query(collection(firebaseDB, 'typinggamerankings'), where('userId', '==', user.uid));

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const higherScore = snapshot.docs[0].data().score as number;
      const higerRank = await calCurRanking(higherScore);
      setUserBest({ rank: higerRank, score: higherScore });
    } else {
      setUserBest(null);
    }
  };

  // 랭킹 조회, 등록 해주는 effect hook
  useEffect(() => {
    const updateScore = async () => {
      if (!user) return;
      if (isRecoreded) return;

      const uid = user.uid;
      const name = user.displayName || user.email?.split('@')[0] || `user_${uid.slice(0, 6)}`;

      const docRef = doc(firebaseDB, 'typinggamerankings', uid);
      const existing = await getDoc(docRef);

      // 기존 점수보다 높으면 갱신
      if (!existing.exists() || (existing.data().score ?? 0) < score) {
        await setDoc(docRef, {
          userId: uid,
          nickName: name,
          score,
          timestamp: serverTimestamp(),
        });
      }
      setIsRecoreded(true);
    };

    const calRankProcess = async () => {
      // 1. score update
      await updateScore();

      // 2. 현재 rank 계산
      const curRanking = await calCurRanking(score);
      setUserRank(curRanking);

      // 3. 최고 점수 fetch 및 최고 순위 fetch
      await fetchMyBestScore(user);
    };

    calRankProcess();

    return () => {
      setUserBest(null);
    };
  }, [user]);

  // top 5 랭킹 데이터 fetch
  // score가 변경될 경우, 점수가 서버에 기록된 경우에 조회함.
  useEffect(() => {
    const fetchTopRankings = async () => {
      const topQuery = query(
        collection(firebaseDB, 'typinggamerankings'),
        orderBy('score', 'desc'),
        orderBy('timestamp', 'asc'),
        limit(3)
      );
      const topSnap = await getDocs(topQuery);
      const topList = topSnap.docs.map((doc) => ({
        ...(doc.data() as Ranking),
      }));
      setRankings(topList);
    };

    fetchTopRankings();
  }, [score, isRecoreded]);

  useEffect(() => {}, [user]);

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

  const isUserInTop = rankings.some((r) => r.userId === user?.uid);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>🏆 Top 3 Rankings</h2>
      <ol className={styles.rankList}>
        {rankings.map((rank, idx) => (
          <li
            key={rank.id}
            className={`${styles.rankItem} ${rank.userId === user?.uid ? styles.myRankHighlight : ''}`}
          >
            <span className={styles.rankIndex}>{getRankingStr(idx + 1)}</span>
            <span className={styles.nickName}>{rank.nickName}</span>
            <span className={styles.score}>{rank.score}</span>
          </li>
        ))}
      </ol>

      {userRank !== null && (
        <div className={styles.myRankAlone}>
          내 순위: {userRank}위 / {score}점
          {userBest !== null && !isUserInTop && (
            <>
              <br />내 최고 성적: {userBest.rank}위 / {userBest.score}점
            </>
          )}
        </div>
      )}
      {!user && (
        <div className={styles.saveMyRankAlone}>
          <button onClick={handleLoginClick}>랭킹 등록</button>
        </div>
      )}
    </div>
  );
};

export default GameRanking;
