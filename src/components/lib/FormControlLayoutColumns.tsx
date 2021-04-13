import cx from "classcat";
import { FormControlHelperText } from "./_FormControlHelperText";
import styles from "./FormControlLayoutColumns.module.css";

export function FormControlLayoutColumns(props: {
  formControl: React.ReactNode;
  label: string;
  // Not currently used, but so props are same as `FormControlLayout`
  labelEnd?: React.ReactNode;
  id: string;
  error?: string | undefined;
  helperText?: string | undefined;
  required?: boolean;
  showRequiredIndicator?: boolean;
  noLabelContainerBlockStartPadding?: boolean;
}) {
  const {
    formControl,
    label,
    id,
    error,
    helperText,
    required,
    showRequiredIndicator = true,
    noLabelContainerBlockStartPadding,
  } = props;

  const text = error || helperText;
  const textComp = text ? (
    <FormControlHelperText isError={!!error}>{text}</FormControlHelperText>
  ) : null;

  return (
    <div className={styles.root}>
      <div
        className={cx([
          styles.labelContainer,
          noLabelContainerBlockStartPadding && styles.labelContainerNoPadding,
        ])}
      >
        <label htmlFor={id} className={styles.label}>
          <div className={styles.labelInner}>
            <div className={styles.labelTextContainer}>
              <span className={styles.labelText}>{label}</span>
              {required && showRequiredIndicator ? (
                <span aria-hidden className={styles.labelTextRequiredIndicator}>
                  *
                </span>
              ) : null}
            </div>
          </div>
        </label>
      </div>
      <div className={styles.formControlContainer}>
        {formControl}
        {textComp}
      </div>
    </div>
  );
}
