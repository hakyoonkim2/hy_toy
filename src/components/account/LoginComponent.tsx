'use client';

import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '@/firebase/firebase.config';
import { useActionState, useEffect, useState } from 'react';
import styles from '@style/LoginComponent.module.scss';
import { useAuth } from '@/hooks/AuthContext';
import { FirebaseError } from 'firebase/app';

type Props = {
  showSignUp: boolean;
};

type FormState = {
  email: string;
  password: string;
  name?: string;
};

const LoginComponent = ({ showSignUp }: Props) => {
  const { setShowingLogin } = useAuth();
  const [emailSent, setEmailSent] = useState(false); // ✅ 이메일 인증 안내 상태
  const [submittedEmail, setSubmittedEmail] = useState(''); // 어떤 이메일로 가입했는지 기억
  const [createEmailError, setCreateEmailError] = useState<FirebaseError | null>(null);

  const [, formAction] = useActionState(
    async (_prevState: FormState, formData: FormData) => {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const name = formData.get('name') as string;

      try {
        if (showSignUp) {
          const result = await createUserWithEmailAndPassword(auth, email, password);
          console.log('회원가입 성공:', result.user);

          if (auth.currentUser && name) {
            await sendEmailVerification(auth.currentUser);
            setSubmittedEmail(email);
            setEmailSent(true);
            await updateProfile(auth.currentUser, { displayName: name });
          }
        } else {
          const result = await signInWithEmailAndPassword(auth, email, password);
          if (!result.user.emailVerified) {
            alert('이메일 인증이 완료되지 않았습니다. 인증 후 다시 로그인해주세요.');
            return { email, password, name };
          }
          console.log('로그인 성공:', result.user);
          setShowingLogin(false);
        }
      } catch (error) {
        if (error instanceof FirebaseError) {
          setCreateEmailError(error);
        }
        console.error('이메일 로그인 에러:', error);
      }

      return { email, password, name };
    },
    {
      email: '',
      password: '',
      name: '',
    }
  );

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google 로그인 성공:', result.user);
      setShowingLogin(false);
    } catch (e) {
      console.log(e);
    }
  };

  const loginWithGitHub = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      console.log('Github 로그인 성공:', result.user);
      if (!result.user.displayName) {
        const providerData = result.user.providerData[0];
        if (providerData) {
          const emailName = providerData.email?.split('@')[0];
          if (emailName) await updateProfile(result.user, { displayName: emailName });
        }
      }
      setShowingLogin(false);
    } catch (e) {
      console.log(e);
    }
  };

  const fireBaseErrorHandle = () => {
    if (createEmailError) {
      if (createEmailError.code.includes('auth/email-already-in-use')) {
        return (
          <p>
            <strong>이미 가입된 이메일입니다.</strong>
            <br />
            로그인을 시도해주세요.
          </p>
        );
      }
    }
    return null;
  };

  useEffect(() => {
    if (emailSent) setCreateEmailError(null);
  }, [emailSent]);

  useEffect(() => {
    if (createEmailError) setEmailSent(false);
  }, [createEmailError]);

  useEffect(() => {
    return () => {
      setCreateEmailError(null);
      setEmailSent(false);
      setSubmittedEmail('');
    };
  }, [showSignUp]);

  return (
    <>
      <form action={formAction} className={styles.form}>
        {showSignUp && <input name="name" placeholder="Name" type="text" required />}
        <input name="email" placeholder="Email" type="email" required />
        <input name="password" placeholder="Password" type="password" required />
        <input type="submit" value={showSignUp ? 'Create Account' : 'Log In'} />
      </form>

      {emailSent && showSignUp && (
        <div className={styles.notice}>
          <h4>인증 메일이 전송되었습니다</h4>
          <p>
            <strong>{submittedEmail}</strong> 주소로 인증 메일을 보냈습니다.
            <br />
            메일을 확인하고 인증을 완료한 후 로그인해주세요.
            <br />
            메일이 보이지 않는다면 스팸함도 확인해보세요.
          </p>
        </div>
      )}

      {createEmailError && showSignUp && (
        <div className={styles.notice}>
          <h4>{fireBaseErrorHandle()}</h4>
        </div>
      )}

      <div className={styles.otherLogin}>
        <button onClick={loginWithGoogle}>
          {showSignUp ? 'Start With Google' : 'Google Login'}
        </button>
        <button onClick={loginWithGitHub}>
          {showSignUp ? 'Start With Github' : 'Github Login'}
        </button>
      </div>
    </>
  );
};

export default LoginComponent;
