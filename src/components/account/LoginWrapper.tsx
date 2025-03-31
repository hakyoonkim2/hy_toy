import styles from '@style/LoginWrapper.module.scss';
import { useState } from 'react';
import LoginComponent from '@components/account/LoginComponent';
import ClearIcon from '@bitCoinChart/assets/ClearIcon.svg?react';
import HytoyLogo from '@/assets/hytoyLogo.svg?react';
import { useAuth } from '@/hooks/AuthContext';

const LoginWrapper = () => {
  const { setShowingLogin } = useAuth();
  const [showSignUp, setShowSignUp] = useState<boolean>(false);

  const handleClick = () => {
    setShowSignUp((prev) => !prev);
  };

  const handleClose = () => {
    setShowingLogin(false);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.loginTitle}>
          <label>{showSignUp ? 'Join' : 'Log into'}</label>
          <HytoyLogo width={120} />
        </div>
        <ClearIcon className={styles.closeBtn} width={22} height={22} onClick={handleClose} />
        <div className={styles.accountContainer}>
          <LoginComponent showSignUp={showSignUp} />
        </div>
        <div className={styles.switchContainer}>
          <span className={styles.switchText}>
            {showSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button type="button" className={styles.link} onClick={handleClick}>
              {showSignUp ? 'Log In →' : 'Create one →'}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginWrapper;
