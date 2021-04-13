// https://github.com/Microsoft/TypeScript/issues/16069
export function isNotNullOrUndefined<T extends Object>(
  input: null | undefined | T
): input is T {
  return input != null;
}
