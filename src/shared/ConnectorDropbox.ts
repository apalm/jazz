import { Dropbox, DropboxAuth } from "dropbox";
import { ThenArg } from "../lib/ThenArg";
import { IConnector } from "./IConnector";

export const CONNECTOR_TYPE_ID_DROPBOX = "1";

export class ConnectorDropbox implements IConnector {
  id: string;
  connectorTypeId: string;
  path: string;
  dropboxAuth: DropboxAuth;
  dropbox: Dropbox;

  constructor(input: { id: string; data: any; path: string }) {
    const dropboxAuth = new DropboxAuth({
      clientId: process.env.REACT_APP_DROPBOX_APP_KEY,
    });
    dropboxAuth.setAccessToken(input.data.access_token);
    dropboxAuth.setRefreshToken(input.data.refresh_token);
    this.dropboxAuth = dropboxAuth;
    this.dropbox = new Dropbox({ auth: dropboxAuth });
    this.id = input.id;
    this.connectorTypeId = CONNECTOR_TYPE_ID_DROPBOX;
    this.path = input.path;
  }

  getId() {
    return this.id;
  }

  getConnectorTypeId() {
    return this.connectorTypeId;
  }

  async getTrackIdList() {
    let response = await this.dropbox.filesListFolder({
      path: this.path,
      recursive: true,
      include_non_downloadable_files: false,
      include_media_info: true,
    });
    let out = this.processFileListResult(response);
    // TODO
    const limit = 500;
    while (response.result.has_more && out.length <= limit) {
      response = await this.dropbox.filesListFolderContinue({
        cursor: response.result.cursor,
      });
      out = out.concat(this.processFileListResult(response));
    }
    // TODO
    // return out;
    return out.slice(0, limit);
  }

  private processFileListResult(
    response:
      | ThenArg<ReturnType<Dropbox["filesListFolder"]>>
      | ThenArg<ReturnType<Dropbox["filesListFolderContinue"]>>
  ) {
    return response.result.entries
      .filter(
        (x) =>
          x[".tag"] === "file" &&
          x.path_lower != null &&
          (x.name.endsWith(".aac") ||
            x.name.endsWith(".aiff") ||
            x.name.endsWith(".alac") ||
            x.name.endsWith(".flac") ||
            x.name.endsWith(".m4a") ||
            x.name.endsWith(".mp3") ||
            x.name.endsWith(".ogg") ||
            x.name.endsWith(".opus"))
      )
      .map((x) => x.path_lower!);
  }

  async downloadTrack(input: { id: string }) {
    const { id } = input;
    const downloadResult = await this.dropbox.filesDownload({ path: id });
    const blob: Blob =
      // @ts-ignore
      downloadResult.result["fileBlob"];
    return blob;
  }

  getTrackUrl(input: { id: string }) {
    const { id } = input;
    return (
      "https://content.dropboxapi.com" +
      "/2/files/download?" +
      new URLSearchParams({
        authorization: `Bearer ${this.dropboxAuth.getAccessToken()}`,
        arg: safeJSONStringify({ path: id }),
      }).toString()
    );
  }
}

function safeJSONStringify(v: any) {
  return JSON.stringify(v).replace(
    /[\u007f-\uffff]/g,
    (c) => "\\u" + ("000" + c.charCodeAt(0).toString(16)).slice(-4)
  );
}
