import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import * as cs from "../../shared/colorScheme";
import { Switch } from "../../components/lib/Switch";
import { Button } from "../../components/lib/Button";
import { KEY_COLOR_SCHEME } from "../../App";
import { useDataService } from "../../shared/useDataService";
import { Loading } from "../../components/lib/Loading";
import { ErrorMessage } from "../../components/ErrorMessage";
import { Well, WellHeading } from "../../components/lib/Well";
import { AlertDialogDelete } from "../../components/lib/AlertDialogDelete";
import { DialogConnectorAdd } from "../../components/DialogConnectorAdd";
import { connectorTypeList } from "../../shared/connectorTypeList";
import { IconDelete } from "../../icons/IconDelete";
import { showToast } from "../../components/lib/Toast";
import { useTrackQueue } from "../../shared/useTrackQueue";
import styles from "./Settings.module.css";

export default function Page() {
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
        <h1 className={styles.heading}>Settings</h1>
        <div className={styles.items}>
          {[
            {
              title: "Dark Mode",
              text: "Enable dark mode",
              content: <ColorSchemeSwitch />,
            },
            {
              title: "Connected Accounts",
              text: "Manage connected accounts",
              content: (
                <Button
                  type="button"
                  onClick={() => {
                    setIsDialogConnectorAddOpen(true);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  Connect Account
                </Button>
              ),
              additionalContent: <ConnectedAccounts />,
            },
          ].map((x, i) => (
            <div key={i} className={styles.item}>
              <div>
                <h2 className={styles.itemTitle}>{x.title}</h2>
                <div>{x.text}</div>
              </div>
              {x.content}
              {x.additionalContent == null ? null : (
                <div className={styles.itemAdditionalContent}>
                  {x.additionalContent}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ColorSchemeSwitch() {
  const [isChecked, setIsChecked] = React.useState(cs.isDark);
  function toggleIsChecked() {
    setIsChecked((x) => !x);
  }
  React.useEffect(() => {
    if (isChecked) {
      cs.setDark();
      window.localStorage.setItem(KEY_COLOR_SCHEME, cs.valueDark);
    } else {
      cs.setLight();
      window.localStorage.setItem(KEY_COLOR_SCHEME, cs.valueLight);
    }
  }, [isChecked]);
  return <Switch checked={isChecked} onChange={toggleIsChecked} />;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function ConnectedAccounts() {
  const [idToRemove, setIdToRemove] = React.useState<
    typeof connectorTypeList[number]["id"] | undefined
  >(undefined);
  const queryClient = useQueryClient();
  const tq = useTrackQueue();
  const { dataService } = useDataService();
  const result = useQuery(["connectorList"], () =>
    dataService.getConnectorList()
  );
  const { mutate: removeItem, ...removeItemResult } = useMutation(
    async (
      variables: Parameters<typeof dataService.removeConnectorAndLinkedRecords>
    ) => {
      return dataService.removeConnectorAndLinkedRecords(...variables);
    },
    {
      onSuccess: () => {
        queryClient.clear();
        tq.operations.clearQueue();
        tq.operations.setTrackCurrent(null);
      },
      onError: (error: any) => {
        showToast(error.message, { type: "error" });
      },
    }
  );
  if (result.status === "loading") {
    return <Loading />;
  }
  if (result.status === "error" || result.data === undefined) {
    return <ErrorMessage error={result.error} />;
  }
  const list = result.data;
  if (list.length === 0) {
    return (
      <Well>
        <WellHeading>No connected accounts yet</WellHeading>
      </Well>
    );
  }
  return (
    <>
      {idToRemove == null ? null : (
        <AlertDialogDelete
          heading="Remove Account"
          text="Are you sure you want to remove this account? All music imported from the account will be removed from your library."
          buttonProps={{
            onClick: () => {
              removeItem([idToRemove]);
            },
            state: removeItemResult.isLoading ? "pending" : undefined,
            children: "Remove",
          }}
          toggleDialog={() => {
            setIdToRemove(undefined);
          }}
        />
      )}
      <ul className={styles.accountList}>
        {list.map((x) => {
          const connectorType = connectorTypeList.find(
            (ct) => ct.id === x.connectorTypeId
          )!;
          return (
            <li key={x.id} className={styles.accountListItem}>
              <div>
                <div className={styles.logoContainer}>
                  <connectorType.logo />
                </div>
                <span>
                  <span>Connected on </span>
                  <span className={styles.accountListItemTextEmphasis}>
                    {dateFormatter.format(x.createdAt)}
                  </span>
                </span>
              </div>
              <div>
                <Button
                  type="button"
                  aria-label="Remove"
                  onClick={() => {
                    setIdToRemove(x.id);
                  }}
                  variant="danger"
                  size="xxs"
                >
                  <IconDelete />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
