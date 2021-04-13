import { Link } from "../../components/lib/Link";
import styles from "./_404.module.css";

export default function Page() {
  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>404</h1>
      <div className={styles.center}>
        <div className={styles.subHeading}>
          This is not the page you were looking for.
        </div>
      </div>
      <div className={styles.linkContainer}>
        <Link to="/">Home</Link>
      </div>
    </div>
  );
}
