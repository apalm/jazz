import styles from "./_ButtonActivityIndicator.module.css";

const size = 24;

export function ButtonActivityIndicator() {
  return (
    <div className={styles.buttonActivityIndicatorRoot}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className={styles.buttonActivityIndicatorSvg}
      >
        <circle
          opacity={0.2}
          cx={`${size / 2}px`}
          cy={`${size / 2}px`}
          fill="none"
          r={`${size / 2 - 6}px`}
          strokeWidth="2px"
        />
        <circle
          strokeDasharray={80}
          strokeDashoffset={60}
          cx={`${size / 2}px`}
          cy={`${size / 2}px`}
          fill="none"
          r={`${size / 2 - 6}px`}
          strokeWidth="2px"
        />
      </svg>
    </div>
  );
}
