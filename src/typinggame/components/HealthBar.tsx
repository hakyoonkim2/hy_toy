import style from '@typinggame/TypingGame.module.scss';

type Props = {
  health: number;
};

/**
 * 체력바 표시 UI
 */
const HealthBar = ({ health }: Props) => {
  return (
    <div className={style.healthBarContainer}>
      <div className={style.healthBar} style={{ width: `${(health / 100) * 100}%` }}></div>
    </div>
  );
};

export default HealthBar;
