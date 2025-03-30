import style from '@typinggame/styles/GameOverOverlay.module.scss';

type Props = {
  restartGame: () => void;
};

/**
 * 게임 오버 UI
 */
const GameOverOverlay = ({ restartGame }: Props) => {
  return (
    <div className={style.gameOverOverlay}>
      <p>Game Over</p>
      <button onClick={restartGame} className={style.restartButton}>
        Restart
      </button>
    </div>
  );
};

export default GameOverOverlay;
