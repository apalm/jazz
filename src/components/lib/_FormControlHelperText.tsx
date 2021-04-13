import cx from "classcat";
import styles from "./_FormControlHelperText.module.css";

export function FormControlHelperText(props: {
  isError?: boolean;
  children: string;
}) {
  return (
    <div
      className={cx([
        styles.formControlHelperText,
        props.isError && styles.formControlHelperTextError,
      ])}
    >
      {props.children}
    </div>
  );
}
