import { useNavigate } from 'react-router-dom';
import HytoyLogo from '../assets/hytoyLogo.svg?react';
import style from '../style/Header.module.scss';

/**
 * SPA 에서 항상 출력되는 헤더라인
 * @HyToyLogo 로고를 클릭하면 홈화면으로 이동
 * 현재 url Path에 따라 현재 선택된 페이지 프로젝트 이름이 출력
 *
 */
const Header = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  const currentProject = window.location.href.split('/').at(-1);

  return (
    <header>
      <HytoyLogo
        className={style.hytoylogo}
        width="200px"
        height="100px"
        onClick={handleLogoClick}
      />
      <div className={style.right}>
        {currentProject !== '' ? `${currentProject?.toUpperCase()}` : '프로젝트를 선택해주세요'}
      </div>
    </header>
  );
};

export default Header;
