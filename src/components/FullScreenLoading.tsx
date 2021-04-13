import { Delay } from "./lib/Delay";
import { ActivityIndicator } from "./lib/ActivityIndicator";
import styles from "./FullScreenLoading.module.css";

export function FullScreenLoading(props: { delay?: number }) {
  return (
    <div className={styles.root}>
      <Delay delay={props.delay}>
        <ActivityIndicator />
      </Delay>
    </div>
  );
}
