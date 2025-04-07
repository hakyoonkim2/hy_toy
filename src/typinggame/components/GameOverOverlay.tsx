import GameRanking from '@typinggame/components/GameRanking';
import style from '@typinggame/styles/GameOverOverlay.module.scss';

type Props = {
  restartGame: () => void;
  score: number;
};

/**
 * 게임 오버 UI
 */
const GameOverOverlay = ({ restartGame, score }: Props) => {
  return (
    <div className={style.gameOverOverlay}>
      <p>Game Over</p>
      <GameRanking score={score} />
      <button onClick={restartGame} className={style.restartButton}>
        Restart
      </button>
    </div>
  );
};

export default GameOverOverlay;
