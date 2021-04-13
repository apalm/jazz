import cx from "classcat";
import { Button } from "../components/lib/Button";
import { IconPlayArrow } from "../icons/IconPlayArrow";
import { IconPause } from "../icons/IconPause";
import { useAudio } from "../shared/useAudio";
import styles from "./ItemPlayButton.module.css";

export function ItemPlayButton(props: {
  onClick: React.ComponentProps<"button">["onClick"];
  isItemCurrent: boolean;
}) {
  const { isItemCurrent, onClick } = props;
  const a = useAudio();
  return (
    <div
      className={cx([
        styles.playButtonContainer,
        !a.state.paused &&
          isItemCurrent &&
          styles.playButtonContainerAlbumCurrent,
      ])}
    >
      <Button type="button" size="sm" onClick={onClick}>
        {!a.state.paused && isItemCurrent ? <IconPause /> : <IconPlayArrow />}
      </Button>
    </div>
  );
}
