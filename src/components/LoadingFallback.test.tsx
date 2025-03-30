import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoadingFallback from './LoadingFallback';

// 스타일 모듈을 간단히 mock
vi.mock('@style/LoadingFallback.module.scss', () => ({
  default: {
    spinner: 'mocked-spinner-class',
  },
}));

describe('LoadingFallback', () => {
  it('기본 width/height로 렌더링 되는지 확인', () => {
    const { container } = render(<LoadingFallback />);
    const spinner = container.firstChild as HTMLElement;

    expect(spinner).toHaveClass('mocked-spinner-class');
    expect(spinner.style.width).toBe('40px');
    expect(spinner.style.height).toBe('40px');
  });

  it('커스텀 width/height로 렌더링 되는지 확인', () => {
    const { container } = render(<LoadingFallback width={80} height={60} />);
    const spinner = container.firstChild as HTMLElement;

    expect(spinner.style.width).toBe('80px');
    expect(spinner.style.height).toBe('60px');
  });
});
