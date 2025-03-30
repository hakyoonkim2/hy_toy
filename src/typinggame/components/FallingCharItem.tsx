import { FallingChar } from '@typinggame/types/TypingGameTypes';
import style from '@typinggame/TypingGame.module.scss';

type Props = {
  fallingChar: FallingChar;
};

/**
 * 떨어지는 문자열 컴포넌트
 * 문자열이 떨어지는 모션은 중앙에서 관리
 *
 */
const FallingCharItem = ({ fallingChar }: Props) => {
  return (
    <div
      key={fallingChar.id}
      className={`${style.char} ${fallingChar.isRemoving ? style.explode : ''}`}
      style={{
        top: fallingChar.top,
        left: fallingChar.left,
        position: 'absolute',
      }}
    >
      {fallingChar.text}
    </div>
  );
};

export default FallingCharItem;
