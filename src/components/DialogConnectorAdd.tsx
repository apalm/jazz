import * as React from "react";
import { useMutation } from "react-query";
import { DropboxAuth } from "dropbox";
import { connectorTypeList } from "../shared/connectorTypeList";
import {
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogHeading,
  DialogBody,
} from "./lib/Dialog";
import { Button } from "./lib/Button";
import { showToast } from "./lib/Toast";
import styles from "./DialogConnectorAdd.module.css";
import { Input } from "./lib/Input";
import { Unarray } from "../lib/Unarray";

export function DialogConnectorAdd(props: {
  onDismiss: React.ComponentProps<typeof DialogOverlay>["onDismiss"];
}) {
  const { onDismiss } = props;
  return (
    <DialogOverlay onDismiss={onDismiss}>
      <DialogContent aria-label="Connect an Account">
        <DialogHeader>
          <DialogHeading>Connect an Account</DialogHeading>
        </DialogHeader>
        <DialogBody>
          <ul className={styles.list}>
            {connectorTypeList.map((x, i) => (
              <ListItem key={i} data={x} />
            ))}
          </ul>
        </DialogBody>
      </DialogContent>
    </DialogOverlay>
  );
}

function ListItem(props: { data: Unarray<typeof connectorTypeList> }) {
  const { data: x } = props;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropboxAuth = new DropboxAuth({
    clientId: process.env.REACT_APP_DROPBOX_APP_KEY,
  });
  const { mutate, ...mutateResult } = useMutation(
    async (variables: Parameters<typeof dropboxAuth.getAuthenticationUrl>) => {
      return dropboxAuth.getAuthenticationUrl(...variables);
    },
    {
      onSuccess: (data) => {
        const codeVerifier = dropboxAuth.getCodeVerifier();
        let url = data.toString();
        const urlParsed = new URL(url);
        let state = JSON.parse(
          window.atob(urlParsed.searchParams.get("state")!)
        );
        state.codeVerifier = codeVerifier;
        urlParsed.searchParams.set("state", window.btoa(JSON.stringify(state)));
        url = urlParsed.toString();
        window.location.href = url;
      },
      onError: (error: any) => {
        showToast(error.message, { type: "error" });
      },
    }
  );
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const redirectUrl = window.location.origin + "/o";
    const musicFolder = inputRef?.current?.value.trim() || "";
    mutate([
      redirectUrl,
      window.btoa(JSON.stringify({ redirectUrl, path: musicFolder })),
      "code",
      "offline",
      undefined,
      undefined,
      true,
    ]);
  }
  return (
    <li className={styles.listItem}>
      <div className={styles.logoContainer}>
        <x.logo />
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          ref={inputRef}
          name="musicFolder"
          label="Music Folder"
          placeholder="/Music"
          helperText={`Enter the path to the folder where your music is located. If not specified, we will import music from your entire ${x.name} account.`}
        />
        <Button
          type="submit"
          state={mutateResult.isLoading ? "pending" : undefined}
        >
          Connect Account
        </Button>
      </form>
    </li>
  );
}
