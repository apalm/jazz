import "react-toastify/dist/ReactToastify.css";
import cx from "classcat";
import { toast } from "react-toastify";
import type { ToastContent, ToastOptions } from "react-toastify";
import styles from "./Toast.module.css";

// https://fkhadra.github.io/react-toastify/prevent-duplicate
const customId = "custom-id";

export function showToast(
  content: ToastContent,
  options: ToastOptions & { type: "success" | "error" }
) {
  const {
    position = "top-center",
    hideProgressBar = true,
    pauseOnFocusLoss = false,
    ...restOptions
  } = options ?? {};
  return toast(content, {
    position,
    hideProgressBar,
    pauseOnFocusLoss,
    toastId: customId,
    className: cx([
      styles.toast,
      restOptions.type === "success" && styles.toastSuccess,
      restOptions.type === "error" && styles.toastError,
    ]),
    bodyClassName: styles.toastBody,
    ...restOptions,
  });
}
