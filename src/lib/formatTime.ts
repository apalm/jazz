export function formatTime(secs: number) {
  secs = Math.round(secs);
  const minutes = Math.floor(secs / 60) % 60;
  const seconds = secs % 60;
  return minutes + ":" + String(seconds).padStart(2, "0");
}
