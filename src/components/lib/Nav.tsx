import * as React from "react";
import cx from "classcat";
import { NavLink } from "react-router-dom";
import variantPills from "./NavPills.module.css";
import variantTabsStyles from "./NavTabs.module.css";
import variantVerticalStyles from "./NavVertical.module.css";

type TVariant = "primary" | "secondary" | "vertical";

const NavContext = React.createContext<{
  variant: TVariant;
}>(
  // @ts-ignore
  undefined
);

export function Nav(props: { children: React.ReactNode; variant?: TVariant }) {
  const { variant = "primary" } = props;
  const styles = variantToStyles[variant];
  return (
    <NavContext.Provider value={{ variant }}>
      <nav className={styles.navList}>{props.children}</nav>
    </NavContext.Provider>
  );
}

export function NavItem(
  props: React.ComponentProps<typeof NavLink> & { disabled?: boolean }
) {
  const { children, exact = true, disabled = false, ...rest } = props;
  const { variant } = React.useContext(NavContext);
  const styles = variantToStyles[variant];
  return (
    <NavLink
      className={cx([styles.link, disabled && styles.linkDisabled])}
      activeClassName={styles.linkActive}
      exact={exact}
      {...rest}
    >
      <div className={styles.navTabLayout}>{children}</div>
    </NavLink>
  );
}

const variantToStyles: { [k: string]: any } = {
  primary: variantPills,
  secondary: variantTabsStyles,
  vertical: variantVerticalStyles,
};
