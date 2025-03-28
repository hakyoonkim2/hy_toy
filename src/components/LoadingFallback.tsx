import style from '@style/LoadingFallback.module.scss';

type Props = {
  width: number;
  height: number;
};

const LoadingFallback = ({ width = 40, height = 40 }: Props) => {
  return (
    <div
      className={style.spinner}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
};

export default LoadingFallback;
