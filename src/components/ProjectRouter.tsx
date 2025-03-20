import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProjectNavigator from './ProjectNavigator';
import Header from './Header';
import StopWatch from '../stopwatch/components/Stopwatch';
import CoinAppWrapper from '../bitCoinChart/components/CoinAppWrapper';
import CoinApp from '../bitCoinChart/components/CoinApp';
import CoinChartView from '../bitCoinChart/components/CoinChartView';
import { isMobile } from 'react-device-detect';

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
                    <Route path='/chart' element={<CoinAppWrapper/>}>
                        <Route index element={<CoinApp />} />
                        {isMobile && <Route path="chartview" element={<CoinChartView />} />}
                    </Route>
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default ProjectRouter;