import * as React from "react";
import cx from "classcat";
import throttle from "lodash.throttle";
import useKey from "react-use/esm/useKey";
import { useAudio } from "../shared/useAudio";
import { useTrackQueue } from "../shared/useTrackQueue";
import { formatTime } from "../lib/formatTime";
import { Slider } from "./lib/Slider";
import { Button } from "./lib/Button";
import { Link } from "./lib/Link";
import { Pressable } from "./lib/Pressable";
import { useHistory, useLocation } from "react-router-dom";
import { IconSkipPrev } from "../icons/IconSkipPrev";
import { IconSkipNext } from "../icons/IconSkipNext";
import { IconPause } from "../icons/IconPause";
import { IconPlayArrow } from "../icons/IconPlayArrow";
import { IconVolumeUp } from "../icons/IconVolumeUp";
import { IconVolumeDown } from "../icons/IconVolumeDown";
import { IconVolumeOff } from "../icons/IconVolumeOff";
import { IconQueue } from "../icons/IconQueue";
import { formatDocumentTitle } from "../shared/formatDocumentTitle";
import { useDataService } from "../shared/useDataService";
import { getDataUri } from "../lib/getDataUri";
import { showToast } from "./lib/Toast";
import styles from "./AudioPlayer.module.css";

export function AudioPlayer() {
  const tq = useTrackQueue();
  const trackCurrent = tq.state.trackCurrent;
  const { state, controls, ref } = useAudio();
  const { dataService } = useDataService();
  const history = useHistory();
  const location = useLocation();

  React.useEffect(() => {
    const fallbackText = "";
    if (state.paused) {
      document.title = formatDocumentTitle(fallbackText);
    } else {
      if (
        trackCurrent != null &&
        trackCurrent.title != null &&
        trackCurrent.artist.name != null
      ) {
        document.title = formatDocumentTitle(
          trackCurrent.title + " \u2014 " + trackCurrent.artist.name
        );
      } else {
        document.title = formatDocumentTitle(fallbackText);
      }
    }
  }, [trackCurrent, state.paused]);

  React.useEffect(() => {
    const refCurrent = ref.current;
    if (refCurrent == null) {
      return;
    }
    const handleEnded = () => {
      tq.operations.nextTrack();
    };
    refCurrent.addEventListener("ended", handleEnded);
    return () => {
      refCurrent.removeEventListener("ended", handleEnded);
    };
  }, [ref, tq]);

  React.useEffect(() => {
    const refCurrent = ref.current;
    if (refCurrent == null) {
      return;
    }
    const handleError = (error: ErrorEvent) => {
      showToast(error.message, { type: "error" });
    };
    refCurrent.addEventListener("error", handleError);
    return () => {
      refCurrent.removeEventListener("error", handleError);
    };
  }, [ref]);

  useKey(
    (event) =>
      event.code === "Space" &&
      !(event.target instanceof HTMLInputElement) &&
      !(event.target instanceof HTMLTextAreaElement),
    (event) => {
      event.preventDefault();
      if (state.paused) {
        controls.play();
      } else {
        controls.pause();
      }
    }
  );

  function handlePlayOrPause() {
    if (state.paused) {
      controls.play();
    } else {
      controls.pause();
    }
  }

  function handleNext() {
    tq.operations.nextTrack();
  }

  function handlePrev() {
    tq.operations.prevTrack();
    controls.seek(0);
  }

  const handleTimeChange = throttle((value: number) => {
    controls.seek(value);
  }, 500);

  const albumImage =
    trackCurrent == null ? null : trackCurrent.album.pictureList?.[0];
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
    <div className={styles.layout}>
      <div>
        {trackCurrent == null ? null : (
          <div className={styles.start}>
            <img
              src={albumImageSrc}
              alt={trackCurrent.album.name}
              width="60"
              height="60"
            />
            <div>
              <div className={styles.startTextEmphasis}>
                <Link to={`/albums/${trackCurrent.albumId}`}>
                  {trackCurrent.title}
                </Link>
              </div>
              <span className={styles.startText}>
                <Link to={`/artists/${trackCurrent.artistId}`}>
                  {trackCurrent.artist.name}
                </Link>
                <span>{" \u2014 "}</span>
                <Link to={`/albums/${trackCurrent.albumId}`}>
                  {trackCurrent.album.name}
                </Link>
              </span>
            </div>
          </div>
        )}
      </div>
      <div className={styles.center}>
        <div className={styles.controlsLayout}>
          <Button
            type="button"
            onClick={handlePrev}
            state={trackCurrent == null ? "disabled" : undefined}
            variant="transparentPrimary"
            size="sm"
          >
            <IconSkipPrev />
          </Button>
          <Button
            type="button"
            onClick={handlePlayOrPause}
            state={trackCurrent == null ? "disabled" : undefined}
            size="sm"
          >
            {state.paused ? <IconPlayArrow /> : <IconPause />}
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            state={trackCurrent == null ? "disabled" : undefined}
            variant="transparentPrimary"
            size="sm"
          >
            <IconSkipNext />
          </Button>
        </div>
        <div className={styles.sliderLayout}>
          <span>{formatTime(state.time)}</span>
          <Slider
            min={0}
            max={state.duration}
            step={1}
            value={state.time}
            onChange={handleTimeChange}
            disabled={trackCurrent == null}
          />
          <span>{formatTime(state.duration)}</span>
        </div>
      </div>
      <div className={styles.end}>
        <div
          className={cx([
            styles.queueButtonContainer,
            location.pathname === "/queue" && styles.queueButtonContainerActive,
          ])}
        >
          <Pressable
            onClick={() => {
              if (location.pathname === "/queue") {
                // Meh, but works well enough in most cases
                history.goBack();
              } else {
                history.push("/queue");
              }
            }}
          >
            <IconQueue />
          </Pressable>
        </div>
        <div className={styles.volumeLayout}>
          {state.volume === 0 ? (
            <IconVolumeOff />
          ) : state.volume < 0.5 ? (
            <IconVolumeDown />
          ) : (
            <IconVolumeUp />
          )}
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={state.volume}
            onChange={(value) => {
              controls.volume(value);
              dataService.setStateVolume(value);
            }}
          />
        </div>
      </div>
    </div>
  );
}
