export const valueLight = "light";
export const valueDark = "dark";

export function isLight() {
  return !document.documentElement.classList.contains(valueDark);
}

export function isDark() {
  return document.documentElement.classList.contains(valueDark);
}

export function setLight() {
  document.documentElement.classList.add(valueLight);
  document.documentElement.classList.remove(valueDark);
}

export function setDark() {
  document.documentElement.classList.add(valueDark);
  document.documentElement.classList.remove(valueLight);
}
