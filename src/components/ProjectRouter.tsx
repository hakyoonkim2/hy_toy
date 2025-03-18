import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProjectNavigator from './ProjectNavigator';
import Stopwatch from './stopwatch/Stopwatch';
import Header from './Header';

/**
 * 라우터
 */
const ProjectRouter = () => {
    return (
        <BrowserRouter>
            <div className='wrapper'>
                <Header />
                <Routes>
                    <Route path='/' element={<ProjectNavigator/>}/>
                    <Route path='/stopwatch' element={<Stopwatch/>}/>
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default ProjectRouter;