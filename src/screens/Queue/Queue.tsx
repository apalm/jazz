import cx from "classcat";
import { useTrackQueue } from "../../shared/useTrackQueue";
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
import { Unarray } from "../../lib/Unarray";
import { Well, WellHeading } from "../../components/lib/Well";
import { Link } from "react-router-dom";
import { getDataUri } from "../../lib/getDataUri";
import styles from "./Queue.module.css";

export default function Page() {
  const tq = useTrackQueue();
  return (
    <div className={styles.root}>
      <div className={styles.contentContainer}>
        <h1 className={styles.heading}>Queue</h1>
      </div>
      {tq.state.trackCurrent == null && tq.state.queue.length === 0 ? (
        <div className={styles.emptyContainer}>
          <div className={styles.contentContainer}>
            <Well>
              <WellHeading>Nothing to see here</WellHeading>
            </Well>
          </div>
        </div>
      ) : (
        <div className={styles.content}>
          <NowPlaying />
          <Queue />
        </div>
      )}
    </div>
  );
}

function NowPlaying() {
  const tq = useTrackQueue();
  const trackCurrent = tq.state.trackCurrent;
  if (trackCurrent == null) {
    return null;
  }
  return (
    <div>
      <div className={styles.contentContainer}>
        <h2 className={styles.subHeading}>Now Playing</h2>
      </div>
      <ListItem
        item={trackCurrent}
        index={0}
        num={1}
        // If the same track appears multiple times in the queue,
        // only the now playing track should be highlighted.
        isTrackCurrent={true}
        disableMenu={true}
      />
    </div>
  );
}

function Queue() {
  const tq = useTrackQueue();
  const queue = tq.state.queue;
  if (queue.length === 0) {
    return null;
  }
  return (
    <div>
      <div className={styles.contentContainer}>
        <h2 className={styles.subHeading}>Up Next</h2>
      </div>
      <ul>
        {queue.map((x, i) => {
          return <ListItem key={i} item={x} index={i} num={i + 2} />;
        })}
      </ul>
    </div>
  );
}

function ListItem(props: {
  item: Unarray<ReturnType<typeof useTrackQueue>["state"]["queue"]>;
  index: number;
  num: number;
  isTrackCurrent?: boolean;
  disableMenu?: boolean;
}) {
  const { item: x, index: i, num, isTrackCurrent, disableMenu } = props;
  const a = useAudio();
  const tq = useTrackQueue();
  const queue = tq.state.queue;
  function handleClickOrDoubleClick() {
    if (isTrackCurrent) {
      if (a.state.paused) {
        a.controls.play();
      } else {
        a.controls.pause();
      }
    } else {
      tq.operations.setQueue(queue.slice(i + 1));
      tq.operations.setTrackCurrent(x);
      a.controls.seek(0);
    }
  }
  const albumImage = x.album.pictureList?.[0];
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
  return (
    <li className={styles.listItem} onDoubleClick={handleClickOrDoubleClick}>
      <div
        className={cx([
          styles.listItemTrackNumber,
          isTrackCurrent && styles.listItemCurrentText,
        ])}
      >
        <Button
          onClick={handleClickOrDoubleClick}
          variant="transparentNeutral"
          size="xxs"
        >
          <div>{num}</div>
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
      <img
        src={albumImageSrc}
        alt={x.album.name}
        width="40"
        height="40"
        className={styles.listItemImage}
      />
      <div>
        <div
          className={cx([
            styles.listItemTextEmphasis,
            isTrackCurrent && styles.listItemCurrentText,
          ])}
        >
          {x.title}
        </div>
        <Link to={`/artists/${x.artistId}`} className={styles.listItemLink}>
          {x.artist.name}
        </Link>
      </div>
      <div className={styles.listItemText}>
        <Link to={`/albums/${x.albumId}`} className={styles.listItemLink}>
          {x.album.name}
        </Link>
      </div>
      <div className={cx([styles.listItemText, styles.listItemDuration])}>
        {x.duration == null ? "--" : formatTime(x.duration)}
      </div>
      <div className={styles.listItemMenuButtonContainer}>
        <Menu>
          <MenuButton
            disabled={disableMenu}
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
                  tq.operations.removeTrackFromQueue(x.id);
                },
                text: "Remove from queue",
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
}
