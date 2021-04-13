import cx from "classcat";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { useTrackQueue } from "../../shared/useTrackQueue";
import { useDataService } from "../../shared/useDataService";
import { FullScreenLoading } from "../../components/FullScreenLoading";
import { ErrorMessage } from "../../components/ErrorMessage";
import { useAudio } from "../../shared/useAudio";
import { formatTime } from "../../lib/formatTime";
import { Link } from "../../components/lib/Link";
import { Button } from "../../components/lib/Button";
import { isNotNullOrUndefined } from "../../lib/isNotNullOrUndefined";
import { IconPause } from "../../icons/IconPause";
import { IconPlayArrow } from "../../icons/IconPlayArrow";
import { showToast } from "../../components/lib/Toast";
import {
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
} from "../../components/lib/MenuButton";
import { IconMoreHoriz } from "../../icons/IconMoreHoriz";
import IconArtist from "../../assets/mic_external_on_black_24dp.svg";
import { Avatar } from "../../components/lib/Avatar";
import { getDataUri } from "../../lib/getDataUri";
import styles from "./Album.module.css";

export default function Page() {
  const params = useParams<{ id: string }>();
  const a = useAudio();
  const tq = useTrackQueue();
  const { dataService } = useDataService();
  const result = useQuery(["album", params.id], () =>
    dataService.getAlbum(params.id)
  );
  if (result.status === "loading") {
    return <FullScreenLoading />;
  }
  if (result.status === "error" || result.data === undefined) {
    return <ErrorMessage error={result.error} />;
  }
  const data = result.data;
  const albumImage = data.pictureList?.[0];
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
  const artistImgSrc = IconArtist;
  const isAlbumCurrent = tq.state.trackCurrent?.albumId === data.id;
  function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault();
    if (isAlbumCurrent) {
      if (a.state.paused) {
        a.controls.play();
      } else {
        a.controls.pause();
      }
    } else {
      dataService
        .getTrackListForAlbum(data.id)
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
    <div>
      <div
        className={styles.top}
        style={data.color == null ? undefined : { backgroundColor: data.color }}
      >
        <img
          src={albumImageSrc}
          alt={data.name}
          width="200"
          height="200"
          className={styles.imageAlbum}
        />
        <div className={styles.topLayoutSub}>
          <h1 className={styles.heading}>{data.name ?? "--"}</h1>
          <div className={styles.infoLayout}>
            <Avatar
              src={artistImgSrc}
              fallback={data.artist.name || "Artist"}
              alt={data.artist.name}
              size="sm"
            />
            <div className={styles.infoEmphasis}>
              <Link to={`/artists/${data.artistId}`}>
                {data.artist.name ?? "--"}
              </Link>
            </div>
            <div>{data.year ?? "--"}</div>
            <div>
              {data.trackCount == null ? "--" : data.trackCount + " songs"}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.actionsContainer}>
        <Button type="button" onClick={handleClick}>
          {!a.state.paused && isAlbumCurrent ? (
            <IconPause />
          ) : (
            <IconPlayArrow />
          )}
        </Button>
      </div>
      <TrackList id={data.id} />
      <div className={styles.copyright}>
        {data.label == null
          ? "--"
          : data.label.filter(isNotNullOrUndefined).join(", ") || "--"}
      </div>
    </div>
  );
}

function TrackList(props: { id: string }) {
  const { dataService } = useDataService();
  const tq = useTrackQueue();
  const a = useAudio();
  const result = useQuery(["trackListListForAlbum", props.id], () =>
    dataService.getTrackListForAlbum(props.id)
  );
  if (result.status === "loading") {
    return <FullScreenLoading />;
  }
  if (result.status === "error" || result.data === undefined) {
    return <ErrorMessage error={result.error} />;
  }
  const list = result.data;
  if (list.length === 0) {
    return <div>No songs found</div>;
  }
  return (
    <ul>
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
                tq.operations.updateQueue(list.slice(i + 1));
                tq.operations.setTrackCurrent(x);
              }
            }}
          >
            <div
              className={cx([
                styles.listItemTrackNumber,
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
                    tq.operations.updateQueue(list.slice(i + 1));
                    tq.operations.setTrackCurrent(x);
                  }
                }}
                variant="transparentNeutral"
                size="xxs"
              >
                <div>{x.number}</div>
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
            <div className={styles.listItemText}>{x.artist.name}</div>
            <div className={cx([styles.listItemText, styles.listItemDuration])}>
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
  );
}
