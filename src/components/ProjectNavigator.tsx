import { useNavigate } from 'react-router-dom';
import style from '@/style/ProjectNavigator.module.scss';

/**
 * 버튼을 통해 각 프로젝트로 진입할 수 있는 컴포넌트
 */
function ProjectNavigator() {
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const path = event.currentTarget.getAttribute('data-path');
    if (path) navigate(path);
  };

  return (
    <div className={style.container}>
      <button className={style.projectBtn} data-path={'/stopwatch'} onClick={handleClick}>
        {'Stopwatch'}
      </button>
      <button className={style.projectBtn} data-path={'/coin'} onClick={handleClick}>
        Coin
      </button>
    </div>
  );
}

export default ProjectNavigator;
