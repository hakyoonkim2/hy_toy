import { useNavigate } from 'react-router-dom';

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
    <>
      <div>
        <button className="projectBtn" data-path={'/stopwatch'} onClick={handleClick}>
          {'stopwatch(test용)'}
        </button>
        <button className="projectBtn" data-path={'/chart'} onClick={handleClick}>
          chart
        </button>
      </div>
    </>
  );
}

export default ProjectNavigator;
