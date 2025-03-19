import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProjectNavigator from './ProjectNavigator';
import Header from './Header';
import StopWatch from '../stopwatch/components/Stopwatch';
import CoinApp from '../bitCoinChart/components/CoinApp';

/**
 * 라우터
 */
const ProjectRouter = () => {
    return (
        <BrowserRouter basename='/hy_toy/'>
            <div className='wrapper'>
                <Header />
                <Routes>
                    <Route path='/' element={<ProjectNavigator/>}/>
                    <Route path='/stopwatch' element={<StopWatch/>}/>
                    <Route path='/chart' element={<CoinApp/>}/>
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default ProjectRouter;