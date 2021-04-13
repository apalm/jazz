import styles from "./_CircularProgress.module.css";

export function CircularProgress() {
  return (
    <div className={styles.circularProgress}>
      <svg viewBox="0 0 32 32" className={styles.circularProgressSvg}>
        <circle
          opacity={0.2}
          cx="16px"
          cy="16px"
          fill="none"
          r="14px"
          strokeWidth="2px"
        />
        <circle
          strokeDasharray={80}
          strokeDashoffset={60}
          cx="16px"
          cy="16px"
          fill="none"
          r="14px"
          strokeWidth="2px"
        />
      </svg>
    </div>
  );
}
