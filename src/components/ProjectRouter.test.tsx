import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProjectRouter from './ProjectRouter';
import * as deviceDetect from 'react-device-detect';
import { Outlet } from 'react-router-dom';

vi.mock('@components/Header', () => ({
  default: () => <div>MockHeader</div>,
}));

vi.mock('@components/ProjectNavigator', () => ({
  default: () => <div>MockProjectNavigator</div>,
}));

vi.mock('@components/LoadingFallback', () => ({
  default: () => <div>MockLoadingFallback</div>,
}));

vi.mock('@typinggame/TypingGame', () => ({
  default: () => <div>MockTypingGame</div>,
}));

vi.mock('../bitCoinChart/components/CoinAppWrapper', () => ({
  default: () => (
    <div>
      MockCoinAppWrapper
      <Outlet />
    </div>
  ),
}));

vi.mock('../bitCoinChart/components/CoinApp', () => ({
  default: () => <div>MockCoinApp</div>,
}));

vi.mock('../bitCoinChart/components/chart/CoinChartView', () => ({
  default: () => <div>MockCoinChartView</div>,
}));

describe('ProjectRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_DEPLOY_TARGET', 'VERCEL'); // 기본 환경 GH 가 아닌환경
  });

  it('"/" 경로에서 ProjectNavigator 렌더링', async () => {
    window.history.pushState({}, '', '/');
    render(<ProjectRouter />);
    await waitFor(() => {
      expect(screen.getByText('MockProjectNavigator')).toBeInTheDocument();
    });
  });

  it('"/coin" 경로에서 CoinAppWrapper, CoinApp 렌더링', async () => {
    window.history.pushState({}, '', '/coin');
    render(<ProjectRouter />);
    await waitFor(() => {
      expect(screen.getByText('MockCoinAppWrapper')).toBeInTheDocument();
      expect(screen.getByText('MockCoinApp')).toBeInTheDocument();
    });
  });

  it('"/typinggame" 경로에서 TypingGame 렌더링', async () => {
    window.history.pushState({}, '', '/typinggame');
    render(<ProjectRouter />);
    await waitFor(() => {
      expect(screen.getByText('MockTypingGame')).toBeInTheDocument();
    });
  });

  it('모바일에서 "/coin/chartview" 렌더링 시 CoinChartView 포함됨', async () => {
    // isMobile을 true로 mock
    vi.spyOn(deviceDetect, 'isMobile', 'get').mockReturnValue(true);

    window.history.pushState({}, '', '/coin/chartview');
    render(<ProjectRouter />);
    await waitFor(() => {
      expect(screen.getByText('MockCoinChartView')).toBeInTheDocument();
    });
  });

  it('isGitHub 환경에서 basename이 "/hy_toy/" 로 설정됨 (렌더링 검증)', async () => {
    vi.stubEnv('VITE_DEPLOY_TARGET', 'GH');

    window.history.pushState({}, '', '/hy_toy/');
    render(<ProjectRouter />);
    await waitFor(() => {
      expect(screen.getByText('MockProjectNavigator')).toBeInTheDocument();
    });
  });
});
