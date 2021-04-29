import * as React from "react";
import { useInfiniteQuery } from "react-query";
import { useIntersection } from "react-use";
import { Link } from "react-router-dom";
import { useDataService } from "../../shared/useDataService";
import { FullScreenLoading } from "../../components/FullScreenLoading";
import { ErrorMessage } from "../../components/ErrorMessage";
import { ItemPlayButton } from "../../components/ItemPlayButton";
import { useTrackQueue } from "../../shared/useTrackQueue";
import { useAudio } from "../../shared/useAudio";
import { showToast } from "../../components/lib/Toast";
import { Well, WellHeading } from "../../components/lib/Well";
import IconArtist from "../../assets/mic_external_on_black_24dp.svg";
import { InfinitePaginationLoadingMore } from "../../components/InfinitePaginationLoadingMore";
import { Avatar } from "../../components/lib/Avatar";
import styles from "./Artists.module.css";

const rootId = "artists";

export default function Page() {
  return (
    <div id={rootId} className={styles.root}>
      <h1 className={styles.heading}>Artists</h1>
      <Content />
    </div>
  );
}

function Content() {
  const tq = useTrackQueue();
  const a = useAudio();
  const intersectionRef = React.useRef(null);
  const { dataService } = useDataService();
  const result = useInfiniteQuery(
    ["artistList"],
    (x) => dataService.getArtistList({ offset: x.pageParam }),
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
          <WellHeading>No artists yet</WellHeading>
        </Well>
      </div>
    );
  }
  return (
    <div>
      <ul ref={intersectionRef} className={styles.layout}>
        {list.map((x, i) => {
          const imgSrc = IconArtist;
          const isArtistCurrent = tq.state.trackCurrent?.artistId === x.id;
          function handleClick(
            event: React.MouseEvent<HTMLButtonElement, MouseEvent>
          ) {
            event.preventDefault();
            if (isArtistCurrent) {
              if (a.state.paused) {
                a.controls.play();
              } else {
                a.controls.pause();
              }
            } else {
              dataService
                .getTrackListForArtist(x.id)
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
              <Link to={`/artists/${x.id}`}>
                <div className={styles.itemImageContainer}>
                  <Avatar
                    src={imgSrc}
                    fallback={x.name || "Artist"}
                    alt={x.name}
                  />
                </div>
                <ItemPlayButton
                  isItemCurrent={isArtistCurrent}
                  onClick={handleClick}
                />
                <div className={styles.itemText}>{x.name}</div>
              </Link>
            </li>
          );
        })}
      </ul>
      {result.isFetchingNextPage ? <InfinitePaginationLoadingMore /> : null}
    </div>
  );
}
