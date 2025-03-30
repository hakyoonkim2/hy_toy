import FallingCharItem from '@typinggame/components/FallingCharItem';
import GameInfoBoardOverlay from '@typinggame/components/GameInfoBoardOverlay';
import GameOverOverlay from '@typinggame/components/GameOverOverlay';
import HealthBar from '@typinggame/components/HealthBar';
import { FallingChar } from '@typinggame/types/TypingGameTypes';
import style from '@typinggame/TypingGame.module.scss';

type Props = {
  chars: FallingChar[];
  health: number;
  isGameOver: boolean;
  score: number;
  combo: number;
  scoreBump: boolean;
  restartGame: () => void;
  containerHeight: number;
};

/**
 *  게임 screen UI
 */
const GameScreen = ({
  chars,
  health,
  isGameOver,
  score,
  combo,
  scoreBump,
  restartGame,
  containerHeight,
}: Props) => {
  return (
    <div
      className={style.gameScreen}
      style={{
        width: `300px`,
        height: `${containerHeight}px`,
        position: 'relative',
      }}
    >
      <GameInfoBoardOverlay score={score} scoreBump={scoreBump} combo={combo} />
      {chars.map((c) => (
        <FallingCharItem key={c.id} fallingChar={c} />
      ))}

      <HealthBar health={health} />
      {isGameOver && <GameOverOverlay restartGame={restartGame} />}
    </div>
  );
};

export default GameScreen;
