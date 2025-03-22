import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProjectNavigator from './ProjectNavigator';
import Header from './Header';
import { isMobile } from 'react-device-detect';
import { lazy, Suspense } from 'react';
import LoadingFallback from './LoadingFallback';


// 진입률이 낮을거 같아서 스플리팅
const StopWatch = lazy(() => import('../stopwatch/components/Stopwatch'));

// chart는 대부분 웹소켓 웹워커 쉐어드워커 등 무거운 작업을 하므로 스플리팅
const CoinAppWrapper = lazy(() => import('../bitCoinChart/components/CoinAppWrapper'));
const CoinApp = lazy(() => import('../bitCoinChart/components/CoinApp'));
const CoinChartView = lazy(() => import('../bitCoinChart/components/CoinChartView'));
/**
 * 라우터
 */
const ProjectRouter = () => {
    return (
        <BrowserRouter basename='/hy_toy/'>
            <div className='wrapper'>
                <Header />
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        <Route path='/' element={<ProjectNavigator/>}/>
                        <Route path='/stopwatch' element={<StopWatch/>}/>
                        <Route path='/chart' element={<CoinAppWrapper/>}>
                            <Route index element={<CoinApp />} />
                            {isMobile && <Route path="chartview" element={<CoinChartView />} />}
                        </Route>
                    </Routes>
                </Suspense>
            </div>
        </BrowserRouter>
    );
}

export default ProjectRouter;