import { addPoint, addRect, fromPoint, Rect } from './utils/math2d';
import { getEllipticalArcBoundingRect } from './arc-node';
import { getCurveBoundingRect, getQCurveBoundingRect } from './curve-node';
import { getX, getY, PathNode } from './path-node';
import {
  isCurveTo,
  isEllipticalArc,
  isMoveTo,
  isQCurveTo,
  isSmoothCurveTo,
  isSmoothQCurveTo,
} from './command-assertion';

export function getItemBoundingRect(item: Readonly<PathNode>): Rect {
  if (isEllipticalArc(item)) {
    return getEllipticalArcBoundingRect(item);
  } else if (isQCurveTo(item) || isSmoothQCurveTo(item)) {
    return getQCurveBoundingRect(item);
  } else if (isCurveTo(item) || isSmoothCurveTo(item)) {
    return getCurveBoundingRect(item);
  } else {
    const rc = fromPoint(getX(item), getY(item));
    if (!isMoveTo(item)) {
      // Treat everything else as a line segment.
      addPoint(rc, getX(item.prev), getY(item.prev));
    }
    return rc;
  }
}

export function getBoundingRect(items: Readonly<PathNode>[], rect?: Rect): Rect {
  if (!rect) {
    rect = {
      left: Number.POSITIVE_INFINITY,
      top: Number.POSITIVE_INFINITY,
      right: Number.NEGATIVE_INFINITY,
      bottom: Number.NEGATIVE_INFINITY,
    };
  }
  for (const item of items) {
    addRect(rect, getItemBoundingRect(item));
  }
  return rect;
}
