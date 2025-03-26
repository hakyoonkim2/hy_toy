import React, { useEffect, useRef } from 'react';
import style from '../style/chart.module.scss';
import { isMobile } from 'react-device-detect';

/**
 * tradingView 차트 위젯을 통해 차트 구성
 */
type TradingViewChartProps = {
  symbol: string;
};

const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          container_id: 'tradingview_chart',
          width: '100%',
          height: isMobile ? '250px' : '500px',
          symbol: `BINANCE:${symbol}`,
          interval: '1D',
          timezone: 'Asia/Seoul',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          save_image: false,
          overrides: {
            'mainSeriesProperties.candleStyle.upColor': '#d32634',          // 상승 색 (예: 빨강)
            'mainSeriesProperties.candleStyle.downColor': '#135ce7',        // 하락 색 (예: 진한 파랑)
            'mainSeriesProperties.candleStyle.borderUpColor': '#d32634',
            'mainSeriesProperties.candleStyle.borderDownColor': '#135ce7',
            'mainSeriesProperties.candleStyle.wickUpColor': '#d32634',
            'mainSeriesProperties.candleStyle.wickDownColor': '#135ce7',
            'mainSeriesProperties.candleStyle.drawWick': true,
            'mainSeriesProperties.candleStyle.drawBorder': true,
          },
          studies_overrides: {
            'volume.volume.color.1': '#d32634',  // 상승 볼륨 색상 (빨강)
            'volume.volume.color.0': '#135ce7',  // 하락 볼륨 색상 (파랑)
            'volume.volume.transparency': 40,   // 투명도 0~100
          }
        });
      }
    };

    containerRef.current.appendChild(script);
  }, [symbol]);

  return (
    <div className={style.chart}>
      <div id="tradingview_chart" ref={containerRef}></div>
    </div>
  );
};

export default TradingViewChart;
