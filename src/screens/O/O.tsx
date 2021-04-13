import * as React from "react";
import { Redirect, useLocation } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import { FullScreenLoading } from "../../components/FullScreenLoading";
import { ErrorMessage } from "../../components/ErrorMessage";
import { useDataService } from "../../shared/useDataService";
import { DropboxAuth } from "dropbox";
import { CONNECTOR_TYPE_ID_DROPBOX } from "../../shared/ConnectorDropbox";

export default function Page() {
  const queryClient = useQueryClient();
  const { dataService } = useDataService();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get("code") || "";
  const state = JSON.parse(window.atob(queryParams.get("state")!));
  const { codeVerifier, redirectUrl, path } = state;
  const connectorTypeId = CONNECTOR_TYPE_ID_DROPBOX;
  const { mutate, ...mutateResult } = useMutation(
    async (variables: {
      connectorTypeId: string;
      path: string;
      codeVerifier: string;
      code: string;
      redirectUrl: string;
    }) => {
      const {
        connectorTypeId,
        path,
        codeVerifier,
        code,
        redirectUrl,
      } = variables;
      const dropboxAuth = new DropboxAuth({
        clientId: process.env.REACT_APP_DROPBOX_APP_KEY,
      });
      dropboxAuth.setCodeVerifier(codeVerifier);
      const result = await dropboxAuth.getAccessTokenFromCode(
        redirectUrl,
        code
      );
      await dataService.addConnector({
        connectorTypeId,
        data: result.result,
        path,
        createdAt: new Date(),
      });
      return dataService.getConnectorList();
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData(["connectorList"], data);
      },
    }
  );

  React.useEffect(
    () => {
      mutate({
        connectorTypeId,
        path,
        codeVerifier,
        code,
        redirectUrl,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (mutateResult.status === "loading") {
    return <FullScreenLoading />;
  }
  if (mutateResult.status === "error") {
    return <ErrorMessage error={mutateResult.error} />;
  }
  return <Redirect to="/" />;
}
