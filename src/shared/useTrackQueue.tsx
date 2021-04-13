import * as React from "react";
import { init } from "./DataService";
import { ThenArg } from "../lib/ThenArg";
import { useDataService } from "./useDataService";

type TTrack = ThenArg<ReturnType<ThenArg<ReturnType<typeof init>>["getTrack"]>>;

export function TrackQueueProvider(props: { children: any }) {
  const [trackCurrent, setTrackCurrent] = React.useState<TTrack | null>(null);
  const [queue, setQueue] = React.useState<Array<TTrack>>([]);
  const { dataService } = useDataService();
  const operations = {
    setTrackCurrent(x: TTrack | null) {
      setTrackCurrent(x);
    },
    setQueue(xs: Array<TTrack>) {
      setQueue(xs);
    },
    updateQueue(xs: Array<TTrack>) {
      // Add elements after any existing elements.
      setQueue((_xs) => _xs.concat(xs));
    },
    enqueue(x: TTrack) {
      setQueue((xs) => xs.concat(x));
    },
    removeTrackFromQueue(id: TTrack["id"]) {
      setQueue((xs) => xs.filter((x) => x.id !== id));
    },
    clearQueue() {
      setQueue([]);
    },
    async nextTrack() {
      if (queue.length === 0) {
        return;
      }
      setTrackCurrent(queue[0]);
      setQueue((xs) => xs.slice(1));
    },
    async prevTrack() {
      if (trackCurrent == null) {
        return;
      }
      const trackListForAlbum = await dataService.getTrackListForAlbum(
        trackCurrent.albumId
      );
      const trackCurrentIndex = trackListForAlbum.findIndex(
        (x) => x.id === trackCurrent.id
      );
      const trackIndex = trackCurrentIndex > 0 ? trackCurrentIndex - 1 : 0;
      const queue = trackListForAlbum.slice(trackIndex + 1);
      const track = trackListForAlbum[trackIndex];
      setQueue(queue);
      setTrackCurrent(track);
    },
  };
  return (
    <TrackQueueContext.Provider
      value={{ state: { trackCurrent, queue }, operations }}
    >
      {props.children}
    </TrackQueueContext.Provider>
  );
}

export const TrackQueueContext = React.createContext<{
  state: { trackCurrent: TTrack | null; queue: Array<TTrack> };
  operations: {
    setTrackCurrent: (x: TTrack | null) => void;
    setQueue: (xs: Array<TTrack>) => void;
    updateQueue: (xs: Array<TTrack>) => void;
    enqueue: (x: TTrack) => void;
    removeTrackFromQueue: (id: TTrack["id"]) => void;
    clearQueue: () => void;
    nextTrack: () => Promise<void>;
    prevTrack: () => Promise<void>;
  };
}>(
  // @ts-ignore
  null
);

export function useTrackQueue() {
  return React.useContext(TrackQueueContext);
}
