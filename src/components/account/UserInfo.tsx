import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebase.config';
import UserAvatar from '@components/account/UserAvatar';
import styles from '@style/UserInfo.module.scss';

const UserInfo = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('로그아웃 실패', e);
    }
  };

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return;

  return (
    <div className={styles.container} ref={ref}>
      <div onClick={() => setOpen(!open)} className={styles.avatar}>
        <UserAvatar />
      </div>
      {open && (
        <div className={styles.dropdown}>
          <p>환영합니다, {`${user.displayName} 님`}!</p>
          <button onClick={handleLogout}>로그아웃</button>
        </div>
      )}
    </div>
  );
};

export default UserInfo;
