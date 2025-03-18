import { useNavigate } from 'react-router-dom'
import '../App.css'

function ProjectNavigator() {
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const path = event.currentTarget.getAttribute('data-path');
    if (path) navigate(path);
  }

  return (
    <>
    <div>
      <button data-path={'/stopwatch'} onClick={handleClick}>stopwatch</button>
    </div>
    </>
  )
}

export default ProjectNavigator;
