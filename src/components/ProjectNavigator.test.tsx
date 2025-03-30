import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import ProjectNavigator from './ProjectNavigator';
import { useNavigate } from 'react-router-dom';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('@/style/ProjectNavigator.module.scss', () => ({
  default: {
    container: 'mock-container',
    projectBtn: 'mock-projectBtn',
  },
}));

describe('ProjectNavigator', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as unknown as Mock).mockReturnValue(mockNavigate);
  });

  it('버튼들이 정상적으로 렌더링되는지 확인', () => {
    render(<ProjectNavigator />);
    expect(screen.getByText('Coin')).toBeInTheDocument();
    expect(screen.getByText('TypingGame')).toBeInTheDocument();
  });

  it('Coin 버튼 클릭 시 navigate("/coin") 호출', () => {
    render(<ProjectNavigator />);
    fireEvent.click(screen.getByText('Coin'));
    expect(mockNavigate).toHaveBeenCalledWith('/coin');
  });

  it('TypingGame 버튼 클릭 시 navigate("/typinggame") 호출', () => {
    render(<ProjectNavigator />);
    fireEvent.click(screen.getByText('TypingGame'));
    expect(mockNavigate).toHaveBeenCalledWith('/typinggame');
  });
});
