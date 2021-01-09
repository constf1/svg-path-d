/**
 * Returns the last item of an array.
 * @param arr an array
 */
export function lastItem<T>(arr: ReadonlyArray<T>): T | undefined {
  return arr[arr.length - 1];
}
