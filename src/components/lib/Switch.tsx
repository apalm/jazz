import * as React from "react";
import cx from "classcat";
import RSwitch from "react-switch";
import { cssVar } from "../../lib/cssVar";
import { hslToHex, parseHsl } from "../../lib/hslToHex";
import styles from "./Switch.module.css";

const height = 22;

export const Switch = React.forwardRef<
  any,
  React.ComponentProps<typeof RSwitch> & { label?: string }
>((props, ref) => {
  const { label, ...rest } = props;
  const onColor = cssVar("--color-success-400");
  const offColor = cssVar("--color-neutral-400");
  const comp = (
    <RSwitch
      ref={ref}
      checkedIcon={false}
      uncheckedIcon={false}
      // Only hex accepted
      onColor={
        onColor.startsWith("#") ? onColor : hslToHex(...parseHsl(onColor))
      }
      offColor={
        offColor.startsWith("#") ? offColor : hslToHex(...parseHsl(offColor))
      }
      height={height}
      width={42}
      borderRadius={height / 2}
      handleDiameter={height - 8}
      {...rest}
    />
  );
  if (label === undefined) {
    return comp;
  }
  return (
    <label
      className={cx([styles.label, rest.disabled && styles.labelDisabled])}
    >
      {comp}
      {label}
    </label>
  );
});
