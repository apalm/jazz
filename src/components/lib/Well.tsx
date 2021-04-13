import * as React from "react";
import cx from "classcat";
import styles from "./Well.module.css";

export function Well(props: { children: React.ReactNode; size?: "sm" | "xs" }) {
  return (
    <div
      className={cx([
        styles.well,
        props.size === "sm" && styles.sm,
        props.size === "xs" && styles.xs,
      ])}
    >
      {props.children}
    </div>
  );
}

export function WellHeading(props: { children: React.ReactNode }) {
  return <div className={styles.wellHeading}>{props.children}</div>;
}

export function WellText(props: { children: React.ReactNode }) {
  return <div className={styles.wellText}>{props.children}</div>;
}

export function WellActionContainer(props: {
  children: React.ReactNode;
  marginBlockStart?: "sm";
}) {
  return (
    <div
      className={cx([
        styles.wellActionContainer,
        props.marginBlockStart === "sm" &&
          styles.wellActionContainerMarginBlockStartSm,
      ])}
    >
      {props.children}
    </div>
  );
}
