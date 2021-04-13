import * as React from "react";
import { useInfiniteQuery } from "react-query";
import { useIntersection } from "react-use";
import { Link } from "react-router-dom";
import cx from "classcat";
import { useTrackQueue } from "../../shared/useTrackQueue";
import { useDataService } from "../../shared/useDataService";
import { FullScreenLoading } from "../../components/FullScreenLoading";
import { ErrorMessage } from "../../components/ErrorMessage";
import { useAudio } from "../../shared/useAudio";
import { formatTime } from "../../lib/formatTime";
import { Button } from "../../components/lib/Button";
import { IconPause } from "../../icons/IconPause";
import { IconPlayArrow } from "../../icons/IconPlayArrow";
import {
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
} from "../../components/lib/MenuButton";
import { IconMoreHoriz } from "../../icons/IconMoreHoriz";
import { Well, WellHeading } from "../../components/lib/Well";
import { InfinitePaginationLoadingMore } from "../../components/InfinitePaginationLoadingMore";
import styles from "./Songs.module.css";

const rootId = "songs";

export default function Page() {
  return (
    <div id={rootId} className={styles.root}>
      <div className={styles.contentContainer}>
        <h1 className={styles.heading}>Songs</h1>
      </div>
      <Content />
    </div>
  );
}

function Content() {
  const a = useAudio();
  const tq = useTrackQueue();
  const intersectionRef = React.useRef(null);
  const { dataService } = useDataService();
  const result = useInfiniteQuery(
    ["trackList"],
    (x) => dataService.getTrackList({ offset: x.pageParam }),
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
        <div className={styles.contentContainer}>
          <Well>
            <WellHeading>No songs yet</WellHeading>
          </Well>
        </div>
      </div>
    );
  }
  return (
    <div>
      <ul ref={intersectionRef}>
        {list.map((x, i) => {
          const isTrackCurrent = tq.state.trackCurrent?.id === x.id;
          return (
            <li
              key={i}
              className={styles.listItem}
              onDoubleClick={() => {
                if (isTrackCurrent) {
                  a.controls.seek(0);
                  a.controls.play();
                } else {
                  tq.operations.setQueue(list.slice(i + 1));
                  tq.operations.setTrackCurrent(x);
                }
              }}
            >
              <div
                className={cx([
                  styles.listItemStart,
                  isTrackCurrent && styles.listItemCurrentText,
                ])}
              >
                <Button
                  onClick={() => {
                    if (isTrackCurrent) {
                      if (a.state.paused) {
                        a.controls.play();
                      } else {
                        a.controls.pause();
                      }
                    } else {
                      tq.operations.setQueue(list.slice(i + 1));
                      tq.operations.setTrackCurrent(x);
                    }
                  }}
                  variant="transparentNeutral"
                  size="xxs"
                >
                  {isTrackCurrent ? (
                    a.state.paused ? (
                      <IconPlayArrow />
                    ) : (
                      <IconPause />
                    )
                  ) : (
                    <IconPlayArrow />
                  )}
                </Button>
              </div>
              <div
                className={cx([
                  styles.listItemTextEmphasis,
                  isTrackCurrent && styles.listItemCurrentText,
                ])}
              >
                {x.title}
              </div>
              <div className={styles.listItemText}>
                <Link
                  to={`/artists/${x.artistId}`}
                  className={styles.listItemLink}
                >
                  {x.artist.name}
                </Link>
              </div>
              <div className={styles.listItemText}>
                <Link
                  to={`/albums/${x.albumId}`}
                  className={styles.listItemLink}
                >
                  {x.album.name}
                </Link>
              </div>
              <div
                className={cx([styles.listItemText, styles.listItemDuration])}
              >
                {x.duration == null ? "--" : formatTime(x.duration)}
              </div>
              <div className={styles.listItemMenuButtonContainer}>
                <Menu>
                  <MenuButton
                    variant="transparentNeutral"
                    size="xxs"
                    noArrow={true}
                  >
                    <IconMoreHoriz />
                  </MenuButton>
                  <MenuList>
                    {[
                      {
                        onSelect: () => {
                          tq.operations.enqueue(x);
                        },
                        text: "Add to queue",
                      },
                    ].map((x, i) => (
                      <MenuItem key={i} onSelect={x.onSelect}>
                        {x.text}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </div>
            </li>
          );
        })}
      </ul>
      {result.isFetchingNextPage ? <InfinitePaginationLoadingMore /> : null}
    </div>
  );
}
