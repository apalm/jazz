import * as React from "react";
import useAudioBase from "react-use/esm/useAudio";

export function AudioProvider(props: {
  children: React.ReactNode;
  src: string;
  volume?: ReturnType<typeof useAudioBase>[1]["volume"];
}) {
  const [audio, state, controls, ref] = useAudioBase({
    src: props.src,
    autoPlay: true,
  });

  React.useEffect(
    () => {
      if (props.volume != null) {
        controls.volume(props.volume);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.volume]
  );

  return (
    <AudioContext.Provider value={{ state, controls, ref }}>
      {audio}
      {props.children}
    </AudioContext.Provider>
  );
}

export const AudioContext = React.createContext<{
  state: ReturnType<typeof useAudioBase>[1];
  controls: ReturnType<typeof useAudioBase>[2];
  ref: ReturnType<typeof useAudioBase>[3];
}>(
  // @ts-ignore
  null
);

export function useAudio() {
  return React.useContext(AudioContext);
}
