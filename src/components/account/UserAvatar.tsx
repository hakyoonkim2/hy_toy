import { useAuth } from '@/hooks/AuthContext';
import styles from '@style/UserAvatar.module.scss';
import NoUserImg from '@assets/NoUser.png';

const UserAvatar = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className={styles.avatarWrapper}>
      <img src={user.photoURL ?? NoUserImg} alt="User Avatar" className={styles.avatarImage} />
    </div>
  );
};

export default UserAvatar;
