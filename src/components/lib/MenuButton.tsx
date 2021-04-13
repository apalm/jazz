import "@reach/menu-button/styles.css";
import styles from "./MenuButton.module.css";
import * as React from "react";
import {
  MenuButton as MenuButtonBase,
  MenuItem as MenuItemBase,
  MenuLink as MenuLinkBase,
} from "@reach/menu-button";
import cx from "classcat";
import buttonStyles from "./Button.module.css";
import buttonPrimaryStyles from "./ButtonPrimary.module.css";
import buttonDangerStyles from "./ButtonDanger.module.css";
import buttonSecondaryStyles from "./ButtonSecondary.module.css";
import buttonSecondaryDangerStyles from "./ButtonSecondaryDanger.module.css";
import buttonTransparentPrimaryStyles from "./ButtonTransparentPrimary.module.css";
import buttonTransparentNeutralStyles from "./ButtonTransparentNeutral.module.css";
import buttonNeutralStyles from "./ButtonNeutral.module.css";

export {
  Menu,
  MenuButton as MenuButtonBase,
  MenuList,
  MenuItems,
  MenuPopover,
} from "@reach/menu-button";

export const MenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof MenuButtonBase> & {
    variant?:
      | "primary"
      | "danger"
      | "neutral"
      | "secondary"
      | "secondaryDanger"
      | "transparentPrimary"
      | "transparentNeutral";
    size?: "sm" | "xs" | "xxs";
    noArrow?: boolean;
  }
>((props, ref) => {
  const {
    variant = "neutral",
    size = "sm",
    noArrow = false,
    children,
    ...rest
  } = props;
  return (
    <MenuButtonBase
      ref={ref}
      // https://stackoverflow.com/questions/3885018/active-pseudo-class-doesnt-work-in-mobile-safari
      onTouchStart={() => {}}
      className={cx([
        buttonStyles.button,
        size === "sm" && buttonStyles.buttonSm,
        size === "xs" && buttonStyles.buttonXs,
        size === "xxs" && buttonStyles.buttonXxs,
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
      {...rest}
    >
      {children}
      {noArrow ? null : (
        <span aria-hidden className={styles.menuButtonArrow}>
          ▾
        </span>
      )}
    </MenuButtonBase>
  );
});

export const MenuItem = React.forwardRef<
  any,
  React.ComponentProps<typeof MenuItemBase> & { variant?: "danger" }
>((props, ref) => {
  const { onSelect, children, variant, ...rest } = props;
  return (
    <MenuItemBase
      ref={ref}
      onSelect={onSelect}
      className={cx([variant === "danger" && styles.menuItemDanger])}
      {...rest}
    >
      {children}
    </MenuItemBase>
  );
});

export const MenuLink = React.forwardRef<
  any,
  React.ComponentProps<typeof MenuLinkBase> & { variant?: "danger" }
>((props, ref) => {
  const { onSelect, children, variant, ...rest } = props;
  return (
    <MenuLinkBase
      ref={ref}
      onSelect={onSelect}
      className={cx([variant === "danger" && styles.menuItemDanger])}
      {...rest}
    >
      {children}
    </MenuLinkBase>
  );
});
