import * as React from "react";
import cx from "classcat";
import styles from "./Pressable.module.css";

// Omit className, since merging classes across stylesheets is hazardous.

export const Pressable = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentProps<"button">, "className"> & {
    variant?: "withoutFeedback" | "opacity";
  }
>((props, ref) => {
  const { variant = "opacity", ...rest } = props;
  return (
    <button
      // https://stackoverflow.com/questions/3885018/active-pseudo-class-doesnt-work-in-mobile-safari
      onTouchStart={() => {}}
      ref={ref}
      type="button"
      className={cx([
        styles.pressable,
        variant === "opacity" && styles.pressableOpacity,
      ])}
      {...rest}
    />
  );
});
