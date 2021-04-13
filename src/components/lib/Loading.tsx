import { Delay } from "./Delay";
import { ActivityIndicator } from "./ActivityIndicator";
import styles from "./Loading.module.css";

export function Loading(props: { delay?: number }) {
  return (
    <div className={styles.root}>
      <Delay delay={props.delay}>
        <ActivityIndicator />
      </Delay>
    </div>
  );
}
