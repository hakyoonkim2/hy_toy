import style from '@typinggame/TypingGame.module.scss';
import VirtualKeyboard from '@typinggame/components/VitualKeyboard';
import useTypingGame from '@typinggame/hooks/useTypingGame';
import GameScreen from '@typinggame/components/GameScreen';

const TypingGame = () => {
  const {
    isGameOver,
    handleVirtualKeyPress,
    shake,
    chars,
    health,
    score,
    combo,
    scoreBump,
    restartGame,
    containerHeight,
    currentKey,
  } = useTypingGame();

  return (
    <div className={`${style.wrapper} ${shake ? style.shake : ''}`}>
      <GameScreen
        chars={chars}
        health={health}
        isGameOver={isGameOver}
        score={score}
        combo={combo}
        scoreBump={scoreBump}
        restartGame={restartGame}
        containerHeight={containerHeight}
      />
      <VirtualKeyboard
        isGameOver={isGameOver}
        onKeyPress={handleVirtualKeyPress}
        currentKey={currentKey}
      />
    </div>
  );
};

export default TypingGame;
