import * as React from "react";
import cx from "classcat";
import styles from "./Avatar.module.css";

type TAvatarProps = {
  size?: "xs" | "sm" | "lg" | "xl" | "xxl";
  fallback: string;
  fallbackVariant?: "outline";
  fallbackLength?: number;
  fallbackBackgroundColor?: string;
  fallbackColor?: string;
  shape?: "rectangular";
};

export const Avatar = React.forwardRef<
  any,
  React.ComponentProps<"img"> & TAvatarProps
>((props, ref) => {
  const {
    alt,
    size,
    shape,
    fallback,
    fallbackVariant,
    fallbackLength,
    fallbackBackgroundColor,
    fallbackColor,
    className,
    ...restProps
  } = props;
  const [shouldShowFallback, setShouldShowFallback] = React.useState(
    !restProps.src
  );
  if (shouldShowFallback) {
    const content =
      fallback.length === 0
        ? "U"
        : fallback.slice(0, fallbackLength ?? 1).toLocaleUpperCase();
    return (
      <div
        ref={ref}
        className={cx([
          styles.avatar,
          size === "xs" && styles.xs,
          size === "sm" && styles.sm,
          size === "lg" && styles.lg,
          size === "xl" && styles.xl,
          size === "xxl" && styles.xxl,
          styles.fallback,
          fallbackVariant === "outline" && styles.fallbackOutline,
          shape === "rectangular" && styles.rectangular,
          className,
        ])}
        style={
          fallbackBackgroundColor == null && fallbackColor == null
            ? undefined
            : { backgroundColor: fallbackBackgroundColor, color: fallbackColor }
        }
      >
        {content}
      </div>
    );
  }
  return (
    <img
      ref={ref}
      alt={alt}
      className={cx([
        styles.avatar,
        size === "xs" && styles.xs,
        size === "sm" && styles.sm,
        size === "lg" && styles.lg,
        size === "xl" && styles.xl,
        size === "xxl" && styles.xxl,
        shape === "rectangular" && styles.rectangular,
        className,
      ])}
      onError={(event) => {
        setShouldShowFallback(true);
      }}
      {...restProps}
    />
  );
});

// https://material-ui.com/components/avatars/#grouped
export function AvatarGroup(props: {
  children: React.ReactNode;
  EmptyComponent?: React.ReactNode;
  max?: number;
}): any {
  const arr = React.Children.toArray(props.children);
  const inner = props.max == null ? arr : arr.slice(0, props.max);
  if (arr.length === 0) {
    if (props.EmptyComponent !== undefined) {
      return props.EmptyComponent;
    }
    return null;
  }
  return <div className={styles.avatarGroup}>{inner}</div>;
}

export function AvatarGroupEmpty(props: { text?: string }) {
  return (
    <div className={styles.avatarGroupEmpty}>
      <div className={styles.avatarGroupEmptyText}>
        {props.text ?? "Nothing to show"}
      </div>
    </div>
  );
}
