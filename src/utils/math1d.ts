/**
 * Linear interpolation.
 * @param a start point
 * @param b stop point
 * @param t blend factor in the interval [0, 1]
 */
export function lerp(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t;
}

export function clamp(a: number, b: number, c: number): number {
  return Math.min(Math.max(a, b), c);
}

/**
 * Quadratic Bezier Curve
 */
export function bezier2(p0: number, p1: number, p2: number, t: number): number {
  // p(t) = (1-t)^2 * p0 + 2 * (1-t) * t * p1 + t^2 * p2
  const s = 1 - t;
  return s * s * p0 + 2 * s * t * p1 + t * t * p2;
}

/**
 * Cubic Bezier Curve
 */
export function bezier3(p0: number, p1: number, p2: number, p3: number, t: number): number {
  // p(t) = (1-t)^3 * p0 + 3 * (1-t)^2 * t * p1 + 3 * (1-t) * t^2 * p2 + t^3 * p3
  const s = 1 - t;
  return s * s * s * p0 + 3 * s * s * t * p1 + 3 * s * t * t * p2 + t * t * t * p3;
}
