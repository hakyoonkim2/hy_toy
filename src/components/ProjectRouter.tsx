import { HashRouter, Route, Routes } from 'react-router-dom';
import ProjectNavigator from './ProjectNavigator';
import Header from './Header';
import StopWatch from '../stopwatch/components/Stopwatch';
import CoinApp from '../bitCoinChart/components/CoinApp';

/**
 * 라우터
 */
const ProjectRouter = () => {
    return (
        <HashRouter>
            <div className='wrapper'>
                <Header />
                <Routes>
                    <Route path='/' element={<ProjectNavigator/>}/>
                    <Route path='/stopwatch' element={<StopWatch/>}/>
                    <Route path='/chart' element={<CoinApp/>}/>
                </Routes>
            </div>
        </HashRouter>
    );
}

export default ProjectRouter;