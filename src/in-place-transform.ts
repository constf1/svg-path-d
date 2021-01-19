import { DrawTo } from './command';
import {
  hasControlPoint1,
  hasControlPoint2,
  isClosePath,
  isEllipticalArc,
  isHLineTo,
  isVLineTo,
} from './command-assertion';

/**
 * Implements simple in-place transformations of a `DrawTo` content.
 */

/**
 * Translates all points in the item
 * @param item `DrawTo` command
 * @param dx x offset
 * @param dy y offset
 */
export function applyTranslate(item: DrawTo, dx: number, dy: number): void {
  if (!isClosePath(item)) {
    if (!isVLineTo(item)) {
      item.x += dx;
    }
    if (!isHLineTo(item)) {
      item.y += dy;
    }
    if (hasControlPoint1(item)) {
      item.x1 += dx;
      item.y1 += dy;
    }
    if (hasControlPoint2(item)) {
      item.x2 += dx;
      item.y2 += dy;
    }
  }
}

export function applyVerticalFlip(item: DrawTo): void {
  if (!isClosePath(item)) {
    if (!isHLineTo(item)) {
      item.y = -item.y;
    }
    if (isEllipticalArc(item)) {
      item.sweepFlag = !item.sweepFlag;
    } else {
      if (hasControlPoint1(item)) {
        item.y1 = -item.y1;
      }
      if (hasControlPoint2(item)) {
        item.y2 = -item.y2;
      }
    }
  }
}

export function applyHorizontalFlip(item: DrawTo): void {
  if (!isClosePath(item)) {
    if (!isVLineTo(item)) {
      item.x = -item.x;
    }
    if (isEllipticalArc(item)) {
      item.sweepFlag = !item.sweepFlag;
    } else {
      if (hasControlPoint1(item)) {
        item.x1 = -item.x1;
      }
      if (hasControlPoint2(item)) {
        item.x2 = -item.x2;
      }
    }
  }
}
