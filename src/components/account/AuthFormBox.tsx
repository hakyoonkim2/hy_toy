import { useAuth } from '@/hooks/AuthContext';
import UserInfo from '@components/account/UserInfo';
import styles from '@style/AuthFormBox.module.scss';

const AuthFormBox = () => {
  const { user, setShowingLogin } = useAuth();

  const handleLoginClick = () => {
    setShowingLogin(true);
  };

  return (
    <div className={styles.container}>
      {user ? (
        <UserInfo />
      ) : (
        <button onClick={handleLoginClick} className={styles.loginButton}>
          Log In
        </button>
      )}
    </div>
  );
};

export default AuthFormBox;
