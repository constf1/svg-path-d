import { createDrawItem, DrawCommand, DrawTo, MoveTo } from './command';
import { isClosePath, isHLineTo, isMoveTo, isVLineTo } from './command-assertion';
import { applyTranslate } from './in-place-transform';

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

export function createPathNode(
  name: DrawCommand,
  args: ReadonlyArray<string | number>,
  relative?: boolean,
  prev?: PathNode
): PathNode {
  const node: PathNode = createDrawItem(name, args);
  node.prev = prev;
  if (relative && prev) {
    applyTranslate(node, getX(prev), getY(prev));
  }
  return node;
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

export function clonePath(
  items: PathNode[],
  mapper: (value: PathNode, index: number, arr: PathNode[]) => PathNode
): PathNode[] {
  let prev: PathNode | undefined;
  return items.map((value, index, arr) => {
    const next = mapper(value, index, arr);
    next.prev = prev;
    return (prev = next);
  });
}
