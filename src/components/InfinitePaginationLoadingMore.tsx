import { Delay } from "./lib/Delay";
import { ActivityIndicator } from "./lib/ActivityIndicator";
import styles from "./InfinitePaginationLoadingMore.module.css";

export function InfinitePaginationLoadingMore() {
  return (
    <div className={styles.root}>
      <Delay>
        <ActivityIndicator />
      </Delay>
    </div>
  );
}
