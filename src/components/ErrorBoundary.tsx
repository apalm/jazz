import * as React from "react";
import styles from "./ErrorBoundary.module.css";
import { ErrorMessage } from "./ErrorMessage";

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.root}>
          <ErrorMessage error={new Error("Something went wrong")} />
        </div>
      );
    }
    return this.props.children;
  }
}
