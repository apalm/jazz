import styles from "./ErrorMessage.module.css";

export function ErrorMessage(props: { error: any }) {
  const { error } = props;
  const fallbackMessage = "Something went wrong.";
  const message = error?.message ?? fallbackMessage;
  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.text}>{message}</div>
      </div>
    </div>
  );
}
