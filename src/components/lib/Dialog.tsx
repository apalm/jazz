import "@reach/dialog/styles.css";
import * as React from "react";
import cx from "classcat";
import {
  DialogOverlay as RDialogOverlay,
  DialogContent as RDialogContent,
} from "@reach/dialog";
import { AlertDialogContext } from "./AlertDialog";
import styles from "./Dialog.module.css";

export {
  AlertDialogLoading as DialogLoading,
  AlertDialogHeader as DialogHeader,
  AlertDialogBody as DialogBody,
} from "./AlertDialog";

export function DialogOverlay(
  props: React.ComponentProps<typeof RDialogOverlay>
) {
  const { children, ...rest } = props;
  return (
    <AlertDialogContext.Provider value={{ onDismiss: rest.onDismiss }}>
      <RDialogOverlay className={styles.overlay} {...rest}>
        {children}
      </RDialogOverlay>
    </AlertDialogContext.Provider>
  );
}

export function DialogContent(
  props: React.ComponentProps<typeof RDialogContent> & { width?: "lg" }
) {
  const { children, width, ...rest } = props;
  return (
    <RDialogContent
      className={cx([styles.content, width === "lg" && styles.contentLg])}
      {...rest}
    >
      {children}
    </RDialogContent>
  );
}

export function DialogHeading(props: { children: React.ReactNode }) {
  return <div className={styles.heading}>{props.children}</div>;
}
