import { titleSuffix, appName } from "../config";

export function formatDocumentTitle(title: string) {
  if (!title) {
    return appName;
  }
  return `${title}${titleSuffix}`;
}
