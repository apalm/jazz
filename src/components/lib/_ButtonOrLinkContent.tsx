import * as React from "react";
import cx from "classcat";
import styles from "./_ButtonOrLinkContent.module.css";

export function ButtonOrLinkContent(props: {
  type: "button" | "link";
  children?: React.ReactNode;
  icon?: {
    icon: React.ReactElement;
    position?: "start" | "end";
    gap?: "md" | "sm";
  };
}) {
  const { type, children, icon } = props;
  if (type === "link") {
    return <>{children}</>;
  }
  if (icon == null) {
    return <>{children}</>;
  }
  let position = icon?.position ?? "start";
  let gap = icon?.gap ?? "md";
  if (children == null) {
    return <>{icon.icon}</>;
  }
  if (position === "start") {
    return (
      <div
        className={cx([
          styles.buttonLayout,
          styles.buttonLayoutWithIconStart,
          gap === "sm" && styles.buttonLayoutSm,
        ])}
      >
        {icon.icon}
        {children}
      </div>
    );
  }
  return (
    <div
      className={cx([
        styles.buttonLayout,
        styles.buttonLayoutWithIconEnd,
        gap === "sm" && styles.buttonLayoutSm,
      ])}
    >
      {children}
      {icon.icon}
    </div>
  );
}
