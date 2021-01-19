import {
  isClosePath,
  isCurveTo,
  isEllipticalArc,
  isHLineTo,
  isLineTo,
  isMoveTo,
  isQCurveTo,
  isSmoothCurveTo,
  isSmoothQCurveTo,
  isVLineTo,
} from './command-assertion';
import { getReflectedX1, getReflectedY1 } from './curve-node';
import { getX, getY, makePath, PathNode } from './path-node';

function hasClosePath(items: PathNode[], index: number) {
  for (; index < items.length; index++) {
    const item = items[index];
    if (isClosePath(item)) {
      return true;
    } else if (isMoveTo(item)) {
      return false;
    }
  }
  return false;
}

export function appendReversed(items: PathNode[], index: number, acc: PathNode[]): void {
  const item = items[index];
  const prev = items[index - 1];
  const next = items[index + 1];

  const x = getX(prev);
  const y = getY(prev);

  if (isEllipticalArc(item)) {
    acc.push({
      name: 'A',
      rx: item.rx,
      ry: item.ry,
      angle: item.angle,
      largeArcFlag: item.largeArcFlag,
      sweepFlag: !item.sweepFlag,
      x,
      y,
    });
  } else if (isLineTo(item)) {
    acc.push({ name: 'L', x, y });
  } else if (isHLineTo(item)) {
    acc.push({ name: 'H', x });
  } else if (isVLineTo(item)) {
    acc.push({ name: 'V', y });
  } else if (isCurveTo(item)) {
    if (next && isSmoothCurveTo(next)) {
      acc.push({ name: 'S', x2: item.x1, y2: item.y1, x, y });
    } else {
      acc.push({ name: 'C', x1: item.x2, y1: item.y2, x2: item.x1, y2: item.y1, x, y });
    }
  } else if (isQCurveTo(item)) {
    if (next && isSmoothQCurveTo(next)) {
      acc.push({ name: 'T', x, y });
    } else {
      acc.push({ name: 'Q', x1: item.x1, y1: item.y1, x, y });
    }
  } else if (isSmoothCurveTo(item)) {
    const x2 = getReflectedX1(item);
    const y2 = getReflectedY1(item);
    if (next && isSmoothCurveTo(next)) {
      acc.push({ name: 'S', x2, y2, x, y });
    } else {
      acc.push({ name: 'C', x1: item.x2, y1: item.y2, x2, y2, x, y });
    }
  } else if (isSmoothQCurveTo(item)) {
    if (next && isSmoothQCurveTo(next)) {
      acc.push({ name: 'T', x, y });
    } else {
      acc.push({ name: 'Q', x1: getReflectedX1(item), y1: getReflectedY1(item), x, y });
    }
  } else {
    const x0 = getX(item);
    const y0 = getY(item);

    if (isMoveTo(item)) {
      if (hasClosePath(items, index + 1)) {
        acc.push({ name: 'Z' });
      }
      if (prev && (x0 !== x || y0 !== y)) {
        acc.push({ name: 'M', x, y });
      }
    } else if (isClosePath(item)) {
      if (x0 !== x) {
        if (y0 !== y) {
          acc.push({ name: 'L', x, y });
        } else {
          acc.push({ name: 'H', x });
        }
      } else if (y0 !== y) {
        acc.push({ name: 'V', y });
      }
    }
  }
}

export function createReversed(items: PathNode[]): PathNode[] {
  const reveresed: PathNode[] = [];
  let i = items.length;
  if (i > 0) {
    const last = items[i - 1];
    reveresed.push({ name: 'M', x: getX(last), y: getY(last) });
    while (i-- > 0) {
      appendReversed(items, i, reveresed);
    }
  }
  return makePath(reveresed);
}
