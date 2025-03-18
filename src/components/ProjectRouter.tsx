import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProjectNavigator from './ProjectNavigator';
import Stopwatch from './stopwatch/Stopwatch';

const ProjectRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<ProjectNavigator/>}/>
                <Route path='/stopwatch' element={<Stopwatch/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default ProjectRouter;