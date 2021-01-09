import { DrawTo, MoveTo } from './command';
import { isClosePath, isHLineTo, isMoveTo, isVLineTo } from './command-assertion';
import { DrawToken } from './parser';

export type PathNode = DrawTo & { prev?: PathNode };

function getMoveTo(item?: Readonly<PathNode>): Readonly<PathNode & MoveTo> | undefined {
  for (let node = item; node; node = node.prev) {
    if (isMoveTo(node)) {
      return node;
    }
  }
}

export function getX(item?: Readonly<PathNode>): number {
  if (item) {
    if (isClosePath(item)) {
      return getX(getMoveTo(item.prev));
    } else if (isVLineTo(item)) {
      return getX(item.prev);
    } else {
      return item.x;
    }
  }
  return 0;
}

export function getY(item?: Readonly<PathNode>): number {
  if (item) {
    if (isClosePath(item)) {
      return getY(getMoveTo(item.prev));
    } else if (isHLineTo(item)) {
      return getY(item.prev);
    } else {
      return item.y;
    }
  }
  return 0;
}

export function createPathNode({ name, args, relative }: Readonly<DrawToken>, prev?: PathNode): PathNode {
  const X0 = relative ? getX(prev) : 0;
  const Y0 = relative ? getY(prev) : 0;

  switch (name) {
    case 'Z':
      return { name, prev };
    case 'H':
      return { name, x: +args[0] + X0, prev };
    case 'V':
      return { name, y: +args[0] + Y0, prev };
    case 'M':
    case 'L':
    case 'T':
      return { name, x: +args[0] + X0, y: +args[1] + Y0, prev };
    case 'Q':
      return { name, x1: +args[0] + X0, y1: +args[1] + Y0, x: +args[2] + X0, y: +args[3] + Y0, prev };
    case 'S':
      return { name, x2: +args[0] + X0, y2: +args[1] + Y0, x: +args[2] + X0, y: +args[3] + Y0, prev };
    case 'C':
      return { name, x1: +args[0] + X0, y1: +args[1] + Y0, x2: +args[2] + X0, y2: +args[3] + Y0, x: +args[4] + X0, y: +args[5] + Y0, prev };
    case 'A':
      return {
        name, rx: +args[0], ry: +args[1], angle: +args[2], largeArcFlag: +args[3] === 1, sweepFlag: +args[4] === 1,
        x: +args[5] + X0, y: +args[6] + Y0, prev
      };
  }
}

/**
 * Connects items and casts the DrawTo array into a PathNode array.
 * @param items array to cast
 */
export function makePath(items: DrawTo[]): PathNode[] {
  let prev: PathNode | undefined;
  for (const node of items as PathNode[]) {
    node.prev = prev;
    prev = node;
  }
  return items;
}
