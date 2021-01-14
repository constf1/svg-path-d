import { bezier2, bezier3, clamp } from './utils/math1d';
import { addPoint, addX, addY, fromPoint, isPointOut, Rect } from './utils/math2d';
import { CurveTo, QCurveTo, SmoothCurveTo, SmoothQCurveTo } from './command';
import {
  hasControlPoint1,
  hasControlPoint2,
  isCurveTo,
  isQCurveTo,
  isSmoothCurveTo,
  isSmoothQCurveTo,
} from './command-assertion';
import { getX, getY, PathNode } from './path-node';

export type CurveNode = PathNode & (CurveTo | QCurveTo | SmoothCurveTo | SmoothQCurveTo);
export type SmoothCurveNode = PathNode & (SmoothCurveTo | SmoothQCurveTo);

function isReflectable(node: Readonly<SmoothCurveNode>, prev: Readonly<PathNode>): prev is Readonly<CurveNode> {
  return (
    prev.name === node.name ||
    (isCurveTo(prev) && isSmoothCurveTo(node)) ||
    (isQCurveTo(prev) && isSmoothQCurveTo(node))
  );
}

/**
 * The S/s and T/t commands indicate that the first control point of the given cubic/quadratic
 * Bézier curve is calculated by reflecting the previous path segment's final control point
 * relative to the current point.
 *
 * The exact math is as follows.
 * If the current point is (curx, cury)
 * and the final control point of the previous path segment is (oldx2, oldy2),
 * then the first control point of the current path segment (reflected point) is:
 *
 * (newx1, newy1) = (curx - (oldx2 - curx), cury - (oldy2 - cury)) = (2*curx - oldx2, 2*cury - oldy2)
 */
export function getReflectedX1(node: Readonly<SmoothCurveNode>): number {
  const prev = node.prev;

  let x = getX(prev);
  if (prev && isReflectable(node, prev)) {
    x += x - getLastControlX(prev);
  }
  return x;
}

export function getReflectedY1(node: Readonly<SmoothCurveNode>): number {
  const prev = node.prev;

  let y = getY(prev);
  if (prev && isReflectable(node, prev)) {
    y += y - getLastControlY(prev);
  }
  return y;
}

export function getFirstControlX(node: Readonly<CurveNode>): number {
  if (hasControlPoint1(node)) {
    return node.x1;
  } else {
    return getReflectedX1(node);
  }
}

export function getFirstControlY(node: Readonly<CurveNode>): number {
  if (hasControlPoint1(node)) {
    return node.y1;
  } else {
    return getReflectedY1(node);
  }
}

export function getLastControlX(node: Readonly<CurveNode>): number {
  if (hasControlPoint2(node)) {
    return node.x2;
  } else if (isQCurveTo(node)) {
    return node.x1;
  } else {
    return getReflectedX1(node);
  }
}

export function getLastControlY(node: Readonly<CurveNode>): number {
  if (hasControlPoint2(node)) {
    return node.y2;
  } else if (isQCurveTo(node)) {
    return node.y1;
  } else {
    return getReflectedY1(node);
  }
}

export function getQCurveBoundingRect(node: Readonly<PathNode & (QCurveTo | SmoothQCurveTo)>): Rect {
  const x0 = getX(node.prev);
  const y0 = getY(node.prev);

  const x1 = getFirstControlX(node);
  const y1 = getFirstControlY(node);

  const x2 = node.x;
  const y2 = node.y;

  const rc = fromPoint(x0, y0);
  addPoint(rc, x2, y2);

  if (isPointOut(rc, x1, y1)) {
    // p(t) = (1 - t)^2 * p0 + 2 * (1 - t) * t * p1 + t^2 * p2, where t is in the range of [0,1]
    // When the first derivative is 0, the point is the location of a local minimum or maximum.
    // p'(t) = 2 * (t - 1) * p0 + 2 * (1 - 2 * t) * p1 + 2 * t * p2
    //       = t * (2 * p0 - 4 * p1 + 2 * p2) + 2 * (p1-p0)
    //       = 0 =>
    // t * (p0 - 2 * p1 + p2) = (p0 - p1)
    // t = (p0 - p1) / (p0 - 2 * p1 + p2)
    const tx = clamp((x0 - x1) / (x0 - 2 * x1 + x2) || 0, 0, 1);
    const px = bezier2(x0, x1, x2, tx);

    const ty = clamp((y0 - y1) / (y0 - 2 * y1 + y2) || 0, 0, 1);
    const py = bezier2(y0, y1, y2, ty);

    addPoint(rc, px, py);
  }

  return rc;
}

export function getCurveBoundingRect(node: Readonly<PathNode & (CurveTo | SmoothCurveTo)>): Rect {
  const x0 = getX(node.prev);
  const y0 = getY(node.prev);
  const x1 = getFirstControlX(node);
  const y1 = getFirstControlY(node);
  const x2 = node.x2;
  const y2 = node.y2;
  const x3 = node.x;
  const y3 = node.y;

  const rc = fromPoint(x0, y0);
  addPoint(rc, x3, y3);

  const kx0 = -x0 + x1;
  const kx1 = x0 - 2 * x1 + x2;
  const kx2 = -x0 + 3 * x1 - 3 * x2 + x3;

  let hx = kx1 * kx1 - kx0 * kx2;
  if (hx > 0) {
    hx = Math.sqrt(hx);
    let t = -kx0 / (kx1 + hx);
    if (t > 0 && t < 1) {
      addX(rc, bezier3(x0, x1, x2, x3, t));
    }

    t = -kx0 / (kx1 - hx);
    if (t > 0 && t < 1) {
      addX(rc, bezier3(x0, x1, x2, x3, t));
    }
  }

  const ky0 = -y0 + y1;
  const ky1 = y0 - 2 * y1 + y2;
  const ky2 = -y0 + 3 * y1 - 3 * y2 + y3;

  let hy = ky1 * ky1 - ky0 * ky2;
  if (hy > 0) {
    hy = Math.sqrt(hy);
    let t = -ky0 / (ky1 + hy);
    if (t > 0 && t < 1) {
      addY(rc, bezier3(y0, y1, y2, y3, t));
    }

    t = -ky0 / (ky1 - hy);
    if (t > 0 && t < 1) {
      addY(rc, bezier3(y0, y1, y2, y3, t));
    }
  }

  return rc;
}
