import * as React from "react";
import cx from "classcat";
import formControlStyles from "./FormControl.module.css";
import { defaultVariant, TFormControlProps } from "./FormControl";
import { FormControlLayout } from "./FormControlLayout";
import { FormControlLayoutColumns } from "./FormControlLayoutColumns";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & TFormControlProps
>((props, ref) => {
  const {
    label,
    labelEnd,
    error,
    helperText,
    showRequiredIndicator,
    variant = defaultVariant,
    siz,
    layoutKind,
    ...rest
  } = props;
  const input = (
    <input
      ref={ref}
      className={cx([
        formControlStyles.formControl,
        siz === "sm" && formControlStyles.formControlSm,
        siz === "xs" && formControlStyles.formControlXs,
        variant === "outline" && formControlStyles.formControlOutline,
        variant === "filled" && formControlStyles.formControlFilled,
        error && formControlStyles.invalid,
      ])}
      {...rest}
    />
  );
  if (layoutKind === "column") {
    return (
      <FormControlLayoutColumns
        formControl={input}
        label={label as string}
        labelEnd={labelEnd}
        id={rest.id as string}
        required={rest.required}
        showRequiredIndicator={showRequiredIndicator}
        error={error}
        helperText={helperText}
      />
    );
  }
  return (
    <FormControlLayout
      formControl={input}
      label={label}
      labelEnd={labelEnd}
      required={rest.required}
      showRequiredIndicator={showRequiredIndicator}
      error={error}
      helperText={helperText}
    />
  );
});
