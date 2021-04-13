import * as React from "react";
import cx from "classcat";
import { ButtonOrLinkContent } from "./_ButtonOrLinkContent";
import { ButtonActivityIndicator } from "./_ButtonActivityIndicator";
import buttonStyles from "./Button.module.css";
import buttonPrimaryStyles from "./ButtonPrimary.module.css";
import buttonDangerStyles from "./ButtonDanger.module.css";
import buttonSecondaryStyles from "./ButtonSecondary.module.css";
import buttonSecondaryDangerStyles from "./ButtonSecondaryDanger.module.css";
import buttonTransparentPrimaryStyles from "./ButtonTransparentPrimary.module.css";
import buttonTransparentNeutralStyles from "./ButtonTransparentNeutral.module.css";
import buttonNeutralStyles from "./ButtonNeutral.module.css";
import linkStyles from "./Link.module.css";

export const Button = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentProps<"button">, "disabled"> & {
    state?: "idle" | "disabled" | "pending";
    variant?:
      | "primary"
      | "danger"
      | "neutral"
      | "secondary"
      | "secondaryDanger"
      | "transparentPrimary"
      | "transparentNeutral"
      | "link";
    size?: "sm" | "xs" | "xxs";
  } & Pick<React.ComponentProps<typeof ButtonOrLinkContent>, "icon">
>((props, ref) => {
  const {
    state = "idle",
    variant = "primary",
    size,
    icon,
    children,
    ...restProps
  } = props;
  return (
    <button
      ref={ref}
      // https://stackoverflow.com/questions/3885018/active-pseudo-class-doesnt-work-in-mobile-safari
      onTouchStart={() => {}}
      className={cx([
        ["link"].includes(variant) && linkStyles.link,
        // No xs, xxs for `link`
        ["link"].includes(variant) && size != null && linkStyles.linkSm,
        !["link"].includes(variant) && buttonStyles.button,
        !["link"].includes(variant) && size === "sm" && buttonStyles.buttonSm,
        !["link"].includes(variant) && size === "xs" && buttonStyles.buttonXs,
        !["link"].includes(variant) && size === "xxs" && buttonStyles.buttonXxs,
        variant === "primary" && buttonPrimaryStyles.buttonPrimary,
        variant === "danger" && buttonDangerStyles.buttonDanger,
        variant === "neutral" && buttonNeutralStyles.buttonNeutral,
        variant === "secondary" && buttonSecondaryStyles.buttonSecondary,
        variant === "secondaryDanger" &&
          buttonSecondaryDangerStyles.buttonSecondaryDanger,
        variant === "transparentPrimary" &&
          buttonTransparentPrimaryStyles.buttonTransparentPrimary,
        variant === "transparentNeutral" &&
          buttonTransparentNeutralStyles.buttonTransparentNeutral,
      ])}
      disabled={["pending", "disabled"].includes(state)}
      {...restProps}
    >
      <ButtonOrLinkContent
        type={variant === "link" ? "link" : "button"}
        icon={state === "pending" ? undefined : icon}
      >
        {state === "pending" ? <ButtonActivityIndicator /> : children}
      </ButtonOrLinkContent>
    </button>
  );
});
