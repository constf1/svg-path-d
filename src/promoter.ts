import { CurveTo, DrawTo, LineTo, QCurveTo } from './command';
import { isHLineTo, isLineTo, isQCurveTo, isSmoothCurveTo, isSmoothQCurveTo, isVLineTo } from './command-assertion';
import { getFirstControlX, getFirstControlY, getReflectedX1, getReflectedY1 } from './curve-node';
import { getX, getY, PathNode } from './path-node';

export function canPromoteToLine(item: Readonly<DrawTo>): boolean {
  return isHLineTo(item) || isVLineTo(item);
}

export function canPromoteToQCurve(item: Readonly<DrawTo>): boolean {
  return canPromoteToLine(item) || isLineTo(item) || isSmoothQCurveTo(item);
}

export function canPromoteToCurve(item: Readonly<DrawTo>): boolean {
  return canPromoteToQCurve(item) || isQCurveTo(item) || isSmoothCurveTo(item);
}

export function promoteToLine(item: Readonly<PathNode>): PathNode & LineTo {
  return { name: 'L', x: getX(item), y: getY(item), prev: item.prev };
}

export function promoteToQCurve(item: Readonly<PathNode>): PathNode & QCurveTo {
  const prev = item.prev;
  if (isSmoothQCurveTo(item)) {
    const x1 = getReflectedX1(item);
    const y1 = getReflectedY1(item);
    return { name: 'Q', x1, y1, x: item.x, y: item.y, prev };
  } else {
    // Treat it as a line.
    const x0 = getX(prev);
    const y0 = getY(prev);
    const x = getX(item);
    const y = getY(item);
    const x1 = (x0 + x) / 2;
    const y1 = (y0 + y) / 2;
    return { name: 'Q', x1, y1, x, y, prev };
  }
}

export function promoteToCurve(item: Readonly<PathNode>): PathNode & CurveTo {
  const prev = item.prev;
  if (isSmoothCurveTo(item)) {
    const x1 = getReflectedX1(item);
    const y1 = getReflectedY1(item);
    return { name: 'C', x1, y1, x2: item.x2, y2: item.y2, x: item.x, y: item.y, prev };
  } else {
    const x0 = getX(prev);
    const y0 = getY(prev);
    if (isQCurveTo(item) || isSmoothQCurveTo(item)) {
      const control2x = 2 * getFirstControlX(item);
      const control2y = 2 * getFirstControlY(item);
      // 1/3rd start + 2/3rd control
      const x1 = (x0 + control2x) / 3;
      const y1 = (y0 + control2y) / 3;
      // 1/3rd stop + 2/3rd control
      const x2 = (item.x + control2x) / 3;
      const y2 = (item.y + control2y) / 3;
      return { name: 'C', x1, y1, x2, y2, x: item.x, y: item.y, prev };
    } else {
      // Treat it as a line.
      const x = getX(item);
      const y = getY(item);

      const x1 = x0 + (x - x0) / 4; // (x + 2 * x0) / 3
      const y1 = y0 + (y - y0) / 4; // (y + 2 * y0) / 3
      const x2 = x0 + (3 * (x - x0)) / 4; // (x0 + 2 * x) / 3
      const y2 = y0 + (3 * (y - y0)) / 4; // (y0 + 2 * y) / 3
      return { name: 'C', x1, y1, x2, y2, x, y, prev };
    }
  }
}
