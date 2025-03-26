import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import StopWatch from './Stopwatch';
import { act } from 'react';

describe('StopWatch', () => {
  beforeEach(() => {
    vi.useFakeTimers(); // 가상 타이머 사용
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  it('초기 상태 렌더링 확인', () => {
    render(<StopWatch />);
    expect(screen.getByText('00:00.00')).toBeInTheDocument();
    expect(screen.getByText('시작')).toBeInTheDocument();
    expect(screen.getByText('재설정')).toBeInTheDocument();
  });

  it('타이머가 시작되고 시간 증가함', () => {
    render(<StopWatch />);
    const startButton = screen.getByText('시작');
    fireEvent.click(startButton);

    act(() => {
        vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('중단')).toBeInTheDocument();
    expect(screen.getByText(/00:01\./)).toBeInTheDocument(); // 1초 후에는 00:01.xx
  });

  it('중단 후 재시작하면 계속 시간 흐름', () => {
    render(<StopWatch />);
    const startButton = screen.getByText('시작');
    fireEvent.click(startButton); // 시작

    act(() => {
        vi.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText(/00:01\./)).toBeInTheDocument();

    fireEvent.click(screen.getByText('중단')); // 정지

    act(() => {
        vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/00:01\./)).toBeInTheDocument();

    fireEvent.click(screen.getByText('시작')); // 재시작

    act(() => {
        vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/00:02\./)).toBeInTheDocument();
  });

  it('랩 추가 동작 확인', () => {
    render(<StopWatch />);
    fireEvent.click(screen.getByText('시작'));
    act(() => {
        vi.advanceTimersByTime(1234);
    });

    fireEvent.click(screen.getByText('랩'));

    expect(screen.getByText(/랩 1/)).toBeInTheDocument();
    const timerText = screen.getByText(/00:01\./, { selector: '#timer' });
    expect(timerText).toBeInTheDocument();
  });

  it('중단 상태에서 재설정하면 초기화됨', () => {
    render(<StopWatch />);
    fireEvent.click(screen.getByText('시작'));
    
    act(() => {
        vi.advanceTimersByTime(2345);
    });
    fireEvent.click(screen.getByText('랩'));
    fireEvent.click(screen.getByText('중단'));

    fireEvent.click(screen.getByText('재설정'));

    expect(screen.getByText('00:00.00')).toBeInTheDocument();
    expect(screen.queryByText(/랩/)).not.toBeInTheDocument();
  });
});
