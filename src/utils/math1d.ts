
/**
 * Linear interpolation.
 * @param a start point
 * @param b stop point
 * @param t blend factor in the interval [0, 1]
 */
export function lerp(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t;
}
