// In general, the angle between two vectors (ux, uy) and (vx, vy) can be computed as
// +- arccos(dot(u, v) / (u.length * v.length),
// where the +- sign is the sign of (ux * vy − uy * vx).
export function twoVectorsAngle(ux: number, uy: number, vx: number, vy: number): number {
  const a2 = Math.atan2(uy, ux);
  const a1 = Math.atan2(vy, vx);
  const sign = a1 > a2 ? -1 : 1;
  const angle1 = a1 - a2;
  const angle2 = angle1 + sign * Math.PI * 2;

  return Math.abs(angle2) < Math.abs(angle1) ? angle2 : angle1;
}
