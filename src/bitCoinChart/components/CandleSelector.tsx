import { useEffect, useRef, useState } from 'react';
import styles from '../style/CandleSelector.module.scss';

export type CandleType = 'seconds' | 'minutes' | 'days' | 'weeks' | 'months' | 'years';

const candleTypeOptions: { label: string; value: CandleType }[] = [
  { label: '초', value: 'seconds' },
  { label: '분', value: 'minutes' },
  { label: '일', value: 'days' },
  { label: '주', value: 'weeks' },
  { label: '월', value: 'months' },
  { label: '년', value: 'years' },
];

const candleUnitOptions: Record<CandleType, number[]> = {
  seconds: [1, 3, 5, 10, 15, 30],
  minutes: [1, 3, 5, 10, 15, 30, 60, 240],
  days: [1],
  weeks: [1],
  months: [1],
  years: [1],
};

export default function CandleSelector({
  onChange,
}: {
  onChange: (type: CandleType, unit: number) => void;
}) {
  const [selectedType, setSelectedType] = useState<CandleType>('days');
  const [selectedUnit, setSelectedUnit] = useState<number>(1);
  const [openType, setOpenType] = useState<CandleType | null>(null);
  const singleOption = ['seconds', 'days', 'weeks', 'months', 'years'];
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleTypeClick = (type: CandleType) => {
    if (singleOption.includes(type)) {
      setSelectedType(type);
      setSelectedUnit(candleUnitOptions[type][0]);
      onChange(type, candleUnitOptions[type][0]);
      setOpenType(null);
    } else {
      setOpenType(type);
    }
  };

  const handleUnitClick = (unit: number) => {
    if (openType) {
      setSelectedType(openType);
      setSelectedUnit(unit);
      onChange(openType, unit);
      setOpenType(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpenType(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.typeButtons}>
        {candleTypeOptions.map((type) => (
          <button
            key={type.value}
            onClick={() => handleTypeClick(type.value)}
            className={`${styles.typeButton} ${
              selectedType === type.value ? styles.activeType : ''
            }`}
          >
            {selectedType === type.value
              ? `${selectedUnit === 1 ? '' : selectedUnit}${type.label}`
              : type.label}
          </button>
        ))}
      </div>

      {openType && candleUnitOptions[openType].length > 1 && (
        <div className={styles.unitDropdown}>
          {candleUnitOptions[openType].map((unit) => (
            <button
              key={unit}
              onClick={() => handleUnitClick(unit)}
              className={`${styles.unitButton} ${
                unit === selectedUnit && openType === selectedType ? styles.activeUnit : ''
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
