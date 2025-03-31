import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/firebase.config';
import LoginWrapper from '@components/account/LoginWrapper';

type AuthContextType = {
  user: User | null;
  setShowingLogin: React.Dispatch<React.SetStateAction<boolean>>;
};

const AuthContext = createContext<AuthContextType>({ user: null, setShowingLogin: () => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [showingLogin, setShowingLogin] = useState<boolean>(false);
  const value = { user, setShowingLogin };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const providerId = currentUser.providerData[0].providerId;
        if (providerId === 'password' && !currentUser.emailVerified) {
          console.warn('이메일 인증되지 않은 사용자입니다. 자동 로그아웃합니다.');
          await auth.signOut();
        } else {
          setUser(currentUser);
          setShowingLogin(false);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={value}>
      {showingLogin && <LoginWrapper />}
      {children}
    </AuthContext.Provider>
  );
};

// 편하게 가져다 쓰기 위한 훅
export const useAuth = () => useContext(AuthContext);
