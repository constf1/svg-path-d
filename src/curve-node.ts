import { CurveTo, QCurveTo, SmoothCurveTo, SmoothQCurveTo } from './command';
import { hasControlPoint1, hasControlPoint2, isCurveTo, isQCurveTo, isSmoothCurveTo, isSmoothQCurveTo } from './command-assertion';
import { getX, getY, PathNode } from './path-node';

export type CurveNode = PathNode & (CurveTo | QCurveTo | SmoothCurveTo | SmoothQCurveTo);
export type SmoothCurveNode = PathNode & (SmoothCurveTo | SmoothQCurveTo);

function isReflectable(node: Readonly<SmoothCurveNode>, prev: Readonly<PathNode>): prev is Readonly<CurveNode>{
  return prev.name === node.name ||
    (isCurveTo(prev) && isSmoothCurveTo(node)) ||
    (isQCurveTo(prev) && isSmoothQCurveTo(node));
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
