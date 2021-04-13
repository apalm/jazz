import * as React from "react";

export function Delay(props: { children: any; delay?: number }) {
  const { delay = 800 } = props;
  const [isVisible, setIsVisible] = React.useState(false);
  React.useEffect(() => {
    const timerID = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => {
      clearTimeout(timerID);
    };
  }, [delay]);
  if (!isVisible) {
    return null;
  }
  return props.children;
}
