import * as React from "react";
import cx from "classcat";
import { Link as RRLink } from "react-router-dom";
import { ButtonOrLinkContent } from "./_ButtonOrLinkContent";
import buttonStyles from "./Button.module.css";
import buttonPrimaryStyles from "./ButtonPrimary.module.css";
import buttonDangerStyles from "./ButtonDanger.module.css";
import buttonSecondaryStyles from "./ButtonSecondary.module.css";
import buttonSecondaryDangerStyles from "./ButtonSecondaryDanger.module.css";
import buttonTransparentPrimaryStyles from "./ButtonTransparentPrimary.module.css";
import buttonTransparentNeutralStyles from "./ButtonTransparentNeutral.module.css";
import buttonNeutralStyles from "./ButtonNeutral.module.css";
import linkStyles from "./Link.module.css";

export const Link = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof RRLink> & {
    variant?:
      | "buttonPrimary"
      | "buttonDanger"
      | "buttonNeutral"
      | "buttonSecondary"
      | "buttonSecondaryDanger"
      | "buttonTransparentPrimary"
      | "buttonTransparentNeutral"
      | "link";
    size?: "sm" | "xs" | "xxs";
  } & Pick<React.ComponentProps<typeof ButtonOrLinkContent>, "icon">
>((props, ref) => {
  const { variant = "link", size, icon, children, ...restProps } = props;
  return (
    <RRLink
      ref={ref}
      // https://stackoverflow.com/questions/3885018/active-pseudo-class-doesnt-work-in-mobile-safari
      onTouchStart={() => {}}
      className={cx([
        ["link"].includes(variant) && linkStyles.link,
        // No xs, xxs for `link`
        ["link"].includes(variant) && size != null && linkStyles.linkSm,
        !["link"].includes(variant) && buttonStyles.button,
        !["link"].includes(variant) && buttonStyles.button,
        !["link"].includes(variant) && size === "sm" && buttonStyles.buttonSm,
        !["link"].includes(variant) && size === "xs" && buttonStyles.buttonXs,
        !["link"].includes(variant) && size === "xxs" && buttonStyles.buttonXxs,
        variant === "buttonPrimary" && buttonPrimaryStyles.buttonPrimary,
        variant === "buttonDanger" && buttonDangerStyles.buttonDanger,
        variant === "buttonNeutral" && buttonNeutralStyles.buttonNeutral,
        variant === "buttonSecondary" && buttonSecondaryStyles.buttonSecondary,
        variant === "buttonSecondaryDanger" &&
          buttonSecondaryDangerStyles.buttonSecondaryDanger,
        variant === "buttonTransparentPrimary" &&
          buttonTransparentPrimaryStyles.buttonTransparentPrimary,
        variant === "buttonTransparentNeutral" &&
          buttonTransparentNeutralStyles.buttonTransparentNeutral,
      ])}
      {...restProps}
    >
      <ButtonOrLinkContent
        type={variant === "link" ? "link" : "button"}
        icon={icon}
      >
        {children}
      </ButtonOrLinkContent>
    </RRLink>
  );
});
