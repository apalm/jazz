import {
  ConnectorDropbox,
  CONNECTOR_TYPE_ID_DROPBOX,
} from "./ConnectorDropbox";
import { ReactComponent as LogoDropbox } from "../assets/dropbox.svg";

export const connectorTypeList = [
  {
    id: CONNECTOR_TYPE_ID_DROPBOX,
    name: "Dropbox",
    logo: LogoDropbox,
    connectorTypeClass: ConnectorDropbox,
  },
];
