import style from '@typinggame/TypingGame.module.scss';

type Props = {
  score: number;
  scoreBump: boolean;
  combo: number;
};

/**
 * 게임 진행 정보 출력 UI
 */
const GameInfoBoardOverlay = ({ score, scoreBump, combo }: Props) => {
  return (
    <>
      <div className={style.scoreBox}>
        <p className={scoreBump ? style.bump : ''}>Score: {score}</p>
        <p>Combo: {combo}</p>
      </div>

      {combo > 0 && combo % 10 === 0 && (
        <div key={combo} className={style.comboPop}>
          {combo} Combo!
        </div>
      )}
    </>
  );
};

export default GameInfoBoardOverlay;
