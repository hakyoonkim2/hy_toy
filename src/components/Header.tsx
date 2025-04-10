import { useNavigate } from 'react-router-dom';
import HytoyLogo from '@assets/hytoyLogo.svg?react';
import style from '@style/Header.module.scss';
import UserInfo from '@components/account/UserInfo';
import AuthFormBox from '@components/account/AuthFormBox';
import { useAuth } from '@/hooks/AuthContext';

/**
 * SPA 에서 항상 출력되는 헤더라인
 * @HyToyLogo 로고를 클릭하면 홈화면으로 이동
 * 현재 url Path에 따라 현재 선택된 페이지 프로젝트 이름이 출력
 *
 */
const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  const currentProject =
    import.meta.env.VITE_DEPLOY_TARGET === 'GH'
      ? window.location.pathname.replace('/hy_toy/', '').split('/').at(0)
      : window.location.pathname.split('/').at(1);

  return (
    <header>
      <div className={style.left}>
        <HytoyLogo
          className={style.hytoylogo}
          width="200px"
          height="100px"
          onClick={handleLogoClick}
        />
        {currentProject !== '' ? `${currentProject?.toUpperCase()}` : null}
      </div>
      <div className={style.right}>{user ? <UserInfo /> : <AuthFormBox />}</div>
    </header>
  );
};

export default Header;
