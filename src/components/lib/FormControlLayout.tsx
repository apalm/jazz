import cx from "classcat";
import { FormControlHelperText } from "./_FormControlHelperText";
import styles from "./FormControlLayout.module.css";

export function FormControlLayout(props: {
  formControl: React.ReactNode;
  label: string | null;
  labelEnd?: React.ReactNode;
  error?: string | undefined;
  helperText?: string | undefined;
  required?: boolean;
  showRequiredIndicator?: boolean;
}) {
  const {
    formControl,
    label,
    labelEnd,
    error,
    helperText,
    required,
    showRequiredIndicator = true,
  } = props;

  const text = error || helperText;
  const textComp = text ? (
    <FormControlHelperText isError={!!error}>{text}</FormControlHelperText>
  ) : null;

  if (!label) {
    return (
      <div className={styles.container}>
        {formControl}
        {textComp}
      </div>
    );
  }
  return (
    <div>
      <label className={styles.label}>
        <div
          className={cx([
            styles.labelInner,
            labelEnd && styles.labelInnerWithEnd,
          ])}
        >
          <div className={styles.labelTextContainer}>
            <span className={styles.labelText}>{label}</span>
            {required && showRequiredIndicator ? (
              <span aria-hidden className={styles.labelTextRequiredIndicator}>
                *
              </span>
            ) : null}
          </div>
          {labelEnd ? (
            <div className={styles.labelEndContainer}>{labelEnd}</div>
          ) : null}
        </div>
        {formControl}
      </label>
      {textComp}
    </div>
  );
}
