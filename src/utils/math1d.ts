
/**
 * Linear interpolation.
 * @param a start point
 * @param b stop point
 * @param t blend factor in the interval [0, 1]
 */
export function lerp(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t;
}

export function lerpObjects(a: any, b: any, t: number): any {
  const c = { ...a };
  for (const key of Object.keys(b)) {
    const an = a[key];
    const bn = b[key];
    if (typeof an === 'number' && typeof bn === 'number') {
      c[key] = lerp(an, bn, t);
    }
  }
  return c;
}
