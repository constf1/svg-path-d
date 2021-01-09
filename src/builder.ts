import { formatDecimal } from './utils/format';
import { DrawTo } from './command';
import { hasControlPoint1, hasControlPoint2, isClosePath, isEllipticalArc, isHLineTo, isVLineTo } from './command-assertion';
import { getTokens } from './parser';
import { createPathNode, getX, getY, PathNode } from './path-node';

function formatDigit(value: number, fractionDigits: number) {
  return ' ' + (fractionDigits < 0 ? value.toString() : formatDecimal(value, fractionDigits));
}

export function formatParams(item: Readonly<DrawTo>, x0: number, y0: number, fractionDigits: number): string {
  let buf = '';
  if (!isClosePath(item)) {
    if (hasControlPoint1(item)) {
      buf += formatDigit(item.x1 - x0, fractionDigits);
      buf += formatDigit(item.y1 - y0, fractionDigits);
    }
    if (hasControlPoint2(item)) {
      buf += formatDigit(item.x2 - x0, fractionDigits);
      buf += formatDigit(item.y2 - y0, fractionDigits);
    }
    if (isEllipticalArc(item)) {
      buf += formatDigit(item.rx, fractionDigits);
      buf += formatDigit(item.ry, fractionDigits);
      buf += formatDigit(item.angle, fractionDigits);
      buf += ' ' + (item.largeArcFlag ? '1' : '0') + (item.sweepFlag ? '1' : '0');
    }

    if (!isVLineTo(item)) {
      buf += formatDigit(item.x - x0, fractionDigits);
    }
    if (!isHLineTo(item)) {
      buf += formatDigit(item.y - y0, fractionDigits);
    }
  }
  return buf;
}
// To string conversions:

/**
 * Returns a string representing the draw command in absolute form.
 * @param item SVG path single draw command
 * @param fractionDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
 */
export function asString(item: Readonly<DrawTo>, fractionDigits = -1): string {
  return item.name + formatParams(item, 0, 0, fractionDigits);
}

export function asRelativeString(item: Readonly<PathNode>, fractionDigits = -1): string {
  return item.name.toLowerCase() + formatParams(item, getX(item.prev), getY(item.prev), fractionDigits);
}

export function fromString(pathData: string): PathNode[] {
  let prev: PathNode | undefined = undefined;
  const tokens = getTokens(pathData);
  return tokens.map(token => prev = createPathNode(token, prev));
}
