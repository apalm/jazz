import * as React from "react";
import { useInfiniteQuery } from "react-query";
import { useIntersection } from "react-use";
import { Link } from "react-router-dom";
import { useDataService } from "../../shared/useDataService";
import { FullScreenLoading } from "../../components/FullScreenLoading";
import { ErrorMessage } from "../../components/ErrorMessage";
import { useAudio } from "../../shared/useAudio";
import { useTrackQueue } from "../../shared/useTrackQueue";
import { ItemPlayButton } from "../../components/ItemPlayButton";
import { showToast } from "../../components/lib/Toast";
import { getDataUri } from "../../lib/getDataUri";
import { Well, WellHeading } from "../../components/lib/Well";
import { InfinitePaginationLoadingMore } from "../../components/InfinitePaginationLoadingMore";
import styles from "./Albums.module.css";

const rootId = "albums";

export default function Page() {
  return (
    <div id={rootId} className={styles.root}>
      <h1 className={styles.heading}>Albums</h1>
      <Content />
    </div>
  );
}

function Content() {
  const { dataService } = useDataService();
  const a = useAudio();
  const tq = useTrackQueue();
  const intersectionRef = React.useRef(null);
  const result = useInfiniteQuery(
    ["albumList"],
    (x) => dataService.getAlbumList({ offset: x.pageParam }),
    { getNextPageParam: (lastPage) => lastPage.pagination.offsetEnd }
  );
  const intersection = useIntersection(intersectionRef, {
    root: document.getElementById(rootId),
    rootMargin: "0px",
    threshold: 0.5,
  });
  React.useEffect(() => {
    if (
      intersection?.isIntersecting &&
      result.hasNextPage &&
      !result.isFetchingNextPage
    ) {
      result.fetchNextPage();
    }
  }, [intersection?.isIntersecting, result]);
  if (result.status === "loading") {
    return <FullScreenLoading />;
  }
  if (result.status === "error" || result.data === undefined) {
    return <ErrorMessage error={result.error} />;
  }
  const list = result.data.pages.flatMap((x) => x.results);
  if (list.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <Well>
          <WellHeading>No albums yet</WellHeading>
        </Well>
      </div>
    );
  }
  return (
    <div>
      <ul ref={intersectionRef} className={styles.layout}>
        {list.map((x, i) => {
          const albumImage = x.pictureList?.[0];
          const albumImageSrc =
            albumImage == null
              ? getDataUri(
                  "image/png",
                  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mOsrgcAAXsA/KZ1G74AAAAASUVORK5CYII="
                )
              : getDataUri(
                  albumImage.format,
                  Buffer.from(albumImage.data).toString("base64")
                );
          const isAlbumCurrent = tq.state.trackCurrent?.albumId === x.id;
          function handleClick(
            event: React.MouseEvent<HTMLButtonElement, MouseEvent>
          ) {
            event.preventDefault();
            if (isAlbumCurrent) {
              if (a.state.paused) {
                a.controls.play();
              } else {
                a.controls.pause();
              }
            } else {
              dataService
                .getTrackListForAlbum(x.id)
                .then((xs) => {
                  tq.operations.setQueue(xs.slice(1));
                  tq.operations.setTrackCurrent(xs[0]);
                })
                .catch((error) => {
                  showToast(error.message, { type: "error" });
                });
            }
          }
          return (
            <li key={i} className={styles.item}>
              <Link to={`/albums/${x.id}`}>
                <img
                  src={albumImageSrc}
                  alt={x.name}
                  width="200"
                  height="200"
                />
                <ItemPlayButton
                  isItemCurrent={isAlbumCurrent}
                  onClick={handleClick}
                />
                <div>
                  <div className={styles.itemText}>{x.name}</div>
                  <Link
                    to={`/artists/${x.artistId}`}
                    className={styles.artistLink}
                  >
                    <div className={styles.itemSubText}>{x.artist.name}</div>
                  </Link>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {result.isFetchingNextPage ? <InfinitePaginationLoadingMore /> : null}
    </div>
  );
}
