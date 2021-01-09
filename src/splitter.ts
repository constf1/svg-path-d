import { lerp } from './utils/math1d';
import { isBezierCurve, isClosePath, isCurveTo, isEllipticalArc, isHLineTo, isLineTo, isMoveTo, isSmoothCurveTo, isVLineTo } from './command-assertion';
import { getX, getY, PathNode } from './path-node';
import { getFirstControlX, getFirstControlY } from './curve-node';
import { getCenterParams, getEllipsePoint } from './arc-node';

export function canSplit(item: Readonly<PathNode>): boolean {
  return !(isMoveTo(item) || isClosePath(item));
}

export function bisect(item: Readonly<PathNode>, t = 1 / 2): PathNode[] {
  const prev = item.prev;
  if (isHLineTo(item)) {
    const h1: PathNode = { name: 'H', x: lerp(getX(prev), item.x, t), prev };
    const h2: PathNode = { name: 'H', x: item.x, prev: h1 };
    return [h1, h2];
  } else if (isVLineTo(item)) {
    const v1: PathNode = { name: 'V', y: lerp(getY(prev), item.y, t), prev };
    const v2: PathNode = { name: 'V', y: item.y, prev: v1 };
    return [v1, v2];
  } else {
    const X0 = getX(prev);
    const Y0 = getY(prev);
    if (isBezierCurve(item)) {
      // De Casteljau's Algorithm. https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm
      const X1 = getFirstControlX(item);
      const Y1 = getFirstControlY(item);

      if (isCurveTo(item) || isSmoothCurveTo(item)) {
        const X2 = item.x2;
        const Y2 = item.y2;

        const X12 = lerp(X1, X2, t);
        const Y12 = lerp(Y1, Y2, t);

        const XB3 = item.x;
        const YB3 = item.y;
        const XB2 = lerp(X2, XB3, t);
        const YB2 = lerp(Y2, YB3, t);
        const XB1 = lerp(X12, XB2, t);
        const YB1 = lerp(Y12, YB2, t);

        const XA1 = lerp(X0, X1, t);
        const YA1 = lerp(Y0, Y1, t);
        const XA2 = lerp(XA1, X12, t);
        const YA2 = lerp(YA1, Y12, t);
        const XA3 = lerp(XA2, XB1, t);
        const YA3 = lerp(YA2, YB1, t);

        const c1: PathNode = { name: 'C', x1: XA1, y1: YA1, x2: XA2, y2: YA2, x: XA3, y: YA3, prev };
        const c2: PathNode = { name: 'C', x1: XB1, y1: YB1, x2: XB2, y2: YB2, x: XB3, y: YB3, prev: c1 };
        return [c1, c2];
      } else {
        const XB2 = item.x;
        const YB2 = item.y;
        const XB1 = lerp(X1, XB2, t);
        const YB1 = lerp(Y1, YB2, t);

        const XA1 = lerp(X0, X1, t);
        const YA1 = lerp(Y0, Y1, t);
        const XA2 = lerp(XA1, XB1, t);
        const YA2 = lerp(YA1, YB1, t);

        const q1: PathNode = { name: 'Q', x1: XA1, y1: YA1, x: XA2, y: YA2, prev };
        const q2: PathNode = { name: 'Q', x1: XB1, y1: YB1, x: XB2, y: YB2, prev: q1 };
        return [q1, q2];
      }
    } else if (isEllipticalArc(item)) {
      const par = getCenterParams(item);
      if (par.deltaTheta) {
        const deltaTheta1 = lerp(0, par.deltaTheta, t);
        const p1 = getEllipsePoint(par, par.theta + deltaTheta1);
        const largeArcFlag1 = Math.abs(deltaTheta1) > Math.PI;
        const largeArcFlag2 = Math.abs(par.deltaTheta - deltaTheta1) > Math.PI;

        const { rx, ry } = par;
        const { angle, sweepFlag } = item;

        const a1: PathNode = { name: 'A', rx, ry, angle, sweepFlag, largeArcFlag: largeArcFlag1, x: p1.x, y: p1.y, prev };
        const a2: PathNode = { name: 'A', rx, ry, angle, sweepFlag, largeArcFlag: largeArcFlag2, x: item.x, y: item.y, prev: a1 };
        return [a1, a2];
      } else {
        // Treat this as a straight line from (x1, y1) to (x2, y2).
        const x = lerp(X0, item.x, t);
        const y = lerp(Y0, item.y, t);
        const { rx, ry, angle, sweepFlag } = item;

        const a1: PathNode = { name: 'A', rx, ry, angle, sweepFlag, largeArcFlag: false, x, y, prev };
        const a2: PathNode = { name: 'A', rx, ry, angle, sweepFlag, largeArcFlag: false, x: item.x, y: item.y, prev: a1 };
        return [a1, a2];
      }
    } else if (isLineTo(item)) {
      const l1: PathNode = { name: 'L', x: lerp(X0, item.x, t), y: lerp(Y0, item.y, t), prev };
      const l2: PathNode = { name: 'L', x: item.x, y: item.y, prev: l1 };
      return [l1, l2];
    } else {
      return [{ ...item }];
    }
  }
}

export function trisect(item: Readonly<PathNode>, t = 1 / 3): PathNode[] {
  const arr = bisect(item, t);
  if (arr.length > 1) {
    return [arr[0], ...bisect(arr[1])];
  }
  return arr;
}

export function split(item: Readonly<PathNode>, count: number): PathNode[] {
  count = Math.round(count);
  if (count <= 1 || !isFinite(count)) {
    return [{ ...item }];
  } else if (count === 2) {
    return bisect(item);
  } else if (count === 3) {
    return trisect(item);
  } else if (count % 2 === 0) {
    const arr = bisect(item);
    if (arr.length > 1) {
      return split(arr[0], count / 2).concat(split(arr[1], count / 2));
    }
    return arr;
  } else {
    const arr = bisect(item, 1 / count);
    if (arr.length > 1) {
      return [arr[0], ...split(arr[1], count - 1)];
    }
    return arr;
  }
}

// Split into logic groups
export function getGroups(items: PathNode[]): PathNode[][]  {
  const groups: PathNode[][] = [];
  let next: PathNode[] | undefined = undefined;
  for (const item of items) {
    if (!next || isMoveTo(item)) {
      if (next) {
        groups.push(next);
      }
      next = [item];
    } else {
      next.push(item);
    }
    if (isClosePath(item)) {
      groups.push(next);
      next = undefined;
    }
  }
  if (next) {
    groups.push(next);
  }
  return groups;
}
