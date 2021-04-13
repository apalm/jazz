import { useEffect } from "react";

export function DocumentTitle(props: { children: string }) {
  useEffect(() => {
    document.title = props.children;
  }, [props.children]);

  return null;
}
