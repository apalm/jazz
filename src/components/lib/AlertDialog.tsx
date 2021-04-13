import "@reach/dialog/styles.css";
import * as React from "react";
import cx from "classcat";
import {
  AlertDialogOverlay as RAlertDialogOverlay,
  AlertDialogContent as RAlertDialogContent,
  AlertDialogLabel as RAlertDialogLabel,
  AlertDialogDescription as RAlertDialogDescription,
} from "@reach/alert-dialog";
import { MdClose } from "react-icons/md";
import { ActivityIndicator } from "./ActivityIndicator";
import { Delay } from "./Delay";
import { Button } from "./Button";
import styles from "./Dialog.module.css";

export const AlertDialogContext = React.createContext<{
  onDismiss: React.ComponentProps<typeof RAlertDialogOverlay>["onDismiss"];
}>(
  // @ts-ignore
  undefined
);

export function AlertDialogOverlay(
  props: React.ComponentProps<typeof RAlertDialogOverlay>
) {
  const { children, ...rest } = props;
  return (
    <AlertDialogContext.Provider value={{ onDismiss: rest.onDismiss }}>
      <RAlertDialogOverlay className={styles.overlay} {...rest}>
        {children}
      </RAlertDialogOverlay>
    </AlertDialogContext.Provider>
  );
}

export function AlertDialogContent(
  props: React.ComponentProps<typeof RAlertDialogContent> & { width?: "lg" }
) {
  const { children, width, ...rest } = props;
  return (
    <RAlertDialogContent
      className={cx([styles.content, width === "lg" && styles.contentLg])}
      {...rest}
    >
      {children}
    </RAlertDialogContent>
  );
}

export function AlertDialogHeading(
  props: React.ComponentProps<typeof RAlertDialogLabel>
) {
  const { children, ...rest } = props;
  return (
    <RAlertDialogLabel className={styles.heading} {...rest}>
      {children}
    </RAlertDialogLabel>
  );
}

export function AlertDialogDescription(
  props: React.ComponentProps<typeof RAlertDialogDescription>
) {
  return <RAlertDialogDescription {...props} />;
}

export function AlertDialogHeader(props: {
  children: React.ReactNode;
  displayCloseButton?: boolean;
}) {
  const { children, displayCloseButton = true } = props;
  const { onDismiss } = React.useContext(AlertDialogContext);
  return (
    <div className={styles.alertDialogHeader}>
      {children}
      {displayCloseButton && onDismiss != null ? (
        <Button
          onClick={onDismiss}
          aria-label="Close"
          variant="transparentNeutral"
          size="xxs"
        >
          <MdClose />
        </Button>
      ) : null}
    </div>
  );
}

export function AlertDialogBody(props: {
  children: React.ReactNode;
  scrollableConfig?: React.ComponentProps<"div">["style"];
}) {
  const { children, scrollableConfig = { maxHeight: "55vh" } } = props;
  return (
    <div
      className={cx([
        styles.alertDialogBody,
        scrollableConfig && styles.alertDialogBodyScrollable,
      ])}
      style={scrollableConfig || undefined}
    >
      {children}
    </div>
  );
}

export function AlertDialogActions(props: { children: React.ReactNode }) {
  return <div className={styles.alertDialogActions}>{props.children}</div>;
}

export function AlertDialogLoading() {
  const leastDestructiveRef = React.useRef<any>(null);
  return (
    <AlertDialogOverlay leastDestructiveRef={leastDestructiveRef}>
      <Delay>
        <RAlertDialogContent className={styles.alertDialogLoadingContainer}>
          <RAlertDialogLabel />
          <div className={styles.alertDialogLoading}>
            <ActivityIndicator />
          </div>
        </RAlertDialogContent>
      </Delay>
    </AlertDialogOverlay>
  );
}
