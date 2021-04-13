export interface IConnector {
  getId(): string;
  getConnectorTypeId(): string;
  getTrackIdList(): Promise<Array<string>>;
  downloadTrack(input: { id: string }): Promise<Blob>;
  getTrackUrl(input: { id: string }): string;
}
