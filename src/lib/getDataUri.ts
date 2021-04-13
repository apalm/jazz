export function getDataUri(mediaType: string, data: string) {
  return `data:${mediaType};base64,${data}`;
}
