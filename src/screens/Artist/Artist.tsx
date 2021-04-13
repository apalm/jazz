import { useQuery } from "react-query";
import { useParams, Link } from "react-router-dom";
import { FullScreenLoading } from "../../components/FullScreenLoading";
import { ErrorMessage } from "../../components/ErrorMessage";
import { useDataService } from "../../shared/useDataService";
import { useAudio } from "../../shared/useAudio";
import { useTrackQueue } from "../../shared/useTrackQueue";
import { ItemPlayButton } from "../../components/ItemPlayButton";
import { showToast } from "../../components/lib/Toast";
import { getDataUri } from "../../lib/getDataUri";
import styles from "./Artist.module.css";

export default function Page() {
  const params = useParams<{ id: string }>();
  const { dataService } = useDataService();
  const result = useQuery(["artist", params.id], () =>
    dataService.getArtist(params.id)
  );
  if (result.status === "loading") {
    return <FullScreenLoading />;
  }
  if (result.status === "error" || result.data === undefined) {
    return <ErrorMessage error={result.error} />;
  }
  const data = result.data;
  const imgSrc = getDataUri(
    "image/png",
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mOsrgcAAXsA/KZ1G74AAAAASUVORK5CYII="
  );
  return (
    <div>
      <div
        style={{ backgroundImage: `url(${imgSrc})` }}
        className={styles.cover}
      >
        <div className={styles.coverText}>{data.name}</div>
      </div>
      <div className={styles.content}>
        <h2 className={styles.heading}>Discography</h2>
        <AlbumList id={data.id} />
      </div>
    </div>
  );
}

function AlbumList(props: { id: string }) {
  const a = useAudio();
  const tq = useTrackQueue();
  const { dataService } = useDataService();
  const result = useQuery(["albumListForArtist", props.id], () =>
    dataService.getAlbumListForArtist(props.id)
  );
  if (result.status === "loading") {
    return <FullScreenLoading />;
  }
  if (result.status === "error" || result.data === undefined) {
    return <ErrorMessage error={result.error} />;
  }
  const list = result.data;
  if (list.length === 0) {
    return <div>No albums yet</div>;
  }
  return (
    <ul className={styles.layout}>
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
              <img src={albumImageSrc} alt={x.name} width="150" height="150" />
              <ItemPlayButton
                isItemCurrent={isAlbumCurrent}
                onClick={handleClick}
              />
              <div className={styles.itemText}>{x.name}</div>
              <div className={styles.itemSubText}>{x.year}</div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
