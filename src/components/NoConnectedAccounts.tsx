import * as React from "react";
import { IconMusicNote } from "../icons/IconMusicNote";
import { Button } from "./lib/Button";
import { DialogConnectorAdd } from "./DialogConnectorAdd";
import styles from "./NoConnectedAccounts.module.css";

export function NoConnectedAccounts() {
  const [
    isDialogConnectorAddOpen,
    setIsDialogConnectorAddOpen,
  ] = React.useState(false);
  return (
    <>
      {isDialogConnectorAddOpen ? (
        <DialogConnectorAdd
          onDismiss={() => {
            setIsDialogConnectorAddOpen(false);
          }}
        />
      ) : null}
      <div className={styles.root}>
        <div className={styles.layout}>
          <IconMusicNote className={styles.icon} />
          <h1 className={styles.heading}>Add Music to Your Library</h1>
          <Button
            type="button"
            onClick={() => {
              setIsDialogConnectorAddOpen(true);
            }}
          >
            Add Music
          </Button>
        </div>
      </div>
    </>
  );
}
