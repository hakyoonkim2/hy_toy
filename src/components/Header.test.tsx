// Header.test.tsx
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import { SVGProps } from 'react';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('@assets/hytoyLogo.svg?react', () => ({
  default: (props: SVGProps<SVGSVGElement>) => <svg {...props} data-testid="hytoy-logo" />,
}));

describe('Header', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as unknown as Mock).mockReturnValue(mockNavigate);

    // 기본 location mock
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        pathname: '/',
      },
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as unknown as Mock).mockReturnValue(mockNavigate);
  });

  it('로고 클릭 시 navigate("/") 호출', () => {
    render(<Header />);
    const logo = screen.getByTestId('hytoy-logo');
    fireEvent.click(logo);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('GH 환경에서 currentProject 추출 테스트', () => {
    // mock GH 환경
    import.meta.env.VITE_DEPLOY_TARGET = 'GH';
    window.location.pathname = '/hy_toy/testproject/page';

    render(<Header />);
    expect(screen.getByText('TESTPROJECT')).toBeInTheDocument();
  });

  it('VERCEL 환경에서 currentProject 추출 테스트', () => {
    import.meta.env.VITE_DEPLOY_TARGET = 'VERCEL';
    window.location.pathname = '/testproject/page';

    render(<Header />);
    expect(screen.getByText('TESTPROJECT')).toBeInTheDocument();
  });
});
