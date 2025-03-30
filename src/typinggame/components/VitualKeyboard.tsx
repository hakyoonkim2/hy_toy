import style from '@typinggame/styles/VitualKeyboard.module.scss';

const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

type Props = {
  onKeyPress: (key: string) => void;
  isGameOver: boolean;
  currentKey: string;
};

/**
 * 가상키보드 UI
 */
const VirtualKeyboard = ({ onKeyPress, isGameOver, currentKey }: Props) => {
  return (
    <div className={style.keyboard}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={style.keyboardRow}>
          {row.split('').map((char) => (
            <button
              key={char}
              className={style.keyButton}
              onClick={() => onKeyPress(char)}
              style={currentKey === char ? { backgroundColor: 'black' } : {}}
              disabled={isGameOver}
            >
              {char}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default VirtualKeyboard;
