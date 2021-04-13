import * as React from "react";
import cx from "classcat";
import { Link } from "react-router-dom";
import styles from "./Pressable.module.css";

// Omit className, since merging classes across stylesheets is hazardous.

export const PressableLink = React.forwardRef<
  HTMLAnchorElement,
  Omit<React.ComponentProps<typeof Link>, "className"> & {
    variant?: "withoutFeedback" | "opacity";
  }
>((props, ref) => {
  const { variant = "opacity", ...rest } = props;
  return (
    <Link
      // https://stackoverflow.com/questions/3885018/active-pseudo-class-doesnt-work-in-mobile-safari
      onTouchStart={() => {}}
      ref={ref}
      className={cx([
        styles.pressable,
        variant === "opacity" && styles.pressableOpacity,
      ])}
      {...rest}
    />
  );
});
